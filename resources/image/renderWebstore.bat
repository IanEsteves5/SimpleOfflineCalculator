 ::  Simple Offline Calculator v0.5 beta
 ::  By Ian Esteves do Nascimento, 2015
 ::
 ::  This script renders the icon in all resolutions needed using inkscape https://inkscape.org/
 ::  Inkscape must be installed in the standard folder
 ::  To see the icon usage, view manifest.json

set INKSCAPE_EXE="C:\Program Files\Inkscape\inkscape.exe"
if not exist %INKSCAPE_EXE% exit 1
%INKSCAPE_EXE% -f webstoreTitleSmallEN.svg -w 440 -h 280 -e webstoreTitleSmallEN.png
%INKSCAPE_EXE% -f webstoreTitleLargeEN.svg -w 920 -h 680 -e webstoreTitleLargeEN.png
%INKSCAPE_EXE% -f webstoreMarqueeEN.svg -w 1400 -h 560 -e webstoreMarqueeEN.png
%INKSCAPE_EXE% -f webstoreTitleSmallPT.svg -w 440 -h 280 -e webstoreTitleSmallPT.png
%INKSCAPE_EXE% -f webstoreTitleLargePT.svg -w 920 -h 680 -e webstoreTitleLargePT.png
%INKSCAPE_EXE% -f webstoreMarqueePT.svg -w 1400 -h 560 -e webstoreMarqueePT.png