//////////////////////////////////////////////////////////////////////////////////////////////
// File		: base64.js
// Author	: Hector J. Rivas
// Purpose	: based on base64-js, which does basic base64 encoding/decoding in pure JS as per
//            Mozilla's recomendation of rewriting the base64 functions to solve "the Unicode
//            problem".
// Created	: Fri Aug 28 11:59:06 CDT 2015
// Comments	: We're assuming modern browsers--the Uint8Array type is available.
//////////////////////////////////////////////////////////////////////////////////////////////
window.base64 = (function()
{
	function base64()
	{
	}

	function encode(n)
	{
		return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(n);
	}

	function encodeTriplet(n)
	{
		return encode(n >> 18 & 0x3F) +
			   encode(n >> 12 & 0x3F) +
			   encode(n >>  6 & 0x3F) +
			   encode(n       & 0x3F);
	}

	function decode(c)
	{
		var N = '0'.charCodeAt(0),
			L = 'a'.charCodeAt(0),
			U = 'A'.charCodeAt(0);

		var n = c.charCodeAt(0);
		
		if (n === '+'.charCodeAt(0) || n === '-'.charCodeAt(0)) return 62;
		if (n === '/'.charCodeAt(0) || n === '_'.charCodeAt(0)) return 63;
		
		if (n < N) return -1;
		
		if (n < N + 10) return n - N + 52;
		if (n < U + 26) return n - U;
		if (n < L + 26) return n - L + 26;
	}

	base64.prototype.fromByteArray = function(a)
	{
		var i,
			l = a.length,
			x = l % 3,
			k = l - x,
			r = "",
			t;
		
		for (i = 0; i < k; i += 3)
		{
			t = (a[i    ] << 16) +
				(a[i + 1] <<  8) +
				 a[i + 2];
			
			r += encodeTriplet(t);
		}
		
		switch (x)
		{
			case 1:
				t = a[l - 1];
				
				r += encode(t >> 2       ) +
					 encode(t << 4 & 0x3F) +
					 "==";

				break;

			case 2:
				t = (a[l - 2] << 8) + a[l - 1];
				
				r += encode(t >> 10       ) +
					 encode(t >>  4 & 0x3F) +
					 encode(t <<  2 & 0x3F) +
					 '=';

				break;
			
			default:
				break;
		}
		
		return r;
	}

	base64.prototype.toByteArray = function(s)
	{
		if (s.length % 4 > 0)
		{
			throw new Error('Invalid string. Length must be a multiple of 4')
		}
		
		var l = s.length,
			p = s.charAt(l - 2) === '=' ? 2 :
				s.charAt(l - 1) === '=' ? 1 : 0,
			a = new Uint8Array(3 * l / 4 - p);
		
		l -= (p > 0) && 4;
		
		for (var i = 0, j = 0, t; i < l; i += 4, j += 3)
		{
			t = (decode(s.charAt(i    )) << 18) |
				(decode(s.charAt(i + 1)) << 12) |
				(decode(s.charAt(i + 2)) <<  6) |
				 decode(s.charAt(i + 3));
				 
			a[j    ] = (t & 0xFF0000) >> 16;
			a[j + 1] = (t & 0x00FF00) >>  8;
			a[j + 2] =  t & 0x0000FF;
		}
		
		if (p === 2)
		{
			t = decode(s.charAt(i    )) << 2 |
				decode(s.charAt(i + 1)) >> 4;
			
			a[j++] = t & 0xFF;
		}
		else if (p === 1)
		{
			t = decode(s.charAt(i    )) << 10 |
				decode(s.charAt(i + 1)) <<  4 |
				decode(s.charAt(i + 2)) >>  2;
			
			a[j++] = t >> 8 & 0xFF;
			a[j++] = t      & 0xFF;
		}
		
		return a;
	}

	return new base64();
}());

