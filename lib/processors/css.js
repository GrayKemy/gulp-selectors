var expressions = require('../utils/expressions');

/*!
 * NOTE : 
 * there is this case : .foo > :not([class*='bar'])
 * the class name 'bar' has not undergone any change ! 
 * probably because it is not preceded by a dot '.'
*/


/**
 * array objects of symbols to replace with add spaces
 *
 * @param {object} symboles
 */
const replacementsArray = [
	 // add espace before class name and id
	 { base: '.', replacement: ' .' },
	 { base: '#', replacement: ' #' },
	 // others symbols
	 { base: '*', replacement: ' * ' },
	 { base: '!', replacement: ' ! ' },
	 { base: ':', replacement: ' : ' },
	 { base: ';', replacement: ' ; ' },
	 { base: '>', replacement: ' > ' },
	 { base: '<', replacement: ' < ' },
	 { base: '[', replacement: ' [ ' },
	 { base: ']', replacement: ' ] ' },
	 { base: ')', replacement: ' ) ' },
	 { base: '(', replacement: ' ( ' },
	 { base: '+', replacement: ' + ' },
	 { base: '=', replacement: ' = ' },
	 { base: '~', replacement: ' ~ ' },
	 { base: '{', replacement: ' { ' },
	 { base: '}', replacement: ' } ' },
 ];
 
 
/**
 * add spaces before each id & class name,
 * Precede class names and ids with a space,
 * add spaces before and after each specific symbol to make the program work perfectly and catch them all
 *
 * otherwise the program would not recognise all the class names, id in some cases,
 * could not catch them all and skip over some !
 *
 * example : 
 * .foo,.bar{ =====> .foo , .bar {
 * .foo>:not(.bar) =====> .foo > :not ( .bar )
 * .foo>:not([class*='bar']) =====> .foo > : not ( [ class * = 'bar' ] )
 * ... and so on
 *
 *
 * @param {string} contents
 * @returns {string} contents with spaces
 */
const formatSentence = sentence => {
	replacementsArray.forEach(replacementItem => {
		// # for SyntaxError: Invalid regular expression: /*/: Nothing to repeat example (colors : #000000;)
		if (['#', ':', '~'].indexOf(replacementItem.base) != -1) {
			sentence = sentence.replace(new RegExp(replacementItem.base, 'g'), replacementItem.replacement);
		} else {
			sentence = sentence.replace(new RegExp('\\' + replacementItem.base, 'g'), replacementItem.replacement);
		}
	});
	
	return sentence;
}


/**
 * just reverse function of formatSentence called at the end,
 * to remove the spaces we added
 *
 * restore the file to its original state otherwise it wouldn't look good with spaces everywhere
 * for example if the input file was a minified css file it would be ideal to return it to its original state,
 * after having done the work, neither seen nor known !!!
 *
 * @param {string} contents
 * @returns {string} contents without spaces
 */
 function revere_formatSentence(sentence) {
	replacementsArray.forEach(function (item, index) {
		sentence = sentence.replaceAll(item.replacement, item.base); 
	});
	
	return sentence;
}


/**
 * Replaces all class names with shortnames. Also builds a library of shortnames which can be
 * used to reduce other file types.
 *
 * @param {string} File
 * @returns {string} Minified file
 */
module.exports =  function(file, classLibrary, idLibrary) {
	
	// call f° adding space
	file = formatSentence(file);
	
	// Now we can go : the process can start !
	
	var selectorNameMatch = expressions.selectorName;

	file = file.replace(expressions.classSelector, function(selector) {
		//exclude property values (matches ending in ')')
		if (selector[selector.length - 1] === ')') {
			return selector;
		}
		return selector.replace(selectorNameMatch, function(selectorName) {
			return classLibrary.get(selectorName, true);
		});
	});

	file = file.replace(expressions.idSelector, function(selector) {
		//exclude property values (matches ending in '; or }')
		if (selector[selector.length - 1] === ';' || selector[selector.length - 1] === '}') {
			return selector;
		}
		return selector.replace(selectorNameMatch, function(selectorName) {
			return idLibrary.get(selectorName, true);
		});
	});
	
	// call f° re-establish/remove the spaces we added
	file = revere_formatSentence(file);
	
	return file;
};