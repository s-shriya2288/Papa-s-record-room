#!/bin/bash
# Builds Papa's Record Room APK with the plain Android SDK tools (no Gradle needed).
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
BT="$SDK/build-tools/$(ls "$SDK/build-tools" | sort -V | tail -1)"
JAR="$SDK/platforms/$(ls "$SDK/platforms" | sort -V | head -1)/android.jar"
JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home -v 17)}"
rm -rf out && mkdir -p out/gen out/classes out/dex
"$BT/aapt2" compile --dir res -o out/res.zip
"$BT/aapt2" link -o out/base.apk -I "$JAR" --manifest AndroidManifest.xml --java out/gen out/res.zip --min-sdk-version 26 --target-sdk-version 36
"$JAVA_HOME/bin/javac" -source 8 -target 8 -bootclasspath "$JAR" -d out/classes -sourcepath src:out/gen $(find src out/gen -name '*.java') 2>&1 | grep -v "warning: \[options\]" || true
"$BT/d8" --min-api 26 --lib "$JAR" --output out/dex $(find out/classes -name '*.class')
cp out/base.apk out/unsigned.apk
(cd out/dex && zip -q ../unsigned.apk classes.dex)
"$BT/zipalign" -f -p 4 out/unsigned.apk out/aligned.apk
KS="${KEYSTORE:-$HOME/.android/debug.keystore}"
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:android --key-pass pass:android --out PapasRecordRoom.apk out/aligned.apk
"$BT/apksigner" verify PapasRecordRoom.apk && ls -la PapasRecordRoom.apk
