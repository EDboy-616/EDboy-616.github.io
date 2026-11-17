@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  开工前拉取：从 GitHub 取回最新版本
echo.

rem 新电脑上第一次跑：自动补上私人备份仓库的地址
git remote get-url backup >nul 2>&1 || git remote add backup https://github.com/EDboy-616/blog-backup.git

git pull origin master

echo.
if errorlevel 1 (
    echo  拉取没有成功。最常见的原因是这台电脑上有没发布的改动。
    echo  先双击「发布博客.bat」把改动推上去，再重新双击这个脚本。
    echo  还是不行就把上面的字截图发给我。
) else (
    echo  已是最新，可以开始改了。
    echo  改完记得双击「发布博客.bat」发布。
)
echo.
pause
