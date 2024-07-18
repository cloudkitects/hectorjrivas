//////////////////////////////////////////////////////////////////////////////////////////////
// File		: syntax.js
// Author	: Hector J. Rivas
// Created	: Tue Sep 18 12:18:54 CDT 2012
// Updated	: Tue Sep 18 12:18:54 CDT 2012
// Purpose	: Define a syntax coloring object, one that parses a PRE element and colorizes
//            the code according to the passed-in spesification.
// Notes	:
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Function : Group(name, keywords, flags)
// Author   : Hector J. Rivas
// Created  : Mon Sep 17 19:40:31 CDT 2012
// Updated  : Wed Sep 19 09:32:48 CDT 2012, catch-all regexp
//          : Tue Oct 23 12:29:16 CDT 2012, style attributes added on the fly
// Purpose  : Contain a RegExp instanced with the pased-in keywords (separated by white
//            space) and the passed-in flags, and a HTML template to highlight matches.
// Notes    : - Valid flags are 'g', 'i' and 'gi'; 'm' does not make much sense here.
//////////////////////////////////////////////////////////////////////////////////////////////
function Group(name, keywords, flags)
{
	var regexp   = null;
	var template = null;
	
	// no keywords, no regexp
	if (keywords)
		regexp = new RegExp(printf("\\b({0})\\b", keywords.replace(/\s+/g, '|')), flags || 'g');

	// no name, no template
	if (name)
		template = printf("<span class=\"{0}\">{1}</span>", name, "{0}");

	this.parse = function(text)
	{
		if (regexp && template)
			return text.replace(regexp, printf(template, "$1"));
		
		// no shirt, no shoes, no service!
		return text;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: Block(name, regexp, realizeHTML)
// Author	: Hector J. Rivas
// Created	: Tue Sep 18 13:31:47 CDT 2012
// Updated	: Tue Sep 18 13:31:47 CDT 2012
// Updated	: Tue Oct  2 09:38:39 CDT 2012 added a flag to realize HTML inside the block.
//          : Tue Oct 23 12:31:01 CDT 2012, no color
//          : Thu Nov 29 23:00:09 CST 2012, HTML is always realized!
//          : Fri Nov 30 13:01:31 CST 2012, bijective base 26 indices!
//			: Tue Feb 10 14:09:03 CST 2015, prefix-suffix via captured groups?
// Purpose	: Contain a Block object that wraps a RegExp and a HTML template.
//////////////////////////////////////////////////////////////////////////////////////////////
function Block(name, regexp, submatch)
{
	var template = printf("<span class=\"{0}\">{1}</span>", name, "{0}");
	var id       = printf("{0}{1}", randomString(25), "{0}");
	var Matches;

	this.hide = function(text)
	{
		// save the matches so we can restore them later
		if (submatch)
		{
			Matches = [];
			var match;
			
			// we want to highlight the captured group
			while (match = regexp.exec(text))
			{
				//for (var i = 1; i < match.length; i++)
				Matches.push(match[1]);
				
				//if (name.indexOf("tags") == 0)
				//	console.log('Found ' + match[0]);
			}
		}
		else
		{
			Matches = text.match(regexp) || [];
		}
		
		for (var i = 0, j; i < Matches.length; i++)
		{
			// shift to the match (skip the left context of the match)
			j = text.search(submatch ? Matches[i] : regexp);
			
			// replace each match by its indexed base26 id
			text = text.substr(0, j) + printf(id, i.toBase26()) + text.substr(j + Matches[i].length);
			
			// tweak each match to preserve white space accross lines
			Matches[i] = Matches[i].replace(/^ +/, function($1) { return "&nbsp;".times($1.length); });
		}
		
		return text;
	}
	
	this.restore = function(text)
	{
		for (var i = 0; i < Matches.length; i++)
			text = text.replace(printf(id, i.toBase26()), printf(template, Matches[i]));

		return text;
	}

	this.restoreEmbedded = function(text)
	{
		if (Matches.length)
		{
			var re = new RegExp(printf('(' + id + ')', "(\\w+)"));
			
			while (text.search(re) != -1)
				text = text.replace(RegExp.$1, Matches[RegExp.$2.fromBase26()]);
		}
		
		return text;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: Syntax()
// Author	: Hector J. Rivas
// Created	: Tue Sep 18 12:20:10 CDT 2012
// Updated	: Wed Oct  3 12:44:25 CDT 2012
// Updated	: Wed Nov 21 16:04:41 CST 2012, privatized most members
//			: Sat Apr  4 14:45:11 CDT 2015, added the rules map
// Purpose	: Serve as the base class for specific language syntax objects.
// Notes	: A Syntax object has a language, keyword groups, block definitions, customizable
//            tab size that defaults to 4 nbsp's and a parse function.
//////////////////////////////////////////////////////////////////////////////////////////////
function Syntax(language, styleSheet, rule, tabSize)
{
	tabSize  |= 4;

	var Groups = [];
	var Blocks = [];

	this.language = language;
	this.rules = {};

	// add the language CSS rule to the style sheet
	addRule(styleSheet, printf(".{0}", language), rule);

	// add keyword group
	this.addGroup = function(name, keywords, rule, flags)
	{
		// push the group (with a decorated name) into the array
		Groups.push(new Group(name += randomHex(4), keywords, flags));
		
		// add the CSS rule of this group
		addRule(styleSheet, printf(".{0} .{1}", language, name), rule);
	}

	// add block
	this.addBlock = function(name, regexp, rule, submatch)
	{
		// push the block (with a decorated name) into the array
		Blocks.push(new Block(name += randomHex(4), regexp, submatch));

		// add the CSS rule of this block
		addRule(styleSheet, printf(".{0} .{1}", language, name), rule);
	}

	// parse function
	this.parse = function(text)
	{
		// hide blocks (replace them with tags)
		for (var i = 0; i < Blocks.length; i++)
			text = Blocks[i].hide(text);
		
		// parse text for keywords
		for (var i = 0; i < Groups.length; i++)
			text = Groups[i].parse(text);
			
		// restore tagged blocks
		for (var i = 0; i < Blocks.length; i++)
			text = Blocks[i].restore(text);

		// restore embedded blocks
		for (var i = 0; i < Blocks.length; i++)
			text = Blocks[i].restoreEmbedded(text);

		// tabify to tabSize
		text = text.replace(/\t/g, "&nbsp;".times(tabSize));

		return text;
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: BatchSyntax()
// Author	: Hector J. Rivas
// Created	: Mon Sep 24 13:17:46 CDT 2012
// Updated	: Mon Sep 24 13:17:46 CDT 2012
// Purpose	: Wrap a Syntax object with batch keywords and blocks and return it.
//////////////////////////////////////////////////////////////////////////////////////////////
function BatchSyntax(styleSheet)
{
	// instance a base class object
	var s = new Syntax("Batch", styleSheet, "display: inline-block; font-size: 0.83em; font-family: Consolas, 'Courier New', Courier, mono; background-color: #FFFFFF; margin: 0px; padding: 4px; border-radius: 0em 0 1em 0em;");

	// append known keyword groups; I prefer case sensitive batch files...
	s.addGroup("reserved", "ASSOC AT ATTRIB BREAK CACLS CALL CD CHCP CHDIR CHKDSK CHKNTFS CLS CMD COLOR COMP COMPACT CONVERT COPY DATE DEL DIR DISKCOMP DISKCOPY DO DOSKEY ECHO ELSE ENDLOCAL ERASE EXIT EXPAND FC FIND FINDSTR FOR FORMAT FTYPE GOTO GRAFTABL HELP IF IN LABEL MD MKDIR MODE MORE MOVE PATH PAUSE POPD PRINT PROMPT PUSHD OSQL RD RECOVER REN RENAME REPLACE RMDIR SET SETLOCAL SHIFT SORT START SUBST TIME TITLE TREE TYPE VER VERIFY VOL XCOPY", "color: #0000FF");
	s.addGroup("modifiers", "NOT EXIST OFF ON ENABLEDELAYEDEXPANSION DISABLEDELAYEDEXPANSION", "color: #8080FF");
	
	// append known blocks; notice that order affects block nesting
	s.addBlock("comments",  /^\s*(::|REM).*/gm, "color: #008000", true); // single line :: or REM, with embedded HTML realization
	s.addBlock("strings1",  /".*"/g,            "color: #FF8080");       // double quoted string literals
	s.addBlock("strings2",  /'\S*'/g,           "color: #FF8080");       // single quoted string literals
	s.addBlock("strings3",  /`\S*`/g,           "color: #FF8080");       // apostrophe string literals
	s.addBlock("variables1", /%%\S*\b/g,        "color: #FF00FF");       // FOR variables
	s.addBlock("variables2", /%\d+\b/g,         "color: #FF00FF");       // environment variables
	s.addBlock("variables3", /%\S*%/g,          "color: #FF00FF");       // script variables
	s.addBlock("variables4", /%~\S*\s/g,        "color: #FF00FF");       // function arguments

	// return the wrapped syntax object
	return s;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: JavaScriptSyntax()
// Author	: Hector J. Rivas
// Created	: Tue Sep 25 14:26:45 CDT 2012
// Updated	: Tue Sep 25 14:26:45 CDT 2012
// Purpose	:
// Notes	:
//////////////////////////////////////////////////////////////////////////////////////////////
function JavaScriptSyntax(styleSheet)
{
	// instance a base class object
	var s = new Syntax("JavaScript", styleSheet, "display: inline-block; font-size: 1em; font-family: Consolas, 'Courier New', Courier, mono; background-color: #FFFFFF; margin: 0px; padding: 4px; border-radius: 0em 0 1em 0em;");

	with (s)
	{
		// append known keyword groups
		addGroup("reserved",   "abstract boolean break byte case catch char class const continue default delete do double else extends false final finally float for goto if implements import in instanceof int interface long native new null package private protected public return short static super switch syncronized this throw throws transient true try typeof var void while with", "color: #0000FF");
		addGroup("intrinsic",  "ActiveXObject arguments Array ArrayBuffer Boolean DataView Date Debug Enumerator Error Float32Array Float64Array Function function Global Int16Array Int32Array Int8Array JSON Math Number Object RegExp String Uint16Array Uint32Array Uint8Array VBArray WinRTError", "color: #0000FF; font-weight: bold");
		addGroup("constants",  "E Infinity LN10 LN2 LOG10E LOG2E MAX_VALUE MIN_VALUE NaN NEGATIVE_INFINITY PI POSITIVE_INFINITY SQRT1_2 SQRT2 undefined", "color: #FF00FF");
		addGroup("properties", "arguments callee caller constructor description global ignoreCase index input lastIndex lastMatch lastParen leftContext length message multiline number prototype rightContext source", "color: #0000FF");
		
		// object, string and array objects' methods
		addGroup("methods1",   "hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf", "color: #0000FF");
		addGroup("methods2",   "charAt charCodeAt concat indexOf lastIndexOf localeCompare match replace search slice split substr substring toLocaleLowerCase toLocaleUpperCase toLowerCase toUpperCase trim", "color: #0000FF");
		addGroup("methods3",   "every filter forEach join map pop push reduce reduceRight reverse shift slice some sort splice unshift", "color: #0000FF");
	
		// append known blocks; notice that order affects block nesting
		addBlock("html",      /<(\S+)\b[^>]*>.*?<\/\1>/g);                     // embedded html
		addBlock("regexp1",   /\$[0-9_&+`']/g,              "color: #C00000"); // RegExp's $x shorthand notation
		addBlock("regexp2",   /\/.+?\/[gmi]{0,3}/g,              "color: #C00000"); // regular expressions
		addBlock("strings1",  /"(\\.|[^\\"])*"/g,           "color: #FF6820"); // double quoted string literals
		addBlock("strings2",  /'(?:.{0,1}|\\{1,2}.)'/g,     "color: #00A0A0"); // single quoted character literals
		addBlock("comments1", /\/\*[\S\s]*?\*\//g,       "color: #008000; font-style: italic"); // multiline or inline (/**/)
		addBlock("comments2", /\/\/.*/g,                 "color: #008000; font-style: italic"); // single line (//)
		addBlock("numbers",   /\b\d+/g,                   "color: #FF0000"); // numeric literals
	}
	
	// return the wrapped Syntax object
	return s;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: CSharpSyntax()
// Author	: Hector J. Rivas
// Created	: Tue Sep 18 13:20:03 CDT 2012
// Updated	: Tue Sep 18 13:20:03 CDT 2012
//          : Fri Jan 30 10:31:09 CST 2015
// Purpose	: Wrap a Syntax object with C# keywords and blocks and return it.
//////////////////////////////////////////////////////////////////////////////////////////////
function CSharpSyntax(styleSheet)
{
	// instance a base class object
	with (s = new Syntax("CSharp", styleSheet,
			"background-color: #FFFFFF;\
			 margin: 0px;\
			 padding: 4px;\
			 font-size: 1em;\
			 font-family: Monaco, Consolas;\
			 display: inline-block;\
			 border-radius: 0em 0 1em 0em;\
			 line-height: 1.33em !important;"
		 ))
	{
		rules["reserved"]   = "color: #0000FF;"
		rules["interfaces"] = "color: #AEBD31;"
		rules["classes"]    = "color: #2B91AF;";

		// append known keyword groups
		addGroup("reserved", "abstract add as ascending async await base bool break by byte case catch char checked class const continue decimal default delegate do double dynamic else enum event explicit extern false finally fixed float for foreach from get global goto group if implicit in int interface internal into is join let lock long namespace new null object operator orderby out override params partial private protected public readonly ref remove return sbyte sealed select set short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using value var virtual void volatile where while yield", rules["reserved"]);
		addGroup("system", "TransactionScope Double Boolean Int32 Int64 List Object Console ConsoleKey ConsoleKeyInfo Func DateTime String StringBuilder", rules["classes"]);
		addGroup("ComponentModel", "ObservableCollection", rules["classes"]);
		addGroup("linq", "Expression", rules["classes"]);
		//addGroup("interfaces", "INotifyCollectionChanged IAsyncResult IValidateableObject INotifyPropertyChanging INotifyPropertyChanged IEnumerable IEnumerator IComparable IDisposable IQueryable IEquatable", rules["interfaces"]);
		addGroup("sql", "IsolatonLevel DbType SqlConnection SqlCommand SqlDataReader", rules["classes"]);
		addGroup("systemIO", "SeekOrigin File FileMode FileAccess FileShare StreamReader StringReader", rules["classes"]);
		addGroup("threading", "ParameterizedThreadStart TaskFactory Stream FileStream TextWriter Thread CancellationTokenSource CancellationToken Task TaskCompletionSource", rules["classes"]);
		addGroup("otherbuiltin", "WebRequest StreamWriter HttpWebRequest ExpandoObject CodeTypeDeclaration MemberAttributes XmlDictionaryWriter XmlWriter Match PipeStream CryptoStream Encoding MemoryStream MatchCollection EventInstance EventLogEntryType StopWatch HashAlgorithm SqlDataAdapter DataContext DbDataAdapter OleDbDataReader ArrayList JavaScriptSerializer XmlSerializer WeakReference SourceLevels Guid Dictionary ValidationContext ValidationResult DataContractSerializer DataContractJsonSerializer NetDataContractSerializer XmlObjectSerializer Regex RegexOptions RegexCompilationInfo WebClient NameValueCollection Uri", rules["classes"]);
		addGroup("other", "LinkedList HashTable Array FileWebRequest FileWebResponse WebResponse KeyValuePair ConcurrentDictionary Stack Queue SortedList", rules["classes"]);
		addGroup("markup", "DataContract DataMember MethodImpl MethodImplOptions Conditional", rules["classes"]);

		addBlock("directives", /#((end)*(if|region)|el(se|if)|define|undef|warning|error|line|region|pragma( warning| checksum)*)/g, "color: #FF00FF");

		addBlock("html1",      /<(a|img|input|span)\b[^>]*>.*?<\/\1>/g); // embedded html--with end tag
		addBlock("html2",      /<(a|img|input|span)\b[^>]*\s*\/>/g);     // embedded html--without end tag

		//addBlock("markup",      /\b([A-Z][^A-Z\W]+\w+Attribute)\b/g, rules["classes"], true);
		
		addBlock("events", /\b[A-Z][^A-Z\W]+\w+Event(Args|Handler)\b/g, rules["classes"]);
		addBlock("exceptions", /[\s\.]*\w*Exception\b/g, rules["classes"]);
		
		addBlock("interfaces", /\bI[A-Z]\w+\b/g, rules["interfaces"]);

		// excluding catch-all groups, the entire System.Windows namespace
		addBlock("sysWin1", /\b(Base(lineAlignment|ValueSource)|ColumnSpaceDistribution|Drag(Action|Drop(Effects|KeyStates))|Figure((Horizontal|Vertical)Anchor|UnitType)|FlowDirection|Font(Capitals|EastAsian(Language|Widths)|Fraction|Numeral(Alignment|Style)|Variants)|FrameworkPropertyMetadataOptions|GridUnitType|HorizontalAlignment|InheritanceBehavior|Line(BreakCondition|StackingStrategy)|LocalizationCategory|MessageBox(Button|Image|Options|Result))\b/g, rules["interfaces"]);
		addBlock("sysWin2", /\b(Modifiability|PowerLineStatus|Readability|ReasonSessionEnding|ResizeMode|(ResourceDictionary|TextDecoration|WindowStartup)Location|RoutingStrategy|ShutdownMode|SizeToContent|Template(Key|Type)|Text(Alignment|DataFormat|DecorationUnit|MarkerStyle|Trimming|Wrapping)|VerticalAlignment|Visibility|Window(State|Style)|WrapDirection)\b/g, rules["interfaces"]);
		addBlock("sysWin3", /\b(CornerRadius|CultureInfoIetfLanguageTag|DeferrableContent|DialogResult|Duration|DynamicResourceExtension|Expression|FigureLength|Font(Size|Stretch|Style|Weight)|GridLength|Int32Rect|Key(Spline|Time)|Length|NullableBool|Point|PropertyPath|Rect|Size|StrokeCollection|TemplateBinding(Expression|Extension)|TextDecorationCollection|Thickness|Vector){1}(Converter)?\b/g, rules["classes"]);
		addBlock("sysWin4", /\b(Application|(Base|Core)CompatibilityPreferences|Clipboard|CoerceValueCallback|ColorConvertedBitmapExtension|ComponentResourceKey|Condition(Collection)?|Content(Element|Operations)|Data(Format(s)?|Object|Template(Key)?|Trigger)|Dependency(Object(Type)?|Property(Helper|Key)?)|DragDrop|Event(Manager|PrivateKey|Route|Setter|Trigger)|Font(Stretches|Styles|Weights)|Framework(CompatibilityPreferences|ContentElement|Element(Factory)?|PropertyMetadata|Template)|Freezable(Collection)?|HierarchicalDataTemplate|Localization|LocalValue(Entry|Enumerator)|LogicalTreeHelper|LostFocusEventManager)\b/g, rules["classes"]);
		addBlock("sysWin5", /\b(MessageBox|Multi(Data)?Trigger|NameScope|PresentationSource|Property(ChangedCallback|Metadata)|Resource(Dictionary|Key)|RoutedEvent|Setter(Base(Collection)?)?|SizeChangedInfo|SplashScreen|StaticResourceExtension|Style|System(Colors|Commands|Fonts|Parameters)|Template(Content(Loader)?|Key)|TextDecoration(s)?|ThemeDictionaryExtension|Trigger(Action(Collection)?|Base|Collection)?|UI(Element(3D)?|PropertyMetadata)|ValidateValueCallback|ValueSource|Visual(State(Group|Manager)?|Transition)|WeakEventManager|Window(Collection)?)\b/g, rules["classes"]);

		// Windows Store apps
		addBlock("winCoreUI1", /\b(ICore(AcceleratorKeys|InputSourceBase|PointerInputSource|Window(EventArgs)*)|IInitializeWithCoreWindow)\b/g, rules["interfaces"]);
		addBlock("winCoreUI2", /\bCore(AcceleratorKey(s|EventType)|(Component|Independent)InputSource|Cursor(Type)*|Dispatcher(Priority)*|InputDeviceTypes|PhysicalKeyStatus|ProcessEventsOption|ProximityEvaluation(Score)*|VirtualKeyStates|Window(ActivationState|Dialog|FlowDirection|Flyout|ResizeManager)*)\b/g, rules["classes"]);
		addBlock("winCoreUI3", /\b(Idle)*DispatchedHandler(Args)*\b/g, rules["classes"]);
	
		// Windows.Security.Credentials.UI; two passes protect properties with the same name as their enum type
		addBlock("winSecCredsUI1", /\.(AuthenticationProtocol|Credential(Picker(Options|Results)*|SaveOption)|UserConsent(Verif(ier(Availability)*|icationResult)))\b/g, "color: inherit");
		addBlock("winSecCredsUI2", /\b(AuthenticationProtocol|Credential(Picker(Options|Results)*|SaveOption)|UserConsent(Verif(ier(Availability)*|icationResult)))\b/g, rules["classes"]);
			
		// Windows.Security.Authentication.Web
		addBlock("winSecAuthWeb1", /\bWebAuthentication(Options|Status)\b/g, rules["interfaces"]);
		addBlock("winSecAuthWeb2", /\bWebAuthentication(Broker|Result)\b/g, rules["classes"]);

		// Windows.UI.Notifications
		addBlock("winUINotif1", /\b(BadgeTemplateType|NotificationSetting|PeriodicUpdateRecurrence|TileTemplateType|Toast(DismissalReason|TemplateType))\b/g, rules["interfaces"]);
		addBlock("winUINotif2", /\b(Badge(Notification|Update(r|Manager))|Scheduled(Tile|Toast)Notification|Tile(Notification|Update(Manager|r))|Toast(Notif(ication(History|Manager)*|ier)))\b/g, rules["classes"]);
		
		// System.Net.Http
		addBlock("sysNetHttp1", /\b(ClientCertificateOption|HttpCompletionOption)\b/g, rules["interfaces"]);
		addBlock("sysNetHttp2", /\b(ByteArrayContent|DelegatingHandler|FormUrlEncodedContent|Http(Client(Handler)*|Content|Message(Handler|Invoker)|Method|(Request|Response)Message)|MessageProcessingHandler|Multipart(FormData)*Content|RtcRequestFactory|(Stream|String)Content|WebRequestHandler)\b/g, rules["classes"]);

		addBlock("diagnostics1", /\bPerformanceCounter(Category(Type)*|Insta(ller|nceLifetime)|Manager|Permission(Access|Entry(Collection)*)*|Type)*|Counter(CreationData(Collection)*|Sample(Calculator)*)*\b/g, rules["classes"]);
		addBlock("diagnostics2", /\bTrace(Event(Cache|Type)|Filter|Level|Listener(Collection)*|LogRetentionOption|Options|Source|Switch)*\b/g, rules["classes"]);
		addBlock("diagnostics3", /\b(Console|Default|DelimitedList|Event(Log|Schema)|(Text|Xml)Writer)TraceListener\b/g, rules["classes"]);
		addBlock("diagnostics4", /\bDebug((\.DebuggingModes)*|ger(BrowsableState)*)\b/g, rules["classes"]);
		addBlock("diagnostics5", /\b(Culture((AndRegion(InfoBuilder|Modifiers))|Info|Types)|DateTime(FormatInfo|Styles))\b/g, rules["classes"]);
		//addBlock("diagnostics6", /Event(Instance|Log(Entry(Collection|Type)*|Installer|Permission(Access|Entry(Collection)*)*|TraceListener)*|SchemaTraceListener|SourceCreationData|TypeFilter)\b/g, rules["classes"]);

		addBlock("reflection1", /\bAssembly(ContentType|Name(Flags|Proxy)*|(File|Informational)Version)*\b/g, rules["classes"]);
		//addBlock("reflection2", /Obfuscat(eAssembly|ion)Attribute\b/g, rules["classes"]);
		
		addBlock("xmlserialization1", /\bXml(Any(Element)*|Array(Item)*|ChoiceIdentifier|Element|Enum|Ignore|CodeExporter|DeserializationEvents|Include|(Member(s)*)*Mapping(Access)*|NamespaceDeclarations|Node|Reflection(Importer|Member)|Root|Schema(Enumerator|(Ex|Im)porter|Provider|s))((Attribute(s)*)|Overrides|s)*\b/g, rules["classes"]);
		addBlock("xmlserialization2", /\bXmlSerializ(ation(((Collection)*)(Fixup|Read|Write)Callback|GeneratedCode|Reader(\.(Collection)*Fixup)*|Writer)|er(Factory|Implementation|Namespaces)*)\b/g, rules["classes"]);
		addBlock("xmlserialization3", /\bXmlTypeMapping\b/g, rules["classes"]);
		addBlock("xmlserialization4", /\b(Code(Exporter|GenerationOptions|Identifier(s)*)|ImportContext|SchemaImporter)\b/g, rules["classes"]);
		addBlock("xmlserialization5", /\bIXml(Serializable|TextParser)\b/g, rules["interfaces"]);
		addBlock("xmlserialization6", /\b(Soap(Overrides|s)|CodeExporter|(Element|Enum|Ignore|Include|Type)|ReflectionImporter|Schema((Ex|Im)porter|Member))\b/g, rules["classes"]);
		
		addBlock("X509", /\bAuthenticodeSignatureInformation|OpenFlags|PublicKey|Store(Location|Name)|TimestampInformation|TrustStatus|X500DistinguishedName(Flags)?|X509\w+\b/g, rules["classes"]);
		
		addBlock("xmllinq", /\b((Load|Reader|Save)Options|X(C(Data|omment|ontainer)|D(eclaration|ocument(Type)?)|Element|Name(space)?|Node(DocumentOrder|Equality)?(Comparer)|Object(Change)?|ProcessingInstruction|StreamingElement|Text))\b/g, rules["classes"]);
		
		addBlock("netsecurity", /\bAuthenticat(edStream|ionLevel)|EncryptionPolicy|LocalCertificateSelectionCallback|RemoteCertificateValidationCallback|NegotiateStream|ProtectionLevel|Ssl(PolicyErrors|Stream)\b/g, rules["classes"]);
		
		addBlock("numbers",   /\b\d+([LDFM]|UL|U){0,1}/gi, "color: #FF0000"); // numeric literals
		addBlock("comments1", /\s*\/\*[\S\s]*?\*\//g, "color: #008000"); // multiline or inline /**/
		addBlock("comments2", /\s*\/\/.*/g, "color: #008000"); // single line //
		addBlock("strings1",  /@?"[^"]*.?/g, "color: #C00000"); // double quoted string literals
		addBlock("strings2",  /'.?'/g, "color: #00A0A0"); // single quoted character literal
		//addBlock("strings3",  /{\d+(:.*)*}/g, "color: #00A0A0"); // string formatting literals? Nested!

	}
	
	// return the wrapped Syntax object
	return s;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: XMLSyntax()
// Author	: Hector J. Rivas
// Created	: Tue Feb 10 13:41:06 CST 2015
// Updated	: Tue Feb 10 13:41:06 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function XMLSyntax(styleSheet)
{
	// instance a base class object
	var s = new Syntax("XML", styleSheet, "display: inline-block; font-size: 1em; font-family: Consolas, 'Courier New', Courier, mono; background-color: #FFFFFF; margin: 0px; padding: 4px; border-radius: 0em 0 1em 0em;");

	with (s)
	{
		// there are no known XML keywords; we'll highlight every tag!
		//addBlock("tags",       /&lt;\??\s*\/?((\w+\.?)+)\s*\/?/g, "color: #C00000", true);
		addBlock("tags1",       /&lt;\??\s*\/?\s*([\w\.]+)\b/g, "color: brown", true);
		addBlock("tags2",       /&lt;\??\s*\/?\s*([\w\.]+)&gt;/g, "color: brown", true);
		addBlock("attributes", /\s+(\w+)=/gi, "font-weight: bold", true);
		
		// append known blocks; notice that order affects block nesting
		addBlock("strings1", /"(\\.|[^\\"])*"/g,       "color: #ce090a"); // double quoted string literals
		addBlock("strings2", /'(?:.{0,1}|\\{1,2}.)'/g, "color: #00A0A0"); // single quoted character literals
		addBlock("comments", /&lt;!--[\S\s]*?--&gt;/g,        "color: #008000; font-style: italic"); // multiline or inline (/**/)
		addBlock("dates",  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(-\d{2}:\d{2})?\b/g,                 "color: #FF0000"); // numeric literals
		addBlock("numbers",  /\b\d+/g,                 "color: #FF0000"); // numeric literals
		addBlock("brackets",       /(&lt;|\/|&gt;)/g, "color: blue");
	}
	
	// return the wrapped Syntax object
	return s;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: XAMLSyntax()
// Author	: Hector J. Rivas
// Created	: Mon Mar  2 11:55:47 CST 2015
// Updated	: Mon Mar  2 11:55:47 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function XAMLSyntax(styleSheet)
{
	// instance a base class object
	var s = new Syntax("XAML", styleSheet, "display: inline-block; font-size: 1em; font-family: Consolas, 'Courier New', Courier, mono; background-color: #FFFFFF; margin: 0px; padding: 4px; border-radius: 0em 0 1em 0em;");

	with (s)
	{
		// append known blocks; notice that order affects block nesting
		addBlock("strings1", /"(\\.|[^\\"])*"/g,       "color: blue"); // double quoted string literals
		addBlock("strings2", /'(?:.{0,1}|\\{1,2}.)'/g, "color: blue"); // single quoted character literals
		addBlock("comments", /&lt;!--[\S\s]*?--&gt;/g,        "color: green"); // multiline or inline (/**/)

		// there are a lot of XAML tags; we'll highlight every one by construction
		addBlock("tags1",       /&lt;\s*\/?\s*([\w\.]+)\b/g, "color: brown", true);
		addBlock("attributes",  /\s([\w\.:]+)=/g, "color: red", true);
	}
	
	// return the wrapped Syntax object
	return s;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: HTMLSyntax()
// Author	: Hector J. Rivas
// Created	: Thu Jun 04 19:11:23 CDT 2015
// Updated	: Thu Jun 04 19:11:23 CDT 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function HTMLSyntax(styleSheet)
{
	// instance a base class object
	var s = new Syntax("HTML", styleSheet, "display: inline-block; font-size: 1em; font-family: Consolas, 'Courier New', Courier, mono; background-color: #FFFFFF; margin: 0px; padding: 4px; border-radius: 0em 0 1em 0em;");

	with (s)
	{
		// append known blocks; notice that order affects block nesting
		addBlock("strings1", /"(\\.|[^\\"])*"/g,       "color: navy"); // double quoted string literals
		addBlock("strings2", /'(?:.{0,1}|\\{1,2}.)'/g, "color: navy"); // single quoted character literals
		addBlock("comments", /&lt;!--[\S\s]*?--&gt;/g,        "color: green");

		// there are a lot of HTML tags; we'll highlight every one by construction
		addBlock("tags1",       /&lt;\s*\/?\s*([\w\.]+)\b/g, "color: #800080", true);
		addBlock("tags2",       /&lt;\s*\/?\s*([\w\.]+)&gt;/g, "color: #800080", true);
		addBlock("doctype",       /&lt;\s*\/?\s*(!DOCTYPE)\b/g, "color: #800080", true);
		addBlock("attributes",  /\s([\w\.:]+)=/g, "color: red", true);
		addBlock("brackets",       /(&lt;|\/|&gt;)/g, "color: blue");
	}
	
	// return the wrapped Syntax object
	return s;
}