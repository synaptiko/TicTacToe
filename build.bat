set BS=d:/git/js/.build-support/
rm -rf build
mkdir build\css build\img build\lib build\js
cmd /C stylus css\TicTacToe.styl -o build\css -c
rename build\css\TicTacToe.css style.css
copy img\paper.jpg build\img\paper.jpg
copy lib build\lib
rm -rf build\lib\jcanvas.js
copy visual-test\index-build.html build\index.htm
java -jar %BS%compiler.jar --js js/Cell.js js/Board.js js/BoardView.js js/TicTacToe.js --js_output_file build/js/ttt.js --compilation_level SIMPLE_OPTIMIZATIONS
rem java -jar %BS%compiler.jar --js js/Cell.js js/Board.js js/BoardView.js js/TicTacToe.js --js_output_file build/js/ttt.js --compilation_level ADVANCED_OPTIMIZATIONS
