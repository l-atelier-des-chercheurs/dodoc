module.exports = parse;

function parse(text) {
	var pieces = text.split(/\n/),
		results = {},
		lastKey = null;
		subfieldMode = false;
		subfieldIndex = -1;
		subfieldKey = null;
	for (var i = 0; i < pieces.length; i++) {
		var piece = pieces[i] || '';
		if (piece == '----') {
			// remove last \n since a divider is made of \n---\n
			if( results[lastKey] !== undefined && typeof results[lastKey] === 'string' && results[lastKey].substring(results[lastKey].length-1) === '\n')
				results[lastKey] = results[lastKey].slice(0, -1);
			lastKey = null;
			subfieldMode = false;
			subfieldIndex = -1;
			subfieldKey = null;
			continue;
		}
		var matches = piece.match(/(^[a-zA-Z0-9_]+)\:(?:[\s\n])*(.+|$)$/m);
		
		// if found a new matching line with "fieldname: anything"
		if (matches && matches.length == 3) {
			// if we are currently adding to a subfield, let's add this 
			if(subfieldMode) {
				subfieldKey = matches[1];
				results[lastKey][subfieldIndex][subfieldKey] = matches[2];
			} else {
				lastKey = matches[1];
				results[lastKey] = matches[2];
			}


		} else {
			if (!lastKey) {
				lastKey = 'content';
				if (!results.content)
					results.content = '';
			}
			if(piece === '-') {
				// seems we are facing a subfield
				subfieldMode = true;
				subfieldIndex++;
				if(typeof results[lastKey] !== 'object')
					results[lastKey] = new Array();
				results[lastKey][subfieldIndex] = new Object();
			} else if(subfieldMode) {
				results[lastKey][subfieldIndex][subfieldKey] += piece;
			} else {
				results[lastKey] += (results[lastKey].length ? '\n' : '') + piece;
			}

		}
	}
	return results;
}