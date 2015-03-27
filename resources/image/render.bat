 ::  Simple Offline Calculator v0.2 beta
 ::  By Ian Esteves do Nascimento, 2015
 ::
 ::  This script renders the icon in all resolutions needed using inkscape https://inkscape.org/
 ::  Inkscape has to be installed in the standard folder
 ::  To see the icon usage, view manifest.json

set INKSCAPE_EXE="C:\Program Files\Inkscape\inkscape.exe"
if not exist %INKSCAPE_EXE% exit 1
%INKSCAPE_EXE% -f icon.svg -w 16 -h 16 -e icon_16.png
%INKSCAPE_EXE% -f icon.svg -w 19 -h 19 -e icon_19.png
%INKSCAPE_EXE% -f icon.svg -w 38 -h 38 -e icon_38.png
%INKSCAPE_EXE% -f icon.svg -w 48 -h 48 -e icon_48.png
%INKSCAPE_EXE% -f icon.svg -w 128 -h 128 -e icon_128.png
%INKSCAPE_EXE% -f icon_beta.svg -w 16 -h 16 -e icon_beta_16.png
%INKSCAPE_EXE% -f icon_beta.svg -w 19 -h 19 -e icon_beta_19.png
%INKSCAPE_EXE% -f icon_beta.svg -w 38 -h 38 -e icon_beta_38.png
%INKSCAPE_EXE% -f icon_beta.svg -w 48 -h 48 -e icon_beta_48.png
%INKSCAPE_EXE% -f icon_beta.svg -w 128 -h 128 -e icon_beta_128.png
%INKSCAPE_EXE% -f webstoreTitleSmall.svg -w 440 -h 280 -e webstoreTitleSmall.png
%INKSCAPE_EXE% -f webstoreTitleLarge.svg -w 920 -h 680 -e webstoreTitleLarge.png
%INKSCAPE_EXE% -f webstoreMarquee.svg -w 1400 -h 560 -e webstoreMarquee.png