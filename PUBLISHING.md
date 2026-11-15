# Publishing to Awesome DSH Plugin

Target: <https://awesome-dsh-plugin.com/zh/>

The site has no upload form. It is generated from the
[awesome-dsh-plugin/awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
repository, where each plugin is one YAML file under `data/plugins/`.

## Repository prerequisites

The public GitHub repository for this plugin must:

- contain this package at its repository root;
- declare `dsh.bundle` in `package.json` (this package does);
- contain real, working code (this package does);
- be at least one day old;
- have the `dsh-plugin` topic;
- have a one-line description that matches what the code actually does.

This package is plain JavaScript with no build step, so a GitHub install needs
no `allowBuilds` approval.

## Submission file

Filename:

```text
data/plugins/myname1234__dsh-deepseek-usage.yml
```

Contents:

```yaml
url: https://github.com/myname1234/dsh-deepseek-usage
name: myname1234/dsh-deepseek-usage
category: usage
description:
  en: 'Adds a left-sidebar DeepSeek usage page with account balance, token and cache totals, 7/14/30-day stacked charts, a model breakdown, and a seven-day table, with usage read from local DSH session logs.'
  zh: '在左侧栏加入 DeepSeek 用量页面，显示账户余额、Token 与缓存统计、7/14/30 天堆叠图、模型分布和最近 7 天明细，用量读取自本机 DSH 会话日志。'
icon: https://raw.githubusercontent.com/myname1234/dsh-deepseek-usage/main/assets/icon-180.png
```

Only `url`, `name`, `category`, and `description.en` are required. The `zh`
line is supplied here; the maintainers accept a missing translation too. The
`icon` is optional but this package includes a 180×180 PNG at
`assets/icon-180.png`.

## Pull request

1. Push this package to `https://github.com/myname1234/dsh-deepseek-usage`.
2. Add the `dsh-plugin` topic in the repository settings.
3. Wait until the repository is at least 24 hours old (the CI gate checks it).
4. Fork `awesome-dsh-plugin/awesome-dsh-plugin`.
5. Add exactly one file, `data/plugins/myname1234__dsh-deepseek-usage.yml`.
6. Open a PR against `main`; do not edit the generated READMEs.
7. Push corrections to the same branch if CI or a maintainer asks.

The site and `plugins.json` rebuild automatically after the PR merges.

## Accuracy notes

The description deliberately avoids claiming platform-wide usage. Token
figures are folded from this machine's DSH Session logs; balance is read from
DeepSeek's `/user/balance` endpoint using the `DEEPSEEK_API_KEY` credential or
the signed-in DSH account. Do not change the wording to claim all DeepSeek API
traffic is counted.
