 ::  Simple Offline Calculator v0.6
 ::  By Ian Esteves do Nascimento, 2015
 ::
 ::  This script renders the icon in all resolutions needed using inkscape https://inkscape.org/
 ::  Inkscape must be installed in the standard folder
 ::  To see the icon usage, view manifest.json

set INKSCAPE_EXE="C:\Program Files\Inkscape\inkscape.exe"
if not exist %INKSCAPE_EXE% exit 1
%INKSCAPE_EXE% -f webstoreTileSmall.svg -w 440 -h 280 -e webstoreTileSmall.png
%INKSCAPE_EXE% -f webstoreTileLarge.svg -w 920 -h 680 -e webstoreTileLarge.png
%INKSCAPE_EXE% -f webstoreMarquee.svg -w 1400 -h 560 -e webstoreMarquee.png