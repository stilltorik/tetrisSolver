
window.tetris = {};
// reference point is the top left point of the piece. The form elements are the
// relative position of the other points to the reference point.
//
// [1, -1] means 1 square below, and 1 square to the left.
tetris.PIECES = {
//	EMPTY: { id: 'EMPTY' }, // empty
	SQR: { id: 'SQR', form: [[1, 0], [0, 1], [1, 1]]}, // [] (square)
	T:  { id: 'T', form: [[1, 0], [1, 1], [2, 0]] }, // |-
	SL: { id: 'SL', form: [[0, 1], [1, 1], [1, 2]] }, // -_ (snake left)
	SR: { id: 'SR', form: [[0, 1], [1, 0], [1, -1]] }, // _- (snake right)
	L:  { id: 'L', form: [[1, 0], [2, 0], [2, 1]] }, // L
	NL: { id: 'NL', form: [[1, 0], [2, 0], [2, -1]] }, // ^L (inverted L)
	I:  { id: 'I', form: [[1, 0], [2, 0], [3, 0]] } // |
};
(function() {
	var urlParam = location.search && location.search.substring(1);
	if (urlParam.startsWith('pieces')) {
		var pieces = urlParam.substring(urlParam.indexOf('=') + 1).split('-');
		var piecesToUse = [];
		for (var i = 0; i < pieces.length; i++) {
			piecesToUse.push(tetris.PIECES[pieces[i]]);
		}
		tetris.PIECES = piecesToUse;
	}

})();
tetris.EMPTY = { id: 'EMPTY' };

tetris.turned = {
	SQR: {},
	T: {
		'1': { id: 'T', form: [[0, 1], [1, 1], [0, 2]] },
		'2': { id: 'T', form: [[1, 0], [1, -1], [2, 0]] },
		'3': { id: 'T', form: [[1, 0], [1, 1], [2, 0]] }
	},
	SL: {
		'1': { id: 'SL',form: [[1, 0], [1, -1], [2, -1]] }
	},
	SR: {
		'1': { id: 'SR',form: [[1, 0], [1, 1], [2, 1]] }
	},
	L: {
		'1': { id: 'L', form: [[1, 0], [0, 1], [0, 2]] },
		'2': { id: 'L', form: [[0, 1], [1, 1], [2, 1]] },
		'3': { id: 'L', form: [[1, 0], [1, -1], [1, -2]] }
	},
	NL: {
		'1': { id: 'NL', form: [[1, 0], [1, 1], [1, 2]] },
		'2': { id: 'NL', form: [[1, 0], [2, 0], [0, 1]] },
		'3': { id: 'NL', form: [[1, 0], [2, 0], [0, 1]] }
	},
	I: {
		'1': { id: 'I', form: [[0, 1], [0, 2], [0, 3]] }
	}
};
tetris.COLORS = {EMPTY: 'White', SQR: 'Blue', T: 'Red', SL: 'Green', SR: 'Yellow', L: 'Black', NL: 'Purple', I: 'Orange'};

/**
 * Brut force algorithm to fit x number of each piece as defined in tetris.PIECES
 * in a rectangle.
 * To simplify the algorithm, only one rectangle will be considered (the one where
 * the length and width are closer to one another).
 */
tetris.solve = function() {
	var nbPieces = +document.getElementById('nbPieces').value;
	var remainingPieces = tetris._init(nbPieces);
	tetris.sizeSquare = tetris._sizeRect(nbPieces);
	var rectangle = tetris._initialRect(tetris.sizeSquare);
	/******* For tracking purposes *******/
	this.mostComplete = {rect: rectangle, remaining: remainingPieces.length};
	this.nbStates = 0;
 	var time = new Date();
	/*************************************/
	var nextSquare = {x: 0, y: 0};
	common.toggleLoader();
	setTimeout(function() {
		rectangle = tetris.fill(rectangle, remainingPieces, 0, nextSquare);
		if (rectangle) {
			common.draw({
				id: 'solution',
				rectangle: rectangle,
				nbStates: this.nbStates,
				duration: ((new Date().getTime()) - time.getTime())/1000
			});
		}
		else {
			common.draw({
				id: 'solution',
				rectangle: this.mostComplete.rect,
				nbStates: this.nbStates,
				duration: ((new Date().getTime()) - time.getTime())/1000
			});
			alert('no solution found!');
		}
		common.toggleLoader();
	}.bind(this), 50);
};

