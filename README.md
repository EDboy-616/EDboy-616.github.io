# Edboy · 开源项目小站

一个手写 HTML 的静态站：首页是暖白编辑式长页，陈列作者自建的 5 个仓库
（3 个公开可读，其中 2 个开源工具带 MIT；2 个 GitHub 私有仓库），每个值得讲的项目
有一页独立详情。无构建工具、无框架、无 Google Fonts（国内加载不出来），全站只有系统字体。

> **接着开发先看 [`从这里继续.md`](从这里继续.md)** —— 写给作者本人的继续指南：
> 改哪里、怎么加项目页、发布链路怎么走。技术细节见本文件。

固定导航四项，每个页面都要和它一致：
**项目 `/#projects` · 更新 `/#updates` · 关于 `/#about` · 订阅 `/#subscribe`**。

## 文件结构

```
.
├── index.html          首页（封面 / 项目 / 更新 / 关于 / 订阅）
├── projects/
│   ├── finance-daily-v5.html   金融日报 Agent Skill 详情页（开源）
│   ├── work-companion.html     工作伴侣 Agent Skill 详情页（开源）
│   ├── localotp.html           本机 TOTP 保管库 详情页（私有仓库）
│   └── tiny-ledger.html        轻量记账 详情页（私有仓库）
├── 404.html            找不到页面时显示
├── feed.xml            RSS 订阅源（6 条条目，绝对 URL）
├── favicon.ico         旧浏览器兜底图标（16 / 32 / 48）
├── assets/
│   ├── atelier.css     全站样式，换配色改顶部 :root 变量；首页用 .lab*，
│   │                   详情页统一 .proj-*（.proj-hero / .proj-sec / .proj-plate 等）
│   ├── atelier.js      滚动渐显、导航亚克力常驻、项目筛选、回到顶部
│   ├── favicon.svg     站点图标（深墨底 + 米白 E.），另有 32px PNG 与 apple-touch 尺寸
│   └── img/            12 张图纸 SVG（首页首屏 cover.svg + 项目页 proj-*.svg 等），
│                       单套暖白浅色、无强制配色副本
├── tools/check-site.mjs 静态检查器（页面、资源、SEO、导览、缓存版本、RSS、SVG 术语）
├── 开工前先双击这个.bat        开工：从 GitHub 拉最新
├── 发布博客.bat                收工：推回 GitHub，一两分钟后线上生效
├── 在家第一次用-双击这个.bat    新电脑首次配置
└── .gitattributes            保证上面三个 .bat 一个字节都不被改
```

> **随改版删除的东西**：`posts/`（7 篇旧文章页）、`system.html`、`guide.html`，
> 以及旧的 21 张交易主题图纸（`hero`、`about`、`capabilities`、`quote`、`subscribe`、
> `essay-01/02`、`method-01…04`、`note-01…05`、`sys-*` 的 SVG 与同名 WebP）。
> 旧图纸把交易文案直接嵌在画面里，换主题后不可能复用，只能重画；协作手册的要点
> 已经并进下面「发布与协作」一节，所以 `guide.html` 不再单独维护。

## 加一个项目页

1. 复制 `projects/finance-daily-v5.html`，改名为 `projects/xxx.html`。
2. 改掉 `<title>`、`<meta name="description">`、`<link rel="canonical">`、
   `.article-meta`、`.meta-strip` 和全部区块文案。**仓库是私有的一律不写
   GitHub 链接和下载按钮**——私有不等于不存在，只是访客点不开（见「公开、开源、MIT」）。
   规格条四页统一用公共结构：`<div class="meta-strip"><div><span class="k">键</span><b class="v">值<small>说明</small></b></div>×4</div>`，
   不要再写 `<span><b>键</b>值</span>` 这种没有 `.k`/`.v` 的变体。
3. 打开 `index.html`，在 `#projects` 的 `.labs-grid` 里复制一张 `<article class="lab" …>`，
   放到合适位置，改图片、编号、日期、标题、摘要和链接。
   `data-category` **只能取现有四类：`agent` / `desktop` / `mobile` / `site`**
   （和首页筛选 pills 的口径完全一致，写成别的值卡片会被筛成不存在的类别）；
   同时把对应 pill 里的 `.count` 和「全部」那个数字一起对上。
4. 想进订阅源，就在 `feed.xml` 最前面复制一段 `<item>`：`<link>` 与 `<guid>`
   都写带 `https://EDboy-616.github.io/` 的绝对 URL，日期用
   `date -d "25 Nov 2026" +%A` 复核星期再写。

新配图做成 SVG 放进 `assets/img/`：全站只有浅色一套，配色直接写在 SVG 文件开头的 `<style>` 里，
**不再存 `xxx-light.svg` / `xxx-dark.svg` 副本，也不要在 `<style>` 里写 `prefers-color-scheme`**——
系统深色下页面保持暖白，图纸跟着不变黑。
**首屏之外**的图片一律写 `loading="lazy"`；首页的 `cover.svg` 与各详情页首屏的
`proj-*.svg` 不写 lazy（要第一时间出来），只写 `decoding="async"`。
`width` / `height` 照 SVG 文件自带的固有尺寸写：`proj-*.svg` 是 768×960（4:5）、
`plate-*.svg` 是 800×600、`cover` / `feed` / `about-bench` 是 1024×1024——数字错了不会当场看出来，
但会算错占位。

