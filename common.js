window.common = {};

/**
 * Show/hide the loader
 */
common.toggleLoader = function() {
	var overlay = document.getElementById('overlay');
	if (overlay.className === 'visible') {
		overlay.className = 'hidden';
	} else {
		overlay.className = 'visible';
	}
};

/**
 * Draws the rectangle, with number of solutions tested and processing time displayed.
 * params  {
 *  id [String] id of the dom element to use to display the result
 *  rectangle [Array] Matrice of objects, which contain an id,
 *                    corresponding to the tetris.PIECES
 *  nbStates [int] number of solutions tested
 *  duration [int] processing time in seconds
 *  }
 */
common.draw = function(params) {
	var id = params.id;
	var rect = params.rectangle;
	var nbStates = params.nbStates;
	var duration = params.duration;
	var rectEl = document.getElementById(id);
	var html = '';
	if (nbStates) html += '<div style="margin-top: 15px">Number of solutions tested: ' + nbStates + '</div>';
	if (duration) html += '<div>Time it took: ' + duration + 's</div>';
	html += '<table border="1" style="margin: 5px auto">';
	for (var i = 0; i < rect.length; i++) {
		html += '<tr>';
		var line = rect[i];
		for (var j = 0; j < line.length; j++) {
			var color = tetris.COLORS[rect[i][j].id];
			html += '<td style="background-color: ' + color + ';" class="cell"></td>';
		}
		html += '</tr>';
	}
	html += '</table>';
	rectEl.innerHTML = html;
};

/**
 * Clones a rectangle
 */
common.cloneRect = function(rect, sizeSquare) {
	var l = sizeSquare.height;
	var copy = [];
	copy.length = l;
	for (var i = 0; i < l; i++) {
		copy[i] = rect[i].slice();
	}
	return copy;
};

/**
 * Counts the number of elements in an object. Works only with simple JavaScript objects.
 * Will NOT work with objects created with new Objects, or anything that has functions
 * in its prototype (would need to add hasOwnProperty, but there is no need here).
 * Also only counts the first level of elements. Will NOT count the number of
 * elements of sub-objects
 */
common.numberElements = function(obj) {
	var count = 0;
	for (var elt in obj) count++;
	return count;
};
