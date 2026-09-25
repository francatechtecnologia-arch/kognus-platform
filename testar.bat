@echo off
chcp 65001 >nul
title KOGNUS 2.0 - Bateria de Testes Automatizados
cls

echo ============================================================
echo   🧪 KOGNUS 2.0 - EXECUTANDO BATERIA DE TESTES
echo ============================================================
echo.

node test.js

echo.
pause
