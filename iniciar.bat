@echo off
chcp 65001 >nul
title KOGNUS 2.0 - Servidor Local
cls

echo ============================================================
echo   🚀 KOGNUS 2.0 - INICIALIZADOR DO AMBIENTE LOCAL
echo ============================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Node.js detectado! Iniciando servidor nativo Kognus...
    echo.
    node server.js
    goto fim
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Python detectado. Iniciando servidor HTTP na porta 3000...
    echo [INFO] Abrindo navegador em http://localhost:3000 ...
    start http://localhost:3000
    python -m http.server 3000
    goto fim
)

echo [AVISO] Node.js ou Python nao encontrados no PATH.
echo [INFO] Abrindo o index.html diretamente no seu navegador padrao...
start index.html

:fim
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ocorreu um erro ao executar o servidor.
    pause
)
