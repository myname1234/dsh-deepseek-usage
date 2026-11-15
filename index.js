/**
 * Host half of the DeepSeek usage dashboard.
 *
 * Token usage is folded from the durable Session logs (the same assistant
 * messages the model calls produced), so it stays correct across restarts and
 * survives forks without double-counting inherited events. Account balance is
 * read from DeepSeek's official `/user/balance` endpoint using the profile's
 * `DEEPSEEK_API_KEY` credential; a signed-in DSH account is used as a fallback.
 *
 * The browser half talks to this file through one authenticated Fetch route on
 * the shared `/api` channel. No credential ever crosses that boundary.
 */

const DEFAULT_CREDENTIAL_REF = 'DEEPSEEK_API_KEY'
const BALANCE_URL = 'https://api.deepseek.com/user/balance'
const MAX_DAYS = 30
const MAX_MODELS = 8
const SCAN_CONCURRENCY = 4
const BALANCE_TIMEOUT_MS = 8_000
const DEFAULT_POLL_SECONDS = 5
const DEFAULT_BALANCE_TTL_SECONDS = 60
const DEFAULT_SCAN_INTERVAL_SECONDS = 300

export const inject = ['connection', 'sessionQuery']

/**
 * Create one snapshot of the usage index and balance cache.
 * @param {import('@deepseek-ai/cordis').Context} ctx - Host plugin context.
 * @param {Record<string, unknown>} [config] - Optional row config.
 */
export function apply(ctx, config = {}) {
  const options = normalizeOptions(config)
  const usage = new UsageIndex(ctx)
  const balance = new BalanceStore(ctx, options)

  // One exact, authenticated Fetch route on the shared /api channel. Using the
  // Fetch registry rather than an RPC interceptor keeps the API gateway's own
  // interceptor untouched.
  ctx.effect(
    () => ctx.connection.fetch.register({
      path: '/api/deepseek-usage',
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: async (request) => {
        let action = 'snapshot'
        try {
          const body = await request.json()
          if (body !== null && typeof body === 'object' && typeof body.action === 'string') action = body.action
        } catch {
          return Response.json(
            { ok: false, error: { code: 'bad-request', message: 'The request body is not valid JSON.' } },
            { status: 400 },
          )
        }
        if (action !== 'snapshot' && action !== 'refresh') {
          return Response.json(
            { ok: false, error: { code: 'bad-request', message: `Unknown usage action: ${action}` } },
            { status: 400 },
          )
        }
        try {
          if (action === 'refresh') {
            await usage.requestScan(false)
            await balance.refresh(true)
          } else {
            void balance.refresh(false)
          }
          return Response.json(
            { ok: true, value: snapshot() },
            { headers: { 'cache-control': 'no-store' } },
          )
        } catch (error) {
          return Response.json(
            { ok: false, error: { code: 'internal', message: messageOf(error) } },
            { status: 200, headers: { 'cache-control': 'no-store' } },
          )
        }
      },
    }),
    'deepseek-usage: dashboard route',
  )

  // Live sessions contribute immediately; the initial scan catches everything
  // that happened before this plugin was activated.
  ctx.on('session/event', (session, event) => {
    try {
      usage.ingestEvent(session.id, event)
    } catch {
      // A malformed third-party event must never break the event feed.
    }
  })

  // Pick up sessions created while the plugin was already running. Existing
  // logs are only scanned once, so this stays cheap.
  ctx.effect(
    () => {
      const timer = setInterval(() => { void usage.requestScan(false) }, options.scanIntervalMs)
      return () => { clearInterval(timer) }
    },
    'deepseek-usage: session discovery',
  )

  void usage.requestScan(false)
  void balance.refresh(false)

  /** @returns {object} JSON-safe dashboard payload. */
  function snapshot() {
    return {
      generatedAt: Date.now(),
      scanning: usage.isScanning,
      usage: usage.snapshot(MAX_DAYS),
      balance: balance.snapshot,
      meta: {
        credentialRef: options.credentialRef,
        pollSeconds: options.pollSeconds,
        balanceTtlSeconds: options.balanceTtlSeconds,
        scanIntervalSeconds: options.scanIntervalSeconds,
      },
    }
  }
}

