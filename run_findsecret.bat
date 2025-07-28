@echo off
REM Compile and run FindSecret.java with Gson
if not exist "gson-2.8.9.jar" (
    echo Downloading Gson library...
    powershell -Command "Invoke-WebRequest -Uri 'https://repo1.maven.org/maven2/com/google/code/gson/gson/2.8.9/gson-2.8.9.jar' -OutFile 'gson-2.8.9.jar'"
)
javac -cp gson-2.8.9.jar FindSecret.java
if errorlevel 1 (
    echo Compilation failed!
    pause
    exit /b 1
)
java -cp ".;gson-2.8.9.jar" FindSecret
pause 