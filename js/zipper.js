//////////////////////////////////////////////////////////////////////////////////////////////
// File		: zipper.js
// Author	: Hector J. Rivas
// Purpose	: a wrapper for various compression/decompression algorithms
//			  LZ77-Algorithm-Based JavaScript Compressor (http://lab.polygonpla.net/js/tinylz77.html)
// Created	: Tue Aug 25 11:40:23 CDT 2015
//////////////////////////////////////////////////////////////////////////////////////////////
window.zipper = (function()
{
	function zipper()
	{
		this.LZ77 =
		{
			compress: function(s)
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
			},
			decompress: function(s)
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
			}
		};
		this.LZW =
		{
			compress: function(s)
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
			},
			decompress: function(s)
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
			}
		};
	};

	return new zipper();
}());
