$(function(){
	// Show the menu on click (You can use "mouseover mouseout" here for the hover effect
	$("ul.dropdown li").on("click",function() {
		var is_vis = $('ul:first',this).css('visibility');
		console.log(is_vis);

		if (is_vis =="hidden") {
			$(this).addClass("hover");
			$('ul:first',this).css('visibility', 'visible');
		} else {
			$(this).removeClass("hover");
			$('ul:first',this).css('visibility', 'hidden');
		}
	});

	$("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");
});
