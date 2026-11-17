@echo off
cd /d "%~dp0"

echo.
echo  正在发布博客…
echo.

git remote get-url backup >nul 2>&1 || git remote add backup https://github.com/EDboy-616/blog-backup.git

git add -A
git commit -m "更新博客 %date% %time:~0,5%"

echo  推送到公开站点…
git push origin master
if errorlevel 1 goto fail

echo  推送到私人备份…
git push backup master
if errorlevel 1 goto fail

echo.
echo  已发布到公开站点，并已存入私人备份仓库。
echo  一两分钟后刷新 https://edboy-616.github.io 就能看到。
echo  若上面显示 Everything up-to-date，说明你没改动任何文件。
echo.
pause
exit /b 0

:fail
echo.
echo  发布没有成功。如果提示 rejected 或 non-fast-forward，
echo  说明另一台电脑先改了东西：先双击「开工前先双击这个」拉下来，再回来发布。
echo  其他情况请把上面的字截图发给我。
echo.
pause