class UsageIndex {
  /** @param {import('@deepseek-ai/cordis').Context} ctx */
  constructor(ctx) {
    this.ctx = ctx
    /** @type {Map<string, object>} */
    this.entries = new Map()
    /** @type {Set<string>} */
    this.scanned = new Set()
    this.scanPromise = null
    this.lastScanAt = 0
    this.lastScanError = null
    this.sessionCount = 0
    this.failures = []
    this.version = 0
    this.aggregateVersion = -1
    this.aggregateCache = null
  }

  get isScanning() {
    return this.scanPromise !== null
  }

  /**
   * Fold one durable session event into the index.
   * @param {string} sessionId - owning Session id.
   * @param {object} event - durable Session event.
   * @returns {boolean} whether a new usage record was added.
   */
  ingestEvent(sessionId, event) {
    if (event === null || typeof event !== 'object' || event.type !== 'assistant/message') return false
    const data = event.data
    const usage = data && data.usage
    if (usage === null || typeof usage !== 'object') return false
    const source = data.message && data.message.source
    const provider = typeof source?.provider === 'string' ? source.provider : ''
    const model = typeof source?.model === 'string' ? source.model : ''
    if (!isDeepSeek(provider, model)) return false

    const key = `${String(sessionId)}:${String(event.seq)}`
    if (this.entries.has(key)) return false

    const rawInput = tokenCount(usage.inputTokens)
    const output = tokenCount(usage.outputTokens)
    const cacheRead = tokenCount(usage.cacheReadTokens)
    const cacheWrite = tokenCount(usage.cacheWriteTokens)
    const reasoning = tokenCount(usage.reasoningTokens)
    // `TokenUsage.inputTokens` is uncached prompt input in the Harness
    // protocol; cache buckets are separate. When the provider reported a
    // total, `total - output` is the exact prompt size and works for both
    // cache-inclusive and cache-exclusive adapters. Without a total, rebuild
    // the prompt from the buckets the protocol documents.
    let input = rawInput + cacheRead + cacheWrite
    let total = input + output
    if (usage.totalTokens !== undefined && usage.totalTokens !== null) {
      const reported = tokenCount(usage.totalTokens)
      if (reported >= output) {
        total = reported
        input = reported - output
      }
    }

    this.entries.set(key, {
      sessionId: String(sessionId),
      seq: Number(event.seq) || 0,
      time: Number(event.time) || Date.now(),
      provider: provider || 'unknown',
      model: model || 'unknown',
      input,
      output,
      cacheRead,
      cacheWrite,
      reasoning,
      total,
    })
    this.version += 1
    return true
  }

  /**
   * Scan every Session that has not been seen yet. Concurrent callers share one
   * run; the forced flag is intentionally ignored while a run is in flight.
   * @param {boolean} force - rescan already-seen Sessions.
   * @returns {Promise<void>}
   */
  requestScan(force = false) {
    if (this.scanPromise !== null) return this.scanPromise
    const run = this.runScan(force)
      .catch((error) => { this.lastScanError = messageOf(error) })
      .finally(() => {
        this.scanPromise = null
        this.lastScanAt = Date.now()
      })
    this.scanPromise = run
    return run
  }

