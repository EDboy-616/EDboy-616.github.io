@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  正在发布博客…
echo.

git add -A
git commit -m "更新博客 %date% %time:~0,5%"

echo  推送到公开站点…
git push origin master
echo  推送到私人备份…
git push backup master

echo.
if errorlevel 1 (
    echo  发布没有成功，请把上面的红字截图发给我。
) else (
    echo  已发布到公开站点，并已存入私人备份仓库。
    echo  一两分钟后刷新 https://edboy-616.github.io 就能看到。
    echo  如果显示 "Everything up-to-date"，说明你没改动任何文件。
)
echo.
pause
