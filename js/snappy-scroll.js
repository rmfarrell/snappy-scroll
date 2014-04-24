/* 
	Snappy Scroll
	MGB Class (RMF)

	Requires:
	jquery.throttle
	jquery.mousewheel
	Modernizr
	
	Optional:
	jquery.touchSwipe for touch devices
*/

function mbSnappyScroll (container, settings) {
	
	var navItems = [],
		that = this,
		currentSlide = null,
		$slides = null,
		windowHeight = 0,
		slidePositions = [],//scroll-to points
		defaults = {
			nav : null, //The nav container
			delay : 0, //Delay the animations
			flatten : false, //Whether this should be 'flattened'. i.e. not snappy; callbacks will still fire
			slideSpeed : 600, //speed at which slides animate
			heightQueries : [], //adds classes to slides based on height of browser
			slides : null, //slides selector
			debug : false, //Show console errors
			initPlace : 0, //first slide to display
			onComplete : function(){}, //callback function after advances
			onStart : function(){}, //callback function when slide advances
			slideThrottle : 180 //Delay after which point, user can advance slide again
		},
		options = $.extend(defaults, settings),
		$container = $(container),
		$nav = (options.nav !== null) ? $(options.nav) : null;
		
	//Set up slides
	$slides = $(options.slides) || $container.children();

	
	function _init () {
		
		//Set slide height to height of window frame
		_setSlideHeight($slides);
		
		//Show only the active slide
		_showActiveSlide($slides.eq(options.initPlace));
		
		$(window).on('resize', function() {
			
			_setSlideHeight($slides);
			
			_advanceSlide(currentSlide, 0, false);
		});
	
		//Reset Slide position
		_advanceSlide(options.initPlace);
		
		//_initialize nav; attach handlers
		_setUpNav();
		
		//Set CSS to Enter full screen mode
		_hideScrollBar(true);
	};
	
	function _isTouchDevice() {
		
		return Modernizr.touch; //should you a test to conditionally load swipe plugin
	}
		
	function _removeClassWithString ($el, str) {
		
		var c = $el.attr("class"),
			classes;
		
		if (typeof c === 'undefined') {
		
			return false;
			
		} else {
			
			//May have to polyfill array.filter. Not supported in IE8
			classes = $el.attr("class").split(" ").filter(function(item) {
			
			    return item.indexOf(str) === -1 ? item : "";
			});
		
			return $el.attr("class", classes.join(" "));
		}
	}
	
	function _addHeightClasses (h, wh) {
		
		var h = h.sort(function(a,b){return a-b}),
			heights = h.unshift(0),
			upplerLimit = 0,
			lowerLimit = 0,
			classTxt = '';
		
		for (var x = 0; x < h.length; x++) {
			
			if (wh >= h[x]) {
				lowerLimit = h[x];
				upplerLimit = h[x + 1];
			}
		}
		
		if (typeof upplerLimit !== 'undefined') {
			
			classTxt = 'slide-height-' + lowerLimit + '-' + upplerLimit;
			
		} else {
			
			classTxt = 'slide-height-over-' + lowerLimit;
		}
		
		//Reset this class
		_removeClassWithString($container, 'slide-height-');
		
		return $container.addClass(classTxt);
	};
	
	function _setUpNav () {
		
		if ($nav !== null) {
			
	        return $nav.click(function (e) {
				
				var i = $nav.index($(this));
				
				e.preventDefault();
				
				if (i === -1) return false;
				
				else {
					
					return setTimeout(function() {
					
						_advanceSlide(i, options.slideSpeed);
					
					}, options.delay);
				}
            });
		}
	};
	
	function _advanceSlide (place, speed, runCallback) {
		
		var $slide = $slides.eq(place)
		
    	_updateNav(place);

    	currentSlide = place; //update public var
		
		_updateContainerClass(place) //add class to the container
		
		if (runCallback !== false) options.onStart.call(this, $slide, place); //invoke onStart callback
		
		_showActiveSlide($slide);
		
		return _scrollToPosition(currentSlide, speed, runCallback);
	};
	
	//Allows public funtion SnapTo to work even if Snappy Scroll hasn't been initialized
	function _flatSnapTo(place, speed) {
		
		var targOffset = $slides.eq(place).offset().top;
		
		return $('body,html')
			.delay(options.delay)
			.animate({'scrollTop' : targOffset}, speed);
	};
	
	function _showActiveSlide ($activeSlide) {
		
		$slides.css('visibilty','hidden')
		
		return $activeSlide.css('visibility', 'visible');
	};
	
	function _updateContainerClass (index) {
		
		var classPrefix = 'at-slide-';
		
		_removeClassWithString($container, classPrefix);
		
		return $container.addClass(classPrefix + index);
	};
	
	function _applyAccelleration($el, yPos, speed) {
		
		var timing = (speed / 1000).toFixed(1) + 's' //Convert speed to CSS-friendly speed
		
		return $el.css({
			'-webkit-transition': '-webkit-transform ' + timing + ' ease-out',
			'-moz-transition': '-moz-transform ' + timing + ' ease-out',
			'-ms-transition': '-ms-transform ' + timing + ' ease-out',
			'transition': 'transform ' + timing + ' ease-out',
			'-webkit-transform': 'translate3d(0,' + yPos + 'px,0)',
			'-moz-transform': 'translate3d(0,' + yPos + 'px,0)',
			'-ms-transform': 'translate3d(0,' + yPos + 'px,0)',
			'transform': 'translate3d(0,' + yPos + 'px,0)'
		});
	};
	
	//Scroll to correct position on Screen (using scrollTo plugin)
	function _scrollToPosition (pos, speed, runCallback) {
		
		var animObj = {'top' : -(slidePositions[pos])};
		
		if (!Modernizr.csstransforms3d) $container.animate(animObj, speed);
		
		else _applyAccelleration($container,  -(slidePositions[pos]), speed);
			
		setTimeout(function() {
			
			var $s = $slides.eq(pos);

			if (runCallback !== false) options.onComplete.call(this, $s, pos);
		},speed);
		
		return;
	};
	
	function _setSlideHeight ($s) {
		
		//console.log('set slide height');
		
		var heights = [],
			windowHeight;
	
		if ($('body').hasClass('touch-device')) {
			windowHeight = $(window).height();
		} else {
			windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
		}

		 //Add classes to container as psuedo-media query
		_addHeightClasses(options.heightQueries, windowHeight);
		
		for (x=0; x < $s.length; x++) {
			
			//height is either the window height or a height defined in a data-height attr
			var h = (typeof $s.eq(x).data('snappy-height') === 'undefined') ? windowHeight : $s.eq(x).data('snappy-height');
			
			$s.eq(x).css('height', h);			
			heights.push(h);
		}
		
		return _trackSlidePositions(heights)	
	};
	
	function _trackSlidePositions(heights) {
		
		var totalHeight = 0,
			p = [0];
		
		for (x=1; x < heights.length; x++) {
			
			totalHeight = totalHeight + heights[x];
			
			p.push(totalHeight);	
		}
		
		return slidePositions = p;
	}
	
	function _hideScrollBar () {
		
		$('html body').css('overflow', 'hidden');
		
		$container.css('position', 'fixed');
	};
	
	//Highlight correct nav item
	function _updateNav ( p ) {
		
		if ($nav === null) return false;
		
		$nav
			.removeClass('active')
			.eq(p)
			.addClass('active');
	};
	
	function _moveSlides ( diff ) {
		
		var delta = currentSlide + diff;
		
		//If the slide is before or after end slides
		if (delta < 0 || delta >= $slides.length) {
			
			return false;
		
		//store slide position reference
		} else if (diff > 0) {
			
	        _moveDown( diff );
	
	    } else {
		
	        _moveUp( diff );
	    }
		
		return _advanceSlide( currentSlide, options.slideSpeed);
	};
	
	function _moveUp (d) {
		
		if ( currentSlide === 0) {
			
			return false;
			
      	} else {
	
			currentSlide = currentSlide + d;
      	}
	};
	
	function _moveDown (d) {
		
		if (currentSlide === navItems.length - 1) {
			
			return false;
			
      	} else {
	
          currentSlide = currentSlide + d;
      	}
	};
	
	function _errorMessage (msg) {
		
		if (options.debug) return console.log(msg);
	};
	
	function _scrollLock(downScroll, upScroll) {
		
		if (_isTouchDevice()) {
			
			return _touchListeners(downScroll, upScroll);
			
		} else {
		
			_keyboardListeners(downScroll, upScroll);
		
			_scrollListeners(downScroll, upScroll);
		}
	};
	
	function _keyboardListeners(downScroll, upScroll) {
		
		return $('body').on('keyup', $.debounce( options.slideThrottle, true, function (e, d, dx, dy) {
			
			var k = e.which;
			
			if (k === 40 || k === 39) return downScroll(); 
			
			else if (k === 38 || k === 37) return upScroll();
	    }));
	};
	
	function _touchListeners(downScroll, upScroll) {
		
		$container.swipe('enable');
		
		$container.swipe({
			
			swipe:function(event, direction, distance, duration, fingerCount) {
				
				if (direction === 'down') {
					
					return upScroll();
					
				} else if (direction === 'up') {
					
					return downScroll();
				}
        	},
		});
	};
	
	function _scrollListeners(downScroll, upScroll) {
		
		return $(container).on('mousewheel', $.debounce( options.slideThrottle, true, function (e, d, dx, dy) {
			
			e.preventDefault();
			
			if (dy < 0) return downScroll();
			
			else if (dy > 0) return upScroll();
    	}));
	};
	
	function _resetListeners() {
		
		$('body').off('keyup');
		
		$(container).off('mousewheel');
		
		$container.swipe('destroy');
	};
	
	return {
		
		isSnappy : false,
		
		//Go to next slide
		next : function() {return _moveSlides(1)},
		
		//Go to previous slide
		previous : function() {return _moveSlides(-1)},
		
		//Advance to next slide. 
		snapTo : function(slide) {
			
			//takes either index of slide element's ID attribute
			if (typeof slide === 'string' && $(slide).length)
			
				slide = $slides.index($(slide));
				
				var that = this;
			
			setTimeout(function() {
			
				if (that.isSnappy) return _advanceSlide(slide, options.slideSpeed);
			
				else return _flatSnapTo(slide, options.slideSpeed);
				
			}, options.delay);
		},
		
		//Placeholders for custom scrollup/down events. 
		//On init these are set with resetUpDown
		down : function() {},
		
		up : function() {},
		
		//Setters for custom up/down scroll events
		setDown :function(func) {
				
			this.down = func;
			
			return this.scrollOverride();
		},
		
		setUp :function(func) {
				
			this.up = func;
			
			return this.scrollOverride();
		},
		
		//Returns the scroll functioning to standard up/down movement of slides
		resetUpDown : function() {
			
			this.up = function() {_moveSlides(-1)};
			
			this.down = function() {_moveSlides(1)};	
			
			return this.scrollOverride();
		},
		
		//Override the scroll up/down functionality of the site
		scrollOverride : function() {
			
			_resetListeners();
			
			return _scrollLock(this.down, this.up);
		},
		
		init : function() {
			
			_init();
			
			this.isSnappy = true;
			
			this.resetUpDown();
		}
	}
}