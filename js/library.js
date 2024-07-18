if (!library)
   var library = {};

library.js =
{
	clean: function(code)
    {
    	// remove attributes
        code = code.replace(/\s+[^\t\n\f\s\/>\"\'=]+=(['\"]).*?\1/g, "")
        code = code.replace(/\s+[^\t\n\f\s\/>\"\'=]+=[^\s]+?\s/g, "");
	
        // remove whitespace
        code = code.replace(/<\/?\s*(\w+)\s+>/g, "<$1>");
	
        // remove tags
        code = code.replace(/<\/?\w+\/?>/g, "");
        
        return code;
    },
	replaceBlock: function(code, key, className)
    {
    	var matches = code.match(key);
        
        if (!matches)
        	return code;
            
        for (var i = 0, j = matches.length; i < j; i++)
        	code = code.replace(matches[i], '<span class=' + className + '>' + this.clean(matches[i]) + '</span>');
            
        return code;
    },
    prettyfy: function(code)
    {
    	var reserved = /(abstract|boolean|break|byte|case|catch|char|class|const|continue|default|delete|do|double|else|extends|false|final|finally|float|for|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|syncronized|this|throw|throws|transient|true|try|typeof|var|void|while|with)/mg;
      
		var intrinsic = /(ActiveXObject|arguments|Array|ArrayBuffer|Boolean|DataView|Date|Debug|Enumerator|Error|Float32Array|Float64Array|Function|function|Global|Int16Array|Int32Array|Int8Array|JSON|Math|Number|Object|RegExp|String|Uint16Array|Uint32Array|Uint8Array|VBArray|WinRTError)/mg;
		
        var output = code.replace(reserved,  "<span class='key'>$1</span>")
        		   	     .replace(intrinsic, "<span class='key'>$1</span>");
                         
        output = this.replaceBlock(output, /[^<]\/.+\//g, "rex");
        output = this.replaceBlock(output, /".+"/g,       "str");
        
        return output;
	}
};
