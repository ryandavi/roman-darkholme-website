function checkAllImagesLoaded(selector, callback, timeout = 5000) {
    var images = document.querySelectorAll(selector);

    // If there are no images, return true immediately
    if (images.length === 0) {
        callback();
        return true;
    }

    var loadedImagesCount = 0;
    var timeoutReached = false;

    function imageLoaded() {
        loadedImagesCount++;
        if (!timeoutReached && loadedImagesCount === images.length) {
            // All images have loaded, call the callback
            callback();
        }
    }

    function imageError() {
        if (!timeoutReached) {
            timeoutReached = true;
            // Handle error (optional)
            console.error('Error loading image');
            // Call the callback if timeout is reached
            callback();
        }
    }

    // Loop through each image and attach load and error event listeners
    images.forEach(function (image) {
        if (image.complete) {
            // Image is already loaded
            imageLoaded();
        } else {
            // Image is not loaded, attach load event listener
            image.addEventListener('load', imageLoaded);
            // Attach error event listener
            image.addEventListener('error', imageError);
        }
    });

    // Timeout mechanism
    setTimeout(function () {
        if (loadedImagesCount < images.length) {
            timeoutReached = true;
            // Handle timeout (optional)
            console.error('Image loading timeout reached. Loaded '  + loadedImagesCount + ' of ' + images.length + ' in ' + timeout + 'ms');
            // Call the callback if timeout is reached
            callback();
        }
    }, timeout);
};

