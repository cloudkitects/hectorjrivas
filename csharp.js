//////////////////////////////////////////////////////////////////////////////////////////////
// File		: csharp.js
// Author	: Hector J. Rivas
// Created	: Fri Jan 30 17:52:17 CST 2015
// Updated	: Wed Feb 11 12:45:20 CST 2015
// Purpose	: customize the CSharp syntax instance with sample classes and interfaces and
//			  styles. Add answer handlers.
//////////////////////////////////////////////////////////////////////////////////////////////

var syntax;

// add a handler for the load event
addEventHandler("load", Load2);

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: Load2
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
	syntax.addGroup("sampleinterfaces", "IHome IOffice IFile IDbConnection ICustomer Interface1 IAnimal IDataContainer IPerson IOutputFormatter", "color: #AEBD31");
	syntax.addGroup("sampleclasses", "Rate UseStart Beam TheaterCustomer UseResources Test EmployeeService MaxTermReachedHandler FullName BaseLogger EmployeeRoster Patient Program MyCustomerClass Alert Subscriber LogHelper PayrollProcessor ItemBase Widget Worker Class2 Class3 Data Cache Temperature TraceSource Bar EventLog Account Game Individual Group Class1 Logger Customer Animal Mammal Loan LoanCollection NorthwindEntities Order Compass Location Person ExtensionMethods Employee TabDelimitedFormatter Lease ExceptionLogger User UserTracker Runner AddUserCallback Kiosk Catalog ScoreCard Warehouse Inventory ReportCard Book BookTracker AddBookCallback RenamedEventArgs Product", "color: #31BDB5");

	// add  rules to override syntax default styles
	addRule(null, ".CSharp", "font-family: Consolas, 'Courier New', Courier, mono; border-radius: 0; background: transparent;");
	addRule(null, "#tbcode", "box-shadow: none;");
		
	// apply highlighting to code fragments
	ApplySyntaxHighlighting1();

	// apply highlighting to inline code tags
	ApplySyntaxHighlighting2();
	
	// attach event handlers
	AttachAnswerHandlers();
	AttachDropdownHandlers();
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: ApplySyntaxHighlighting()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Fri Jan 30 15:48:48 CST 2015
// Updated	: Tue Feb 10 11:31:40 CST 2015
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
				linens.innerHTML = lineCountHTML(source, true);
				
				// modify line numbers' style
				with (linens.style)
				{
					borderRadius = 0;
					textAlign = "right";
					backgroundColor = "#fff";
					color = "#000";
				}
			}
		}
		else
		{
			target.innerHTML = source.value;
		}
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
// Function	: AttachAnswerHandlers()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Mon Feb 9 20:34:39 CST 2015
// Updated	: Mon Feb 9 20:34:39 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function AttachAnswerHandlers()
{
	// add answer onclick handlers
	var questions = document.getElementsByTagName("OL");
	
	for (var i = 0; i < questions.length; i++)
	{
		var answers = questions[i].children;
		
		for (var j = 0; j < answers.length; j++)
			addEventHandler("click", function() { toggleClass(this, "answered"); }, answers[j]);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: AttachDropdownHandlers()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Mon Feb 9 20:34:52 CST 2015
// Updated	: Mon Feb 9 20:34:52 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function AttachDropdownHandlers()
{
	var tables = document.getElementsByName("tbcode");

	if (tables == null)
		return;
	
	for (var t = 0; t < tables.length; t++)
	{
		var table = tables[t];
		
		if (table.rows == null || table.rows.length < 2)
			continue;
		
		var inputs = table.getElementsByTagName("INPUT");
		var divs   = table.getElementsByTagName("DIV");
		
		if (inputs == null || divs == null)
			continue;
		
		for (var i = 0; i < inputs.length; i++)
		{
			var div = divs[i];
			
			relocate(div, getOffsetPosition(inputs[i], div.children[0]));
			
			hide(inputs[i]);
				
			div.onmouseover = function() { var p = getParent(event.srcElement, "DIV"); if (p)  display(p.children[1]); };
			div.onmouseout  = function() { var p = getParent(event.srcElement, "DIV"); if (p) collapse(p.children[1]); };
			
			var list = div.children[1];
			
			list.onclick = function()
			{
				var li = event.srcElement;
				
				if (li.tagName != "LI")
				 	li = getParent(event.srcElement, "LI");

				if (li == null)
					return;
					
				if (li.children == null || li.children[0].tagName != "CODE")
				{
					var div = getParent(li, "DIV");
					
					if (div)
					{
						var span = div.children[0];
							
						span.innerHTML = li.innerHTML;
						
						collapse(this);
						
						removeClass(span, "right");
						removeClass(span, "wrong");
		
						addClass(span, hasClass(li, "right") ? "right" : "wrong");
					}
				}
				else
				{
					var code = li.children[0];
					
					if (code == null)
						return;
					
					if (code.tagName != "CODE")
						return;
					else
					{
						// TODO?
					}
					
					var div = getParent(code, "DIV");
					
					if (div)
					{
						var span = div.children[0];
							
						span.innerHTML = code.innerHTML;
						
						collapse(this);
						
						removeClass(span, "right");
						removeClass(span, "wrong");
		
						addClass(span, hasClass(li, "right") ? "right" : "wrong");
					}
				}
			};
		}
	}
}
