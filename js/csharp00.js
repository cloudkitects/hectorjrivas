//////////////////////////////////////////////////////////////////////////////////////////////
// File		: alphadock.js
// Author	: Hector J. Rivas
// Created	: Fri Jan 30 17:52:17 CST 2015
// Updated	: Fri Feb  6 09:47:04 CST 2015
// Purpose	: 
// Notes	: 
//////////////////////////////////////////////////////////////////////////////////////////////

var syntax;

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: ApplySyntaxHighlighting()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Fri Jan 30 15:48:48 CST 2015
// Updated	: Fri Jan 30 18:17:57 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function ApplySyntaxHighlighting1()
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
// Function	: ApplySyntaxHighlighting()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Fri Jan 30 15:48:48 CST 2015
// Updated	: Fri Jan 30 18:17:57 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function ApplySyntaxHighlighting2()
{
	// check if we have a syntax object to reuse
	syntax = Syntaxes.find("language", "CSharp");
	
	if (syntax == null)
		return;

	// parse code fragments
	var codeFragments = document.getElementsByTagName("CODE");
	
	for (var i = 0; i < codeFragments.length; i++)
	{
		var codeFragment = codeFragments[i];
		
		if (codeFragment.className != "CSharp")
			continue;

		try 
		{
			codeFragment.innerHTML = syntax.parse(codeFragment.innerText);
		}
		catch(e)
		{
			console.debug(printf("Unable to parse: {0}", codeFragment.innerHTML));
			continue;
		}
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

	if (syntax == null)
	{
		syntax = LoadSyntax("CSharp");
		
		if (syntax == null)
			return;
	}
		
	// add any custom groups or blocks
	syntax.addGroup("csharp", "Animal Loan LoanCollection", "color: #5FB9A7");

	// add  rules to overrides the default style
	addRule(null, ".CSharp", "font-family: Consolas, 'Courier New', Courier, mono; font-size: 1em; border-radius: 0; background: transparent;");
	addRule(null, "#tbcode", "box-shadow: none;");
		
	ApplySyntaxHighlighting1();

	// add handling of generics for CODE tags
	syntax.addBlock("generics", /<((?:[\w\s,_]+\s*)+)>/g, "");

	ApplySyntaxHighlighting2();
	
	// add answer onclick handlers
	var questions = document.getElementsByTagName("OL");
	
	for (var i = 0; i < questions.length; i++)
	{
		var answers = questions[i].children;
		
		for (var j = 0; j < answers.length; j++)
			addEventHandler("click", answered, answers[j]);
	}
	
	function answered()
	{
		if (!this.classList)
			return;

		if (this.classList.contains("answered"))
			this.classList.remove("answered");
		else
			this.classList.add("answered");
	}
	
	// add dropdown handlers
	var table = document.getElementsByName("tbcode")[1];

	if (table == null)
		return;
	
	var inputs = table.rows[0].getElementsByTagName("INPUT");
	var divs   = table.rows[1].getElementsByTagName("DIV");
	
	for (var i = 0; i < inputs.length; i++)
	{
		var div = divs[i];
		
		var r0 = inputs[i].getBoundingClientRect();
		var r1 = div.children[0].getBoundingClientRect();
		
		div.style.left = printf("{0}px", parseInt(r0.left) - parseInt(r1.left));
		div.style.top  = printf("{0}px", parseInt(r0.top)  - parseInt(r1.top));
		
		div.children[0].style.width = printf("{0}px", parseInt(div.getBoundingClientRect().width));
		
	
		div.onmouseover = function() { var p = getParent(event.srcElement, "DIV"); if (p) p.children[1].style.display = "inline-block"; };
		div.onmouseout  = function() { var p = getParent(event.srcElement, "DIV"); if (p) p.children[1].style.display = "none"; };
		
		var listItems = div.children[1];
		
		listItems.onclick = function()
		{
			var p = getParent(event.srcElement, "DIV");
			
			if (p)
			{
				p.children[0].value = event.srcElement.innerText;
				p.children[1].style.display = "none";
			}
		};
	}
}

// add a handler for the load event
addEventHandler("load", Load2);