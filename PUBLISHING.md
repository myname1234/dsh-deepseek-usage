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

1. Create a **public** repository named `dsh-deepseek-usage` under
   `myname1234`: <https://github.com/new?name=dsh-deepseek-usage&visibility=public>.
   Do not initialize it with a README; this checkout already has one.
2. Push this checkout:

   ```powershell
   cd D:\workspace\dsh-deepseek-usage-app
   git push -u origin main
   ```

3. Add the `dsh-plugin` topic in the repository settings.
4. Wait until the repository is at least 24 hours old (the CI gate checks it).
5. Fork `awesome-dsh-plugin/awesome-dsh-plugin` in the GitHub UI.
6. Push the prepared submission branch to your fork:

   ```powershell
   cd D:\workspace\awesome-dsh-plugin
   git remote rename origin upstream
   git remote add origin https://github.com/myname1234/awesome-dsh-plugin.git
   git push -u origin add-deepseek-usage-dashboard
   ```

7. Open the pull request:

   <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/compare/main...myname1234:add-deepseek-usage-dashboard?expand=1>

   Use this PR body:

   ```markdown
   Adds `myname1234/dsh-deepseek-usage` to Usage & Billing.

   - Installs with `dsh plugin --profile <profile> add github:myname1234/dsh-deepseek-usage`.
   - `package.json` declares `dsh.bundle.patch`; plain JavaScript, no build step and no `allowBuilds` approval.
   - One submission file only: `data/plugins/myname1234__dsh-deepseek-usage.yml`.
   - The icon is a 180×180 PNG hosted by the plugin repository.
   ```

8. Push corrections to the same branch if CI or a maintainer asks.

The site and `plugins.json` rebuild automatically after the PR merges.

## Accuracy notes

The description deliberately avoids claiming platform-wide usage. Token
figures are folded from this machine's DSH Session logs; balance is read from
DeepSeek's `/user/balance` endpoint using the `DEEPSEEK_API_KEY` credential or
the signed-in DSH account. Do not change the wording to claim all DeepSeek API
traffic is counted.
