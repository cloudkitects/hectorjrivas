//////////////////////////////////////////////////////////////////////////////////////////////
// File		: scripts.js
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 10:28:42 CDT 2012
// Updated	: Tue Sep 25 14:16:46 CDT 2012
// Purpose	: 
// Notes	: depends on DOM.js, prototypes.js, syntax.js and utility.js
//////////////////////////////////////////////////////////////////////////////////////////////

// a collection of Syntaxes so that they can be reused
var Syntaxes = [];

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: lineCountHTML(source)
// Author	: Hector J. Rivas
// Created	: Tue Oct 23 12:03:26 CDT 2012
// Updated	: Fri Feb 06  9:46:48 CDT 2014, split to add per-page syntax customizations.
//			: Mon Feb 16 16:42:44 CST 2015, min 2 zero padding added to the line count.
// Purpose	:
// Notes	:
//////////////////////////////////////////////////////////////////////////////////////////////
function lineCountHTML(source, pad)
{
	// line count with provision for IE
	var n = source.innerText.lineCount(1) - (BrowserInfo.id != "Explorer");
	var s = '';
	
	for (var i = 0; i < n; i++)
		 s += printf("{0}\n", pad ? (i + 1).pad(Math.max(n.toString().length, 2)) : i + 1);
		 
	return s;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: LoadSyntax(language)
// Author	: Hector J. Rivas
// Purpose	: Instance a syntax object for the language and push it into the Syntaxes array. 
// Created	: Fri Jan 30 18:05:11 CST 2015
// Updated	: Fri Jan 30 18:05:11 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function LoadSyntax(language)
{
	// reference a syntax object if already created for the language
	var syntax = Syntaxes.find("language", language);

	// none found, create it
	if (syntax == null)
	{
		// a stylesheet object
		var style = createStyleElement();

		switch (language)
		{
			case "CSharp":

				syntax = new CSharpSyntax(style);
				
				// TODO: move to each page's script
				syntax.addGroup("user1", "HJR ReadPassword", "color: #FF46A3");

				break;

			case "Batch":

				syntax = new BatchSyntax(style);

				break;
	
			case "JavaScript":

				syntax = new JavaScriptSyntax(style);

				// TODO: move to each page's script
				syntax.addGroup("user1", "addRule box compact escapeTags fChar fromBase26 indent indentation lChar lines ltrim mtrim printf randomGUID randomHex randomString reverse rtrim times toArray toBase26 trim unescapeTags unindent words", "color: #FF46A3");
				syntax.addGroup("user2", "Syntax Group Block BatchSyntax CSharpSyntax JavaScriptSyntax", "color: #FF46A3");

				break;
	
			case "XML":
				syntax = new XMLSyntax(style);

				break;

			case "XAML":
				syntax = new XAMLSyntax(style);

				break;

			case "HTML":
				syntax = new HTMLSyntax(style);

				break;

			default:
				break;
		}
	
		// save the subclassed syntax object for reuse
		if (syntax != null)
		{
			Syntaxes.push(syntax);
		}
		
		return syntax;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: LoadSyntaxes()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Fri Jan 30 18:13:57 CST 2015
// Updated	: Fri Jan 30 18:13:57 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function LoadSyntaxes()
{
	// get code tables on this document
	var ctables = document.getElementsByName("tbcode");

	// nothing to do
	if (ctables == null)
		return;

	for (var i = 0, j; i < ctables.length; i++)
	{
		var source = ctables[i].getElementsByTagName("TEXTAREA")[0],
			target = ctables[i].getElementsByTagName("PRE")[1];

		// skip ill-formed code tables
		if (source == null || target == null)
			continue;

		// the PRE element's class attribute indicates the language
		LoadSyntax(target.className);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: Load
// Author	: Hector J. Rivas
// Created	: Tue Oct 23 11:38:28 CDT 2012
// Updated	: Tue Oct 23 11:38:28 CDT 2012
//			: Fri Jan 30 15:46:03 CST 2015
// Purpose	: init the BrowserInfo object (utility.js) and highlight the syntax of any
//            embedded code fragments.
//////////////////////////////////////////////////////////////////////////////////////////////
function Load()
{
	// initialize browser info
	BrowserInfo.init();
	
	// pre-load syntax objects for languages found on the page
	LoadSyntaxes();
}

// add a handler for the load event
window.addEventListener("load", Load);
