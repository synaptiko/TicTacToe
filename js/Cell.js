var Cell = function(player, x, y) {
  this.player = player;
  this.x = x;
  this.y = y;
};

Cell.prototype.countNeighbor = function(cells, trace) {
  var counts = [0, 0, 0, 0], count, maxCount = 0,
      i, j, max = cells.length,
      row, cell, coord,
      tracers = [[], [], [], []], tracer, maxTracer;

  if (this.x >= 0 && this.y >= 0 && this.x < max && this.y < max) {
    for (i = -1; i < 2; i++) {
      for (j = -1; j < 2; j++) {
        if (!(i === 0 && j === 0)) {
          row = cells[this.y + i];
          cell = (row ? row[this.x + j] : null);
          if (cell && cell instanceof Cell && cell.player === this.player) {
            coord = Math.abs(i + j) * (i === 0 ? -1 : 1) + 1;

            if (trace) {
              tracer = tracers[coord];
            }
            count = (cell.countNeighborInDirection(cells, j, i, trace, tracer) + 1);
            counts[coord] += count;

            if (trace && count >= 1) {
              tracer.push({
                x: (this.x + j),
                y: (this.y + i)
              });
            }
          }
        }
      }
    }
  }

  for (i = 0; i < counts.length; i++) {
    count = counts[i];
    if (count) {
      if (maxCount < count) {
        maxCount = count;
        if (trace) {
          maxTracer = tracers[i];
        }
      }
    }
  }

  if (trace) {
    maxTracer.push({
      x: (this.x),
      y: (this.y)
    });
    return maxTracer;
  }
  else {
    return (maxCount + 1);
  }
};

Cell.prototype.countNeighborInDirection = function(cells, dirX, dirY, trace, tracer) {
  var count = 0,
      max = cells.length,
      row, cell;

  if (this.x >= 0 && this.y >= 0 && this.x < max && this.y < max) {
    row = cells[this.y + dirY];
    cell = (row ? row[this.x + dirX] : null);
    if (cell && cell instanceof Cell && cell.player === this.player) {
      count = cell.countNeighborInDirection(cells, dirX, dirY, trace, tracer) + 1;
      if (trace && count >= 1) {
        tracer.push({
          x: (this.x + dirX),
          y: (this.y + dirY)
        });
      }
    }
  }

  return count;
};
