@echo off
echo ========================================
echo ETH Dashboard 开发环境启动
echo ========================================
echo.
echo 正在启动后端服务器...
echo.

cd /d "%~dp0"
npm run dev

pause
