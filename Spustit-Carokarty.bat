@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Carokarty - spustam server...
echo  V telefone otvor adresu "Network: https://..." (telefon musi byt na rovnakej Wi-Fi).
echo  Prehliadac upozorni na certifikat - daj "Pokracovat / Rozsirene - prejst na stranku".
echo.
if not exist node_modules call npm install
call npm run dev
pause
