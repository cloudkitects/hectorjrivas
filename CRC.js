//////////////////////////////////////////////////////////////////////////////////////////////
// File		: CRC.js
// Author	: Hector J. Rivas
// Purpose	: Lammert Bies 2008 CRC Library port from ANSI C to JS.
// Created	: Wed Aug 26 10:14:46 CDT 2015
// Updated	: Wed Aug 26 10:14:46 CDT 2015
//////////////////////////////////////////////////////////////////////////////////////////////
window.CRC = (function()
{
	function assert(condition, message) { message = message || "Assertion failed"; if (!condition) { alert(message); throw message; } }

	// a CRC algorithm has a polynomial whose coefficients are determined by a constant,
	// and a table with precalculated values to speed things up.
	function algorithm(p)
	{
		this.poly  = p || 0;
		this.table = new Uint16Array(256);

		// factor in differences between CCITT and the rest
		if (p === 0x1021)
		{
			for (var i = 0, j, k, c; i < 256; i++)
			{
				c = 0;
				j = i << 8;
			
				for (k = 0; k < 8; k++)
				{
					if ((c ^ j) & 0x8000)
						c = c << 1 ^ p;
					else
						c = c << 1;
					
					j = j << 1;
				}
			
				this.table[i] = c;
			}

			this.update = function(r, c)
			{
				return (r << 8 ^ this.table[r >> 8 ^ 0xff & c]) & 0xffff;
			}
		}
		else
		{
			for (var i = 0, j, k, c; i < 256; i++)
			{
				c = 0;
				j = i;
			
				for (k = 0; k < 8; k++)
				{
					if ((c ^ j) & 1)
						c = c >>> 1 ^ p;
					else
						c = c >>> 1;
					
					j = j >>> 1;
				}
			
				this.table[i] = c;
			}

			// exception for sick
			if (p === 0x8005)
			{
				this.update = function(r, c, d)
				{
					if (r & 0x8000)
						r = r << 1 ^ p;
					else
						r = r << 1;
					
					r &= 0xffff;
					r ^= 0xff & c | (0xff & d) << 8;
					
					return r;
				}
			}
			else
			{
				this.update = function(r, c)
				{
					return r >> 8 ^ this.table[(r ^ c & 0xff) & 0xff];
				}
			}
		}
	}
	
	function CRC()
	{
		this.algorithms =
		{
			sixteen:   new algorithm(0xA001),
			ccitt:     new algorithm(0x1021),
			dnp:       new algorithm(0xA6BC),
			kermit:    new algorithm(0x8408),
			sick:      new algorithm(0x8005)
		};
	}

	CRC.prototype.calculate = function(s)
	{
		s = (s + '').split('');
		
		function toHex(n, d) { return n.toString(16).toUpperCase().pad(d || 4) }
        function hilo(n) { return (n & 0xff00) >> 8 | (n & 0x00ff) << 8; }
		
		this.results =
		{
			sixteen      : 0,
			sixteenModBus: 0xffff,
			dnp          : 0,
			sick         : 0,
			CCITT0000    : 0,
			CCITTffff    : 0xffff,
			CCITT1d0f    : 0x1d0f,
			kermit       : 0,
			toString     : function()
			{
				return printf(
					"CRC16              = 0x{0} = {1}  {16}\n" +
					"CRC16 (Modbus)     = 0x{2} = {3}  {17}\n" +
					"CRC16 (Sick)       = 0x{4} = {5}  {18}\n" +
					"CRC-CCITT (0x0000) = 0x{6} = {7}  {19}\n" +
					"CRC-CCITT (0xffff) = 0x{8} = {9}  {20}\n" +
					"CRC-CCITT (0x1d0f) = 0x{10} = {11}  {21}\n" +
					"CRC-CCITT (Kermit) = 0x{12} = {13}  {22}\n" +
					"CRC-DNP            = 0x{14} = {15}  {23}\n",
					toHex(this.sixteen),       this.sixteen,
					toHex(this.sixteenModBus), this.sixteenModBus,
					toHex(this.sick),          this.sick,
					toHex(this.CCITT0000),     this.CCITT0000,
					toHex(this.CCITTffff),     this.CCITTffff,
					toHex(this.CCITT1d0f),     this.CCITT1d0f,
					toHex(this.kermit),        this.kermit,
					toHex(this.dnp),           this.dnp,
					"[0xBB3D = 47933]",
					"[0x4B37 = 19255]",
					"[0x56A6 = 22182]",
					"[0x31C3 = 12739]",
					"[0x29B1 = 10673]",
					"[0xE5CC = 58828]",
					"[0x8921 = 35105]",
					"[0x82EA = 33514]");
			}
		}

		with (this)
		{
			for (var i = 0, c, d = 0; i < s.length; i++)
			{
				c = s[i].charCodeAt(0);
				
				results.sixteen       = algorithms.sixteen.update(results.sixteen,       c);
				results.sixteenModBus = algorithms.sixteen.update(results.sixteenModBus, c);
				results.dnp           = algorithms.dnp.update(results.dnp,               c);
				results.sick          = algorithms.sick.update(results.sick,             c, d);
				results.CCITT0000     = algorithms.ccitt.update(results.CCITT0000,       c);
				results.CCITTffff     = algorithms.ccitt.update(results.CCITTffff,       c);
				results.CCITT1d0f     = algorithms.ccitt.update(results.CCITT1d0f,       c);
				results.kermit        = algorithms.kermit.update(results.kermit,         c);
				
				d = c;
			}
	
	        results.dnp    = hilo(~results.dnp);
	        results.sick   = hilo(results.sick);
	        results.kermit = hilo(results.kermit);
		}
	}

	return new CRC();
}());
