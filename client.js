/**
 * Browser half of the DeepSeek usage dashboard.
 *
 * Registers the left-sidebar panel icon and the main-column page. Data comes
 * from the package's Host half over the authenticated `/api/deepseek-usage`
 * route; the page never talks to DeepSeek directly and never sees a credential.
 */

window.__ModuleLoader__.load({
  id: '@local/deepseek-usage',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'deepseek-usage'
    const ROUTE = '/api/deepseek-usage'
    const PANEL_ID = 'deepseek-usage'

    const en = {
      'panel.title': 'DeepSeek Usage',
      'panel.description': 'Live balance, token usage, and daily trends for the DeepSeek API.',
      'page.kicker': 'DEEPSEEK API',
      'page.title': 'Usage overview',
      'page.subtitle': 'Live token consumption, cache efficiency, and account balance from this Harness.',
      'refresh': 'Refresh',
      'updated': 'Updated {time}',
      'balance': 'Account balance',
      'balance.available': 'Available',
      'balance.low': 'Low balance',
      'balance.loading': 'Reading balance…',
      'balance.missingKey': 'No API key',
      'balance.missingKeyHint': 'Set the {ref} credential to read your DeepSeek balance.',
      'balance.error': 'Balance unavailable',
      'balance.unauthorized': 'The API key was rejected. Check the credential and try again.',
      'balance.forbidden': 'This key cannot read balance information.',
      'balance.rateLimited': 'DeepSeek is rate-limiting balance requests. Try again shortly.',
      'balance.network': 'Could not reach api.deepseek.com. Check the network and try again.',
      'balance.invalid': 'DeepSeek returned an unexpected balance response.',
      'balance.failed': 'Could not read the balance. Try again.',
      'balance.retry': 'Try again',
      'balance.toppedUp': 'Topped up',
      'balance.granted': 'Granted',
      'balance.source.apiKey': 'API key',
      'balance.source.account': 'DSH account',
      'balance.noWallets': 'No wallet information returned.',
      'today.tokens': 'Tokens today',
      'today.requests': 'Requests today',
      'today.cache': 'Cache hit rate',
      'today.total': 'All-time tokens',
      'delta.up': '{value} vs yesterday',
      'delta.down': '{value} vs yesterday',
      'delta.flat': 'Same as yesterday',
      'delta.none': 'No data for yesterday',
      'chart.title': 'Daily usage',
      'chart.subtitle': 'Token consumption over the last {days} days',
      'chart.rangeTotal': '{value} tokens in range',
      'chart.empty': 'No token usage recorded yet.',
      'range.7': '7 days',
      'range.14': '14 days',
      'range.30': '30 days',
      'legend.input': 'Input',
      'legend.output': 'Output',
      'composition.title': 'Token mix',
      'composition.input': 'Input tokens',
      'composition.output': 'Output tokens',
      'composition.cache': 'Cache reads',
      'composition.total': 'total tokens',
      'composition.subtitle': 'All recorded requests',
      'models.title': 'By model',
      'models.subtitle': 'Top models by token usage',
      'models.empty': 'No model usage yet.',
      'models.requests': '{n} req',
      'models.count': '{n} models',
      'total.requests': '{n} requests all time',
      'table.title': 'Recent days',
      'table.date': 'Date',
      'table.requests': 'Requests',
      'table.input': 'Input',
      'table.output': 'Output',
      'table.cache': 'Cache hit',
      'table.total': 'Total',
      'table.today': 'Today',
      'table.yesterday': 'Yesterday',
      'note': 'Tokens are folded from local DSH session logs; balance comes from DeepSeek /user/balance.',
      'note.scope': 'Scope: requests whose provider or model contains “deepseek”.',
      'openUsage': 'Open DeepSeek usage',
      'scanning': 'Scanning history…',
      'sessions': '{n} sessions scanned',
      'error.title': 'Could not load usage',
      'error.retry': 'Try again',
      'error.host': 'The plugin’s Host half is not responding. Reinstall or restart Harness.',
      'unknown': 'Unknown',
      'time.justNow': 'just now',
      'time.seconds': '{n}s ago',
      'time.minutes': '{n}m ago',
      'time.hours': '{n}h ago',
      'time.days': '{n}d ago',
    }

    const zh = {
      'panel.title': 'DeepSeek 用量',
      'panel.description': '实时查看 DeepSeek API 余额、Token 用量与每日趋势。',
      'page.kicker': 'DEEPSEEK API',
      'page.title': '用量总览',
      'page.subtitle': '实时查看本机 Harness 的 Token 消耗、缓存效率与账户余额。',
      'refresh': '刷新',
      'updated': '更新于 {time}',
      'balance': '账户余额',
      'balance.available': '可用',
      'balance.low': '余额不足',
      'balance.loading': '正在读取余额…',
      'balance.missingKey': '未配置 API Key',
      'balance.missingKeyHint': '配置 {ref} 凭据后即可读取 DeepSeek 余额。',
      'balance.error': '余额暂不可用',
      'balance.unauthorized': 'API Key 被拒绝，请检查凭据后重试。',
      'balance.forbidden': '当前 Key 无权读取余额信息。',
      'balance.rateLimited': 'DeepSeek 正在限制余额请求频率，请稍后重试。',
      'balance.network': '无法连接 api.deepseek.com，请检查网络后重试。',
      'balance.invalid': 'DeepSeek 返回了无法识别的余额数据。',
      'balance.failed': '余额读取失败，请重试。',
      'balance.retry': '重试',
      'balance.toppedUp': '充值',
      'balance.granted': '赠送',
      'balance.source.apiKey': 'API Key',
      'balance.source.account': 'DSH 账户',
      'balance.noWallets': '未返回钱包信息。',
      'today.tokens': '今日 Token',
      'today.requests': '今日请求',
      'today.cache': '缓存命中率',
      'today.total': '累计 Token',
      'delta.up': '较昨日 {value}',
      'delta.down': '较昨日 {value}',
      'delta.flat': '与昨日持平',
      'delta.none': '昨日暂无数据',
      'chart.title': '每日用量',
      'chart.subtitle': '最近 {days} 天的 Token 消耗',
      'chart.rangeTotal': '区间合计 {value} Token',
      'chart.empty': '还没有 Token 使用记录。',
      'range.7': '7 天',
      'range.14': '14 天',
      'range.30': '30 天',
      'legend.input': '输入',
      'legend.output': '输出',
      'composition.title': 'Token 构成',
      'composition.input': '输入 Token',
      'composition.output': '输出 Token',
      'composition.cache': '缓存读取',
      'composition.total': '总 Token',
      'composition.subtitle': '全部已记录请求',
      'models.title': '模型分布',
      'models.subtitle': '按 Token 用量排序',
      'models.empty': '还没有模型用量记录。',
      'models.requests': '{n} 次请求',
      'models.count': '{n} 个模型',
      'total.requests': '累计 {n} 次请求',
      'table.title': '最近 7 天',
      'table.date': '日期',
      'table.requests': '请求',
      'table.input': '输入',
      'table.output': '输出',
      'table.cache': '缓存命中',
      'table.total': '合计',
      'table.today': '今天',
      'table.yesterday': '昨天',
      'note': 'Token 数据来自本机 DSH 会话日志；余额来自 DeepSeek /user/balance。',
      'note.scope': '统计范围：provider 或模型名包含“deepseek”的请求。',
      'openUsage': '打开 DeepSeek 用量页',
      'scanning': '正在扫描历史会话…',
      'sessions': '已扫描 {n} 个会话',
      'error.title': '无法加载用量数据',
      'error.retry': '重试',
      'error.host': '插件的 Host 半未响应，请重新安装或重启 Harness。',
      'unknown': '未知',
      'time.justNow': '刚刚',
      'time.seconds': '{n} 秒前',
      'time.minutes': '{n} 分钟前',
      'time.hours': '{n} 小时前',
      'time.days': '{n} 天前',
    }

    const CSS = `
.dsu-page {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font: inherit;
}
.dsu-inner {
  box-sizing: border-box;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 28px clamp(24px, 4vw, 48px) 52px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dsu-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-top: 4px;
}
.dsu-head-copy { min-width: 0; }
.dsu-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  line-height: 16px;
  font-weight: 650;
  letter-spacing: .12em;
  color: var(--dsw-alias-label-secondary);
}
.dsu-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-success-primary) 16%, transparent);
  animation: dsu-pulse 2.2s ease-in-out infinite;
}
.dsu-title {
  margin: 7px 0 0;
  font-size: 26px;
  line-height: 34px;
  font-weight: 600;
  letter-spacing: -.02em;
}
.dsu-subtitle {
  max-width: 620px;
  margin: 5px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-head-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  padding-top: 3px;
}
.dsu-updated {
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.dsu-refresh {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}
.dsu-refresh:hover:not(:disabled) {
  border-color: var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
}
.dsu-refresh:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.dsu-refresh:disabled { cursor: default; opacity: .62; }
.dsu-spin { animation: dsu-spin 1s linear infinite; }
.dsu-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, var(--dsw-alias-border-l1));
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 18px;
}
.dsu-banner strong { color: var(--dsw-alias-state-error-primary); }
.dsu-banner span { margin-left: 8px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dsu-banner button {
  flex: none;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsu-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.55fr);
  gap: 14px;
}
.dsu-card,
.dsu-balance-card,
.dsu-metric {
  box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 15px;
  background: var(--dsw-alias-bg-layer-1);
}
.dsu-balance-card {
  display: flex;
  flex-direction: column;
  min-height: 206px;
  padding: 18px 20px;
  background:
    radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--dsw-alias-brand-primary) 15%, transparent), transparent 58%),
    var(--dsw-alias-bg-layer-1);
}
.dsu-balance-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dsu-card-label {
  font-size: 12px;
  line-height: 18px;
  font-weight: 550;
  color: var(--dsw-alias-label-secondary);
}
.dsu-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .02em;
  white-space: nowrap;
}
.dsu-badge.ok {
  color: var(--dsw-alias-state-success-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 13%, transparent);
}
.dsu-badge.warn {
  color: var(--dsw-alias-state-warn-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 14%, transparent);
}
.dsu-badge.bad {
  color: var(--dsw-alias-state-error-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);
}
.dsu-badge.muted {
  color: var(--dsw-alias-label-secondary);
  background: color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent);
}
.dsu-balance-amount {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 18px;
  font-variant-numeric: tabular-nums;
}
.dsu-balance-amount strong {
  font-size: 42px;
  line-height: 48px;
  font-weight: 600;
  letter-spacing: -.04em;
}
.dsu-currency {
  font-size: 21px;
  line-height: 28px;
  font-weight: 500;
  color: var(--dsw-alias-label-secondary);
}
.dsu-balance-amount.is-empty strong { color: var(--dsw-alias-label-secondary); opacity: .55; }
.dsu-balance-detail {
  margin: 6px 0 0;
  font-size: 11.5px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-balance-hint {
  margin: 8px 0 0;
  font-size: 11.5px;
  line-height: 18px;
  color: var(--dsw-alias-label-secondary);
  overflow-wrap: anywhere;
}
.dsu-balance-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  font-size: 10.5px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-balance-foot button {
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.dsu-balance-foot button:hover { background: var(--dsw-alias-bg-layer-2); }
.dsu-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.dsu-metric {
  display: flex;
  flex-direction: column;
  min-height: 98px;
  padding: 14px 15px 13px;
}
.dsu-metric-label {
  font-size: 11px;
  line-height: 16px;
  font-weight: 550;
  color: var(--dsw-alias-label-secondary);
}
.dsu-metric-value {
  margin-top: 5px;
  font-size: 24px;
  line-height: 30px;
  font-weight: 600;
  letter-spacing: -.025em;
  font-variant-numeric: tabular-nums;
}
.dsu-metric-foot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
  font-size: 10.5px;
  line-height: 15px;
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
}
.dsu-delta {
  display: inline-flex;
  align-items: center;
  height: 16px;
  padding: 0 5px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);
  color: var(--dsw-alias-brand-primary);
  font-size: 9.5px;
  font-weight: 600;
}
.dsu-delta.down { color: var(--dsw-alias-label-secondary); background: color-mix(in srgb, var(--dsw-alias-label-secondary) 9%, transparent); }
.dsu-progress {
  height: 4px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-secondary) 12%, transparent);
}
.dsu-progress > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--dsw-alias-state-success-primary);
}
.dsu-card { padding: 18px 20px 20px; }
.dsu-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.dsu-card-head h2 {
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}
.dsu-card-head p {
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 17px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-tabs {
  display: inline-flex;
  flex: none;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
}
.dsu-tab {
  height: 24px;
  padding: 0 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 10.5px;
  font-weight: 550;
  cursor: pointer;
}
.dsu-tab[data-active="true"] {
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .08);
}
.dsu-tab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.dsu-chart-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-legend-item { display: inline-flex; align-items: center; gap: 5px; }
.dsu-legend-dot { width: 8px; height: 8px; border-radius: 2px; }
.dsu-legend-dot.input { background: var(--dsw-alias-brand-primary); }
.dsu-legend-dot.output { background: var(--dsw-alias-state-success-primary); }
.dsu-chart-legend .dsu-range-total { margin-left: auto; font-variant-numeric: tabular-nums; }
.dsu-chart-body {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.dsu-chart-yaxis {
  display: flex;
  flex: none;
  flex-direction: column;
  justify-content: space-between;
  width: 42px;
  height: 178px;
  padding-bottom: 0;
  font-size: 9.5px;
  color: var(--dsw-alias-label-secondary);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dsu-chart-main { flex: 1; min-width: 0; }
.dsu-chart-plot {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: clamp(3px, .8vw, 9px);
  height: 178px;
  padding: 0 2px;
}
.dsu-chart-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.dsu-chart-grid span {
  width: 100%;
  border-top: 1px dashed color-mix(in srgb, var(--dsw-alias-border-l1) 75%, transparent);
}
.dsu-chart-col {
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
}
.dsu-chart-bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(62%, 30px);
  min-height: 2px;
  overflow: hidden;
  border-radius: 5px 5px 2px 2px;
  transition: height .28s ease, filter .15s ease;
}
.dsu-chart-col:hover .dsu-chart-bar { filter: brightness(1.1); }
.dsu-chart-bar.is-zero { min-height: 0; }
.dsu-chart-bar.is-today { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, transparent); }
.dsu-chart-seg { width: 100%; }
.dsu-chart-seg.input {
  background: linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 78%, var(--dsw-alias-bg-layer-1)), var(--dsw-alias-brand-primary));
}
.dsu-chart-seg.output {
  background: linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-state-success-primary) 72%, var(--dsw-alias-bg-layer-1)), var(--dsw-alias-state-success-primary));
}
.dsu-chart-labels {
  display: flex;
  gap: clamp(3px, .8vw, 9px);
  padding: 7px 2px 0;
}
.dsu-chart-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 9.5px;
  line-height: 14px;
  color: var(--dsw-alias-label-secondary);
  text-align: center;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dsu-chart-empty {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);
  border-radius: 10px;
}
.dsu-split {
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
  gap: 14px;
}
.dsu-mix-body {
  display: flex;
  align-items: center;
  gap: clamp(18px, 3vw, 30px);
  margin-top: 18px;
}
.dsu-donut-wrap { flex: none; }
.dsu-donut {
  display: grid;
  place-items: center;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: conic-gradient(var(--dsw-alias-bg-layer-2) 0 100%);
}
.dsu-donut-hole {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-layer-1);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1);
}
.dsu-donut-hole strong {
  max-width: 78px;
  overflow: hidden;
  font-size: 19px;
  line-height: 24px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dsu-donut-hole span {
  max-width: 78px;
  overflow: hidden;
  font-size: 9px;
  line-height: 13px;
  color: var(--dsw-alias-label-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsu-mix-legend { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.dsu-mix-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 10px;
  align-items: center;
  font-size: 11px;
  line-height: 16px;
}
.dsu-mix-name { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-secondary); }
.dsu-mix-value { color: var(--dsw-alias-label-primary); font-weight: 550; font-variant-numeric: tabular-nums; }
.dsu-mix-bar {
  grid-column: 1 / -1;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-secondary) 11%, transparent);
}
.dsu-mix-bar > span { display: block; height: 100%; border-radius: inherit; }
.dsu-mix-bar.input > span { background: var(--dsw-alias-brand-primary); }
.dsu-mix-bar.output > span { background: var(--dsw-alias-state-success-primary); }
.dsu-mix-bar.cache > span { background: var(--dsw-alias-state-warn-primary); }
.dsu-models-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dsu-model-list { display: flex; flex-direction: column; gap: 13px; margin-top: 17px; }
.dsu-model-row { min-width: 0; }
.dsu-model-top { display: flex; align-items: baseline; gap: 8px; justify-content: space-between; }
.dsu-model-name {
  overflow: hidden;
  font-size: 11.5px;
  line-height: 16px;
  font-weight: 550;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsu-model-total {
  flex: none;
  font-size: 11px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
}
.dsu-model-meta {
  display: flex;
  gap: 8px;
  margin-top: 1px;
  font-size: 9.5px;
  line-height: 14px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-model-meta span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsu-model-bar {
  height: 4px;
  margin-top: 5px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-secondary) 10%, transparent);
}
.dsu-model-bar > span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 65%, var(--dsw-alias-bg-layer-1)), var(--dsw-alias-brand-primary));
}
.dsu-empty-note {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 116px;
  margin-top: 10px;
  border: 1px dashed var(--dsw-alias-border-l1);
  border-radius: 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  text-align: center;
}
.dsu-table-scroll { margin-top: 14px; overflow-x: auto; }
.dsu-table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.dsu-table th {
  padding: 0 10px 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 9.5px;
  font-weight: 550;
  letter-spacing: .02em;
  text-align: right;
  white-space: nowrap;
}
.dsu-table td {
  padding: 9px 10px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  text-align: right;
  white-space: nowrap;
}
.dsu-table th:first-child,
.dsu-table td:first-child { padding-left: 0; text-align: left; }
.dsu-table th:last-child,
.dsu-table td:last-child { padding-right: 0; }
.dsu-table tbody tr:first-child td { border-top-color: var(--dsw-alias-border-l2); }
.dsu-table tbody tr.is-today td { color: var(--dsw-alias-label-primary); font-weight: 550; }
.dsu-table .dsu-muted { color: var(--dsw-alias-label-secondary); }
.dsu-table-day { display: inline-flex; align-items: center; gap: 6px; }
.dsu-today-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--dsw-alias-brand-primary); }
.dsu-footnote {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 18px;
  padding: 2px 2px 0;
  font-size: 10px;
  line-height: 16px;
  color: var(--dsw-alias-label-secondary);
}
.dsu-footnote a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-brand-primary);
  text-decoration: none;
}
.dsu-footnote a:hover { text-decoration: underline; }
.dsu-footnote a:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; border-radius: 4px; }
.dsu-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 32px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 16px;
  background: var(--dsw-alias-bg-layer-1);
  text-align: center;
}
.dsu-state-card h2 { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; }
.dsu-state-card p {
  max-width: 480px;
  margin: 7px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 19px;
}
.dsu-state-card button {
  height: 32px;
  margin-top: 18px;
  padding: 0 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsu-state-card button:hover { border-color: var(--dsw-alias-border-l2); }
.dsu-state-card button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.dsu-skeleton { display: flex; flex-direction: column; gap: 14px; }
.dsu-skeleton-hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.55fr); gap: 14px; }
.dsu-skeleton-block {
  min-height: 118px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 15px;
  background:
    linear-gradient(100deg, transparent 20%, color-mix(in srgb, var(--dsw-alias-label-secondary) 7%, transparent) 40%, transparent 60%) 0 0 / 220% 100%,
    var(--dsw-alias-bg-layer-1);
  animation: dsu-shimmer 1.5s ease-in-out infinite;
}
.dsu-skeleton-hero .dsu-skeleton-block:first-child { min-height: 206px; }
.dsu-skeleton-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.dsu-skeleton-chart { min-height: 280px; }
.dsu-scan {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: var(--dsw-alias-label-secondary);
}
@keyframes dsu-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .62; transform: scale(.86); }
}
@keyframes dsu-spin { to { transform: rotate(360deg); } }
@keyframes dsu-shimmer {
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dsu-live-dot, .dsu-skeleton-block, .dsu-spin { animation: none; }
  .dsu-chart-bar { transition: none; }
}
@media (max-width: 860px) {
  .dsu-hero, .dsu-split, .dsu-skeleton-hero { grid-template-columns: minmax(0, 1fr); }
  .dsu-balance-card { min-height: 180px; }
}
@media (max-width: 560px) {
  .dsu-inner { padding-inline: 18px; }
  .dsu-head { flex-direction: column; gap: 12px; }
  .dsu-head-actions { width: 100%; justify-content: space-between; }
  .dsu-metrics, .dsu-skeleton-metrics { grid-template-columns: minmax(0, 1fr); }
  .dsu-mix-body { flex-direction: column; align-items: flex-start; }
  .dsu-chart-yaxis { width: 34px; }
}
`

    function UsageIcon({ size = 18 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
        style: { display: 'block' },
      },
      h('path', {
        d: 'M4 18.5V13.2M9.33 18.5V9.1M14.67 18.5v-4.6M20 18.5V6.2',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      }),
      h('path', {
        d: 'M4 8.7 9.1 4l4.1 3.4L20 2.6',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        opacity: 0.72,
      }))
    }

    function RefreshIcon({ size = 15, spinning = false }) {
      return h('svg', {
        className: spinning ? 'dsu-spin' : undefined,
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
      },
      h('path', {
        d: 'M20 11a8 8 0 1 0-2.34 5.66',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      }),
      h('path', {
        d: 'M20 4.5V11h-6.5',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }))
    }

    function ExternalIcon({ size = 11 }) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        'aria-hidden': true,
      },
      h('path', {
        d: 'M14 5h5v5M19 5l-8 8',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }),
      h('path', {
        d: 'M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
      }))
    }

    function UsagePanel(props) {
      const t = props.t || props.fallbackT || (key => key)
      const [snapshot, setSnapshot] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [loading, setLoading] = React.useState(true)
      const [busy, setBusy] = React.useState(false)
      const [range, setRange] = React.useState(14)
      const snapshotRef = React.useRef(null)

      const call = React.useCallback(async (method) => {
        const response = await fetch(ROUTE, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: method }),
        })
        if (!response.ok) {
          throw new Error(`Usage endpoint returned HTTP ${response.status}.`)
        }
        const result = await response.json()
        if (result === null || typeof result !== 'object' || result.ok !== true) {
          const message = result && result.error && typeof result.error.message === 'string'
            ? result.error.message
            : 'Host request failed.'
          throw new Error(message)
        }
        return result.value
      }, [])

      React.useEffect(() => {
        let cancelled = false
        let timer = null
        const tick = async () => {
          try {
            const next = await call('snapshot')
            if (cancelled) return
            snapshotRef.current = next
            setSnapshot(next)
            setError(null)
            setLoading(false)
          } catch (caught) {
            if (cancelled) return
            setError(caught instanceof Error ? caught.message : String(caught))
            setLoading(false)
          } finally {
            if (!cancelled) {
              const seconds = snapshotRef.current && snapshotRef.current.meta
                ? snapshotRef.current.meta.pollSeconds
                : 5
              timer = window.setTimeout(tick, Math.max(2, Number(seconds) || 5) * 1000)
            }
          }
        }
        tick()
        return () => {
          cancelled = true
          if (timer !== null) window.clearTimeout(timer)
        }
      }, [call])

      const refresh = async () => {
        setBusy(true)
        try {
          await call('refresh')
          const next = await call('snapshot')
          snapshotRef.current = next
          setSnapshot(next)
          setError(null)
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : String(caught))
        } finally {
          setBusy(false)
        }
      }

      const usage = snapshot && snapshot.usage ? snapshot.usage : null
      const balance = snapshot && snapshot.balance ? snapshot.balance : null
      const updatedAt = snapshot && snapshot.generatedAt ? snapshot.generatedAt : null
      const credentialRef = snapshot && snapshot.meta && snapshot.meta.credentialRef
        ? snapshot.meta.credentialRef
        : 'DEEPSEEK_API_KEY'

      let body
      if (loading && snapshot === null) {
        body = h(LoadingState)
      } else if (snapshot === null) {
        body = h('div', { className: 'dsu-state-card', role: 'alert' },
          h('h2', null, t('error.title')),
          h('p', null, error || t('error.host')),
          h('button', { type: 'button', onClick: refresh, disabled: busy }, t('error.retry')))
      } else {
        const days = usage.days.slice(-range)
        const max = niceMax(Math.max(...days.map(day => day.total), 0))
        const hasChartData = days.some(day => day.total > 0)
        const todayKey = usage.days.length > 0 ? usage.days[usage.days.length - 1].date : ''
        const rangeTotal = days.reduce((sum, day) => sum + day.total, 0)
        body = h(React.Fragment, null,
          error !== null
            ? h('div', { className: 'dsu-banner', role: 'alert' },
              h('div', null,
                h('strong', null, t('error.title')),
                h('span', null, error)),
              h('button', { type: 'button', onClick: refresh, disabled: busy }, t('error.retry')))
            : null,
          h(Hero, {
            usage,
            balance,
            busy,
            credentialRef,
            onRetry: refresh,
            t,
          }),
          h(ChartCard, {
            days,
            max,
            hasChartData,
            todayKey,
            range,
            setRange,
            rangeTotal,
            scanning: snapshot.scanning,
            scanned: usage.sessions.scanned,
            t,
          }),
          h('div', { className: 'dsu-split' },
            h(CompositionCard, { usage, t }),
            h(ModelsCard, { models: usage.models, t })),
          h(RecentTable, { usage, t }))
      }

      return h('section', { className: 'dsu-page', 'data-plugin-panel': 'deepseek-usage' },
        h('style', null, CSS),
        h('div', { className: 'dsu-inner' },
          h('header', { className: 'dsu-head', 'data-window-drag': '' },
            h('div', { className: 'dsu-head-copy' },
              h('div', { className: 'dsu-kicker' },
                h('span', { className: 'dsu-live-dot', 'aria-hidden': true }),
                t('page.kicker')),
              h('h1', { className: 'dsu-title' }, t('page.title')),
              h('p', { className: 'dsu-subtitle' }, t('page.subtitle'))),
            h('div', { className: 'dsu-head-actions' },
              h('span', { className: 'dsu-updated', role: 'status' },
                t('updated', { time: updatedAt === null ? '—' : relativeTime(updatedAt, t) })),
              h('button', {
                type: 'button',
                className: 'dsu-refresh',
                onClick: refresh,
                disabled: busy,
                'aria-label': t('refresh'),
              },
              h(RefreshIcon, { size: 15, spinning: busy }),
              h('span', null, t('refresh'))))),
          body,
          h('footer', { className: 'dsu-footnote' },
            h('span', null, t('note')),
            h('span', null, t('note.scope')),
            h('a', {
              href: 'https://platform.deepseek.com/usage',
              target: '_blank',
              rel: 'noreferrer',
            }, t('openUsage'), h(ExternalIcon)))))
    }

    function Hero({ usage, balance, busy, credentialRef, onRetry, t }) {
      return h('div', { className: 'dsu-hero' },
        h(BalanceCard, {
          balance,
          t,
          busy,
          credentialRef,
          onRetry,
        }),
        h('div', { className: 'dsu-metrics' },
          h(Metric, {
            label: t('today.tokens'),
            value: compact(usage.today.total),
            foot: h(React.Fragment, null,
              h('span', null, `${t('legend.input')} ${compact(usage.today.input)}`),
              h('span', null, '·'),
              h('span', null, `${t('legend.output')} ${compact(usage.today.output)}`),
              h(Delta, { today: usage.today, yesterday: usage.yesterday, t })),
          }),
          h(Metric, {
            label: t('today.requests'),
            value: formatInt(usage.today.requests),
            foot: h('span', null, t('sessions', { n: formatInt(usage.sessions.count) })),
          }),
          h(Metric, {
            label: t('today.cache'),
            value: usage.today.cacheHitRate === null ? '—' : formatPercent(usage.today.cacheHitRate),
            foot: h('span', null, `${t('composition.cache')} ${compact(usage.today.cacheRead)}`),
            children: h('div', { className: 'dsu-progress' },
              h('span', {
                style: { width: `${Math.max(0, Math.min(100, (usage.today.cacheHitRate || 0) * 100))}%` },
              })),
          }),
          h(Metric, {
            label: t('today.total'),
            value: compact(usage.total.total),
            foot: h('span', null,
              t('total.requests', { n: formatInt(usage.total.requests) }),
              ` · ${compact(usage.total.averagePerRequest)} / ${t('table.requests')}`),
          })))
    }

    function ChartCard({ days, max, hasChartData, todayKey, range, setRange, rangeTotal, scanning, scanned, t }) {
      return h('section', { className: 'dsu-card' },
        h('div', { className: 'dsu-card-head' },
          h('div', null,
            h('h2', null, t('chart.title')),
            h('p', null, t('chart.subtitle', { days: range }))),
          h('div', { className: 'dsu-tabs', role: 'group', 'aria-label': t('chart.title') },
            [7, 14, 30].map(value => h('button', {
              key: value,
              type: 'button',
              className: 'dsu-tab',
              'data-active': range === value ? 'true' : 'false',
              'aria-pressed': range === value,
              onClick: () => { setRange(value) },
            }, t(`range.${value}`))))),
        h('div', { className: 'dsu-chart-legend' },
          h('span', { className: 'dsu-legend-item' },
            h('span', { className: 'dsu-legend-dot input' }),
            t('legend.input')),
          h('span', { className: 'dsu-legend-item' },
            h('span', { className: 'dsu-legend-dot output' }),
            t('legend.output')),
          h('span', { className: 'dsu-range-total' }, t('chart.rangeTotal', { value: compact(rangeTotal) }))),
        h('div', { className: 'dsu-chart-body' },
          h('div', { className: 'dsu-chart-yaxis', 'aria-hidden': true },
            h('span', null, compact(max)),
            h('span', null, compact(max / 2)),
            h('span', null, '0')),
          h('div', { className: 'dsu-chart-main' },
            h('div', { className: 'dsu-chart-plot' },
              h('div', { className: 'dsu-chart-grid', 'aria-hidden': true },
                h('span'), h('span'), h('span'), h('span')),
              hasChartData
                ? days.map(day => h(ChartBar, { key: day.date, day, max, todayKey, t }))
                : h('div', { className: 'dsu-chart-empty' }, t('chart.empty'))),
            h('div', { className: 'dsu-chart-labels', 'aria-hidden': true },
              days.map((day, index) => h('span', { key: day.date, className: 'dsu-chart-label' },
                shouldShowLabel(index, days.length, range) ? shortDate(day.date) : ''))))),
        h('div', { className: 'dsu-chart-legend', style: { marginTop: '10px' } },
          h('span', { className: 'dsu-scan' },
            scanning ? t('scanning') : t('sessions', { n: formatInt(scanned) }))))
    }

    function Metric({ label, value, foot, children }) {
      return h('section', { className: 'dsu-metric' },
        h('span', { className: 'dsu-metric-label' }, label),
        h('div', { className: 'dsu-metric-value' }, value),
        children || null,
        foot ? h('div', { className: 'dsu-metric-foot' }, foot) : null)
    }

    function Delta({ today, yesterday, t }) {
      if (!yesterday || yesterday.total <= 0) {
        return h('span', { className: 'dsu-delta down' }, t('delta.none'))
      }
      const change = (today.total - yesterday.total) / yesterday.total
      if (!Number.isFinite(change)) return null
      if (Math.abs(change) < 0.0005) {
        return h('span', { className: 'dsu-delta down' }, t('delta.flat'))
      }
      const formatted = `${change > 0 ? '+' : '−'}${Math.abs(change * 100).toFixed(1)}%`
      return h('span', { className: `dsu-delta${change < 0 ? ' down' : ''}` },
        t(change > 0 ? 'delta.up' : 'delta.down', { value: formatted }))
    }

    function BalanceCard({ balance, t, busy, credentialRef, onRetry }) {
      const wallets = balance && Array.isArray(balance.wallets) ? balance.wallets : []
      const primary = wallets.find(wallet => wallet.currency === 'CNY') || wallets[0] || null
      const status = balance ? balance.status : 'loading'
      const ready = status === 'ready' && primary !== null
      let badge = t('balance.loading')
      let badgeClass = 'muted'
      if (status === 'ready') {
        if (balance.available === false) {
          badge = t('balance.low')
          badgeClass = 'bad'
        } else {
          badge = t('balance.available')
          badgeClass = 'ok'
        }
      } else if (status === 'missing-key') {
        badge = t('balance.missingKey')
        badgeClass = 'warn'
      } else if (status === 'error') {
        badge = t('balance.error')
        badgeClass = 'bad'
      }

      let amount
      let detail
      if (ready) {
        amount = h('div', { className: 'dsu-balance-amount' },
          h('span', { className: 'dsu-currency' }, currencySymbol(primary.currency)),
          h('strong', null, moneyNumber(primary.total)))
        const parts = []
        if (primary.toppedUp !== null && primary.toppedUp !== undefined) {
          parts.push(`${t('balance.toppedUp')} ${currencySymbol(primary.currency)}${moneyNumber(primary.toppedUp)}`)
        }
        if (primary.granted !== null && primary.granted !== undefined) {
          parts.push(`${t('balance.granted')} ${currencySymbol(primary.currency)}${moneyNumber(primary.granted)}`)
        }
        detail = parts.length > 0
          ? h('p', { className: 'dsu-balance-detail' }, parts.join(' · '))
          : h('p', { className: 'dsu-balance-detail' }, status === 'ready' && !primary ? t('balance.noWallets') : '')
      } else {
        amount = h('div', { className: 'dsu-balance-amount is-empty' },
          h('span', { className: 'dsu-currency' }, '—'),
          h('strong', null, status === 'loading' ? '…' : '—'))
        if (status === 'missing-key') {
          detail = h('p', { className: 'dsu-balance-hint' }, t('balance.missingKeyHint', { ref: credentialRef }))
        } else if (status === 'error') {
          detail = h('p', { className: 'dsu-balance-hint' }, balanceErrorMessage(balance, t))
        } else if (status === 'ready') {
          detail = h('p', { className: 'dsu-balance-detail' }, t('balance.noWallets'))
        } else {
          detail = h('p', { className: 'dsu-balance-detail' }, t('balance.loading'))
        }
      }

      const source = balance && balance.source === 'account'
        ? t('balance.source.account')
        : balance && balance.source === 'api-key'
          ? t('balance.source.apiKey')
          : null
      return h('section', { className: 'dsu-balance-card' },
        h('div', { className: 'dsu-balance-head' },
          h('span', { className: 'dsu-card-label' }, t('balance')),
          h('span', { className: `dsu-badge ${badgeClass}` }, badge)),
        amount,
        detail,
        wallets.length > 1
          ? h('p', { className: 'dsu-balance-detail' },
            wallets.slice(1).map(wallet => `${currencySymbol(wallet.currency)}${moneyNumber(wallet.total)}`).join(' · '))
          : null,
        h('div', { className: 'dsu-balance-foot' },
          h('span', null,
            source === null
              ? ''
              : `${source}${balance.checkedAt ? ` · ${relativeTime(balance.checkedAt, t)}` : ''}`),
          status === 'error' || status === 'missing-key'
            ? h('button', { type: 'button', onClick: onRetry, disabled: busy }, t('balance.retry'))
            : null))
    }

    function ChartBar({ day, max, todayKey, t }) {
      const height = day.total > 0 ? Math.max(2, Math.min(100, (day.total / max) * 100)) : 0
      const inputShare = day.total > 0 ? (day.input / day.total) * 100 : 0
      const outputShare = day.total > 0 ? (day.output / day.total) * 100 : 0
      const title = [
        longDate(day.date),
        `${t('table.total')}: ${formatInt(day.total)}`,
        `${t('legend.input')}: ${formatInt(day.input)}`,
        `${t('legend.output')}: ${formatInt(day.output)}`,
        `${t('table.cache')}: ${day.cacheHitRate === null ? '—' : formatPercent(day.cacheHitRate)}`,
      ].join('\n')
      return h('div', { className: 'dsu-chart-col', title },
        h('div', {
          className: `dsu-chart-bar${day.date === todayKey ? ' is-today' : ''}${day.total > 0 ? '' : ' is-zero'}`,
          style: { height: `${height}%` },
          'aria-label': title,
        },
        inputShare > 0 ? h('div', { className: 'dsu-chart-seg input', style: { height: `${inputShare}%` } }) : null,
        outputShare > 0 ? h('div', { className: 'dsu-chart-seg output', style: { height: `${outputShare}%` } }) : null))
    }

    function CompositionCard({ usage, t }) {
      const input = usage.total.input
      const output = usage.total.output
      const total = input + output
      const inputShare = total > 0 ? (input / total) * 100 : 0
      const cacheHit = usage.total.cacheHitRate
      const donutBackground = total > 0
        ? `conic-gradient(var(--dsw-alias-brand-primary) 0 ${inputShare}%, var(--dsw-alias-state-success-primary) ${inputShare}% 100%)`
        : 'var(--dsw-alias-bg-layer-2)'
      return h('section', { className: 'dsu-card' },
        h('div', { className: 'dsu-card-head' },
          h('div', null,
            h('h2', null, t('composition.title')),
            h('p', null, t('composition.subtitle')))),
        h('div', { className: 'dsu-mix-body' },
          h('div', { className: 'dsu-donut-wrap' },
            h('div', { className: 'dsu-donut', style: { background: donutBackground } },
              h('div', { className: 'dsu-donut-hole' },
                h('strong', { title: formatInt(total) }, compact(total)),
                h('span', null, t('composition.total'))))),
          h('div', { className: 'dsu-mix-legend' },
            mixRow('input', t('composition.input'), compact(input), total > 0 ? input / total : 0),
            mixRow('output', t('composition.output'), compact(output), total > 0 ? output / total : 0),
            mixRow('cache', t('composition.cache'), compact(usage.total.cacheRead), cacheHit || 0,
              cacheHit === null ? '—' : formatPercent(cacheHit)))))
    }

    function mixRow(kind, label, value, share, trailing) {
      return h('div', { className: 'dsu-mix-row' },
        h('span', { className: 'dsu-mix-name' },
          h('span', { className: `dsu-legend-dot ${kind}` }),
          label),
        h('span', { className: 'dsu-mix-value' }, trailing ? `${value} · ${trailing}` : value),
        h('div', { className: `dsu-mix-bar ${kind}` },
          h('span', { style: { width: `${Math.max(0, Math.min(100, share * 100))}%` } })))
    }

    function ModelsCard({ models, t }) {
      const max = Math.max(...models.map(model => model.total), 1)
      return h('section', { className: 'dsu-card' },
        h('div', { className: 'dsu-card-head' },
          h('div', null,
            h('h2', null, t('models.title')),
            h('p', null, t('models.subtitle'))),
          models.length > 0
            ? h('span', { className: 'dsu-scan' }, t('models.count', { n: models.length }))
            : null),
        models.length === 0
          ? h('div', { className: 'dsu-empty-note' }, t('models.empty'))
          : h('div', { className: 'dsu-model-list' },
            models.map(model => h('div', { className: 'dsu-model-row', key: `${model.provider}:${model.model}` },
              h('div', { className: 'dsu-model-top' },
                h('span', { className: 'dsu-model-name', title: `${model.provider} / ${model.model}` },
                  prettyModel(model.model, t)),
                h('span', { className: 'dsu-model-total' }, compact(model.total))),
              h('div', { className: 'dsu-model-meta' },
                h('span', { title: model.provider }, prettyProvider(model.provider, t)),
                h('span', null, t('models.requests', { n: formatInt(model.requests) }))),
              h('div', { className: 'dsu-model-bar' },
                h('span', { style: { width: `${Math.max(2, (model.total / max) * 100)}%` } }))))))
    }

    function RecentTable({ usage, t }) {
      const days = usage.days.slice(-7).reverse()
      const todayKey = usage.days.length > 0 ? usage.days[usage.days.length - 1].date : ''
      const yesterdayKey = usage.days.length > 1 ? usage.days[usage.days.length - 2].date : ''
      return h('section', { className: 'dsu-card' },
        h('div', { className: 'dsu-card-head' },
          h('div', null,
            h('h2', null, t('table.title')),
            h('p', null, t('chart.subtitle', { days: 7 })))),
        h('div', { className: 'dsu-table-scroll' },
          h('table', { className: 'dsu-table' },
            h('thead', null,
              h('tr', null,
                [t('table.date'), t('table.requests'), t('table.input'), t('table.output'), t('table.cache'), t('table.total')]
                  .map((label, index) => h('th', { key: index, scope: 'col' }, label)))),
            h('tbody', null,
              days.map(day => h('tr', {
                key: day.date,
                className: day.date === todayKey ? 'is-today' : undefined,
              },
              h('td', null,
                h('span', { className: 'dsu-table-day' },
                  day.date === todayKey ? h('span', { className: 'dsu-today-dot', 'aria-hidden': true }) : null,
                  day.date === todayKey ? t('table.today') : day.date === yesterdayKey ? t('table.yesterday') : tableDate(day.date))),
              h('td', null, formatInt(day.requests)),
              h('td', null, compact(day.input)),
              h('td', null, compact(day.output)),
              h('td', { className: day.cacheHitRate === null ? 'dsu-muted' : undefined },
                day.cacheHitRate === null ? '—' : formatPercent(day.cacheHitRate)),
              h('td', null, compact(day.total))))))))
    }

    function LoadingState() {
      return h('div', { className: 'dsu-skeleton', 'aria-busy': true },
        h('div', { className: 'dsu-skeleton-hero' },
          h('div', { className: 'dsu-skeleton-block' }),
          h('div', { className: 'dsu-skeleton-metrics' },
            h('div', { className: 'dsu-skeleton-block' }),
            h('div', { className: 'dsu-skeleton-block' }),
            h('div', { className: 'dsu-skeleton-block' }),
            h('div', { className: 'dsu-skeleton-block' }))),
        h('div', { className: 'dsu-skeleton-block dsu-skeleton-chart' }))
    }

    function compact(value) {
      const number = numeric(value)
      if (Math.abs(number) >= 1_000_000_000) return `${trim(number / 1_000_000_000)}B`
      if (Math.abs(number) >= 1_000_000) return `${trim(number / 1_000_000)}M`
      if (Math.abs(number) >= 10_000) return `${trim(number / 1_000)}K`
      return formatInt(number)
    }

    function trim(value) {
      const fixed = value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)
      return fixed.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')
    }

    function formatInt(value) {
      return Math.round(numeric(value)).toLocaleString()
    }

    function formatPercent(value) {
      const number = numeric(value)
      return `${(number * 100).toFixed(number > 0 && number < 0.001 ? 2 : 1)}%`
    }

    function numeric(value) {
      const number = typeof value === 'number' ? value : Number(value)
      return Number.isFinite(number) ? number : 0
    }

    function niceMax(value) {
      if (!Number.isFinite(value) || value <= 0) return 1000
      const power = 10 ** Math.floor(Math.log10(value))
      const scaled = value / power
      const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10
      return nice * power
    }

    function currencySymbol(currency) {
      if (currency === 'CNY') return '¥'
      if (currency === 'USD') return '$'
      return currency ? `${currency} ` : ''
    }

    function moneyNumber(value) {
      const number = Number(value)
      if (!Number.isFinite(number)) return '—'
      return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    function parseDay(date) {
      const parts = String(date).split('-').map(Number)
      if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return null
      return new Date(parts[0], parts[1] - 1, parts[2])
    }

    function shortDate(date) {
      const parsed = parseDay(date)
      if (parsed === null) return date
      return `${parsed.getMonth() + 1}/${parsed.getDate()}`
    }

    function tableDate(date) {
      const parsed = parseDay(date)
      if (parsed === null) return date
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(parsed)
    }

    function longDate(date) {
      const parsed = parseDay(date)
      if (parsed === null) return date
      return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(parsed)
    }

    function shouldShowLabel(index, count, range) {
      if (index === count - 1) return true
      if (range === 30) return index % 3 === 0
      if (range === 14) return index % 2 === 0
      return true
    }

    function relativeTime(timestamp, t) {
      const delta = Math.max(0, Date.now() - numeric(timestamp))
      const seconds = Math.round(delta / 1000)
      if (seconds < 8) return t('time.justNow')
      if (seconds < 60) return t('time.seconds', { n: seconds })
      const minutes = Math.round(seconds / 60)
      if (minutes < 60) return t('time.minutes', { n: minutes })
      const hours = Math.round(minutes / 60)
      if (hours < 24) return t('time.hours', { n: hours })
      return t('time.days', { n: Math.round(hours / 24) })
    }

    function prettyModel(model, t) {
      if (model === null || model === undefined || model === '' || model === 'unknown') return t('unknown')
      return String(model)
    }

    function prettyProvider(provider, t) {
      if (provider === null || provider === undefined || provider === '' || provider === 'unknown') return t('unknown')
      return String(provider)
    }

    function balanceErrorMessage(balance, t) {
      if (balance === null || balance === undefined) return t('balance.error')
      switch (balance.errorCode) {
        case 'unauthorized': return t('balance.unauthorized')
        case 'forbidden': return t('balance.forbidden')
        case 'rate-limited': return t('balance.rateLimited')
        case 'network':
        case 'timeout': return t('balance.network')
        case 'invalid-response': return t('balance.invalid')
        default: return t('balance.failed')
      }
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'deepseek-usage: dictionaries')
      const t = ctx.locale.bind(NS)
      const Panel = props => h(UsagePanel, {
        ...props,
        fallbackT: t,
      })
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
        locale: NS,
      }, Panel))
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        locale: NS,
        label: () => t('panel.title'),
      }, UsageIcon))
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
