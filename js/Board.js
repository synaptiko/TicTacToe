var Board = function(size, player, winCount) {
  this.size = size;
  this.player = player;
  this.winCount = winCount;
  this.clear();
  this.clearScore();
};

Board.prototype.setPlayer = function(player) {
  this.player = player;
}

Board.prototype.togglePlayer = function() {
  this.player = this.inversePlayer(this.player);
}

Board.prototype.inversePlayer = function(player) {
  return (player === 'x' ? 'o' : 'x');
}

Board.prototype.putCurrentPlayer = function(x, y) {
  if (!this.cells[y][x]) {
    var cell = new Cell(this.player, x, y);

    this.maxNeighborCount = Math.max(cell.countNeighbor(this.cells), this.maxNeighborCount);
    if (this.maxNeighborCount >= this.winCount) {
      this.winnerPlayer = this.player;
      this.score[this.winnerPlayer]++;
    }
    else {
      this.togglePlayer();
    }
    this.lastCell = cell;
    this.cells[y][x] = cell;
    this.freeCellCount--;

    return this.player;
  }
  else {
    return false;
  }
};

Board.prototype.getWinnerCoords = function() {
  var coords = this.lastCell.countNeighbor(this.cells, true),
      finalCoords = [];

  coords = coords.sort(function(a, b) {
    if (a.x == b.x) {
      return a.y - b.y;
    }
    else return a.x - b.x;
  });

  // first one
  finalCoords[0] = coords.shift();
  // last one
  finalCoords[1] = coords.pop();

  return finalCoords;
}

Board.prototype.isGameOver = function() {
  return (this.winnerPlayer !== null) || (this.freeCellCount === 0);
};

Board.prototype.clear = function() {
  this.cells = new Array(this.size);
  this.lastCell = null;
  this.maxNeighborCount = 0;
  this.freeCellCount = (this.size * this.size);
  this.winnerPlayer = null;

  for (var i = 0; i < this.size; i++) {
    this.cells[i] = new Array(this.size);
  }
}

Board.prototype.clearScore = function() {
  this.score = {x: 0, o: 0};
}

Board.prototype.isIndecisive = function() {
  return (this.winnerPlayer === null) && (this.freeCellCount === 0);
}
