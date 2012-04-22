var BoardView = function(board, $canvas, $playerLeft, $playerRight, $playerXColorDef, $playerOColorDef, $boardColorDef, $playerLeftSelection, $playerRightSelection, $playButton, $restartButton, $main, scoreFont) {
  this.board = board;
  this.$canvas = $canvas;
  this.$playerLeft = $playerLeft;
  this.$playerRight = $playerRight;
  this.$playerLeftBlinker = $playerLeft.find('.blinker'),
  this.$playerRightBlinker = $playerRight.find('.blinker'),
  this.$playerLeftSelection = $playerLeftSelection;
  this.$playerRightSelection = $playerRightSelection;
  this.$playerLeftSelectionCanvas = $playerLeftSelection.find('canvas');
  this.$playerRightSelectionCanvas = $playerRightSelection.find('canvas');
  this.$playButton = $playButton;
  this.$restartButton = $restartButton;
  this.$main = $main;
  this.scoreFont = scoreFont;

  this.colorDef = {
    x: {
      stroke: $playerXColorDef.find('.stroke').css('color')
    },
    o: {
      stroke: $playerOColorDef.find('.stroke').css('color')
    },
    board: {
      lines: $boardColorDef.find('.lines').css('color'),
      score: $boardColorDef.find('.score').css('color')
    }
  }

  this.defaultPlayer = this.board.player;
  this.leftPlayer = this.board.player;
  this.rightPlayer = this.board.inversePlayer(this.board.player);

  this.initialize();
};

BoardView.prototype.initialize = function() {
  this.attachPlayerSelectionClick();
  this.attachStartGameClick();
}

BoardView.prototype.attachStartGameClick = function() {
  var me = this;
  var prepareBoard = function() {
    me.detachPlayerSelectionClick();

    me.board.clear();

    me.$main.fadeOut(750, function() {
      me.$canvas.css('z-index', 9999);
    });

    me.$playerLeftBlinker.removeClass('winner');
    me.$playerRightBlinker.removeClass('winner');
  };
  var activatePlayer = function(player) {
    if (me.leftPlayer === player) {
      me.$playerLeftBlinker.addClass('active');
      me.$playerRightBlinker.removeClass('active');
    }
    else {
      me.$playerLeftBlinker.removeClass('active');
      me.$playerRightBlinker.addClass('active');
    }
    me.board.setPlayer(player);
    me.repaint();
  };
  var startGameHandler = function() {
    prepareBoard();
    activatePlayer(me.board.player);
    me.repaint();
    return false;
  };
  var restartGameHandler = function() {
    me.board.clearScore();
    prepareBoard();
    activatePlayer(me.defaultPlayer);
    return false;
  };
  me.$playButton.click(startGameHandler);
  me.$restartButton.click(restartGameHandler);
}

BoardView.prototype.attachPlayerSelectionClick = function() {
  var me = this;
  var switchPlayerHandler = function() {
    me.switchPlayers();
  };
  me.$playerLeftSelectionCanvas.click(switchPlayerHandler);
  me.$playerRightSelectionCanvas.click(switchPlayerHandler);
}

BoardView.prototype.detachPlayerSelectionClick = function() {
  this.$playerLeftSelectionCanvas.unbind('click');
  this.$playerRightSelectionCanvas.unbind('click');
}

BoardView.prototype.switchPlayers = function() {
  this.$playerLeft.toggleClass('x o');
  this.$playerRight.toggleClass('x o');
  if (this.board.isGameOver() && !this.board.isIndecisive()) {
    this.$playerLeftBlinker.toggleClass('winner');
    this.$playerRightBlinker.toggleClass('winner');
  }
  this.leftPlayer = this.board.inversePlayer(this.leftPlayer);
  this.rightPlayer = this.board.inversePlayer(this.rightPlayer);
  this.repaint();
}

