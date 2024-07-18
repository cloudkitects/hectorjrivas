"use strict";

/** @param {string=} message */
function assert(condition, message) {
    message = message || "Assertion failed";
    if (!condition) {
        alert(message);
        throw message;
    }
}

/** @constructor */
function BinaryReader(arrayBuffer)
{
    assert(arrayBuffer instanceof ArrayBuffer, "BinaryReader constructor expects an ArrayBuffer.");
    this.pos = 0;
    this.data = new Uint8Array(arrayBuffer);
}

BinaryReader.prototype = {
    seek: function(pos) {
        assert(pos >=0 && pos <= this.data.length, "BinaryReader seek: requested position out of bounds.");
        var oldPos = this.pos;
        this.pos = pos;
        return oldPos;
    },

    tell: function() {
        return this.pos;
    },

    getUint8: function() {
        assert(this.pos < this.data.length, "BinaryReader getUint8: requested position out of bounds.");
        return this.data[this.pos++];
    },

    getUint16: function() {
        return ((this.getUint8() << 8) | this.getUint8()) >>> 0;
    },

    getUint32: function() {
       return this.getInt32() >>> 0;
    },

    getInt16: function() {
        var result = this.getUint16();
        if (result & 0x8000) {
            result -= (1 << 16);
        }
        return result;
    }, 

    getInt32: function() {
        return ((this.getUint8() << 24) | 
                (this.getUint8() << 16) |
                (this.getUint8() <<  8) |
                (this.getUint8()      ));
    }, 

    getFword: function() {
        return this.getInt16();
    },

    get2Dot14: function() {
        return this.getInt16() / (1 << 14);
    },

    getFixed: function() {
        return this.getInt32() / (1 << 16);
    },

    getString: function(length) {
        var result = "";
        for(var i = 0; i < length; i++) {
            result += String.fromCharCode(this.getUint8());
        }
        return result;
    },

    getDate: function() {
        var macTime = this.getUint32() * 0x100000000 + this.getUint32();
        var utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);
        return new Date(utcTime);
    }
};

/** @constructor */
function TrueTypeFont(arrayBuffer)
{
    this.file = new BinaryReader(arrayBuffer);
    this.tables = this.readOffsetTables(this.file);
    this.readHeadTable(this.file);
    this.length = this.glyphCount();
}

