$(function(){
	// Show the menu on click (You can use "mouseover mouseout" here for the hover effect
	$("ul.dropdown li").on("click",function() {
		var is_vis = $('ul:first',this).css('visibility');
		console.log(is_vis);

		// Show the menu
		if (is_vis =="hidden") {
			// Hide all the other menus in case one got left open
			$('.action_menu ul').css('visibility', 'hidden');

			$('ul:first',this).css('visibility', 'visible');
		// Hide the menu
		} else {
			$('ul:first',this).css('visibility', 'hidden');
		}
	});

	$("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");
});