  /** @param {boolean} force */
  async runScan(force) {
    let records
    try {
      records = await this.ctx.sessionQuery.listSessions()
    } catch (error) {
      this.lastScanError = messageOf(error)
      return
    }
    this.lastScanError = null
    const ids = records.map(record => String(record.header.id))
    const present = new Set(ids)
    for (const id of this.scanned) {
      if (!present.has(id)) this.scanned.delete(id)
    }
    this.sessionCount = ids.length
    this.failures = []
    const pending = ids.filter(id => force || !this.scanned.has(id))
    if (pending.length === 0) return

    let cursor = 0
    const worker = async () => {
      while (true) {
        const index = cursor
        cursor += 1
        if (index >= pending.length) return
        const id = pending[index]
        try {
          const log = await this.ctx.sessionQuery.readSession(id)
          const inherited = Number(log.inheritedEventCount) || 0
          for (const event of log.events) {
            // A fork carries its parent's prefix. Counting it again would make
            // the dashboard depend on how often a session was forked.
            if ((Number(event.seq) || 0) < inherited) continue
            this.ingestEvent(id, event)
          }
          this.scanned.add(id)
        } catch (error) {
          if (this.failures.length < 5) {
            this.failures.push({ sessionId: id, message: messageOf(error) })
          }
        }
      }
    }
    const workers = Array.from(
      { length: Math.min(SCAN_CONCURRENCY, pending.length) },
      () => worker(),
    )
    await Promise.all(workers)
  }

  /** @returns {{ totals: object, byDay: Map<string, object>, byModel: object[], firstAt: number|null, lastAt: number|null }} */
  aggregate() {
    if (this.aggregateVersion === this.version && this.aggregateCache !== null) return this.aggregateCache
    const totals = emptyBucket()
    const byDay = new Map()
    const byModel = new Map()
    let firstAt = null
    let lastAt = null
    for (const entry of this.entries.values()) {
      addToBucket(totals, entry)
      const date = dayKey(entry.time)
      let day = byDay.get(date)
      if (day === undefined) {
        day = emptyBucket()
        byDay.set(date, day)
      }
      addToBucket(day, entry)

      const modelKey = `${entry.provider}\u0000${entry.model}`
      let model = byModel.get(modelKey)
      if (model === undefined) {
        model = { provider: entry.provider, model: entry.model, ...emptyBucket() }
        byModel.set(modelKey, model)
      }
      addToBucket(model, entry)

      firstAt = firstAt === null ? entry.time : Math.min(firstAt, entry.time)
      lastAt = lastAt === null ? entry.time : Math.max(lastAt, entry.time)
    }
    const models = [...byModel.values()]
      .map(model => ({
        provider: model.provider,
        model: model.model,
        requests: model.requests,
        input: model.input,
        output: model.output,
        cacheRead: model.cacheRead,
        cacheHitRate: model.input > 0 ? model.cacheRead / model.input : null,
        total: model.total,
      }))
      .sort((left, right) => right.total - left.total || right.requests - left.requests)
      .slice(0, MAX_MODELS)

    this.aggregateVersion = this.version
    this.aggregateCache = { totals, byDay, byModel: models, firstAt, lastAt }
    return this.aggregateCache
  }

  /**
   * Build a detached, JSON-safe usage view.
   * @param {number} days - number of calendar days to include.
   */
  snapshot(days) {
    const aggregate = this.aggregate()
    const series = makeDaySeries()
    const allDays = series.map(({ date }) => {
      const bucket = aggregate.byDay.get(date) ?? emptyBucket()
      return {
        date,
        requests: bucket.requests,
        input: bucket.input,
        output: bucket.output,
        cacheRead: bucket.cacheRead,
        cacheWrite: bucket.cacheWrite,
        reasoning: bucket.reasoning,
        cacheHitRate: bucket.input > 0 ? bucket.cacheRead / bucket.input : null,
        total: bucket.total,
      }
    })
    const selected = allDays.slice(-days)
    const totals = aggregate.totals
    const today = selected[selected.length - 1] ?? emptyBucketView()
    const yesterday = selected[selected.length - 2] ?? emptyBucketView()
    return {
      total: {
        requests: totals.requests,
        input: totals.input,
        output: totals.output,
        cacheRead: totals.cacheRead,
        cacheWrite: totals.cacheWrite,
        reasoning: totals.reasoning,
        cacheHitRate: totals.input > 0 ? totals.cacheRead / totals.input : null,
        averagePerRequest: totals.requests > 0 ? totals.total / totals.requests : 0,
        total: totals.total,
        firstAt: aggregate.firstAt,
        lastAt: aggregate.lastAt,
      },
      today,
      yesterday,
      days: allDays,
      models: aggregate.byModel,
      sessions: {
        count: this.sessionCount,
        scanned: this.scanned.size,
        failures: this.failures.slice(),
        lastScanAt: this.lastScanAt || null,
        error: this.lastScanError,
      },
    }
  }
}

