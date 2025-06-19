@echo off
set version=unknown
for /f "tokens=1,2* delims=," %%a in (package.json) do (
for /f tokens^=4delims^=^" %%i in ('echo %%a ^| findstr "version"') do set version=%%i
)
npm run build && docker buildx build . -t eling486/lab_deputy:%version% && docker tag eling486/lab_deputy:%version% eling486/lab_deputy:latest