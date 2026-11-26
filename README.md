# 某某的博客

基于上传的 `index.html` 原型整体替换的静态个人博客首页。

- `index.html`：完整页面，CSS 与图片均内嵌，无外部依赖。
- `404.html`：同设计语言的 404 页面。
- `favicon.ico`：浏览器默认图标。
- `发布博客.bat`：提交并推送到 GitHub Pages。

## 本地预览

直接打开 `index.html`，或运行任意静态服务器：

```bash
py -m http.server 8123
```

然后访问 `http://127.0.0.1:8123/`。

## 部署

仓库使用 GitHub Pages 的 `master` 分支根目录。推送到 `master` 后自动发布：

https://edboy-616.github.io/
