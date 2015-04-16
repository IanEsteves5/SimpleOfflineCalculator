 ::  Simple Offline Calculator v0.4
 ::  By Ian Esteves do Nascimento, 2015
 ::
 ::  This script minimizes the javascript files using Yui Compressor http://yui.github.io/yuicompressor/
 ::  Yui Compressor must be in folder "C:\Program Files\Yui Compressor\"

for /r "C:\Program Files\Yui Compressor\" %%X in ("yuicompressor-*.jar") do set YUI_COMPRESSOR_JAR="%%X"
if not exist %YUI_COMPRESSOR_JAR% exit 1
java -jar %YUI_COMPRESSOR_JAR% calculator.js -o calculator.min.js
java -jar %YUI_COMPRESSOR_JAR% popup.js -o popup.min.js
java -jar %YUI_COMPRESSOR_JAR% tree.js -o tree.min.js
java -jar %YUI_COMPRESSOR_JAR% plot.js -o plot.min.js