class BalanceStore {
  /**
   * @param {import('@deepseek-ai/cordis').Context} ctx
   * @param {{ credentialRef: string, balanceTtlMs: number }} options
   */
  constructor(ctx, options) {
    this.ctx = ctx
    this.credentialRef = options.credentialRef
    this.ttlMs = options.balanceTtlMs
    this.promise = null
    this.state = {
      status: 'loading',
      available: null,
      wallets: [],
      checkedAt: null,
      source: null,
      error: null,
      errorCode: null,
    }
  }

  get snapshot() {
    return {
      ...this.state,
      wallets: this.state.wallets.map(wallet => ({ ...wallet })),
      refreshing: this.promise !== null,
    }
  }

  /**
   * Refresh the cached balance when its TTL expired, or when forced.
   * @param {boolean} force - bypass the cache.
   * @returns {Promise<object>} the settled state.
   */
  refresh(force = false) {
    if (this.promise !== null) return this.promise
    const fresh = this.state.checkedAt !== null
      && Date.now() - this.state.checkedAt < this.ttlMs
      && this.state.status !== 'loading'
    if (!force && fresh) return Promise.resolve(this.state)
    const run = this.load()
      .catch((error) => {
        this.state = {
          ...this.state,
          status: this.state.wallets.length > 0 ? 'ready' : 'error',
          error: messageOf(error),
          errorCode: 'internal',
          checkedAt: Date.now(),
        }
      })
      .finally(() => { this.promise = null })
    this.promise = run
    return run
  }

  async load() {
    let apiKey = null
    const credentials = this.ctx.get('credentials')
    if (credentials !== undefined && typeof credentials.resolve === 'function') {
      try {
        const resolved = await credentials.resolve(this.credentialRef)
        if (resolved !== undefined && typeof resolved.value === 'string' && resolved.value !== '') {
          apiKey = resolved.value
        }
      } catch {
        // A credential store failure must not hide token statistics.
      }
    }

    let apiError = null
    if (apiKey !== null) {
      try {
        const result = await fetchBalance(apiKey)
        this.state = {
          status: 'ready',
          available: result.available,
          wallets: result.wallets,
          checkedAt: Date.now(),
          source: 'api-key',
          error: null,
          errorCode: null,
        }
        return
      } catch (error) {
        apiError = error
      }
    }

    const account = this.ctx.get('deepseekAccount')
    if (account !== undefined && typeof account.getBalance === 'function') {
      try {
        const details = await account.getBalance(accountClientMetadata())
        if (details !== null && details !== undefined && details.balance?.status === 'ready') {
          const wallets = Array.isArray(details.balance.value)
            ? details.balance.value.map(wallet => ({
              currency: String(wallet.currency || ''),
              total: String(wallet.balance ?? '0'),
              granted: null,
              toppedUp: null,
            }))
            : []
          this.state = {
            status: 'ready',
            available: wallets.length > 0,
            wallets,
            checkedAt: Date.now(),
            source: 'account',
            error: apiError === null ? null : messageOf(apiError),
            errorCode: apiError === null ? null : errorCodeOf(apiError),
          }
          return
        }
      } catch {
        // Fall through to the explicit key/account diagnosis below.
      }
    }

    if (apiKey === null) {
      this.state = {
        status: 'missing-key',
        available: null,
        wallets: [],
        checkedAt: Date.now(),
        source: null,
        error: null,
        errorCode: 'missing-key',
      }
      return
    }

    this.state = {
      status: 'error',
      available: null,
      wallets: [],
      checkedAt: Date.now(),
      source: 'api-key',
      error: apiError === null ? 'Unable to read account balance.' : messageOf(apiError),
      errorCode: apiError === null ? 'http-error' : errorCodeOf(apiError),
    }
  }
}

