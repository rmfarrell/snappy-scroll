$(document).ready(function() {
	
	//snappiness intantiated. the first required parameter is the container element
	var snappiness = new mbSnappyScroll('#main', {
		
		//Attach a nav to the site. 
		//The order of the anchors in dom corresponds to their slide#
		nav : '#navigator a',
		
		//Speed at which slide animation takes place
		slideSpeed : 800,
		
		//children of the container which the user scroll to
		slides : '.slide',
		
		//Use these to add classes to the container which you can use to help style the content
		//The heightQueries in the array correspond to to the height of the window.
		//You can use media queries as well, but these will work in IE.
		//Leave it out if ya' don't care (and you're a true playa')
		heightQueries : [600,800,1000],
		
		//Callbacks
		onStart : function($slide, index) {
			
			console.log('Moving to slide ' + parseInt(index + 1) + ' / ' + $slide.attr('id'));
			
		},//End of onStart
		onComplete : function($slide, index) {
			
			//Good place to add tracking and whatnot
			console.log('You are now at slide ' + parseInt(index + 1) + ' / ' + $slide.attr('id'));
			
			if (index === 2) {
				
				//You can override the normal scroll/swipe action of snap-scroll with the setDown and setUp functions
				//Use this to scroll through animations on the same slide, for example.
				snappiness.setDown(function() {
					
					if (!$('#example-of-next').length) {
						var nextSlide = $('<p>HAHA PSYCH!<br/><a href="#" id="example-of-next">Go to Next Slide</a></p>');

						$slide.find('.valign').append(nextSlide);
							
						nextSlide.hide().slideDown();
						
						//next is a public function which advances to the next slide.
						nextSlide.click(snappiness.next)
					}
				});
				
			} else {
				
				//resetUpDown() allows you to reattach normal scrolling
				snappiness.resetUpDown();
			}
			
		}//End of onComplete
	});
	
	snappiness.init();
	
	/*
		OTHER PUBLIC FUNCTIONS
		
		snapTo goes to takes either a slide index or slide ID and 
		animates directly to that position
		
			snappiness.snapTo(5)
			snappiness.snapTo('#about')
		
		next/previous goes forward or back a position
		
			snappiness.next();
			snappiness.previous();
	*/
});