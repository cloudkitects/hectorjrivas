//////////////////////////////////////////////////////////////////////////////////////////////
// File		: alphadock.js
// Author	: Hector J. Rivas
// Created	: Fri Jan 30 17:52:17 CST 2015
// Updated	: Fri Jan 30 17:52:22 CST 2015
// Purpose	: 
// Notes	: 
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: ApplySyntaxHighlighting()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Fri Jan 30 15:48:48 CST 2015
// Updated	: Fri Jan 30 18:17:57 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function ApplySyntaxHighlighting()
{
	// get code tables on this document
	var ctables = document.getElementsByName("tbcode");

	// nothing to do
	if (!ctables)
		return;

	for (var i = 0, j; i < ctables.length; i++)
	{
		var linens = ctables[i].getElementsByTagName("PRE")[0],
			source = ctables[i].getElementsByTagName("TEXTAREA")[0],
			target = ctables[i].getElementsByTagName("PRE")[1];

		// skip bad-formed ctables (nothing will be shown)
		if (source == null || target == null)
			continue;

		// the PRE element's class attribute indicates the language to parse
		var syntax = Syntaxes.find("language", target.className);

		// we managed to create a syntax object ( === language is known )
		if (syntax != null)
		{
			// parse the source
			try 
			{
				target.innerHTML = syntax.parse(source.innerText);
			}
			catch(e)
			{
				target.innerHTML = source.innerHTML;
				
				return;
			}
			
			// Safari bug will not apply the font-size correctly...
			if (linens != null && BrowserInfo.id != "Safari")
			{
				// count source lines
				linens.innerHTML = lineCountHTML(source);
				
				// modify line numbers' style
				with (linens.style)
				{
					borderRadius = 0;
					textAlign = "right";
					backgroundColor = "#C0C0C0";
					color = "#FFFFFF";
				}
			}
		}
		else
			target.innerHTML = source.innerHTML;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: Load
// Author	: Hector J. Rivas
// Created	: Fri Jan 30 17:53:21 CST 2015
// Updated	: Fri Jan 30 17:53:25 CST 2015
// Purpose	: add any customizations to the CSharp syntax used in Alpha Dock.
//////////////////////////////////////////////////////////////////////////////////////////////
function Load2()
{
	// add syntax customizations
	var syntax = Syntaxes.find("language", "CSharp");

	if (syntax != null)
	{
		syntax.addGroup("alphadock", "Person", "color: #FF46A3");
	}
		
	ApplySyntaxHighlighting();
}

// add a handler for the load event
addEventHandler("load", Load2);