## 性能约定（别破坏它）

- **不引外部字体、不引 CDN 脚本、不引外链图片。** 中国大陆加载不了，会把首屏卡住；
  徽章、进度条、示意图一律自绘 SVG。
- **配图一律 SVG，首屏不懒加载、其余懒加载**：首页首屏只加载 `cover.svg`，项目详情页首屏只加载本页的
  `proj-*.svg`（其余区块滚动到才取）。全站只有浅色一套，每页每张图都只引一份 base SVG，
  页面里不会并排放两套。
- **改 `atelier.css` / `atelier.js` 必须全站同步 `?v=`**，版本号统一定为
  **`v=20261126-12`**；漏改某一页，那一页的读者会继续看到旧缓存。
  详情页与 `404.html` 引用样式一律写绝对路径 `/assets/`；只有 `index.html` 用相对路径
  `assets/`，为的是直接双击也能看。

## 本地预览

双击 `index.html` 也能看（那一页用的是相对路径）；看详情页要起个本地服务器：

```bash
py -m http.server 8123
```

改完先跑静态检查，再开浏览器看页面：

```bash
node tools/check-site.mjs
```

这台机器上 `python` 是 Microsoft Store 的占位程序，跑 `python -m http.server` 会报
`Python was not found`；带版本号的入口是 `py`（实测 `py --version` → Python 3.14.7）。

## 上线（已完成，这里只是记录）

站点已在线：https://EDboy-616.github.io ，由公开仓库 `EDboy-616.github.io` 的
master 分支驱动 GitHub Pages。**这是唯一的仓库、也是唯一的存档处**——GitHub Pages
要求仓库公开，所以不再另外维护私人备份库，避免两份版本互相追。
站点里的 `<link rel="canonical">` 和 `feed.xml` 已填好这个域名；
若以后换自定义域名，记得同步替换每一页的 canonical 与 feed 里所有 URL。

## 发布与协作

GitHub 仓库就是两台电脑之间的中转站。日常规矩只有两条，都在项目文件夹里双击：

1. **开工前**双击「开工前先双击这个.bat」——从 GitHub 拉最新版本
2. **收工后**双击「发布博客.bat」——推回 GitHub，一两分钟后线上生效

同一时间只在一台电脑上改，改完就推，几乎永远不会冲突。
万一推送被拒绝（提示 rejected / non-fast-forward），说明另一台先改了：
先跑「开工前」脚本拉下来，再发布。

### 第一次在新电脑上用

新电脑上还没有这个项目，需要先把它弄下来。**只需拷一个文件过去**
（U 盘 / 微信"文件传输" / 邮件都行）：

- 把 `在家第一次用-双击这个.bat` 拷到新电脑，双击它。
- 它会自动：检查有没有装 Git（没有会告诉你怎么装）→ 从仓库
  下载整个项目到 `%USERPROFILE%\blog`。
- 完成后，`%USERPROFILE%\blog` 里就有全部三个脚本，以后照常双击即可。

> 前提：新电脑装好 Git。没有的话在 PowerShell 里跑
> `winget install --id Git.Git -e`，或去 git-scm.com 下载安装。
> 站点仓库是公开的，clone 不需要登录；第一次「发布」时才会弹浏览器
> 让你授权一次 GitHub 账号。

手动版（不想拷脚本、愿意打命令的话，等价）：

```bash
git clone https://github.com/EDboy-616/EDboy-616.github.io.git
cd EDboy-616.github.io
```

### 常见报错对照

| 看到什么 | 意思 | 怎么办 |
|---|---|---|
| `rejected` / `non-fast-forward` | 另一台电脑先推了 | 双击「开工前」拉最新，再双击「发布」 |
| `'git' 不是内部或外部命令` | 这台电脑没装 Git 或没进 PATH | `winget install --id Git.Git -e`，关掉窗口重开脚本 |
| 弹窗要登录 / `Permission denied` | 第一次推送要授权 | 按提示在浏览器登录 GitHub 账号，授权一次即可 |
| 脚本窗口一闪就关 | 出错太快看不见 | 在项目文件夹地址栏输 `cmd` 回车，再手动跑那个 .bat |
| 线上还是旧内容 | Pages 部署要一两分钟 | 等一下强刷（Ctrl+F5）；还不行就是 `?v=` 没同步 |

### 关于 .bat 的编码（改脚本前必读）

这次改版**没有动这三个脚本一字节**，`.gitattributes` 也保持原样。

三个脚本都是 **GBK 编码 + CRLF 换行**，这是中文 Windows 的 cmd 解析批处理
的硬性要求。如果用编辑器把它们存成 UTF-8、或加了 `chcp 65001`，含中文的
行会字节错位、把注释当命令执行。改脚本时保持 GBK+CRLF，别动这个设置。