BoardView.prototype.repaint = function() {
  var me = this,
      $c = this.$canvas,
      $pLeft = this.$playerLeft, $pLeftBlinker = this.$playerLeftBlinker,
      $pRight = this.$playerRight, $pRightBlinker = this.$playerRightBlinker,
      $pLeftSelection = this.$playerLeftSelectionCanvas,
      $pRightSelection = this.$playerRightSelectionCanvas,
      clientSize = this.getClientSize(),
      width = clientSize.width,
      height = clientSize.height,
      koefX = 0.5,
      koefY = 0.85,
      canvasIdealWidth = (width * koefX),
      canvasIdealHeight = (height * koefY),
      canvasSize = Math.min(canvasIdealWidth, canvasIdealHeight),
      boardSize = this.board.size,
      cellSize = (canvasSize / boardSize),
      cellSelectionSize = (cellSize * 1.5);

  $c.attr('width', canvasSize);
  $c.attr('height', canvasSize);
  $c.css('left', (width - canvasSize) / 2);
  $pLeft.css('height', height);
  $pRight.css('height', height);
  $c.clearCanvas();
  $c.removeLayers();

  $pLeftSelection.attr('width', cellSelectionSize);
  $pLeftSelection.attr('height', cellSelectionSize);
  $pRightSelection.attr('width', cellSelectionSize);
  $pRightSelection.attr('height', cellSelectionSize);

  var paintPlayerScore = function() {
    $pLeftSelection.clearCanvas();
    var leftAlpha = 1, rightAlpha = 1;
    if (me.leftPlayer === me.board.player) {
      rightAlpha = 0.25;
    }
    else {
      leftAlpha = 0.25;
    }

    me.drawPlayer(me.leftPlayer, 0, 0, cellSelectionSize, $pLeftSelection, leftAlpha);
    me.drawScore(cellSelectionSize, 'left', $pLeftSelection, leftAlpha);
    $pRightSelection.clearCanvas();
    me.drawPlayer(me.rightPlayer, 0, 0, cellSelectionSize, $pRightSelection, rightAlpha);
    me.drawScore(cellSelectionSize, 'right', $pRightSelection, rightAlpha);
  };
  paintPlayerScore();

  $c.unbind('click');
  $c.click(function(e) {
    if (me.board.isGameOver()) return;

    var x = (Math.ceil(e.offsetX / cellSize) - 1),
        y = (Math.ceil(e.offsetY / cellSize) - 1),
        currentPlayer = me.board.player,
        newPlayer, firstPlayer;

    newPlayer = me.board.putCurrentPlayer(x, y);
    if (newPlayer) {
      me.drawPlayer(currentPlayer, x, y, cellSize);

      if (!me.board.isGameOver()) {
        $pLeftBlinker.toggleClass('active');
        $pRightBlinker.toggleClass('active');
      }
      else if (!me.board.isIndecisive()) {
        me.crossWinner(cellSize);
        if ($pLeft.hasClass(currentPlayer)) {
          $pLeftBlinker.addClass('winner');
        }
        else {
          $pRightBlinker.addClass('winner');
        }
      }

      if (me.board.isGameOver()) {
        $pLeftBlinker.removeClass('active');
        $pRightBlinker.removeClass('active');
        me.$canvas.css('z-index', 0);
        me.$main.fadeIn(250);
        me.$restartButton.show();
        me.attachPlayerSelectionClick();

        firstPlayer = me.defaultPlayer;
        if (me.board.winnerPlayer !== null) {
          firstPlayer = me.board.inversePlayer(me.board.winnerPlayer);
        }
        else if (me.board.isIndecisive()) {
          firstPlayer = me.board.player;
        }
        me.board.player = firstPlayer;
      }
      paintPlayerScore();
    }
  });

  for (var i = 0; i < boardSize; i++) {
    for (var j = 0; j < boardSize; j++) {
      this.drawEmptyCell(i, j, cellSize);
      if (this.board.cells[i][j]) {
        var cell = this.board.cells[i][j];
        me.drawPlayer(cell.player, cell.x, cell.y, cellSize);
      }
    }
  }
  if (me.board.isGameOver()) {
    if (!me.board.isIndecisive()) {
      me.crossWinner(cellSize);
    }
  }
};

BoardView.prototype.drawPlayer = function(currentPlayer, x, y, cellSize, $destination, alpha) {
  if (currentPlayer === 'x') {
    this.drawCross(x, y, cellSize, $destination, alpha);
  }
  else {
    this.drawCircle(x, y, cellSize, $destination, alpha);
  }
}

BoardView.prototype.crossWinner = function(cellSize) {
  var coords = this.board.getWinnerCoords(),
      $c = this.$canvas,
      coord1 = coords[0],
      coord2 = coords[1],
      startPoint = {
        x: ((coord1.x * cellSize) + (cellSize / 2)),
        y: ((coord1.y * cellSize) + (cellSize / 2))
      },
      endPoint = {
        x: ((coord2.x * cellSize) + (cellSize / 2)),
        y: ((coord2.y * cellSize) + (cellSize / 2))
      },
      player = this.board.winnerPlayer;

  $c.drawLine({
    strokeStyle: this.colorDef[player].stroke,
    strokeWidth: (cellSize / 2),
    rounded: true,
    x1: startPoint.x,
    y1: startPoint.y,
    x2: endPoint.x,
    y2: endPoint.y,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowBlur: (cellSize / 10),
    shadowX: 0, shadowY: 0
  });
  $c.drawLine({
    strokeStyle: "rgba(0, 0, 0, 0.1)",
    strokeWidth: (cellSize / 30),
    rounded: false,
    x1: startPoint.x,
    y1: startPoint.y,
    x2: endPoint.x,
    y2: endPoint.y
  });
}

