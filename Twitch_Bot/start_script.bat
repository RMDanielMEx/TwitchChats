set /p STREAMER="Enter streamer name: "
echo "Streamer to analyse: "
echo %STREAMER%
set key="Your key"
set name="Your name in Twitch"
cls
@echo off
node index.js %STREAMER% %name% %key%