@echo off
echo Limpiando caché de Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
echo Caché limpiado. Reinicia el servidor con: npm run dev

