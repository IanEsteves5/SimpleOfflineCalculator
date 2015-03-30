 ::  Simple Offline Calculator v0.3
 ::  By Ian Esteves do Nascimento, 2015
 ::
 ::  This script minimizes the css files using Yui Compressor http://yui.github.io/yuicompressor/
 ::  Yui Compressor must be in folder "C:\Program Files\Yui Compressor\"

for /r "C:\Program Files\Yui Compressor\" %%X in ("yuicompressor-*.jar") do set YUI_COMPRESSOR_JAR="%%X"
if not exist %YUI_COMPRESSOR_JAR% exit 1
java -jar %YUI_COMPRESSOR_JAR% common.css -o common.min.css
java -jar %YUI_COMPRESSOR_JAR% popup.css -o popup.min.css
java -jar %YUI_COMPRESSOR_JAR% tree.css -o tree.min.css
java -jar %YUI_COMPRESSOR_JAR% plot.css -o plot.min.css
