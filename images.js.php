<?PHP
	header('Content-type: application/x-javascript');

	if ($_SERVER["HTTPS"]) { $http = "https://"; }
	else { $http = "http://"; }

	$post_location = $http . $_SERVER['SERVER_NAME'] . dirname($_SERVER['REQUEST_URI']) . "/";

	print "var url = \"$post_location\"\n";
?>


var body = document.getElementsByTagName('body')[0];
var old_panel = document.getElementById('panel');

if (old_panel) { 
	body.removeChild(old_panel);
}

var urls   = {}
var image_count = document.getElementsByTagName('img').length;
for(var n=0 ; n < image_count ; n++) {
	var my_url = document.images[n].src;
	urls[my_url]++;
};

var images = new Array();
images = Object.keys(urls);

if (images.length > 0) {
	var header = document.createElement('h2');

	header.innerHTML = "Images Found:";
	header.style.color = "black";
	header.style.textAlign = 'center';

	var panel  = document.createElement('div');
	panel.style.width = '98%';
	panel.style.height = '97%';
	panel.style.backgroundColor= 'white';
	panel.style.position = 'absolute';
	panel.style.top= '1%';
	panel.style.left= '.5%';
	panel.style.border = '2px solid black';
	panel.style.borderRadius= '5px';
	panel.style.padding = '5px';
	panel.id = 'panel';

	var image_str = '';
	for (i in images) {
		var my_src = images[i];
		image_str += "<img src=\"" + my_src + "\" /> ";
	}
	
	panel.appendChild(header);
	panel.innerHTML = panel.innerHTML + image_str;

	var form = document.createElement('form');
	form.name = 'f';
	form.action = url;
	form.method = 'post';
	form.id = 'my_form';

	var input = document.createElement('input');
	input.type = 'hidden';
	input.name = 'url';
	input.id = 'my_url';

	// Put the input element in the form
	form.appendChild(input);
	// Put the form at the end of the panel
	panel.appendChild(form);

	// Put the panel at the end of body
	body.appendChild(panel);

	// Scroll to the top of the page (where the panel is)
	window.scroll(0,0);

	// Add the click handler to each img
	add_click();
} else {
	alert('There are no images to host on this page.');
};

function add_click() {
	var imgs = document.querySelectorAll('img');
	var count = imgs.length;
	var i = 0;
	
	for (i = 0; i < count ; i++) {
		var myobj = imgs[i];
		var form  = document.getElementById('my_form');
		var url   = document.getElementById('my_url');

		myobj.addEventListener('click',function() { 
			var src = this.src;

			url.value = src;	
			form.submit();
		});
	}
}
