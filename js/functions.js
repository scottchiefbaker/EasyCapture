// If you capture a bunch of similar files and want to quick categorize them add each "type" to the array
// This will allow you to quick categorize (rename) your files by name
var rename_words = new Array();

$(document).ready(function() {
	//init_tag_select();
	init_tabs();
	init_rename();
	init_filter();
});

function init_tag_select() {
	$(".gallery_header").click(function() {
		init_tag_select();
	});
}

function init_rename() {
	if (rename_words.length > 0) {
		var html = new Array();

		// Build the HTML for the rename keywords
		for (i in rename_words) {
			var word = rename_words[i];
			//html.push("<input type=\"checkbox\" class=\"rename_keyword\" value=\"" + word + "\">" + word + "</input>");
			html.push("<a href=\"#\" class=\"rename_keyword\">" + word + "</a>")
		}

		// Build the HTML and put it in the placeholder slot
		html = "<br /><br /><b>Quick Rename:</b> " + html.join(" ");
		$("#placeholder").after(html); // Put this strings of keywords after the button

		// Add a click option to each keyword
		$(".rename_keyword").click(function() {
			var foo = keyword_click($(this));
		});
	}
}

function init_tag_select() {
	$("a.clickable").click(function(e) {
		e.preventDefault(); // Don't actually propagate the click

		var img = $(this).find("img");
		var wrapper = $(".image_wrapper",$(this));

		// If it's checked, then un-check it
		if (wrapper.hasClass("js_selected")) {
			wrapper.removeClass("js_selected");
		} else {
			var w = img.width();
			var h = img.height();
			wrapper.css("width",w);
			wrapper.css("height",h);

			wrapper.addClass("js_selected");
		}

		console.log(get_selected_files());
	});

	return true;
}

function get_selected_files() {
	var ret = [];
	$(".js_selected").each(function(index,e) {
		var mimg = $("img",e);
		var file = mimg.attr("src");
		file = basename(file);

		ret.push(file);
	});

	return ret;
}

// basename from http://phpjs.org/functions/basename/
function basename(path, suffix) {
	var b = path;
	var lastChar = b.charAt(b.length - 1);

	if (lastChar === '/' || lastChar === '\\') {
		b = b.slice(0, -1);
	}

	b = b.replace(/^.*[\/\\]/g, '');

	if (typeof suffix === 'string' && b.substr(b.length - suffix.length) == suffix) {
		b = b.substr(0, b.length - suffix.length);
	}

	return b;
}

function init_tabs() {
	$(".tab_text").click(function() {
		var name = $(this).data('tab_name');

		// Set all the tabs to non-selected
		$(".tab_text").css('font-weight','normal').css('color','#bebebe').css('cursor','pointer').css('background', '');

		// Set the clicked one to active
		$(this).css('font-weight','bold').css('color','black').css('background', '#fffee8');

		$('.url_wrapper').children().hide()
		$('.' + name).show();
	});

	$(".tab_text").first().click();
}

function keyword_click(item) {
	// Toggle adding/removing the selected class
	$(item).toggleClass('keyword_selected');

	var selected = new Array(); // Reset the array so it's clean
	var orig = $("#old_name").val();

	// Find all the checked elements (with both classes)
	$('.rename_keyword.keyword_selected').each(function() {
		selected.push($(this).text()); // Build an array of the selected 'words'
	});

	// Add a random number at the end
	var num         = sprintf("%05d",parseInt(Math.random() * 99999));
	var my_new_name = selected.join("_") + "_" + num;
	var period      = $('#new_name').val().indexOf(".");
	var ext         = $('#new_name').val().substring(period);

	if (selected.length == 0) {
		my_new_name = orig;
	} else {
		my_new_name += ext;
	}

	$('#new_name').val(my_new_name);
	select_to_period("new_name");
}

function select_to_period(id) {
	var value = $("#" + id).val();

	var period = value.indexOf(".");
	setSelectionRange(document.getElementById(id),0,period);
}

function rename_file(old_file,new_file) {
	document.getElementById('form').style.display = 'block';

	document.getElementById('old_name_text').value = old_file;
	document.getElementById('old_name').value = old_file;
	document.getElementById('new_name').value = old_file;
	document.getElementById('new_name').focus();

	// Unselect all the keywords the first time you show the information
	$(".rename_keyword").removeClass('keyword_selected');

	// Find the period and select everything from the first char up to the period
	var name = document.getElementById('new_name').value;
	var period = name.indexOf(".");
	setSelectionRange(document.getElementById('new_name'),0,period);

	return false;
}

function final_submit() {
	return true;
}

function setSelectionRange(input, selectionStart, selectionEnd) {
	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	} else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function sprintf ( ) {
    // Return a formatted string
    //
    // version: 909.322
    // discuss at: http://phpjs.org/functions/sprintf
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Ricardo F. Santos
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function (str, len, chr, leftJustify) {
        if (!chr) {chr = ' ';}
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;

        if (substring == '%%') {return '%';}

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
                case ' ': positivePrefix = ' '; break;
                case '+': positivePrefix = '+'; break;
                case '-': leftJustify = true; break;
                case "'": customPadChar = flags.charAt(j+1); break;
                case '0': zeroPad = true; break;
                case '#': prefixBaseX = true; break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd':
                number = parseInt(+value, 10);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G':
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);
}

function init_filter() {
	$("#filter").on("keyup",function() {
		delay(function() {
			var fval = $("#filter").val();

			var opts = {
				data    : { action: "gallery_filter", filter: fval },
				url     : "index.php",
				success : function(e) {
					var my_html = e.html;
					$(".gallery_wrapper").html(my_html);
				},
			};

			$.ajax(opts);
		}, 400);
	});
}

// Also could use TypeWatch: https://github.com/dennyferra/TypeWatch
var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();
