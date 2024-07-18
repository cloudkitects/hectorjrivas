//////////////////////////////////////////////////////////////////////////////////////////////
// File		: utility.js
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 10:24:50 CDT 2012
// Updated	: Wed Sep 19 10:24:50 CDT 2012
// Purpose	: javascript utility functions include
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: printf(f, [item1[, [item2[, ...]]])
// Author	: Hector J. Rivas
// Created	: Thu Dec 22 11:49:48 CST 2011
// Updated	: Wed Jan 25 20:01:28 CST 2012, replaced the eval for a new RegExp (faster).
// 			  Mon Sep 17 22:38:59 CDT 2012, does not collapse 0 or null valued arguments.
// Purpose	: act just like C/C++ printf (format an argument list using placeholders).
// Notes	: 
//////////////////////////////////////////////////////////////////////////////////////////////
function printf(f)
{
	for (var i = 1, r = f; i < arguments.length; i++)
		r = r.replace(new RegExp('\\{' + (i - 1) + '\\}', 'g'), arguments[i]);

	return r;
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: randomHex(n)
// Author	: Hector J. Rivas
// Created	: Wed Oct 3 07:37:44 CDT 2012
// Updated	: Wed Oct 3 07:37:44 CDT 2012
// Purpose	: Return a pseudo-random hexadecimal string of 12 chars max
//////////////////////////////////////////////////////////////////////////////////////////////
function randomHex(n) { return (Number.MAX_VALUE * Math.random()).toString(16).replace('.', '').toUpperCase().substr(0, Math.min(n || 12, 12)); }

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: randomGUID()
// Author	: Hector J. Rivas
// Created	: Wed Oct 3 07:37:59 CDT 2012
// Updated	: Wed Oct 3 07:37:59 CDT 2012
// Updated	: Tue Oct 9 21:53:53 CDT 2012 alphabetic prefix for each section
// Purpose	: return a pseudo-random GUID
//////////////////////////////////////////////////////////////////////////////////////////////
function randomGUID() { return printf("A{0}B{1}C{2}D{3}E{4}", randomHex(7), randomHex(3), randomHex(3), randomHex(3), randomHex(11)); }


//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: randomString(n)
// Author	: Hector J. Rivas
// Created	: Tue Dec 4 14:21:38 CST 2012
// Updated	: Tue Dec 4 14:21:38 CST 2012
// Purpose	: return a random string of length n in the A-Z range.
//////////////////////////////////////////////////////////////////////////////////////////////
function randomString(n) { var r = ''; for (var i = 0; i < n; i++) r += String.fromCharCode(parseInt(Math.random() * 25) + 65); return r; }

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: function rgba(r, g, b, a)
// Author	: Hector J. Rivas
// Created	: Tue Nov 13 07:48:02 CST 2012
// Updated	: Tue Nov 13 07:48:02 CST 2012
// Purpose	: wrap the rgba CSS function
//////////////////////////////////////////////////////////////////////////////////////////////
function rgba(r, g, b, a)
{
	return printf("rgba({0}, {1}, {2}, {3})", r, g, b, a);
}

