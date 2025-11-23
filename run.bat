@echo off
title KingsRockDiscordBot

echo Checking Node modules...
npm install

echo.
echo Checking .env file...

IF EXIST ".env" (
    echo .env found! Starting development server...
    echo.
    npm run dev
    exit
) ELSE (
    echo .env not found. Creating one for you...
    copy ".env.example" ".env"
    echo.
    echo A new .env file has been created.
    echo Please open the .env file and add your required API keys.
    echo.
    pause
    echo Starting development server...
    npm run dev
)
