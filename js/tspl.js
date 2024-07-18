"use strict";

function assert(condition, message)
{
    message = message || "Assertion failed";
    
    if (!condition)
    {
        alert(message);
        throw message;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Function	: printf(f, [item1[, [item2[, ...]]])
// Author	: Hector J. Rivas
// Created	: Thu Dec 22 11:49:48 CST 2011
// Updated	: Wed Jan 25 20:01:28 CST 2012, replaced the eval for a new RegExp (faster).
// 			  Mon Sep 17 22:38:59 CDT 2012, does not collapse 0 or null valued arguments.
// Purpose	: act just like C/C++ printf (format an argument list using placeholders).
//////////////////////////////////////////////////////////////////////////////////////////////
function printf(f)
{
	for (var i = 1, r = f; i < arguments.length; i++)
		r = r.replace(new RegExp('\\{' + (i - 1) + '\\}', 'g'), arguments[i]);

	return r;
}

function toByteArray(s)
{
	var j = s.length,
		a = new Uint8Array(j);
	
	for (var i = 0; i < j; ++i)
		a[i] = s.charCodeAt(i);

	return a;
}

function fromHexToByteArray(s)
{
	var j = s.length / 2,
		a = new Uint8Array(j);
	
	for (var i = 0; i < j; i++)
		a[i] = parseInt("0x" + s.substring(2 * i, 2 * i + 2));
	
	return a;
}

function makeImage()
{
	var img = new Uint8Array(180);

	img[0] = 0x00;
	img[1] = 0x00;
	img[2] = 0x00;
	img[3] = 0x00;
	img[4] = 0x00;
	img[5] = 0x00;
	img[6] = 0x00;
	img[7] = 0x00;
	img[8] = 0x00;
	img[9] = 0x00;
	img[10] = 0x00;
	img[11] = 0x00;
	img[12] = 0x00;
	img[13] = 0x00;
	img[14] = 0x00;
	img[15] = 0x00;
	img[16] = 0x00;
	img[17] = 0x00;
	img[18] = 0x00;
	img[19] = 0x00;
	img[20] = 0x0F;
	img[21] = 0xFF;
	img[22] = 0xFF;
	img[23] = 0xFF;
	img[24] = 0xFF;
	img[25] = 0x0F;
	img[26] = 0xFF;
	img[27] = 0xFF;
	img[28] = 0xFF;
	img[29] = 0xFF;
	img[30] = 0x0F;
	img[31] = 0xFF;
	img[32] = 0xFF;
	img[33] = 0xFF;
	img[34] = 0xFF;
	img[35] = 0x0F;
	img[36] = 0xFF;
	img[37] = 0xFF;
	img[38] = 0xFF;
	img[39] = 0xFF;
	img[40] = 0x0F;
	img[41] = 0x00;
	img[42] = 0x00;
	img[43] = 0x00;
	img[44] = 0x00;
	img[45] = 0x0F;
	img[46] = 0x00;
	img[47] = 0x00;
	img[48] = 0x00;
	img[49] = 0x00;
	img[50] = 0x0F;
	img[51] = 0x00;
	img[52] = 0x00;
	img[53] = 0x00;
	img[54] = 0x00;
	img[55] = 0x0F;
	img[56] = 0x00;
	img[57] = 0x00;
	img[58] = 0x00;
	img[59] = 0x00;
	img[60] = 0x0F;
	img[61] = 0xFF;
	img[62] = 0xFF;
	img[63] = 0xFF;
	img[64] = 0xF0;
	img[65] = 0x0F;
	img[66] = 0xFF;
	img[67] = 0xFF;
	img[68] = 0xFF;
	img[69] = 0xF0;
	img[70] = 0x0F;
	img[71] = 0xFF;
	img[72] = 0xFF;
	img[73] = 0xFF;
	img[74] = 0xF0;
	img[75] = 0x0F;
	img[76] = 0xFF;
	img[77] = 0xFF;
	img[78] = 0xFF;
	img[79] = 0xF0;
	img[80] = 0x0F;
	img[81] = 0x00;
	img[82] = 0x00;
	img[83] = 0x00;
	img[84] = 0x00;
	img[85] = 0x0F;
	img[86] = 0x00;
	img[87] = 0x00;
	img[88] = 0x00;
	img[89] = 0x00;
	img[90] = 0x0F;
	img[91] = 0x00;
	img[92] = 0x00;
	img[93] = 0x00;
	img[94] = 0x00;
	img[95] = 0x0F;
	img[96] = 0x00;
	img[97] = 0x00;
	img[98] = 0x00;
	img[99] = 0x00;
	img[100] = 0x0F;
	img[101] = 0x0F;
	img[102] = 0xFF;
	img[103] = 0xFF;
	img[104] = 0xF0;
	img[105] = 0x0F;
	img[106] = 0x0F;
	img[107] = 0xFF;
	img[108] = 0xFF;
	img[109] = 0xF0;
	img[110] = 0x0F;
	img[111] = 0x0F;
	img[112] = 0xFF;
	img[113] = 0xFF;
	img[114] = 0xF0;
	img[115] = 0x0F;
	img[116] = 0x0F;
	img[117] = 0xFF;
	img[118] = 0xFF;
	img[119] = 0xF0;
	img[120] = 0x0F;
	img[121] = 0x00;
	img[122] = 0x00;
	img[123] = 0x00;
	img[124] = 0x00;
	img[125] = 0x0F;
	img[126] = 0x00;
	img[127] = 0x00;
	img[128] = 0x00;
	img[129] = 0x00;
	img[130] = 0x0F;
	img[131] = 0x00;
	img[132] = 0x00;
	img[133] = 0x00;
	img[134] = 0x00;
	img[135] = 0x0F;
	img[136] = 0x00;
	img[137] = 0x00;
	img[138] = 0x00;
	img[139] = 0x00;
	img[140] = 0x0F;
	img[141] = 0xFF;
	img[142] = 0xFF;
	img[143] = 0xFF;
	img[144] = 0xFF;
	img[145] = 0x0F;
	img[146] = 0xFF;
	img[147] = 0xFF;
	img[148] = 0xFF;
	img[149] = 0xFF;
	img[150] = 0x0F;
	img[151] = 0xFF;
	img[152] = 0xFF;
	img[153] = 0xFF;
	img[154] = 0xFF;
	img[155] = 0x0F;
	img[156] = 0xFF;
	img[157] = 0xFF;
	img[158] = 0xFF;
	img[159] = 0xFF;
	img[160] = 0x00;
	img[161] = 0x00;
	img[162] = 0x00;
	img[163] = 0x00;
	img[164] = 0x00;
	img[165] = 0x00;
	img[166] = 0x00;
	img[167] = 0x00;
	img[168] = 0x00;
	img[169] = 0x00;
	img[170] = 0x00;
	img[171] = 0x00;
	img[172] = 0x00;
	img[173] = 0x00;
	img[174] = 0x00;
	img[175] = 0x00;
	img[176] = 0x00;
	img[177] = 0x00;
	img[178] = 0x00;
	img[179] = 0x00;
	
	return img;
}

window.onload = function()
{
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
	    	name = file.name;
	    
	    reader.readAsText(file);
	    
	    reader.onload = function(e)
	    {
	    	var data = reader.result;
	    	
	    	//var blob = new Blob([ data, makeImage(), toByteArray("\nPRINT 1,1\n") ], {type: "application/octet-stream"});
	    	var blob = new Blob([ data, makeImage(), toByteArray("\nPRINT 1,1\n") ], {type: "text/plain;charset=utf-8"});
	    	
	    	saveAs(blob, name + '.bin');
	    }
	};

	var dropTarget1 = document.getElementById("dropTarget1");

	dropTarget1.ondragover = function(e) { e.preventDefault(); };
	dropTarget1.ondrop = function(e)
	{
		e.preventDefault();

    	if (!e.dataTransfer || !e.dataTransfer.files)
    	{
        	alert("Your browser didn't include any files in the drop event");
        	return;
    	}

	    var reader = new FileReader(),
	    	file = e.dataTransfer.files[0],
	    	name = file.name;
	    
	    reader.readAsBinaryString(file);
	    
	    reader.onload = function(e)
	    {
	    	var data = reader.result;
	    	
	    	// { type: "text/plain;charset=utf-8" }
	    	var blob = new Blob(
			[
				toByteArray(printf("DOWNLOAD \"FONT001\", {0},", data.length)),
				data
				//toByteArray("\nTEXT 10,80,\"FONT001\",0,1,1,\"Text with Downloaded Font!\"\nPRINT 1,1\n")
			],
			{ type: "application/octet-stream" });
	    	
	    	saveAs(blob, "test.font.bin");
	    }
	};

	var convertButton1 = document.getElementById("ConvertButton1");
	var convertButton2 = document.getElementById("ConvertButton2");
	
	var hex = document.getElementById("HexCode");
	var b64 = document.getElementById("Base64Code");

	convertButton1.onclick = function(e)
	{
		b64.value = base64.fromByteArray(fromHexToByteArray(hex.value));
	}

	convertButton2.onclick = function(e)
	{
		var a = base64.toByteArray(b64.value),
			h = "";

		for (var i = 0; i < a.length; i++)
			h += a[i].toString(16).pad(2);

		hex.value = h;
	}
}
