//////////////////////////////////////////////////////////////////////////////////////////////
// File		: LZW.js
// Author	: Hector J. Rivas
// Purpose	: compress and decompress strigns using the LZ77 algorithm published in 1977 by
//            Abraham Lempel and Jacob Ziv, or the LZW algorithm--an improved implementation
//            of the LZ78 lossless data compression algorithms published by Abraham Lempel,
//            Jacob Ziv and Terry Welch in 1984. LZ77 is used by PKWARE's® PKZIP™ and is
//            integral to the PNG graphics format, and is also used by ZPL in Zebra's own ZB64
//            encoding, a combination of LZ77 and Base64 encoding for downloading objects
//            to printers.
// Created	: Tue Aug 25 10:26:35 CDT 2015
//////////////////////////////////////////////////////////////////////////////////////////////
window.LZW = (function()
{
	function LZW() {};

	LZW.prototype.compress77 = function(s)
	{
		var a = 53300, b, c, d, e, f, g = -1, h, r = [];
		
		s = new Array(a--).join(' ') + s;
		
		while ((b = s.substr(a, 256)))
		{
			for (c = 2; c <= b.length; ++c)
			{
				d = s.substring(a - 52275, a + c - 1).lastIndexOf(b.substring(0, c));
		
				if (d === -1)
					break;
		
				e = d;
			}
		
			if (c === 2 || c === 3 && f === g)
			{
				f = g;
				h = s.charCodeAt(a++);
				r.push(h >> 8 & 255, h & 255);
			}
			else
			{
				r.push((e >> 8 & 255) | 65280, e & 255, c - 3);
				a += c - 1;
			}
		}
		
		return String.fromCharCode.apply(0, r);
	};
	  
	LZW.prototype.decompress77 = function(s)
	{
		var a = 53300, b = 0, c, d, e, f, g, h, r = new Array(a--).join(' ');
		
		while (b < s.length)
		{
			c = s.charCodeAt(b++);
		
			if (c <= 255)
				r += String.fromCharCode((c << 8) | s.charCodeAt(b++));
			else
			{
				e = ((c & 255) << 8) | s.charCodeAt(b++);
				f = e + s.charCodeAt(b++) + 2;
				h = r.slice(-52275);
				g = h.substring(e, f);
				
				if (g)
				{
					while (h.length < f)
						h += g;
				
					r += h.substring(e, f);
				}
			}
		}
		
		return r.slice(a);
	};

	LZW.prototype.compress = function(s)
	{
		s = (s + "").split("");
	
		var p = s[0], n = 256, d = {}, a = [], c;
		
		for (var i = 1; i < s.length; i++)
		{
			c = s[i];
			
			if (d[p + c] != null)
				p += c;
			else
			{
				a.push(p.length > 1 ? d[p] : p.charCodeAt(0));
				
				d[p + c] = n;
				n++;
				p = c;
			}
		}
		
		a.push(p.length > 1 ? d[p] : p.charCodeAt(0));
		
		for (i = 0; i < a.length; i++)
			a[i] = String.fromCharCode(a[i]);
		
		return a.join("");
	};

	LZW.prototype.decompress = function(s)
	{
		s = (s + "").split("");
	
		var c = s[0], o = c, a = [c], n = 256, d = {}, p;
		
		for (var i = 1; i < s.length; i++)
		{
			var j = s[i].charCodeAt(0);
			
			if (j < 256)
				p = s[i];
			else
				p = d[j] || (o + c);// p = d[j] ? d[j] : (o + c);
			
			a.push(p);
			
			c = p.charAt(0);
			
			d[n] = o + c;
			
			n++;
			
			o = p;
		}
		
		return a.join("");
	};

	return new LZW();
}());
