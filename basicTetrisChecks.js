
window.tetris_check = {};


/**
 * Checks the tetris._checkLocal function.
 */
tetris_check.checkLocal = function() {
	var pieces = [
		{piece: JSON.parse(JSON.stringify(tetris.PIECES.SQR)), topLeft: {x: 0, y: 0}},
		{piece: JSON.parse(JSON.stringify(tetris.PIECES.T)), topLeft: {x: 2, y: 0}}
	];
	tetris.sizeSquare = {width: 4, height: 3};
	var rect = tetris_check.createRect(pieces);
	common.draw({id: 'solution', rectangle: rect});
	if (tetris._checkLocal(rect, {x: 2, y: 0})) throw 'invalid rectangle deemed valid.';
	else console.log('invalid rectangle: OK');

	pieces = [
		{piece: JSON.parse(JSON.stringify(tetris.PIECES.SQR)), topLeft: {x: 0, y: 0}},
		{piece: tetris._turn(JSON.parse(JSON.stringify(tetris.PIECES.L)), 2), topLeft: {x: 2, y: 0}}
	];
	rect = tetris_check.createRect(pieces);
	common.draw({id: 'solution', rectangle: rect});
	var res = tetris._checkLocal(rect, {x: 2, y: 0});
	if (!res) throw 'valid rectangle deemed invalid.';
	else console.log('valid rectangle: OK');
	if (res.x === 2 && res.y === 1) console.log('nextSquare properly updated');
	else throw 'Issue with nextSquare\'s update';
};
/**
 * Checks the tetris._add function.
 */
tetris_check.add = function() {
	var pieces = [
		{piece: JSON.parse(JSON.stringify(tetris.PIECES.SQR)), topLeft: {x: 0, y: 0}}
	];
	tetris.sizeSquare = {width: 4, height: 3};
	var rect = tetris_check.createRect(pieces);
	common.draw({id: 'solution', rectangle: rect});

	if (tetris._add(rect, tetris._turn(JSON.parse(JSON.stringify(tetris.PIECES.T)), 1), {x: 2, y: 0})) {
		common.draw({id: 'solution', rectangle: rect});
		throw 'out of bound rectangle deemed valid.';
	} else console.log('out of bound rectangle: OK');

	rect = tetris_check.createRect(pieces);
	if (tetris._add(rect, tetris._turn(JSON.parse(JSON.stringify(tetris.PIECES.T)), 2), {x: 2, y: 0})) {
		common.draw({id: 'solution', rectangle: rect});
		throw 'invalid rectangle deemed valid.';
	} else console.log('invalid rectangle: OK');

	rect = tetris_check.createRect(pieces);
	if (!tetris._add(rect, tetris.PIECES.L, {x: 2, y: 0})) throw 'valid rectangle deemed invalid.';
	else console.log('valid rectangle: OK');
	common.draw({id: 'solution', rectangle: rect});

};

tetris_check.fillNext = function() {
	var pieces = [
		{piece: JSON.parse(JSON.stringify(tetris.PIECES.SQR)), topLeft: {x: 0, y: 0}}
	];
	tetris.sizeSquare = {width: 4, height: 3};
	var rect = tetris_check.createRect(pieces);
	common.draw({id: 'solution', rectangle: rect});

	var response = tetris._fillNext(rect, [tetris.PIECES.L], 0, 1, {x: 2, y: 0});
	if (response && response.nextSquare) {
		common.draw({id: 'solution', rectangle: response.rect});
		throw 'Addition of L, position 0 deemed valid when it shouldn\'t have.';
	}
	else console.log('Addition of L, position 0: OK');

	tetris.sizeSquare = {width: 4, height: 5};
	rect = tetris_check.createRect(pieces);
	common.draw({id: 'solution', rectangle: rect});
	response = tetris._fillNext(rect, [tetris.PIECES.L, tetris.PIECES.T], 0, 2, {x: 2, y: 0});
	common.draw({id: 'solution', rectangle: response.rect});
	if (!(response.nextSquare && response.rect)) {
		throw 'Addition of L, position 2 deemed invalid when it shouldn\'t have.';
	}
	else console.log('Addition of L, position 2: OK');
	if (response.nextSquare.x === 2 && response.nextSquare.y === 1) console.log('nextSquare OK');
	else throw 'nextSquare not updated properly.';
	common.draw({id: 'solution', rectangle: response.rect});

	response = tetris._fillNext(response.rect, [tetris.PIECES.T, tetris.PIECES.T], 0, 2, response.nextSquare);
	if (!(response.nextSquare && response.rect)) {
		throw 'Addition of T, position 2 deemed invalid when it shouldn\'t have.';
	}
	else console.log('Addition of T, position 2: OK');
	if (response.nextSquare.x === 0 && response.nextSquare.y === 2) console.log('nextSquare OK');
	else throw 'nextSquare not updated properly.';
	common.draw({id: 'solution', rectangle: response.rect});
};

tetris_check.createRect = function(pieces) {
	var height = tetris.sizeSquare.height;
	var width = tetris.sizeSquare.width;
	var rect = tetris._initialRect({height: height, width: width});
	for (var i = 0; i < pieces.length; i++) {
		tetris._add(rect, pieces[i].piece, pieces[i].topLeft);
	}
	return rect;
};