// TODO check how the response is handled. It's not done correctly.
// also, remainingPieces is not updated correctly the second time.
tetris.fill = function(rectangle, remainingPieces, next, nextSquare) {
	if (remainingPieces.length === 0) {
		return rectangle;
	} else if(next === remainingPieces.length) {
		return false;
	} else {
		//var obtainedResponses = [];
		for (var position = 0; position < 4; position++) {
			this.nbStates++;
			var res = tetris._fillNext(rectangle, remainingPieces, next, position, nextSquare);
			var response = false;
			if (res.nextSquare) {
				var remainingL = remainingPieces.length;
				if (remainingL === 1) return res.rect;
				if (remainingL < this.mostComplete.remaining) {
					this.mostComplete.remaining = remainingL;
					this.mostComplete.rect = res.rect;
				}
				var remainingCpy = remainingPieces.slice();
				remainingCpy.splice(next, 1);
				// a copy of remainingPieces is used, so that if it fails, we still use
				// the full copy of remainingPieces for the next position
				response = tetris.fill(res.rect, remainingCpy, 0, res.nextSquare);
			} else if (position === 3) {
				if (next != remainingPieces.length - 1) {
					response = tetris.fill(rectangle, remainingPieces, next + 1, nextSquare);
				} else {
					return false;
				}
			}
			if (response) {
				return response;
			}

		}
		return false;
	}
};

// tries to fill the next piece in the position provided, in a _COPY_ of rectangle that is returned,
// and then checks if the resulting rectangle is viable (via tetris.checkLocal).
// returns false if the attempt failed.
// returns an updated copy of the rectangle provided or false
tetris._fillNext = function(rectangle, remainingPieces, next, position, nextSquare) {
	var pieceToAdd = tetris._turn(remainingPieces[next], position);
	if (pieceToAdd) {
		var rectangleCpy = common.cloneRect(rectangle, this.sizeSquare);
		if(tetris._add(rectangleCpy, pieceToAdd, nextSquare)) {
			if (remainingPieces.length === 1) {
				return {rect: rectangleCpy, nextSquare: {x: -1, y: -1}};
			} else {
				var nextSquareCpy = tetris._checkLocal(rectangleCpy, nextSquare);
				return nextSquareCpy? {rect: rectangleCpy, nextSquare: nextSquareCpy}: false;
			}
		} else {
			return false;
		}
	}
	return false;
};

