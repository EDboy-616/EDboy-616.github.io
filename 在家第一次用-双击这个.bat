@echo off
setlocal
cd /d "%~dp0"

echo.
echo  正在检查这台电脑有没有 Git…
echo.

where git >nul 2>&1
if errorlevel 1 goto nogit

echo  找到 Git 了。
echo.

if exist "%USERPROFILE%\blog\.git" goto already

echo  正在从 GitHub 下载博客项目到 %USERPROFILE%\blog …
echo.

git clone https://github.com/EDboy-616/EDboy-616.github.io.git "%USERPROFILE%\blog"
if errorlevel 1 goto clonefail

echo  正在补上私人备份仓库的地址…
git -C "%USERPROFILE%\blog" remote add backup https://github.com/EDboy-616/blog-backup.git >nul 2>&1

echo.
echo  ============================================
echo   装好了。项目位置： %USERPROFILE%\blog
echo  ============================================
echo.
echo  以后在家里就两步，都在那个文件夹里双击：
echo     开工前   双击   开工前先双击这个.bat
echo     发布时   双击   发布博客.bat
echo.
echo  注意：第一次双击「发布博客」会弹出浏览器让你登录 GitHub 授权，
echo  用你的 EDboy-616 账号授权一次，之后不再问。
echo.
pause
exit /b 0

:nogit
echo  这台电脑还没装 Git，没法继续。
echo.
echo  打开 PowerShell（右键开始菜单可选），粘贴这一行回车：
echo.
echo      winget install --id Git.Git -e
echo.
echo  装完关掉本窗口，重新双击本文件。
echo  winget 用不了就去 git-scm.com 下载 Windows 版，一路下一步。
echo.
pause
exit /b 1

:already
echo  项目已经在 %USERPROFILE%\blog 里了，不需要重复下载。
echo  直接进那个文件夹，双击「开工前先双击这个.bat」开始干活。
echo.
pause
exit /b 0

:clonefail
echo.
echo  下载失败。多半是这台电脑连不上 github.com。
echo  换手机热点试一次，通常就能成。
echo.
pause
exit /b 1
