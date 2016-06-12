 ::  Simple Offline Calculator v0.6
 ::  By Ian Esteves do Nascimento, 2015-2016
 ::
 ::  This script minimizes the css and javascript files using Yui Compressor http://yui.github.io/yuicompressor/
 ::  Yui Compressor must be in folder "C:\Program Files\Yui Compressor\"
 ::
 ::  This script renders the icon in all resolutions needed using inkscape https://inkscape.org/
 ::  Inkscape must be in the folder "C:\Program Files\Inkscape\"
 ::
 ::  This script compresses the final extension using 7zip http://www.7-zip.org/
 ::  7zip must be in the folder "C:\Program Files\7-Zip\"

for /r "C:\Program Files\Yui Compressor\" %%X in ("yuicompressor-*.jar") do set YUI_COMPRESSOR_JAR="%%X"
if not exist %YUI_COMPRESSOR_JAR% exit 1
set INKSCAPE_EXE="C:\Program Files\Inkscape\inkscape.exe"
if not exist %INKSCAPE_EXE% exit 2
set ZIP_EXE="C:\Program Files\7-Zip\7z.exe"
if not exist %ZIP_EXE% exit 3
set OUTPUT_ROOT=release
set BUILD_ROOT=%OUTPUT_ROOT%\unzipped
set OUTPUT_FILE=%OUTPUT_ROOT%\SimpleOfflineCalculator.zip

rd %OUTPUT_ROOT% /s /q
rd %BUILD_ROOT% /s /q

mkdir %BUILD_ROOT%
copy manifest.json %BUILD_ROOT%
copy plot.html %BUILD_ROOT%
copy popup.html %BUILD_ROOT%
copy tree.html %BUILD_ROOT%
xcopy _locales %BUILD_ROOT%\_locales /s /i /f

mkdir %BUILD_ROOT%\resources
mkdir %BUILD_ROOT%\resources\css
java -jar %YUI_COMPRESSOR_JAR% resources\css\common.css -o %BUILD_ROOT%\resources\css\common.min.css
java -jar %YUI_COMPRESSOR_JAR% resources\css\popup.css -o %BUILD_ROOT%\resources\css\popup.min.css
java -jar %YUI_COMPRESSOR_JAR% resources\css\tree.css -o %BUILD_ROOT%\resources\css\tree.min.css
java -jar %YUI_COMPRESSOR_JAR% resources\css\plot.css -o %BUILD_ROOT%\resources\css\plot.min.css

mkdir %BUILD_ROOT%\resources\javascript
java -jar %YUI_COMPRESSOR_JAR% resources\javascript\calculator.js -o %BUILD_ROOT%\resources\javascript\calculator.min.js
java -jar %YUI_COMPRESSOR_JAR% resources\javascript\popup.js -o %BUILD_ROOT%\resources\javascript\popup.min.js
java -jar %YUI_COMPRESSOR_JAR% resources\javascript\tree.js -o %BUILD_ROOT%\resources\javascript\tree.min.js
java -jar %YUI_COMPRESSOR_JAR% resources\javascript\plot.js -o %BUILD_ROOT%\resources\javascript\plot.min.js

mkdir %BUILD_ROOT%\resources\image
%INKSCAPE_EXE% -f resources\image\icon.svg -w 16 -h 16 -e %BUILD_ROOT%\resources\image\icon_16.png
%INKSCAPE_EXE% -f resources\image\icon.svg -w 19 -h 19 -e %BUILD_ROOT%\resources\image\icon_19.png
%INKSCAPE_EXE% -f resources\image\icon.svg -w 38 -h 38 -e %BUILD_ROOT%\resources\image\icon_38.png
%INKSCAPE_EXE% -f resources\image\icon.svg -w 48 -h 48 -e %BUILD_ROOT%\resources\image\icon_48.png
%INKSCAPE_EXE% -f resources\image\icon.svg -w 128 -h 128 -e %BUILD_ROOT%\resources\image\icon_128.png

mkdir %OUTPUT_ROOT%
%ZIP_EXE% a -tzip %OUTPUT_FILE% .\%BUILD_ROOT%\*
