<?PHP
#error_reporting(E_ALL);

require('ec.class.php');
$ec = new ec_page;

// Load the config options
if (is_readable('config.php')) {
	require('config.php');

	$ec->has_config = 1;
} else {
	$ec->set_defaults();
	$ec->has_config = 0;
}

/////////////////////////////////////////////////////////////////////////////////
// No more user editable settings past this point!!!
/////////////////////////////////////////////////////////////////////////////////

$ec->sanity_check();

$ec->title = "Easy Capture";
$ec->link = "<link rel=\"stylesheet\" type=\"text/css\" media=\"screen\" href=\"css/style.css\" title=\"Default\" />";

// This lets us upgrade JQuery versions without having to update HTML
$glob = glob("js/jquery*min.js");

$ec->script[] = $glob[0]; // Jquery must come first
$ec->script[] = "js/functions.js";

if (isset($_GET['check'])) {
	$html = $ec->check_files();
	$ec->html($html);
	exit;
} elseif (isset($_GET['login'])) {
	$ec->show_admin_login();
} elseif (isset($_POST['username']) && isset($_POST['password'])) {
	$_SESSION['username'] = $_POST['username'];
	$_SESSION['password'] = $_POST['password'];
}

$total_upload_size = 0;
if (isset($_FILES['file']['size'])) {
	$total_upload_size = array_sum($_FILES['file']['size']);
}

// Check to see if a file was uploaded from the local PC
if ($total_upload_size > 0) {
	$url = $ec->process_files();
	if (!$url) {
		//print_r($_FILES);
		$ec->error("No files found to process");
	}
// Check to see if a URL was sent in via POST
} else {
	//print_r($_POST); print_r($_GET);
	if (isset($_POST['url']) && ($url = $_POST['url'])) {
		// If URL is set, and it's NOT an array make it an array
		if (!is_array($url)) {
			$url = array($_POST['url']);
		}
	} else {
		$url = "";
	}
}

$show     = var_set($_GET['show']);
$action   = var_set($_GET['action']);
$filename = var_set($_GET['filename']);
$PHP_SELF = var_set($_SERVER['PHP_SELF']);

// Check to see if they're removing/adding the info tag
if ($action == "add_tag") {
	$ec->add_tag($filename);
	header("Location: $PHP_SELF?show=$filename");
} elseif ($action == "remove_tag") {
	$ec->remove_tag($filename);
	header("Location: $PHP_SELF?show=$filename");
} elseif ($action == "resample") {
	$ec->resample($ec->full_dir . "/" .$filename,85);
	#$show = $filename;
	$show = "gallery";
} elseif ($action == "resize") {
	$ec->resize($ec->full_dir . "/" .$filename);
	$show = "gallery";
} elseif ($action) {
	$ec->error("Unknown action '$action'");
}

// Show the gallery
if ($show == "gallery") {
	$ec->html($ec->show_gallery());
// Show only one image
} elseif ($show && $ec->get_file_info($show)) {
	$body = $ec->show_image($show);
	$ec->html($body);
	exit;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// If there is no $url show the default options
////////////////////////////////////////////////////////////////////////////////////////////////////

$img_info = [];
if ($url) {

	// This code checks for tar.gz and extracts them, and adds the files to the process queue
	$files = array();
	foreach ($url as $url_item) {
		if (preg_match("/.tar.(gz|bz2)$/",$url_item)) {
			$files_from_tar = $ec->get_tar_list($url_item,1);

			foreach ($ec->extract_tar_file($url_item,"/tmp/",$files_from_tar) as $url_item) {
				//print "$url_item<br />\n";
				$files[$url_item] = 1;
			}
		} else {
			$files[$url_item] = 1;
		}
	}

	foreach (array_keys($files) as $url_item) {
		$img_info[] = $ec->capture_image($url_item);
	}
}

if (!$img_info) {
	$output = "";

	if (!$ec->has_config) {
		$output .= "<div class=\"config_warning\" style=\"margin-top: 1em;\"><b>Warning:</b> config.php not found, using defaults instead.</div>\n\n";
	}

	$PHP_SELF  = $_SERVER['PHP_SELF'];
	$output   .= "<h2>Easy Capture $ec->version</h2>";

	if (isset($_SERVER["HTTPS"])) { $http = "https://"; }
	else { $http = "http://"; }

	$js_location = $http . $_SERVER['SERVER_NAME'] . dirname($_SERVER['SCRIPT_NAME']) . "/images.js.php";

	$output .= "<div style=\"margin-bottom: 15px; \"><a href=\"javascript:void(z=document.body.appendChild(document.createElement('script')));void(z.language='javascript');void(z.type='text/javascript');void(z.src='$js_location');\">EasyCapture</a> (Bookmarklet)</div>\n";

	$output .= "<div style=\"margin-bottom: 15px; \"><a href=\"$PHP_SELF?show=gallery\">Image Gallery</a></div>\n";

	$max_upload = ini_get("upload_max_filesize");

	$output .= "<form method=\"post\" action=\"$PHP_SELF\" enctype=\"multipart/form-data\">
	<!--
	<input type=\"text\" name=\"url\" size=\"40\" value=\"URL ME!\" id=\"foo\" onclick=\"javascript: document.getElementById('foo').value = '';\" />

	<br />
	<br />
	-->";

	$show_count = 1;
	$urlt = ''; // initalize urlt;
	for ($i = 0; $i < $show_count; $i++) {
		$filet  = "<input class=\"file_input\" type=\"file\" multiple=\"true\" name=\"file[]\" id=\"file-$i\" size=\"40\" />\n";

		$urlt  .= "\t<input class=\"url_input\" type=\"text\" name=\"url[]\" size=\"40\" />\n";
	}

	//$filet .= "<input type=\"file\" multiple=\"true\" id=\"file_temp\" name=\"file_temp\" size=\"40\" /><br />\n";

	if (($ec->auth_capture && $ec->valid_admin_login()) || !$ec->auth_capture) {
		$output .= "

	<br />

	<div class=\"tab_text\" data-tab_name=\"url_input\">URL Capture:</div>
	<div class=\"tab_text\" data-tab_name=\"file_input\">Local File:</div>

	<div class=\"url_wrapper\">
	$urlt
	$filet
	</div>

	<div class=\"max_file_size\">Max File Size: $max_upload</div>

	<br />

	<input type=\"submit\" value=\"Upload!\" />\n";
	} else {
		$PHP_SELF = $_SERVER['PHP_SELF'];
		$output .= "Please <a href=\"$PHP_SELF?login=1\">login</a> to upload files";
	}
	$output .= "</form>\n";

	$ec->html($output);
	exit;
// This is run after an image is captured
} else {
	//print_r($img_info);

	$html = "<h2 style=\"text-align: center;\"><a href=\"$PHP_SELF?show=gallery\">Show all gallery images</a></h2>\n\n";
	foreach ($img_info as $info) {
		if (!$info) { continue; }

		$filename = basename($info['filename']);
		//print "Showing: $filename<br />\n";
		$html .= $ec->show_image($filename,0);
	}
	$ec->html($html);

	exit;
}
