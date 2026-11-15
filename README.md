# DeepSeek Usage

A persistent DSH Web UI plugin that adds a **DeepSeek 用量** entry to the left
sidebar and opens a visual dashboard in the main column.

## Install

```sh
dsh plugin --profile <profile> add github:myname1234/dsh-deepseek-usage
```

The package is plain JavaScript with no build step, so the GitHub install needs
no `allowBuilds` approval. In the Web UI, **Plugins → Add plugin** accepts the
same GitHub spec.

## What it shows

- **Account balance** from DeepSeek's official `GET /user/balance` endpoint
  (total, topped-up, and granted amounts, plus the low-balance state).
- **Token usage** — input, output, cache reads/writes, reasoning tokens, request
  count, cache-hit rate, and average tokens per request.
- **Daily trend chart** for the last 7, 14, or 30 days, stacked by input/output.
- **Token mix** donut and **per-model** breakdown.
- **Recent 7-day table** with requests, tokens, and cache hit rate per day.

Token usage is folded from this Harness profile's durable Session logs (the
`assistant/message` usage records), so it survives restarts and does not
double-count inherited events in forked Sessions. Live Sessions appear through
the `session/event` feed without waiting for a refresh.

## Configuration

The bundle patch gives the Host row these optional values:

```yaml
- id: deepseek-usage
  name: '@local/deepseek-usage'
  config:
    credentialRef: DEEPSEEK_API_KEY   # Harness credential reference
    pollSeconds: 5                    # browser poll interval
    balanceTtlSeconds: 60             # Host-side balance cache
    scanIntervalSeconds: 300          # new-Session discovery interval
```

`credentialRef` is resolved through `ctx.credentials`; the secret never reaches
the browser. If the key is absent, the Host falls back to the signed-in
`deepseekAccount` balance. Balance failures never hide token statistics.

## Scope and privacy

- Only usage whose provider or model name contains `deepseek` is aggregated.
- The browser receives aggregates, model names, and wallet balances. It never
  receives the API key, session text, or individual message logs.
- The dashboard link points to <https://platform.deepseek.com/usage>.

## Development

The plugin is plain ESM + a plain JavaScript browser bundle; there is no build
step. Validate with:

```sh
node --check index.js
node --check client.js
```

Install the directory through DSH's Plugin Manager. The Host half registers the
authenticated `/api/deepseek-usage` Fetch route; the Client half renders into
`sidebar.panellist` and `main`.
