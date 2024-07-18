//////////////////////////////////////////////////////////////////////////////////////////////
// File		: DOM.js
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 10:27:40 CDT 2012
// Updated	: Tue Sep 25 11:00:32 CDT 2012
// Purpose	: Cross-browser (IE9, Chrome21m and iPad iOS6.0 Safari tested) DOM access include
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: BrowserInfo
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 10:28:50 CDT 2012
// Updated	: Wed Sep 19 10:28:50 CDT 2012
// Purpose	: Gather browser (user agent) info from the navigator or window object
//////////////////////////////////////////////////////////////////////////////////////////////
var BrowserInfo =
{
	// the list of
	knownBrowsers:
	[
		{ identity: "iCab",                                              },
		{ identity: "Konqueror", keyword: "KDE"                          },
		{ identity: "Camino",                                            },
		{ identity: "Opera",                         version: "Version"  },
		{ identity: "Chrome",                                            },
		{ identity: "Safari",    keyword: "Apple",   version: "Version"  },
		{ identity: "OmniWeb",                       version: "OmniWeb/" },
		{ identity: "Firefox",                                           },
		{ identity: "Netscape",                                          }, // Netscape 6+
		{ identity: "Explorer",  keyword: "MSIE",    version: "MSIE"     },
		{ identity: "Mozilla",   keyword: "Gecko",   version: "rv"       },
		{ identity: "Netscape",  keyword: "Mozilla", version: "Mozilla"  }  // Netscape 4-
	],
	// the list of
	knownOS:
	[
	  "Windows", "iPad", "iPhone", "Mac", "Linux"
	],
	getIdentity: function(property)
	{
		if (property)
		{
			for (var i = 0; i < this.knownBrowsers.length; i++)
			{
				var browser = this.knownBrowsers[i];
				var pattern = new RegExp(printf("\\b{0}\\b", browser.keyword || browser.identity));
				
				if (property.search(pattern) != -1)
				{
					this.version = browser.version || browser.identity;
					return browser.identity;
				}
			}			
		}
		
		return null;
	},
	getVersion: function ()
	{
		var v = this.version;
		var p = navigator.userAgent;
		var i = p.indexOf(v);

		if (i == -1)
		{
			p = navigator.appVersion;
			i = p.indexOf(v);
		}

		if (i == -1)
			return null;

		var j = p.indexOf(';', i + v.length + 1);

		if (j == -1)
			j = p.indexOf(' ', i + v.length + 1);

		return p.substring(i + v.length + 1, j);
	},
	getOS: function()
	{
		// property to inspect
		var property = navigator.userAgent;
		
		if (property)
		{
			for (var i = 0; i < this.knownOS.length; i++)
			{
				if (property.indexOf(this.knownOS[i]) != -1)
					return this.knownOS[i];
			}			
		}
		
		return null;
	},
	init: function ()
	{
		this.id      = this.getIdentity(navigator.vendor)    ||
		               this.getIdentity(window.opera)        ||
		               this.getIdentity(navigator.userAgent) ||
		               "[unknown browser]";
		
		this.version = this.getVersion()  || "[unknown version]";
		this.OS      = this.getOS()       || "[unknown OS]";
	}
};

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: getStyle(e, p)
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 10:26:06 CDT 2012
// Updated	: Wed Sep 19 10:26:06 CDT 2012
// Purpose	: Cross-browser utility that returns the value of the passed-in CSS property p
//            of the passed-in element e.
//////////////////////////////////////////////////////////////////////////////////////////////
function getStyle(e, p)
{
	if (!e || !p || !p.length)
		return null;
		
	if (e.currentStyle)
		return e.currentStyle[p];

	if (document.defaultView && document.defaultView.getComputedStyle)
		return document.defaultView.getComputedStyle(e, "")[p];
		
	return e.style[p];
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: createStyleElement()
// Author	: Hector J. Rivas
// Created	: Tue Oct 23 11:39:46 CDT 2012
// Updated	: Fri Feb 27 10:42:01 CST 2015, return the last one created instead of a new one
// Purpose	: Instance a new STYLE element as a HEAD link element and return it.
//////////////////////////////////////////////////////////////////////////////////////////////
function createStyleElement()
{
	if (document.styleSheets.length == 0)
	{
		var style = document.createElement("link"); 
		
		style.type = "text/css"; 
		style.rel = "stylesheet"; 
		
		document.getElementsByTagName("HEAD")[0].appendChild(style);
	}
	
	return document.styleSheets[document.styleSheets.length - 1];
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: addRule(stylesheet, name, rule)
// Author	: Hector J. Rivas
// Created	: Wed Nov 28 21:12:48 CST 2012
// Updated	: Fri Feb  6 12:02:37 CST 2015, default to the last styleSheet
//          : Tue Jun 16 22:41:48 CDT 2015, when things are really slow, styleSheet.cssRules
//            can be null; added a short-circuiting AND check
// Purpose	: shortcut to adding CSS rules to a stylesheet
//////////////////////////////////////////////////////////////////////////////////////////////
function addRule(styleSheet, name, rule)
{
	if (styleSheet == null)
		styleSheet = document.styleSheets[document.styleSheets.length - 1];

	if (styleSheet != null && name != null && rule != null)
	{
		try
		{
			styleSheet.insertRule(printf("{0} \{ {1} \}", name, rule), styleSheet.cssRules && styleSheet.cssRules.length);
		}
		catch(e)
		{
			console.debug(printf("unable to add CSS rule: {0} { {1} }. {2}", name, rule, e.message));
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: getParent(element, tagName)
// Author	: Hector J. Rivas
// Created	: Tue Dec 4 14:31:36 CST 2012
// Purpose	: recursively find the parent element of element with tagName
// Updated	: Tue Dec  4 14:31:36 CST 2012
//			: Mon Mar  2 17:55:01 CST 2015, include self by default
//////////////////////////////////////////////////////////////////////////////////////////////
function getParent(element, tagName, excludeSelf)
{
	if (!element)
		return null;
		
	if (!excludeSelf && element.tagName == tagName)
		return element;
		
	if (element.parentElement != null && element.parentElement.tagName == tagName)
		return element.parentElement;
		
	return getParent(element.parentElement, tagName);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: getFrameDocument(id)
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 16:47:02 CDT 2012
// Updated	: Wed Sep 19 16:47:02 CDT 2012
// Purpose	:
// Notes	:
//////////////////////////////////////////////////////////////////////////////////////////////
function getFrameDocument(f)
{
	if (typeof f == "string")
		f = document.getElementsByTagName("IFRAME")[f];
	
	return f.contentDocument || f.contentWindow.document;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: resizeCodeFrame
// Author	: Hector J. Rivas
// Created	: Sat Sep 15 21:01:39 CDT 2012
// Updated	: Tue Sep 25 14:20:55 CDT 2012 width too? no.
// Purpose	: resize an iframe's height to show all of the its contents.
// Notes	: Cross-browser compatible.
//////////////////////////////////////////////////////////////////////////////////////////////
function resizeCodeFrame(f)
{
	var d = getFrameDocument(f);
	var b = d.body;
	var p = b.getElementsByTagName("PRE")[0];
	var m = parseInt(getStyle(p, "marginTop")) || 8;

	f.height = b.offsetHeight + 2 * m;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: AddEventHandler(e, h)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Fri Jan 30 17:48:16 CST 2015
// Updated	: Fri Feb  6 15:15:07 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function addEventHandler(e, h, o)
{
	if (o == null)
		o = window;

	try
	{
		// for all major browsers, except IE 8 and earlier
		if (document.addEventListener)
		{
			o.addEventListener(e, h);
		}
		else if (document.attachEvent)
		{
			o.attachEvent(e, h);
		}
	}
	catch(e)
	{
		var t = "window";
		
		if (o != null)
			t = t.tagName;
		
		console.debug(printf("Unable to add handler '{0}' for event '{1}' to '{2}'. {3}", h, e, o));
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: getOffsetPosition
// Author	: Hector J. Rivas
// Purpose	: return the difference in position between the bounding rects of two elements.
// Notes    : if e1 is further down from e0, top will be negative.
// Created	: Tue Feb 10 11:44:48 CST 2015
// Updated	: Tue Feb 10 11:44:48 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function getOffsetPosition(e0, e1)
{
	var r0 = e0.getBoundingClientRect();
	var r1 = e1.getBoundingClientRect();
	
    return { left: parseFloat(r0.left) - parseFloat(r1.left), top: parseFloat(r0.top) - parseFloat(r1.top) };
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: relocate(e, p)
// Author	: Hector J. Rivas
// Purpose	: relocate e to passed-in position p.
// Created	: Tue Feb 10 11:57:07 CST 2015
// Updated	: Tue Feb 10 11:57:07 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function relocate(e, p)
{
	e.style.left = printf("{0}px", p.left);
	e.style.top  = printf("{0}px", p.top);
}
/*
function getOffsetRect(elem)
{
    // (1)
    var box = elem.getBoundingClientRect()
    
    var body = document.body
    var docElem = document.documentElement
    
    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
    
    // (3)
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0
    
    // (4)
    var top  = box.top +  scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft
    
    return { top: Math.round(top), left: Math.round(left) }
}
*/

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: show(e)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Tue Feb 10 12:06:27 CST 2015
// Updated	: Tue Feb 10 12:06:27 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function show(e)
{
	if (e && e.style)
		e.style.visibility = "visible";
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: hide(e)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Tue Feb 10 12:06:27 CST 2015
// Updated	: Tue Feb 10 12:06:27 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function hide(e)
{
	if (e && e.style)
		e.style.visibility = "hidden";
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: display(e)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Tue Feb 10 12:06:27 CST 2015
// Updated	: Tue Feb 10 12:06:27 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function display(e)
{
	if (e && e.style)
		e.style.display = "inline-block";
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: collapse(e)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Tue Feb 10 12:06:27 CST 2015
// Updated	: Tue Feb 10 12:06:27 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function collapse(e)
{
	if (e && e.style)
		e.style.display = "none";
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: toggleClass(e, c)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Tue Feb 10 12:13:32 CST 2015
// Updated	: Tue Feb 10 12:13:32 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function toggleClass(e, c)
{
	if (hasClass(e, c))
		removeClass(e, c);
	else
		addClass(e, c);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: hasClass(e, c)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Thu Feb 12 12:00:59 CST 2015
// Updated	: Thu Feb 12 12:00:59 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function hasClass(e, c)
{
	return e.classList.contains(c);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: addClass(e, c)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Thu Feb 12 12:00:59 CST 2015
// Updated	: Thu Feb 12 12:00:59 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function addClass(e, c)
{
	if (!hasClass(e, c))
		e.classList.add(c);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: removeClass(e, c)
// Author	: Hector J. Rivas
// Purpose	:
// Created	: Thu Feb 12 12:00:59 CST 2015
// Updated	: Thu Feb 12 12:00:59 CST 2015
//////////////////////////////////////////////////////////////////////////////////////////////
function removeClass(e, c)
{
	if (hasClass(e, c))
		e.classList.remove(c);
}

