# 我的网志

一个手写 HTML 的个人博客。没有构建工具，没有 JavaScript，没有外部字体和图片。
全站首页 + 样式表约 10KB，任何免费托管额度都用不完。

## 文件结构

```
.
├── index.html      首页（文章列表）
├── about.html      关于页
├── 404.html        找不到页面时显示
├── feed.xml        RSS 订阅源
├── assets/
│   └── style.css   全站样式，换配色只改这个文件顶部的变量
└── posts/
    └── *.html      文章，文件名以日期开头
```

## 写一篇新文章

1. 复制 `posts/` 里任意一篇，重命名为 `2026-11-20-标题.html`。
2. 改掉里面的标题、`<meta name="description">`、日期和正文。
3. 打开 `index.html`，复制列表里第一个 `<li>…</li>`，改好日期、链接、标题、摘要，放到最前面。
4. 想让文章进 RSS，就在 `feed.xml` 复制一段 `<item>` 放到最前面（日期格式照抄，星期和月份是英文）。

## 本地预览

双击 `index.html` 也能看，但样式用的是绝对路径 `/assets/`，最好起个本地服务器：

```bash
python -m http.server 8123
```

然后浏览器打开 http://127.0.0.1:8123

## 上线（已完成，这里只是记录）

站点已在线：https://EDboy-616.github.io ，由公开仓库 `EDboy-616.github.io` 的
master 分支驱动 GitHub Pages。代码同时备份在私人仓库 `blog-backup`。
站点里的 `<link rel="canonical">` 和 `feed.xml` 已填好这个域名；
若以后换自定义域名，记得同步替换。

## 两台电脑协作

GitHub 仓库就是两台电脑之间的中转站。日常规矩只有两条，都在项目文件夹里双击：

1. **开工前**双击「开工前先双击这个.bat」——从 GitHub 拉最新版本
2. **收工后**双击「发布博客.bat」——推回 GitHub，一两分钟后线上生效

同一时间只在一台电脑上改，改完就推，几乎永远不会冲突。
万一推送被拒绝（提示 rejected / non-fast-forward），说明另一台先改了：
先跑「开工前」脚本拉下来，再发布。

### 第一次在新电脑上用（回家那次）

新电脑上还没有这个项目，需要先把它弄下来。**只需拷一个文件过去**
（U盘 / 微信"文件传输" / 邮件都行）：

- 把 `在家第一次用-双击这个.bat` 拷到新电脑，双击它。
- 它会自动：检查有没有装 Git（没有会告诉你怎么装）→ 从公开仓库
  下载整个项目到 `%USERPROFILE%\blog` → 配好私人备份仓库地址。
- 完成后，`%USERPROFILE%\blog` 里就有全部三个脚本，以后照常双击即可。

> 前提：新电脑装好 Git。没有的话在 PowerShell 里跑
> `winget install --id Git.Git -e`，或去 git-scm.com 下载安装。
> 博客仓库是公开的，clone 不需要登录；第一次「发布」时才会弹浏览器
> 让你授权一次 GitHub 账号。

手动版（不想拷脚本、愿意打命令的话，等价）：

```bash
git clone https://github.com/EDboy-616/EDboy-616.github.io.git
cd EDboy-616.github.io
git remote add backup https://github.com/EDboy-616/blog-backup.git
```

### 关于 .bat 的编码（改脚本前必读）

三个脚本都是 **GBK 编码 + CRLF 换行**，这是中文 Windows 的 cmd 解析批处理
的硬性要求。如果用编辑器把它们存成 UTF-8、或加了 `chcp 65001`，含中文的
行会字节错位、把注释当命令执行。改脚本时保持 GBK+CRLF，别动这个设置。

## 加新页面（作品集、清单等）

都放在这个仓库里，用子文件夹分类，例如：

```
portfolio/index.html   →  https://EDboy-616.github.io/portfolio/
notes/index.html       →  https://EDboy-616.github.io/notes/
```

页面内引用样式写 `/assets/style.css`（绝对路径，全站共用一份样式）。
只有当某个东西需要完全独立的域名或独立私密策略时，才值得拆成新仓库。

## 国内访问的实话

免费子域名（github.io / pages.dev 等）都托管在海外节点，中国大陆访问时快时慢，
没有哪个免费方案能保证"流畅"。真要国内快，唯一的路是：买一个便宜域名 → 备案 →
套国内 CDN 的免费额度。这条路要花钱和时间，详见对话。
