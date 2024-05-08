var MarqueeManager = {
	resizeTimeout: null,

	// default vars
	defaultDirection: "left",
	defaultSpeed: 2,
	defaultRepeat: true,
	defaultPause: false,

	// element classes
	marqueeClass: 'marquee',
	marqueeContentClass: 'marquee_content',

    // configuration classes
    pauseClass: 'hover-pause',
    repeatClass: 'repeat',

	// attributes
	directionAttribute: 'data-direction',
	speedAttribute: 'data-speed',
	repeatAttribute: 'data-repeat',
	pauseAttribute: 'data-pause',

	pixelsPerSecond: 100,

	prevWindowWidth: window.innerWidth,
	prevWindowHeight: window.innerHeight,

	init: function () {
		checkAllImagesLoaded(`.${this.marqueeClass} img`, () => {
			console.log('marquees loaded');
			this.addClasses();
			this.manageMarqueeContent();

			// Attach the resize event listener to the window
			window.addEventListener('resize', () => {
				// Call resizeMarquee when the window is resized
				this.resizeMarquee();
			});
		});
	},

	// general functions
	toBoolean: function (myValue) {
		return String(myValue).toLowerCase() === 'true';
	},

	debounce: function (func, delay) {
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(func, delay);
	},

	// vars
	isRepeat: function (element) {
		return this.toBoolean(element.getAttribute(this.repeatAttribute) || this.defaultRepeat);
	},

	isPause: function (element) {
		return this.toBoolean(element.getAttribute(this.pauseAttribute) || this.defaultPause);
	},

	isHorizontal: function (element) {
		const direction = element.getAttribute(this.directionAttribute) || this.defaultDirection;
		return this.toBoolean(direction === 'left' || direction === 'right');
	},

	getDirection: function (element) {
		return element.getAttribute(this.directionAttribute) || this.defaultDirection;
	},

	getSpeed: function (element) {
		return parseFloat(element.getAttribute(this.speedAttribute)) || this.defaultSpeed;
	},

	addClasses: function () {
		const elements = document.querySelectorAll(`.${this.marqueeClass}`);
		elements.forEach((element) => {
			// pause
			if (this.isPause(element)) {
				element.classList.add(this.pauseClass);
			}

			// repeat
			if (this.isRepeat(element)) {
				element.classList.add(this.repeatClass);
			}

			// direction
			const direction = this.getDirection(element);
			if (direction) {
				element.classList.add(direction);
			}
		});
	},

	resizeMarquee: function () {
		// Get the current window dimensions
		const currentWindowWidth = window.innerWidth;
		const currentWindowHeight = window.innerHeight;
	
		// Check if the resize is both horizontal and vertical or just horizontal
		const isHorizontalResize = currentWindowWidth !== this.prevWindowWidth;

	
		// Only run the debounced function if the resize is both horizontal and vertical or just horizontal
		if (isHorizontalResize) {
		  // Debounce the execution of resetMarquee and manageMarqueeContent by wrapping them in a function
		  const debounceResize = () => {
			this.resetMarquee();
			this.manageMarqueeContent();
		  };
	
		  // Execute debounceResize after 500 milliseconds (adjust the delay as needed)
		  this.debounce(debounceResize, 500);
		}

		// Update the previous window dimensions
		this.prevWindowWidth = currentWindowWidth;
		this.prevWindowHeight = currentWindowHeight;
	  },

	/*
	repeatContent: function (element, repetitions) {
		const originalContent = element.innerHTML;
		const repeatedContent = originalContent.repeat(repetitions);
		element.innerHTML = repeatedContent;
	},
	*/

    handleSlideElements: function (tempElement) {
        // Get all .slide elements in the temporary element
        const slideElements = tempElement.querySelectorAll('.slide');

        // Add the class .duplicate to each .slide element
        slideElements.forEach(slide => {
            slide.classList.add('duplicate');
        });
    },

	repeatContent: function (element, repetitions) {
		const originalContent = element.innerHTML;
		const repeatedContent = originalContent.repeat(repetitions - 1);

		// Create a temporary element to hold the repeated content
		const tempElement = document.createElement('div');
		tempElement.innerHTML = repeatedContent;

        // Call the function to handle slide elements, which isn't applicable to every project
        this.handleSlideElements(tempElement);

		// Add aria-hidden to the top-level repeated elements
		const topLevelElements = tempElement.children;
		for (let i = 0; i < topLevelElements.length; i++) {
			topLevelElements[i].setAttribute('aria-hidden', 'true');
		}

		// Set the element's innerHTML to the updated content
		element.innerHTML += tempElement.innerHTML;
	},

	calculateRepetitions: function (element) {
		const elementWidth = element.offsetWidth;
		const childElementWidth = element.children[0].offsetWidth;
		return Math.ceil(elementWidth / childElementWidth) + 1;
	},

	calculateAnimationSpeed: function (element) {
		const animationFactor = 10;
		const speed = (this.isRepeat(element) ? this.getSpeed(element) * 2 : this.getSpeed(element)) / animationFactor;
		const width = element.children[0].offsetWidth;
		return (width / this.pixelsPerSecond) * 1000 / speed;
	},

	manageMarqueeContent: function () {
		const elements = document.querySelectorAll(`.${this.marqueeClass}`);
		elements.forEach((element) => {
			this.createMarqueeContentIfNotExist(element);
			const repetitions = this.calculateRepetitions(element);
			const animationDuration =  this.calculateAnimationSpeed(element);

			//set animation duration
			element.querySelector(`.${this.marqueeContentClass}`).style.animationDuration = animationDuration + 'ms';

			// if it's a repeat and horizontal, repeat it
			if (this.isRepeat(element) && this.isHorizontal(element)) {
				this.repeatContent(element, repetitions);
			}
		});
	},

	createMarqueeContentIfNotExist: function (element) {
		if (!element.querySelector(`.${this.marqueeContentClass}`)) {
			const contentWrapper = document.createElement('div');
			contentWrapper.classList.add(this.marqueeContentClass);
			while (element.firstChild) {
				contentWrapper.appendChild(element.firstChild);
			}
			element.appendChild(contentWrapper);
		}
	},

	resetMarquee: function () {
		const elements = document.querySelectorAll(`.${this.marqueeClass}`);
		elements.forEach((element) => {
			const children = element.children;
			for (let i = children.length - 1; i > 0; i--) {
				element.removeChild(children[i]);
			}
		});
	}
};