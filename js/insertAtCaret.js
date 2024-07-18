// Tue Jul 21 15:32:17 CDT 2015
function getCaretPosition(e)
{
	var v = e.value,
		p = 0;
		
	if (typeof document.selection != "undefined")
	{ 
		e.focus();
		
		var r = document.selection.createRange();
		
		r.moveStart('character', -v.length);
		
		p = r.text.length;
	}
	else if (typeof input.selectionStart != "undefined")
		p = e.selectionStart;

	return p;
}

// Tue Jul 21 15:32:28 CDT 2015
function setCaretPosition(e, p)
{
	var v = e.value;
		
	if (typeof document.selection != "undefined")
	{ 
		input.focus();
		
		var r = document.selection.createRange();
		
		r.moveStart('character', -v.length);
		r.moveStart('character', p);
		r.moveEnd  ('character', 0);
		
		r.select();
	}
	else if (typeof input.selectionStart != "undefined")
	{
		e.selectionStart = 
		e.selectionEnd   = p;
		
		e.focus();
	}
}

// Sat Jul 18 17:36:48 CDT 2015
function insertAtCaret(id, t)
{
	var e = document.getElementById(id),
		v = e.value,
		s = e.scrollTop,
		p = getCaretPosition(e);
		
	e.value = v.substring(0, p) + t + v.substring(p);
	
	p = p + t.length;

	setCaretPosition(e, p);
	
	e.scrollTop = s;
}