TrueTypeFont.prototype = {
    readOffsetTables: function(file) {
        var tables = {};
        this.scalarType = file.getUint32();
        var numTables = file.getUint16();
        this.searchRange = file.getUint16();
        this.entrySelector = file.getUint16();
        this.rangeShift = file.getUint16();

        for( var i = 0 ; i < numTables; i++ ) {
            var tag = file.getString(4);
            tables[tag] = {
                checksum: file.getUint32(),
                offset: file.getUint32(),
                length: file.getUint32()
            };

            if (tag !== 'head') {
                assert(this.calculateTableChecksum(file, tables[tag].offset, tables[tag].length) === tables[tag].checksum, "BinaryReader readOffsetTables: table checksum mismatch.");
            }
        }

        return tables;
    },

    calculateTableChecksum: function(file, offset, length)
    {
        var old = file.seek(offset);
        var sum = 0;
        var nlongs = ((length + 3) / 4) | 0;
        while( nlongs-- ) {
            sum = (sum + file.getUint32() & 0xffffffff) >>> 0;
        }

        file.seek(old);
        return sum;
    },

    readHeadTable: function(file) {
        assert("head" in this.tables, "BinaryReader readHeadTable: no 'head' table found.");
        file.seek(this.tables["head"].offset);

        this.version = file.getFixed();
        this.fontRevision = file.getFixed();
        this.checksumAdjustment = file.getUint32();
        this.magicNumber = file.getUint32();
        assert(this.magicNumber === 0x5f0f3cf5, "BinaryReader readHeadTable: wrong magic number.");
        this.flags = file.getUint16();
        this.unitsPerEm = file.getUint16();
        this.created = file.getDate();
        this.modified = file.getDate();
        this.xMin = file.getFword();
        this.yMin = file.getFword();
        this.xMax = file.getFword();
        this.yMax = file.getFword();
        this.macStyle = file.getUint16();
        this.lowestRecPPEM = file.getUint16();
        this.fontDirectionHint = file.getInt16();
        this.indexToLocFormat = file.getInt16();
        this.glyphDataFormat = file.getInt16();
    },

    glyphCount: function() {
        assert("maxp" in this.tables, "BinaryReader glyphCount: no 'maxp' table found.");
        var old = this.file.seek(this.tables["maxp"].offset + 4);
        var count = this.file.getUint16();
        this.file.seek(old);
        return count;
    },

    getGlyphOffset: function(index) {
        assert("loca" in this.tables, "BinaryReader getGlyphOffset: no 'loca' table found.");
        var table = this.tables["loca"];
        var file = this.file;
        var offset, old;

        if (this.indexToLocFormat === 1) {
            old = file.seek(table.offset + index * 4);
            offset = file.getUint32();
        } else {
            old = file.seek(table.offset + index * 2);
            offset = file.getUint16() * 2;
        }

        file.seek(old);

        return offset + this.tables["glyf"].offset;
    },

    readGlyphs: function(file) {
        assert("glyf" in this.tables, "BinaryReader readGlyphs: no 'glyf' table found.");
        var glyphTable = this.tables["glyf"];
        
        file.seek(glyphTable.offset);

        var glyphs = [];

        while(file.tell() < glyphTable.offset + glyphTable.length) {
            glyphs.push(this.readGlyph(file));

            while(file.tell() & 1) {
                file.getUint8();
            }
        }

        return glyphs;
    },

    readGlyph: function(index) {
        var offset = this.getGlyphOffset(index);
        var file = this.file;

        if (offset >= this.tables["glyf"].offset + this.tables["glyf"].length)
        {
            return null;
        }

        assert(offset >= this.tables["glyf"].offset, "BinaryReader readGlyph: offset out of bounds.");
        assert(offset < this.tables["glyf"].offset + this.tables["glyf"].length, "BinaryReader readGlyph: offset out of bounds.");

        file.seek(offset);

        var glyph = {
            numberOfContours: file.getInt16(),
            xMin: file.getFword(),
            yMin: file.getFword(),
            xMax: file.getFword(),
            yMax: file.getFword()
        };

        assert(glyph.numberOfContours >= -1, "BinaryReader readGlyph: no contours found.");

        if (glyph.numberOfContours === -1) {
            this.readCompoundGlyph(file, glyph);
        } else {
            this.readSimpleGlyph(file, glyph);
        }

        return glyph;
    },

    readSimpleGlyph: function(file, glyph) {

        var ON_CURVE        =  1,
            X_IS_BYTE       =  2,
            Y_IS_BYTE       =  4,
            REPEAT          =  8,
            X_DELTA         = 16,
            Y_DELTA         = 32;

        glyph.type = "simple";
        glyph.contourEnds = [];
        var points = glyph.points = [];

        for( var i = 0; i < glyph.numberOfContours; i++ ) {
            glyph.contourEnds.push(file.getUint16());
        }

        // skip over intructions
        file.seek(file.getUint16() + file.tell());

        if (glyph.numberOfContours === 0) {
            return;
        }

        var numPoints = Math.max.apply(null, glyph.contourEnds) + 1;

        var flags = [];

        for( i = 0; i < numPoints; i++ ) {
            var flag = file.getUint8();
            flags.push(flag);
            points.push({
                onCurve: (flag & ON_CURVE) > 0
            });

            if ( flag & REPEAT ) {
                var repeatCount = file.getUint8();
                assert(repeatCount > 0, "BinaryReader readGlyph: no repeat count.");
                i += repeatCount;
                while( repeatCount-- ) {
                    flags.push(flag);
                    points.push({
                        onCurve: (flag & ON_CURVE) > 0
                    });
                }
            }
        }

        function readCoords(name, byteFlag, deltaFlag, min, max) {
            var value = 0;

            for( var i = 0; i < numPoints; i++ ) {
                var flag = flags[i];
                if ( flag & byteFlag ) {
                    if ( flag & deltaFlag ) {
                        value += file.getUint8();
                    } else {
                        value -= file.getUint8();
                    }
                } else if ( ~flag & deltaFlag ) {
                    value += file.getInt16();
                } else {
                    // value is unchanged.
                }

                points[i][name] = value;
            }
        }

        readCoords("x", X_IS_BYTE, X_DELTA, glyph.xMin, glyph.xMax);
        readCoords("y", Y_IS_BYTE, Y_DELTA, glyph.yMin, glyph.yMax);
    },

    readCompoundGlyph: function(file, glyph) {
        var ARG_1_AND_2_ARE_WORDS    = 1,
            ARGS_ARE_XY_VALUES       = 2,
            ROUND_XY_TO_GRID         = 4,
            WE_HAVE_A_SCALE          = 8,
            // RESERVED              = 16
            MORE_COMPONENTS          = 32,
            WE_HAVE_AN_X_AND_Y_SCALE = 64,
            WE_HAVE_A_TWO_BY_TWO     = 128,
            WE_HAVE_INSTRUCTIONS     = 256,
            USE_MY_METRICS           = 512,
            OVERLAP_COMPONENT        = 1024;

        glyph.type = "compound";
        glyph.components = [];

        var flags = MORE_COMPONENTS;
        while( flags & MORE_COMPONENTS ) {
            var arg1, arg2;

            flags = file.getUint16();
            var component = {
                glyphIndex: file.getUint16(),
                matrix: {
                    a: 1, b: 0, c: 0, d: 1, e: 0, f: 0
                }
            };

            if ( flags & ARG_1_AND_2_ARE_WORDS ) {
                arg1 = file.getInt16();
                arg2 = file.getInt16();
            } else {
                arg1 = file.getUint8();
                arg2 = file.getUint8();
            }

            if ( flags & ARGS_ARE_XY_VALUES ) {
                component.matrix.e = arg1;
                component.matrix.f = arg2;
            } else {
                component.destPointIndex = arg1;
                component.srcPointIndex = arg2;
            }

            if ( flags & WE_HAVE_A_SCALE ) {
                component.matrix.a = file.get2Dot14();
                component.matrix.d = component.matrix.a;
            } else if ( flags & WE_HAVE_AN_X_AND_Y_SCALE ) {
                component.matrix.a = file.get2Dot14();
                component.matrix.d = file.get2Dot14();
            } else if ( flags & WE_HAVE_A_TWO_BY_TWO ) {
                component.matrix.a = file.get2Dot14();
                component.matrix.b = file.get2Dot14();
                component.matrix.c = file.get2Dot14();
                component.matrix.d = file.get2Dot14();
            }

            glyph.components.push(component);
        }

        if ( flags & WE_HAVE_INSTRUCTIONS ) {
            file.seek(file.getUint16() + file.tell());
        }
    },

    drawGlyph: function(index, ctx) {

        var glyph = this.readGlyph(index);

        if ( glyph === null || glyph.type !== "simple" ) {
            return false;
        }

        var p = 0,
            c = 0,
            first = 1;

        while (p < glyph.points.length) {
            var point = glyph.points[p];
            if ( first === 1 ) {
                ctx.moveTo(point.x, point.y);
                first = 0;
            } else {
                ctx.lineTo(point.x, point.y);
            }

            if ( p === glyph.contourEnds[c] ) {
                c += 1;
                first = 1;
            }

            p += 1;
        }

        return true;
    }
};