var MasonryManager = {
	gridSelector: '.masonry',
	itemSelector: '.grid-item:not(.hidden)',
	columnWidthSelector: '.grid-sizer',
	gutterSelector: '.grid-gutter',

	// filter
	filterViewAllID: 'viewAllCheckbox',
	filterID: 'filter',
	filterCheckboxSelector: '#filter .checkbox',
	filterSlidesSelector: '#photos .slide',
	filterTagAttribute: 'data-tag',
	filterSlideTagsAttribute: 'data-tags',


	portfolioID: 'photo',
	headerID: 'header',
	filterTotalID: 'filter_total',

	// fade
	isFadeIn: true,
	fadeInClass: 'fade-in',
	fadeDelay: 100,
	fadeInImageSelector: '',


	init: function () {

		this.fadeInImageSelector = '#'+this.portfolioID+' .slide img';

		this.grid = document.querySelector(this.gridSelector);
		if (this.grid && typeof Masonry !== 'undefined') {

			this.msnry = new Masonry(this.grid, {
				itemSelector: this.itemSelector,
				columnWidth: this.columnWidthSelector,
				gutter: this.gutterSelector,
				stagger: 30
			});

			// once we've loaded, do things related to the images
			checkAllImagesLoaded('#'+this.portfolioID+' img', () => {
				console.log('masonry loaded')
				MasonryManager.msnry.layout();
				if(this.isFadeIn) this.fadeIn();
			});

			// filter
			this.initFilter();
			this.checkFilterURLParameters();
		}

	},

	initFilter: function () {
		const checkboxes = document.querySelectorAll(this.filterCheckboxSelector);

		checkboxes.forEach(checkbox => {
			checkbox.addEventListener('change', this.handleCheckboxChange.bind(this, checkbox));
		});
	},

	handleCheckboxChange: function (checkbox, event) {
		const viewAllCheckbox = document.getElementById(this.filterViewAllID);
		const checkboxes = document.querySelectorAll(this.filterCheckboxSelector);

		if (viewAllCheckbox.checked) {
			// If "View All" is checked, uncheck all other checkboxes
			checkboxes.forEach(otherCheckbox => {
				if (otherCheckbox !== checkbox) {
					otherCheckbox.checked = false;
				}
			});
		} else {
			// If "View All" is not checked, check it if all other checkboxes are unchecked
			const allUnchecked = Array.from(checkboxes).every(otherCheckbox => !otherCheckbox.checked);
			viewAllCheckbox.checked = allUnchecked;
		}

		// Set the data-count attribute of #filter_total
		var filterTotalElement = document.getElementById(this.filterTotalID);
		var checkedCount = this.countCheckedCheckboxes();
		if (filterTotalElement) {
			filterTotalElement.setAttribute('data-count', checkedCount);
		}

		MasonryManager.toggleSlides();

		this.scrollToTopOfPortfolio();


	},


	fadeIn: function(){
		/* FADE IN ELEMENT */
		const elements = document.querySelectorAll(this.fadeInImageSelector);

	

		// Create a new Intersection Observer
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry, index) => {
				
				// Check if the element is intersecting with the viewport
				if (entry.isIntersecting) {
					// Calculate the delay based on the index of the element
					const delay = index * this.fadeDelay; // Adjust the delay duration as desired

					console.log("hi");
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

	
	countCheckedCheckboxes: function () {
		// Assuming you have a reference to the #filter element
		var filterElement = document.getElementById(this.filterID);

		// Get all checkboxes inside #filter that do not have the id #viewAllCheckbox
		var checkboxes = filterElement.querySelectorAll(this.filterCheckboxSelector + ':not(#' + this.filterViewAllID + ')');

		// Count the checked checkboxes
		var checkedCount = 0;
		checkboxes.forEach(function (checkbox) {
			if (checkbox.checked) {
				checkedCount++;
			}
		});

		return checkedCount; // You can return the count if needed
	},

	scrollToTopOfPortfolio: function () {
		// Smooth scroll to the top of the #portfolio element
		const portfolioElement = document.getElementById(this.portfolioID);
		if (!portfolioElement) return; // Exit early if portfolioElement is not found
	
		// Get the scroll-padding-top value from the HTML tag
		var offsetTop = portfolioElement.offsetTop;

		var headerElement = document.getElementById(this.headerID);
		if (headerElement) offsetTop -= headerElement.offsetHeight;

		window.scrollTo({
			top: offsetTop,
			behavior: 'smooth'
		});
		
	},

	checkFilterURLParameters: function () {
		// Get the URL query parameter 'filter'
		const urlParams = new URLSearchParams(window.location.search);
		var filterParam = urlParams.get('filter');

		if (!filterParam) {
			const regexFilter = /filter\/([^\/\\#]+)/;
			const decodedUrl = decodeURI(window.location.href).replace('-', ' ');
			const match = decodedUrl.match(regexFilter);

			filterParam = match ? match[1] : null;
		}


		var count = 0;

		if (filterParam) {
			// Split the comma-separated values
			const filterValues = filterParam.split(',');

			// Loop through checkboxes and check those with matching data-tag
			const checkboxes = document.querySelectorAll(this.filterCheckboxSelector);
			checkboxes.forEach(checkbox => {
				const dataTag = checkbox.getAttribute(this.filterTagAttribute);
				//if (filterValues.includes(dataTag)) {
				if (filterValues.map(value => value.toLowerCase()).includes(dataTag.toLowerCase())) {
					checkbox.checked = true;
					count++;
				}
			});

			// if we changed something
			if (count) {
				const viewAllCheckbox = document.getElementById(this.filterViewAllID);
				viewAllCheckbox.checked = false;

				this.toggleSlides();

			}

		}
	},

	toggleSlides: function () {
		const viewAllCheckbox = document.getElementById(this.filterViewAllID);
		const slides = document.querySelectorAll(this.filterSlidesSelector);
		const selectedTags = Array.from(document.querySelectorAll(this.filterCheckboxSelector + ':checked')).map(checkbox => checkbox.getAttribute(this.filterTagAttribute));

		slides.forEach(slide => {
			const tagsAttribute = slide.getAttribute(this.filterSlideTagsAttribute);
			const tags = tagsAttribute ? tagsAttribute.split(',').map(tag => tag.trim().toLowerCase()) : [];

			if (viewAllCheckbox.checked || selectedTags.length === 0 || selectedTags.some(tag => tags.includes(tag.trim().toLowerCase()))) {
				slide.classList.remove('hidden');
			} else {
				slide.classList.add('hidden');
			}
		});

		if (typeof RyanLightbox !== 'undefined') {
			RyanLightbox.updateSlides();
		}

		// reset layout
		MasonryManager.msnry.layout();
	}
};