// Turns the piece by 90° _position_ times clockwise.
tetris._turn = function(piece, position) {
	if (position === 0) return piece;
	return tetris.turned[piece.id]['' + position] || false;
};
tetris._add = function (rectangle, pieceToAdd, nextSquare) {
	tetris.lastChanged = [];
	form = pieceToAdd.form;
	if ( rectangle[nextSquare.y][nextSquare.x] === tetris.EMPTY ) {
		rectangle[nextSquare.y][nextSquare.x] = pieceToAdd;
		tetris.lastChanged.push({x: nextSquare.x, y: nextSquare.y});
	} else {
		return false;
	}
	for (var i = 0; i < 3; i++) {
		var x = nextSquare.x + pieceToAdd.form[i][1];
		var y = nextSquare.y + pieceToAdd.form[i][0];
		if (tetris.sizeSquare.height > y &&
		    tetris.sizeSquare.width > x) {
			var nextToFill = rectangle[y][x];
			if ( nextToFill === tetris.EMPTY ) {
				rectangle[y][x] = pieceToAdd;
				tetris.lastChanged.push({x: x, y: y});
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	return true;
};
tetris._checkLocal = function(rectangle, nextSquare) {
	// check if no neighbouring space of the added piece is too small
	// to contain another piece.
	var toCheck = tetris._toCheck(rectangle, tetris.lastChanged, nextSquare);
	for (var x in toCheck) {
		for (var j = 0; j < toCheck[x].length; j++) {
			var checked = tetris._checkSquare(rectangle, {x: +x, y: toCheck[x][j]}, undefined, nextSquare);
			if(!checked) {
				return false;
			}
		}
	}
	// compute new nextSquare
	var nextSquareCpy = {x: nextSquare.x, y: nextSquare.y};
	while (true) {
		if (rectangle[nextSquareCpy.y][nextSquareCpy.x] === tetris.EMPTY) {
			return nextSquareCpy;
		}
		if (nextSquareCpy.x === tetris.sizeSquare.width - 1) {
			nextSquareCpy.x = 0;
			if (nextSquareCpy.y < tetris.sizeSquare.height) {
				nextSquareCpy.y++;
			} else {
				// we have passed the rectangle's last square.
				return false;
			}
		} else {
			nextSquareCpy.x++;
		}
	}
};

// returns the empty cells/squares neighbouring the provided squares
tetris._toCheck = function(rectangle, squares, nextSquare) {
	var toCheck = {};
	var minY = nextSquare.y;
	for (var i = 0; i < squares.length; i++) {
		var currentSquare = squares[i];
		var x = currentSquare.x;
		var y = currentSquare.y;
		if ( y >= minY) {
			if (x + 1 < tetris.sizeSquare.width) tetris._addSquare(rectangle, toCheck, {x: x + 1 , y: y });
			if (x - 1 >= 0) tetris._addSquare(rectangle, toCheck, {x: x - 1 , y: y });
			if (y - 1 >= minY) tetris._addSquare(rectangle, toCheck, {x: x , y: y - 1 });
		}
		if (y + 1 < tetris.sizeSquare.height) tetris._addSquare(rectangle, toCheck, {x: x , y: y + 1 });
	}
	return toCheck;
};

// TODO not efficient
// adds pos to currentChecks if it's empty, and is not already in currentChecks
tetris._addSquare = function(rectangle, currentChecks, pos) {
	var added = [];
	if (rectangle[pos.y][pos.x] === tetris.EMPTY) {
		if (!currentChecks[pos.x]) {
			currentChecks[pos.x] = [];
			currentChecks[pos.x].push(pos.y);
			added.push({x: pos.x, y: pos.y});
		} else {
			if (currentChecks[pos.x].indexOf(pos.y) === -1) {
				currentChecks[pos.x].push(pos.y);
				added.push({x: pos.x, y: pos.y});
			}
		}
	}
	return added;
};


// TODO performance can be improved, as we can find neighbours that are already in toCheck,
// so they're being checked twice
// also, using concatSquares is suboptimal
tetris._checkSquare = function(rectangle, tobechecked, neighbours, nextSquare) {
	if (!neighbours) {
		neighbours = [tobechecked];
	}

	var added;
	var nbNeighbours = neighbours.length;
	while (nbNeighbours < 4) {
		added = tetris._toCheck(rectangle, neighbours, nextSquare);
		neighbours = tetris._concatSquares(neighbours, added);
		if (neighbours.length === nbNeighbours) return false;
		nbNeighbours = neighbours.length;
	}
	return true;
};

tetris._init = function(nbPieces) {
	var result = [];
	for (var piece in tetris.PIECES) {
		for (var j = 0; j < nbPieces; j++) {
			result.push(tetris.PIECES[piece]);
		}
	}
	return result;
};

tetris._sizeRect = function(nbPieces) {
	var nbSquares = nbPieces * common.numberElements(tetris.PIECES) * 4;
	for (var x = Math.floor(Math.sqrt(nbSquares)); x > 1; x++) {
		if ((nbSquares/x - Math.floor(nbSquares/x)) < 0.001) {
			return {width: Math.floor(nbSquares/x), height: x};
		}
	}
};
tetris._initialRect = function(sizeSquare) {
	var array = [];
	array.length = sizeSquare.height;
	var line = [];
	line.length = sizeSquare.width;
	for (var i = 0; i < line.length; i++) line[i] = tetris.EMPTY;
	for (i = 0; i < array.length; i++) array[i] = line.slice();
	return array;
};


/**
 * concatenate two list of squares in two different formats
 * a is a list of {x: x, y: y} and b is a object of x: [y1, y2...]
 * the resulting array is of squares in a's format.
 */
//
tetris._concatSquares = function(a, b) {
	var bNotInA = [];
	for (var x in b) {
		var current = b[x];
		for (var i = 0; i < current.length; i++) {
			var found = false;
			for (var j = 0; j < a.length; j++) {
				if (+x === a[j].x && current[i] === a[j].y) {
					found = true;
					break;
				}
			}
			if (!found) bNotInA.push({x: +x, y: current[i]});
		}
	}
	return a.concat(bNotInA);
};

