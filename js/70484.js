//////////////////////////////////////////////////////////////////////////////////////////////
// File		: csharp.js
// Author	: Hector J. Rivas
// Created	: Fri Jan 30 17:52:17 CST 2015
// Updated	: Wed Feb 11 12:45:20 CST 2015
// Purpose	: customize the CSharp syntax instance with sample classes and interfaces and
//			  styles. Add answer handlers.
//////////////////////////////////////////////////////////////////////////////////////////////

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
		
	with (syntax)
	{
		// sample (and fake) objects
		addGroup("sampleinterfaces", "IBindablePropertyChanging IBindablePropertyChanged", rules["interfaces"]);
		addGroup("sampleclasses", "NewItem NewsSource FeedRetriever SocialItem SocialSource TimeSpan MainPage DispatchTimer App DataStoreBase VideoLibrary VideoCollection Video GridView AuthenticationPicker Journal Profile BlankPage MyApp AccountViewModel BindablePropertyChangedEventHandler NotifyPropertyChangingEventHandler CustomerList Customer CustomerCollection", rules["classes"]);
	
		// objects that eventually should be moved to syntax.css
		addGroup("interfaces", "ApplicationExecutionState NavigationCacheMode IRandomAccessStream", rules["interfaces"] + "border-bottom:1px dotted #AEBD31;");
		addGroup("classes", "DateTimeOffset ContactPicker ContactManager ContactPickerUI ContactInformation SearchPane BackgroundExecutionManager FormsAuthentication WindowsAuthenticationModule PassportAuthenticationModule PasswordCredentialPropertyStore PasswordCredential Calendar XmlDocument OnlineIdAuthenticator NetworkCredential PasswordVault LSAuthenticationObject PSCredential LSCredentialFormContext Frame StorageFile NavigationHelper TimeSpan MediaElement CoreWindow ApplicationSettings SettingsPane SettingsCommand SettingsFlyout AppSettingsFlyout", rules["classes"] + "border-bottom:1px dotted #31BDB5;");
	}
	
	// add  rules to override syntax default styles
	addRule(null, ".CSharp, .XAML, SELECTOR", "font-family: Consolas, 'Courier New', Courier, mono; line-height: 1em; border-radius: 0; background: transparent;");
	addRule(null, "#tbcode", "border-radius: 0; box-shadow: none;");
	
	// apply highlighting to code fragments
	ApplySyntaxHighlighting1();

	// apply highlighting to inline code tags
	ApplySyntaxHighlighting2();
	
	// attach event handlers
	AttachAnswerHandlers();
	AttachDropdownHandlers();
	AttachChecklistHandlers();
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
// Purpose	: parses inline C# code fragments.
// Created	: Fri Jan 30 15:48:48 CST 2015
// Updated	: Fri Feb 20 11:10:52 CST 2015, parses custom CSHARP elements also.
//			: Mon Mar  2 12:56:04 CST 2015, parses custom XAML elements.
//////////////////////////////////////////////////////////////////////////////////////////////
function ApplySyntaxHighlighting2()
{
	// parse code fragments
	var codeFragments1 = document.getElementsByTagName("CSHARP");
	var codeFragments2 = document.getElementsByTagName("XAML");
	
	var codeFragments = Array.prototype.slice.call(codeFragments1).concat(
						Array.prototype.slice.call(codeFragments2));
	
	for (var i = 0; i < codeFragments.length; i++)
	{
		var codeFragment = codeFragments[i];
		
		switch (codeFragment.tagName)
		{
		case "CSHARP": codeFragment.className = "CSharp"; break;
		case "XAML": codeFragment.className = "XAML"; break;
		default:
			console.debug(printf("No syntax found for {0} tags.", codeFragment.tagName));
			continue;
		}

		// check if we have a syntax object to reuse
		var syn = Syntaxes.find("language", codeFragment.className);
	
		if (syn == null)
		{
			console.debug(printf("No syntax found for the {0} language.", codeFragment.className));
			continue;
		}

		try 
		{
			codeFragment.innerHTML = syn.parse(codeFragment.innerText);
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
// Created	: Mon Feb  9 20:34:52 CST 2015
// Updated	: Fri Feb 20 11:08:04 CST 2015, input elements no longer required.
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
		
		var answers = table.getElementsByTagName("ANSWER");
		var divs   = table.getElementsByTagName("DIV");
		
		if (answers == null || divs == null)
			continue;
		
		for (var i = 0; i < answers.length; i++)
		{
			var div = divs[i];
			
			relocate(div, getOffsetPosition(answers[i], div.children[0]));
			
			div.onmouseover = function() { var p = getParent(event.srcElement, "DIV"); if (p)  display(p.children[1]); };
			div.onmouseout  = function() { var p = getParent(event.srcElement, "DIV"); if (p) collapse(p.children[1]); };
			
			var list = div.children[1];
			
			list.onclick = function()
			{
				//debugger;
				
				var item = getParent(event.srcElement, "LI");
				
				if (item == null)
					return;
				
				var selector = getParent(item, "DIV").children[0];
				
				selector.innerHTML = item.innerHTML;

				collapse(this);
				
				removeClass(selector, "right");
				removeClass(selector, "wrong");

				addClass(selector, hasClass(item, "right") ? "right" : "wrong");
			};
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: AttachChecklistHandlers()
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Mon Mar 9 13:11:50 CDT 2015
// Updated	: Mon Mar 9 13:11:50 CDT 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function AttachChecklistHandlers()
{
	var lists = document.getElementsByTagName("UL");

	for (var i = 0; i < lists.length; i++)
	{
		var list = lists[i];
		
		if (!hasClass(list, "checklist"))
			continue;
			
		var items = list.getElementsByTagName("LI");
		
		for (var j = 0; j < items.length; j++)
		{
			var item = items[j];
			
			item.onclick = function()
			{
				var item = getParent(event.srcElement, "LI");
				
				toggleClass(item, "checked");
				removeClass(item, "wrong");

				if (hasClass(item, "checked") && !hasClass(item, "right"))
					addClass(item, "wrong");
			};
		}
	}
}