BoardView.prototype.drawScore = function(cellSize, side, $destination, alpha) {
  var player = this[side + 'Player'],
      fontSize = (cellSize / 4),
      shadowColor = "rgba(0, 0, 0, 0.5)",
      shadowBlur = (cellSize / 10),
      shadowX = 0, shadowY = 0;

  if (alpha && alpha < 1) {
    shadowColor = undefined;
    shadowBlur = undefined;
    shadowX = undefined;
    shadowY = undefined;
  }

  $destination.drawText({
    fillStyle: this.colorDef[player].stroke,
    strokeStyle: this.colorDef.board.score,
    opacity: alpha || 1,
    strokeWidth: 3,
    x: (side === 'left' ? (cellSize - (cellSize / 10)) : (cellSize / 10)),
    y: cellSize - (cellSize / 10),
    text: this.board.score[player],
    align: (side === 'left' ? 'right' : 'left'),
    baseline: 'alphabetic',
    font: fontSize + 'px ' + this.scoreFont,
    shadowColor: shadowColor,
    shadowBlur: shadowBlur,
    shadowX: shadowX, shadowY: shadowY
  });
}



BoardView.prototype.drawCircle = function(x, y, cellSize, $destination, alpha) {
  var $c = $destination || this.$canvas,
      radius = (cellSize / 4),
      circleX = (x * cellSize) + (cellSize / 4),
      circleY = (y * cellSize) + (cellSize / 4),
      strokeColor = this.colorDef['o'].stroke,
      shadowColor = "rgba(0, 0, 0, 0.5)",
      shadowBlur = (cellSize / 10),
      shadowX = 0, shadowY = 0;

  if (alpha && alpha < 1) {
    shadowColor = undefined;
    shadowBlur = undefined;
    shadowX = undefined;
    shadowY = undefined;
  }

  $c.drawArc({
    strokeStyle: strokeColor,
    opacity: alpha || 1,
    strokeWidth: (cellSize / 5),
    x: circleX,
    y: circleY,
    radius: radius,
    fromCenter: false,
    shadowColor: shadowColor,
    shadowBlur: shadowBlur,
    shadowX: shadowX, shadowY: shadowY
  });
  $c.drawArc({
    strokeStyle: "rgba(0, 0, 0, 0.1)",
    opacity: alpha || 1,
    strokeWidth: (cellSize / 30),
    x: circleX,
    y: circleY,
    radius: radius,
    fromCenter: false
  });
}

BoardView.prototype.drawCross = function(x, y, cellSize, $destination, alpha) {
  var $c = $destination || this.$canvas,
      startPoint1 = {
        x: ((x * cellSize) + (3 * cellSize / 4)),
        y: ((y * cellSize) + (cellSize / 4))
      },
      endPoint1 = {
        x: ((x * cellSize) + (cellSize / 4)),
        y: ((y * cellSize) + (3 * cellSize / 4))
      },
      startPoint2 = {
        x: (x * cellSize) + (cellSize / 4),
        y: (y * cellSize) + (cellSize / 4)
      },
      endPoint2 = {
        x: (x * cellSize) + (3 * cellSize / 4),
        y: (y * cellSize) + (3 * cellSize / 4)
      },
      strokeColor = this.colorDef['x'].stroke,
      shadowColor = "rgba(0, 0, 0, 0.5)",
      shadowBlur = (cellSize / 10),
      shadowX = 0, shadowY = 0;

  if (alpha && alpha < 1) {
    shadowColor = undefined;
    shadowBlur = undefined;
    shadowX = undefined;
    shadowY = undefined;
  }


  $c.drawLine({
    strokeStyle: strokeColor,
    opacity: alpha || 1,
    strokeWidth: (cellSize / 5),
    rounded: false,
    x1: startPoint1.x,
    y1: startPoint1.y,
    x2: endPoint1.x,
    y2: endPoint1.y,
    shadowColor: shadowColor,
    shadowBlur: shadowBlur,
    shadowX: shadowX, shadowY: shadowY
  });
  $c.drawLine({
    strokeStyle: "rgba(0, 0, 0, 0.1)",
    opacity: alpha || 1,
    strokeWidth: (cellSize / 30),
    rounded: false,
    x1: startPoint1.x,
    y1: startPoint1.y,
    x2: endPoint1.x,
    y2: endPoint1.y
  });
  $c.drawLine({
    strokeStyle: strokeColor,
    opacity: alpha || 1,
    strokeWidth: (cellSize / 5),
    rounded: false,
    x1: startPoint2.x,
    y1: startPoint2.y,
    x2: endPoint2.x,
    y2: endPoint2.y,
    shadowColor: shadowColor,
    shadowBlur: shadowBlur,
    shadowX: shadowX, shadowY: shadowY
  });
  $c.drawLine({
    strokeStyle: "rgba(0, 0, 0, 0.1)",
    opacity: alpha || 1,
    strokeWidth: (cellSize / 30),
    rounded: false,
    x1: startPoint2.x,
    y1: startPoint2.y,
    x2: endPoint2.x,
    y2: endPoint2.y
  });
}

BoardView.prototype.drawEmptyCell = function(i, j, cellSize) {
  this.$canvas.drawRect({
    strokeStyle: this.colorDef.board.lines,
    strokeWidth: 2,
    x: (i * cellSize),
    y: (j * cellSize),
    width: cellSize,
    height: cellSize,
    fromCenter: false
  });
}

BoardView.prototype.getClientSize = function() {
  if($.browser.msie){
    return {
      width: document.documentElement.offsetWidth,
      height: document.documentElement.offsetHeight
    }
  }
  else {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}
