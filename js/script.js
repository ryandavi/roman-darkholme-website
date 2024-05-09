// SLUT FOR BUTT!
const SlutForButt = {

	minLogoHeight: 150, // Define the minimum height for the logo
	maxLogoHeight: 800, // Define the maximum height for the logo

	fadeInSelector: '.portfolio-piece',
	fadeInClass: 'fadeIn',
	fadeDelay: 100,

	fadeIn() {
		/* FADE IN ELEMENT */
		const elements = document.querySelectorAll(this.fadeInSelector);



		// Create a new Intersection Observer
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry, index) => {

				// Check if the element is intersecting with the viewport
				if (entry.isIntersecting) {
					// Calculate the delay based on the index of the element
					const delay = index * this.fadeDelay; // Adjust the delay duration as desired

					// Add a CSS class with the delay to initiate the fade-in effect
					entry.target.style.transitionDelay = `${delay}ms`;
					entry.target.classList.add(this.fadeInClass);

					// Stop observing the element after it fades in once
					observer.unobserve(entry.target);
				}
			});
		});

		// Start observing each element
		elements.forEach(element => {
			observer.observe(element);
		});
	},

	init() {
		// listener events
		this.addClickListener();
		this.addScrollListener();

		// run things for the first time
		this.handleScrollForHeader();
		this.addSmoothScrollAnchor();

		// logo things

		// run it the first time
		this.initMaxHeight();
		this.setMaxHeight();

		// Add event listener for window resize
		window.addEventListener('resize', (event) => {
			// Call the function again on resize
			this.setMaxHeight();
		});

		// Add event listener for window scroll
		window.addEventListener('scroll', (event) => {
			// Call the function again on scroll
			this.setMaxHeight();
		});

		this.fadeIn();
	},

	// Function to set the max height of the logo based on the height of #logo-area and scroll position

	initMaxHeight() {
		var logoArea = document.getElementById('logo-area');
		logoArea.style.paddingBottom = this.minLogoHeight + 'px';
	},

	setMaxHeight() {

		var logoArea = document.getElementById('logo-area');
		var logoWrapper = document.getElementById('logo-wrapper');
		var logo = document.getElementById('logo');

		var logoAreaHeight = logoArea.clientHeight;
		var scrollY = window.scrollY || window.pageYOffset;

		var availableHeight = logoAreaHeight - scrollY;



		// calculate max height
		var maxHeight = Math.max(this.minLogoHeight, Math.min(this.maxLogoHeight, availableHeight));
		logo.style.height = maxHeight + 'px';

		// calculate top
		let logoHeight = logo.offsetHeight;
		var top = Math.max(0, (availableHeight - logoHeight) / 2);
		logoWrapper.style.top = top + 'px';

	},




	addSmoothScrollAnchor() {
		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener('click', function (e) {
				e.preventDefault();

				document.querySelector(this.getAttribute('href')).scrollIntoView({
					behavior: 'smooth'
				});
			});
		});
	},

	addClickListener() {
		this.addLogoClickListener();
	},

	addLogoClickListener() {
		const scrollToTop = () => {
			if (window.scrollY === 0) {
				return;
			}

			setTimeout(function () {
				window.scrollTo({
					top: 0,
					behavior: 'smooth'
				});
			}, 200);



		};

		const logo = document.getElementById('logo-wrapper');

		// Click Event Listener
		logo.addEventListener('click', (event) => {
			event.preventDefault();
			scrollToTop();
		});

		// Touch Event Listener
		logo.addEventListener('touchstart', (event) => {
			event.preventDefault();
			scrollToTop();
		}, { passive: true });
	},

	addScrollListener() {
		window.addEventListener('scroll', () => {
			this.handleScrollForHeader();
		});
	},

	handleScrollForHeader() {
		const logo = document.getElementById('header');
		if (window.scrollY > 0) {
			logo.classList.add('scrolled');
		} else {
			logo.classList.remove('scrolled');
		}
	}
};


