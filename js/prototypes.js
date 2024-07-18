//////////////////////////////////////////////////////////////////////////////////////////////
// File		: prototypes.js
// Author	: Hector J. Rivas
// Created	: Wed Sep 19 10:30:26 CDT 2012
// Updated	: Mon Feb 16 16:40:03 CST 2015, added pad number prototype
//            Thu Aug 27 15:13:57 CDT 2015, pad char
// Purpose	: Extend the intrinsic javascript objects.
//////////////////////////////////////////////////////////////////////////////////////////////

// Object prototypes
Object.prototype.properties = function() { var r = new Array(); for (var p in this) if (typeof this[p] !== "function") r.push(p); return r; }

// String prototypes
String.prototype.toArray = function()  { return this.split(''); }
String.prototype.reverse = function()  { return this.toArray().reverse().join(''); }

String.prototype.words = function()  { return this.split(/\s+/); }
String.prototype.compact = function()  { return this.words().join(' '); }

String.prototype.fChar = function()  { return this.charAt(0); }
String.prototype.lChar = function()  { return this.charAt(this.length - 1); }

String.prototype.repeat =
String.prototype.times  = function(l) { var s = '', i = 0; while (i++ < l) { s += this; } return s; }
String.prototype.pad = function(l, c) { return (c || '0').times(l - this.length) + this; }

String.prototype.box = function(s) { var r = s || '|'; return r + this.replace(/\n/g, r + '\n' + r) + r; }

String.prototype.ltrim = function(s, f) { return this.replace(new RegExp('^' + (s || "\\s+"), f || ''), ''); }
String.prototype.rtrim = function(s, f) { return this.replace(new RegExp((s || "\\s+") + '$', f || ''), ''); }
String.prototype.mtrim = function(s)    { return this.ltrim(s, "gm").rtrim(s, "gm"); }
String.prototype.trim  = function(s)    { return this.ltrim(s).rtrim(s); }

String.prototype.lines = function(c) { return this.split(c ? /\r*\n/ : /\r*\n(?!\r*\n)/); }
String.prototype.lineCount = function(c) { return this.lines(c).length; }

String.prototype.indentation = function()  { this.match(/^(\t+)\s*\S/); return RegExp.$1.length; }
String.prototype.unindent    = function()  { return this.ltrim(); }
String.prototype.indent      = function(n) { return '\t'.times(n) + this.unindent(); }

String.prototype.escapeTags   = function() { return this.replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
String.prototype.unescapeTags = function() { return this.replace(/&lt;/g, '<').replace(/&gt;/g, '>'); }

// Array prototypes
Array.prototype.append  = function(o)       { return this[this.push(o) - 1]; }
Array.prototype.clear   = function()        { this.length = 0; }
Array.prototype.compact = function()        { for (var i in this) if (this[i] == null || this[i] == '') this.splice(i, 1); return this; }
Array.prototype.copy    = function(a)       { this.clear(); for (var i in a) this.push(a[i]); }
Array.prototype.indexOf = function(o)       { for (var i in this) if (this[i] === o) return i; return -1; }
Array.prototype.insert  = function(o, i)    { this.splice(i, 0, o); }
Array.prototype.last    = function()        { return this[this.length - 1]; }
Array.prototype.merge   = function(i, c, d) { return this.slice(i, i + c).join(d || ' '); }
Array.prototype.search  = function(r, s)    { for (var i in this.slice(s || 0)) if (this[i].search(r) != -1) return i; return -1; }
Array.prototype.trim    = function(c)       { for (var i in this) this[i] = this[i].trim(c); return this; }

Array.prototype.find = function(p, v)       { for (var i in this) if (this[i][p] === v) return this[i]; return null; }

// Number prototypes

// '2'.pad(2) returns '02'; '15'.pad(2) returns '15'
Number.prototype.pad = function(l, c) { return this.toString().pad(l, c); }

Number.prototype.toBase26 = function()
{
    var n = this, r = "", m;

    do
    {
        m = n % 26;
        r = String.fromCharCode(m + 65) + r;
        n = (n - m - 1) / 26;
    } while (n > 0);
    
    return r;
}

String.prototype.fromBase26 = function()
{
	var s = this, n = 0;
	
	for (var i = 0; i < s.length - 1; i++)
		n += (s.charCodeAt(i) - 64) * (s.length - i - 1) * 26;
	
	n += (s.charCodeAt(i) - 65);

	return n;
}

// Tue Jun 25 18:22:55 CDT 2013

// Zero-Trailing
String.prototype.zt = function(n) { return this + '0'.times(n - this.length); } 

// decimal digits truncation
Number.prototype.truncate = function(n)
{
	return Math.round(this * Math.pow(10, n)) / Math.pow(10, n);
} 

// fractional part of a number
Number.prototype.fractional = function() { return parseFloat(this) - parseInt(this); } 

// format a number with n decimal digits
Number.prototype.format = function(n)
{
	// round the fractional part to n digits, skip the '0.' and zero trail
	var f = this.fractional().truncate(n).toString().substr(2).zt(n);
	
	// integer part + dot + fractional part, skipping the '0.'
	return parseInt(this) + '.' + f;
}