仓库根目录的 `.gitattributes` 写了 `*.bat -text`，让 git 对这三个文件一个字节
都不做换行转换——所以不管哪台电脑的 git 怎么配置，clone 出来的 .bat 都是原样。
**别删这一行**，删了之后在 `core.autocrlf=false` 的电脑上会拿到 LF 换行的脚本。

## 加新页面（清单、笔记等）

都放在这个仓库里，用子文件夹分类，例如：

```
projects/xxx.html      →  https://EDboy-616.github.io/projects/xxx.html
notes/index.html       →  https://EDboy-616.github.io/notes/
```

页面内引用样式写 `/assets/atelier.css`（绝对路径，全站共用一份样式）。
只有当某个东西需要完全独立的域名或独立私密策略时，才值得拆成新仓库。

## 公开、开源、MIT（统一口径）

**公开 ≠ 开源 ≠ MIT。** 5 个仓库都挂在 GitHub 上，可见性只有 public / private 两种，
许可证是另一回事，三件事别混着写。**介绍可以都写，链接不能都给**：

| 仓库 | 可见性 | 许可证 | 站上怎么写 |
|---|---|---|---|
| `finance-daily-v5` | public | MIT（根目录 `LICENSE`） | 开源工具：详情页给 GitHub 链接与安装命令，feed 里给绝对 URL |
| `work-companion` | public | MIT（根目录 `LICENSE`） | 同上 |
| 本站（`EDboy-616.github.io`） | public | **没有 LICENSE** → 默认保留所有权利 | 只说「源码公开可读」，不要写成开源或 MIT |
| `localotp` | private | 无 | 私有仓库：源码不对外可见。v0.5.0 有 tag + GitHub Release（NSIS / 中文 MSI / 免安装 exe，三项均未签名），在私有仓库里 → **不放仓库链接、不放下载按钮** |
| `tiny-ledger` | private | MIT（仓库私有，访客读不到） | 私有仓库：README 的版本徽章与「APK on the Releases page」指向的是同一个私有 Releases，点不开 ≠ 不存在 |

写法纪律（2026-11-25 终审在这三处翻过车）：

- 私有仓库**就在 GitHub 上**：不要写「不在 GitHub 上」「没有下载页」，要写
  「私有仓库，不对外可见、不提供下载」。
- 没有许可证文件的公开仓库不叫开源——`gh api repos/EDboy-616/EDboy-616.github.io` 的
  `license` 返回 `null`。
- 「零依赖」只适用于 finance-daily-v5 的取数脚本（Python 标准库）。localotp 要 pnpm /
  Rust / Tauri，tiny-ledger 要 JDK 17/21 + Android SDK 36，出 3x 长图还要 playwright +
  pillow + chromium。所以首页统一说「少依赖」，不说「零依赖」。

如果以后决定把 `localotp` 公开，命令是（备忘，由作者本人执行）：

```bash
gh api -X PATCH repos/EDboy-616/localotp -f private=false
```

公开之后要同步改四处，少一处就会前后不一致：

1. 首页 `#projects` 那张 `.lab` 卡上的 badge（从「私有仓库」改成开源口径）；
2. 对应详情页的 `.meta-strip`、`sys-confirm` / `sys-cta` 说明与主按钮（补上 GitHub 链接 / 安装命令）；
3. 本文件上面这张状态表，以及首页与详情页页脚「3 个公开 · 2 件 MIT · 2 个私有」的说法；
4. `feed.xml` 里那条项目的描述。

## GitHub 上的仓库描述（待作者本人改，不在工作区内）

`gh api repos/EDboy-616/EDboy-616.github.io` 的 `description` 还停留在改版前的
「个人博客 · 手写 HTML 静态站」。这条是账号侧元数据，站内的 title / description 已经全部
去掉交易味，只有这里落后。执行（由作者本人跑，本次返工没有跑）：

```bash
gh api -X PATCH repos/EDboy-616/EDboy-616.github.io -f description="Edboy 的 GitHub 项目小站：5 个自建仓库 · 本地优先的工具与 Agent Skill"
```

## 发布脚本带走哪些文件

`发布博客.bat` 用的是 `git add -A`（全量添加），所以 `.gitignore` 是唯一的闸门。
2026-11-25 起 `.gitignore` 除 `.claude/` 外还挡着 `.mimosa/` 与 `.zcode/`——扫描工具写进
工作区的产物（`finding-ledger` / `hook-state` / `hook-status`，实测量级：`.mimosa/` 599K、
`projects/.mimosa/` 11K、`.zcode/` 78K）。以后再有工具往工作区写目录，先进 `.gitignore`
再双击发布；三个 `.bat` 本身仍然一字节都不改（GBK + CRLF 是硬要求）。

## 国内访问的实话

免费子域名（github.io / pages.dev 等）都托管在海外节点，中国大陆访问时快时慢，
没有哪个免费方案能保证"流畅"。真要国内快，唯一的路是：买一个便宜域名 → 备案 →
套国内 CDN 的免费额度。这条路要花钱和时间，详见对话。