function ShowTTFFile(arrayBuffer)
{
    var font = new TrueTypeFont(arrayBuffer);

    var width = font.xMax - font.xMin;
    var height = font.yMax - font.yMin;
    var scale = 64 / font.unitsPerEm;

    var container = document.getElementById("font-container");

    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }

    for( var i = 0; i < font.length; i++ ) {
        var canvas = document.createElement("canvas");
        canvas.style.border = "1px solid gray";
        canvas.width = width * scale;
        canvas.height = height * scale;
        var ctx = canvas.getContext("2d");
        ctx.scale(scale, -scale);
        ctx.translate(-font.xMin, -font.yMin - height);
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        if (font.drawGlyph(i, ctx)) {
            ctx.fill();
            container.appendChild(canvas);
        }
    }

}

window.onload = function()
{
	//console.log(base64.fromByteArray(toByteArray("Mary had a little lamb... @JKLMNOPZ[\\]^_`ajklmnoz}~")));
	
	var dropTarget = document.getElementById("dropTarget");

	dropTarget.ondragover = function(e) { e.preventDefault(); };
	dropTarget.ondrop = function(e)
	{
		e.preventDefault();

    	if (!e.dataTransfer || !e.dataTransfer.files)
    	{
        	alert("Your browser didn't include any files in the drop event");
        	return;
    	}

	    var reader = new FileReader(),
	    	file = e.dataTransfer.files[0],
	    	name = file.name.substring(0, 4).toUpperCase();
	    
	    reader.readAsArrayBuffer(file);
	    
	    reader.onload = function(e)
	    {
	    	var binReader = new BinaryReader(reader.result),
	    		data = binReader.data,
	    		j = data.length,
	    		hex = "";
	    	
	    	// to hex string
	    	for (var i = 0; i < j; i++)
	    	{
	    		assert(data[i] !== '\\');
	    		
	    		hex += data[i].toString(16).pad(2);
	    	}
	    	
	    	// B64: encoded as base64
	    	var b64 = base64.fromByteArray(data);
	    	

	    	// bytes to string
	    	var str = new Array(j);
	    	
	    	for (i = 0; i < j; i++)
				str[i] = String.fromCharCode(data[i]);
	    	
	    	// Z64: compressed with LZ77...
	    	var zip = zipper.LZ77.compress(str.join(''));
	    	
	    	// ...and encoded as base64
	    	// this one may be wrong...!
	    	var z64 = base64.fromByteArray(toByteArray(zip));
	    	
	    	// but we also need the CRCs
	    	CRC.calculate(b64);
	    	
	    	var crc1 = CRC.results.CCITT0000.toString(16).toUpperCase().pad(4);
	    	
	    	CRC.calculate(z64);
	    	
	    	var crc2 = CRC.results.CCITT0000.toString(16).toUpperCase().pad(4);

	    	var zpl = printf("~DTR:{0}1.FNT,{1},{2}\n" +
			    			 "~DTR:{0}2.FNT,{1},{3}\n" +
			    			 "~DTR:{0}3.FNT,{1},{4}\n",
	    			  		 name,
	    			  		 j,
	    			  		 printf("{0}", hex),
	    			  		 printf(":B64:{0}:{1}", b64, crc1),
	    			  		 printf(":Z64:{0}:{1}", z64, crc2));
	    	
	    	
	    	var t = 2 * j,
	    		b = Math.round(100 * b64.length / t).toString().pad(3, ' '),
	    		z = Math.round(100 * z64.length / t).toString().pad(3, ' ');
	    	
	    	zpl += printf("^XA\n\t^PW609\n\t^LL913\n\t^LH000,250\n" +
	    				  "\t^CWX,R:{0}1.FNT\n" +
	    				  "\t^CWY,R:{0}2.FNT\n" +
	    				  "\t^CWZ,R:{0}3.FNT\n" +
						  "\t^FO000,000^AX,32,32^FDRaw Font X ({1} Bytes {2}%)^FS\n" +
						  "\t^FO000,200^AY,32,32^FDB64 Font Y ({3} Bytes {4}%)^FS\n" +
						  "\t^FO000,400^AZ,32,32^FDZ64 Font Z ({5} Bytes {6}%)^FS\n" +
						  "^XZ\n" +
						  "^XA\n" +
						  "\t^IDR:*.FNT^FS\n" +
						  "^XZ",
						  name,
						  t.pad(6, ' '), 100,
						  b64.length.pad(6, ' '), b,
						  z64.length.pad(6, ' '), z);
	    	
	    	download(name + ".zpl", zpl);
	    	
	    	// font 2 and 3 do not print; wrong encodings or CRCs.

	    	ShowTTFFile(reader.result);
	   	};
	};
}

function toByteArray(s)
{
	var j = s.length,
		a = new Uint8Array(j);
	
	for (var i = 0; i < j; ++i)
		a[i] = s.charCodeAt(i);

	return a;
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}