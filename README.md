# ED boy · 个人博客

基于上传的 `index.html` 整体替换的单页个人博客。页面标题为「ED boy · 个人博客」，包含首页、文章、项目、关于与联系等区块。

## 文件

- `index.html`：完整单页博客，HTML、CSS、JavaScript、SVG、Canvas 与站点数据均内嵌，无构建步骤、无外部运行资源依赖。
- `404.html`：与首页同设计语言的自定义错误页，保留 `noindex` 并提供返回首页链接，无外部依赖。
- `favicon.ico`：仓库保留的默认站点图标；页面自身使用内嵌 data SVG favicon。
- `发布博客.bat`、`在家第一次用-双击这个.bat`、`开工前先双击这个.bat`：保留的仓库辅助脚本。

## 本地预览

直接打开 `index.html` 即可预览。文章与项目列表由页面内嵌脚本渲染，需要浏览器启用 JavaScript。

也可以在仓库根目录启动一个仅监听本机的静态服务器（需已安装 Python）：

```powershell
pwsh -NoProfile -Command "python -m http.server 8123 --bind 127.0.0.1"
```

然后访问 <http://127.0.0.1:8123/>。

## GitHub Pages 部署

仓库使用 GitHub Pages 的 legacy 发布方式：从 `master` 分支根目录发布，线上地址为：

https://edboy-616.github.io/

将包含本次替换的提交推送到 `master` 后，由 GitHub Pages 自动构建。当前工作分支为 `replace-with-uploaded-html`；发布时应确认推送的是当前工作分支的目标提交，而不是落后的本地 `master`。不要强制推送。
