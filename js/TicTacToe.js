// TODO refaktoring

var boardTest;
jQuery(function($) {
  var size = 9,
      winCount = 5,
      firstPlayer = 'x',
      board = new Board(size, firstPlayer, winCount),
      $board = $('#board'),
      $playerLeft = $('#playerLeft'), $playerRight = $('#playerRight'),
      $playerXColorDef = $('.player.x .canvasColorDef'), $playerOColorDef = $('.player.o .canvasColorDef'),
      $boardColorDef = $board.find('.canvasColorDef'),
      $playerLeftSelection = $('#playerSelectLeft'),
      $playerRightSelection = $('#playerSelectRight'),
      $playButton = $('#play'),
      $restartButton = $('#restart'),
      $main = $('#main'),
      scoreFont = $('body').css('font-family'),
      boardView;

  boardTest = board;
  boardView = new BoardView(board,
    $board, $playerLeft, $playerRight, $playerXColorDef, $playerOColorDef, $boardColorDef,
    $playerLeftSelection, $playerRightSelection, $playButton, $restartButton, $main, scoreFont
  );
  $(window).bind("resize", function() {
    boardView.repaint();
  });
  $(window).resize();
});