/**
 * Read the official DeepSeek wallet balance.
 * @param {string} apiKey - resolved credential value.
 * @returns {Promise<{ available: boolean, wallets: object[] }>}
 */
async function fetchBalance(apiKey) {
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, BALANCE_TIMEOUT_MS)
  try {
    const response = await fetch(BALANCE_URL, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${apiKey.trim()}`,
        accept: 'application/json',
      },
      signal: controller.signal,
    })
    if (!response.ok) {
      const code = response.status === 401
        ? 'unauthorized'
        : response.status === 403
          ? 'forbidden'
          : response.status === 429
            ? 'rate-limited'
            : 'http-error'
      throw taggedError(`DeepSeek balance request failed with HTTP ${response.status}.`, code)
    }
    const data = await response.json()
    if (data === null || typeof data !== 'object' || !Array.isArray(data.balance_infos)) {
      throw taggedError('DeepSeek returned an unexpected balance response.', 'invalid-response')
    }
    const wallets = data.balance_infos
      .filter(wallet => wallet !== null && typeof wallet === 'object')
      .map(wallet => ({
        currency: typeof wallet.currency === 'string' ? wallet.currency : '',
        total: stringValue(wallet.total_balance),
        granted: stringValue(wallet.granted_balance),
        toppedUp: stringValue(wallet.topped_up_balance),
      }))
    return { available: data.is_available !== false, wallets }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw taggedError('DeepSeek balance request timed out.', 'timeout')
    }
    if (typeof error?.code === 'string' && error.code !== '') throw error
    throw taggedError(messageOf(error), 'network')
  } finally {
    clearTimeout(timer)
  }
}

/** @param {unknown} config */
function normalizeOptions(config) {
  const source = config !== null && typeof config === 'object' ? config : {}
  const credentialRef = typeof source.credentialRef === 'string' && source.credentialRef.trim() !== ''
    ? source.credentialRef.trim()
    : DEFAULT_CREDENTIAL_REF
  const pollSeconds = clampNumber(source.pollSeconds, DEFAULT_POLL_SECONDS, 2, 60)
  const balanceTtlSeconds = clampNumber(source.balanceTtlSeconds, DEFAULT_BALANCE_TTL_SECONDS, 15, 600)
  const scanIntervalSeconds = clampNumber(source.scanIntervalSeconds, DEFAULT_SCAN_INTERVAL_SECONDS, 60, 3600)
  return {
    credentialRef,
    pollSeconds,
    balanceTtlSeconds,
    scanIntervalSeconds,
    balanceTtlMs: balanceTtlSeconds * 1000,
    scanIntervalMs: scanIntervalSeconds * 1000,
  }
}

function clampNumber(value, fallback, min, max) {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function tokenCount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

function stringValue(value) {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return '0'
}

function isDeepSeek(provider, model) {
  return /deepseek/i.test(provider) || /deepseek/i.test(model)
}

function accountClientMetadata() {
  return {
    version: '1.0.0',
    locale: 'zh',
    timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
  }
}

function emptyBucket() {
  return {
    requests: 0,
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    reasoning: 0,
    total: 0,
  }
}

function emptyBucketView() {
  return {
    date: '',
    requests: 0,
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    reasoning: 0,
    cacheHitRate: null,
    total: 0,
  }
}

function addToBucket(bucket, entry) {
  bucket.requests += 1
  bucket.input += entry.input
  bucket.output += entry.output
  bucket.cacheRead += entry.cacheRead
  bucket.cacheWrite += entry.cacheWrite
  bucket.reasoning += entry.reasoning
  bucket.total += entry.total
}

function dayKey(time) {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function makeDaySeries() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = []
  for (let offset = MAX_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    days.push({ date: dayKey(date.getTime()), start: date.getTime() })
  }
  return days
}

function taggedError(message, code) {
  const error = new Error(message)
  error.code = code
  return error
}

function errorCodeOf(error) {
  return typeof error?.code === 'string' && error.code !== '' ? error.code : 'http-error'
}

function messageOf(error) {
  if (error instanceof Error && error.message !== '') return error.message
  return String(error)
}
