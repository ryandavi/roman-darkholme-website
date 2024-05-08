var StickerApp = {

	stickers_array: [],

	sticker_containerID: "sticker-book",

	sticker_itemName: ".sticker-wrapper",
	sticker_item_innerName: ".sticker",

	// shake
	doShake: false,
	sticker_shakeDuration: 1200,
	sticker_shakeInterval: 4000,

	// layering
	highestZIndex: 0,
	sticker_overlapIterations: 10,
	sticker_overlapOffset: 0.025, // 0.025

	// sparkle
	sparkle_do: false,
	sparkle_itemName: ".sparkle",
	sparkle_Interval: 2000,

	// reveal
	doReveal: true,
	revealClassName: "visible",
	initialRevealDelayDuration: 300,
	revealDelayDuration: 150,
	loadTimeoutDuration: 1000,
	isAccelerated: true,
	accelerationFactor: .9,




	// starting rotation
	doRotate: false,



	// placement
	doRandomPlacement: false,


	convertToPercent: true,

	// decide if it's a click
	movementThreshold: 5,
	clickDurationThreshold: 125,

	init: function () {
		let container = document.getElementById(this.sticker_containerID);
		if(container){
			this.stickers_array = container.querySelectorAll(this.sticker_itemName);
			this.imagesLoaded = false;
			this.imagesLoadedTimeout = null;
			this.loadImagesWithTimeout();
		}

	},

	loadImagesWithTimeout: function () {
		const images = Array.from(this.stickers_array).map(sticker => sticker.querySelector('img'));
		const imagesToLoad = images.filter(img => img !== null);

		if (imagesToLoad.length === 0) {
			// no images to load
			this.imagesLoaded = true;
			this.executeInitFunctions();
		} else {
			// load images
			const loadedImages = [];
			imagesToLoad.forEach(img => {
				img.addEventListener('load', () => {
					loadedImages.push(img);

					// If all images are loaded, mark images as loaded, clear timeout, and execute initialization functions
					if (loadedImages.length === imagesToLoad.length) {
						this.imagesLoaded = true;
						clearTimeout(this.imagesLoadedTimeout);
						this.executeInitFunctions();
					}
				});
			});

			// timeout
			this.imagesLoadedTimeout = setTimeout(() => {
				// If timeout is reached, mark images as loaded, execute initialization functions, and log a timeout message
				this.imagesLoaded = true;
				this.executeInitFunctions();
				console.log("timeout");
			}, this.loadTimeoutDuration); // Timeout after 5 seconds (adjust as needed)
		}
	},

	executeInitFunctions: function () {
		console.log("all loaded");

		if(this.doRandomPlacement){
			this.setStickerLocations();
		}
		
		this.makeDraggable();

		if(this.doShake){
			this.shakeRandomSticker();
			this.setIntervalShake();
		}

		if(this.doReveal){
			this.revealStickerOneByOne();
		}
		


		if (this.sparkle_do) {
			/***********************************************
			* EXECUTE SPARKLE
			/**********************************************/

			setInterval(function () {
				this.SetSparkle();
			}, sparkle_Interval);

			this.setSparkle();
		}

	},



    // Function to reveal stickers one by one
    revealStickerOneByOne: function () {
        let currentDelay = this.initialRevealDelayDuration;

        for (let i = 0; i < this.stickers_array.length; i++) {
            setTimeout(() => {
                this.stickers_array[i].classList.add(this.revealClassName);
            }, currentDelay);

            if (this.isAccelerated) {
                currentDelay += this.revealDelayDuration * Math.pow(this.accelerationFactor, i);
            } else {
                currentDelay += this.revealDelayDuration;
            }
        }
    },

	isOverlap: function (objOne, objTwo) {
		var offsetOne = objOne.getBoundingClientRect(),
			offsetTwo = objTwo.getBoundingClientRect(),
			topOne = offsetOne.top + (objOne.offsetHeight * (this.sticker_overlapOffset)),
			topTwo = offsetTwo.top + (objTwo.offsetHeight * (this.sticker_overlapOffset)),
			leftOne = offsetOne.left + (objOne.offsetWidth * (this.sticker_overlapOffset)),
			leftTwo = offsetTwo.left + (objTwo.offsetWidth * (this.sticker_overlapOffset)),
			widthOne = objOne.offsetWidth * (1 - (this.sticker_overlapOffset * 2)),
			widthTwo = objTwo.offsetWidth * (1 - (this.sticker_overlapOffset * 2)),
			heightOne = objOne.offsetHeight * (1 - (this.sticker_overlapOffset * 2)),
			heightTwo = objTwo.offsetHeight * (1 - (this.sticker_overlapOffset * 2));
		var leftTop = leftTwo > leftOne && leftTwo < leftOne + widthOne && topTwo > topOne && topTwo < topOne + heightOne,
			rightTop = leftTwo + widthTwo > leftOne && leftTwo + widthTwo < leftOne + widthOne && topTwo > topOne && topTwo < topOne + heightOne,
			leftBottom = leftTwo > leftOne && leftTwo < leftOne + widthOne && topTwo + heightTwo > topOne && topTwo + heightTwo < topOne + heightOne,
			rightBottom = leftTwo + widthTwo > leftOne && leftTwo + widthTwo < leftOne + widthOne && topTwo + heightTwo > topOne && topTwo + heightTwo < topOne + heightOne;
		return leftTop || rightTop || leftBottom || rightBottom;
	},

	getRandomInteger: function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	convertPixelToPercent: function (val, dimension) {
		return (parseInt(val) / (dimension / 100)) + "%";
	},

	setStickerPlacement: function (v, count) {
		var newx = this.getRandomInteger(0, window.innerWidth - v.offsetWidth);
		var newy = this.getRandomInteger(0, window.innerHeight - v.offsetHeight);

		if (newx + v.offsetWidth > window.innerWidth) newx = window.innerWidth - v.offsetWidth;
		if (newx + v.offsetWidth <= 0) newx = 0;
		if (newy + v.offsetHeight > window.innerHeight) newy = window.innerHeight - v.offsetHeight;
		if (newy + v.offsetHeight <= 0) newy = 0;

		v.style.top = this.convertPixelToPercent(newy, window.innerHeight);
		v.style.left = this.convertPixelToPercent(newx, window.innerWidth);

		if (count < this.sticker_overlapIterations) {

			this.stickers_array.forEach(function (item) {

				if (item !== v && StickerApp.isOverlap(v, item)) {
					StickerApp.setStickerPlacement(v, count + 1);
					console.log("reset");
				}
			});
		}
	},

	shakeSticker: function (element) {
		element.classList.add("temp-shake");

		setTimeout(function () {
			element.classList.remove("temp-shake");
		}, this.sticker_shakeDuration);
	},

	shakeRandomSticker: function () {
		var random = this.getRandomInteger(0, this.stickers_array.length - 1);
		this.shakeSticker(this.stickers_array[random]);
	},

	setStickerLocations: function () {
		var self = this; // Store a reference to 'this'
		this.stickers_array.forEach(function (item) {


			
			if(self.doRotate) self.setRandomRotation(item.querySelector(self.sticker_item_innerName));
			item.style.zIndex = self.highestZIndex; // Use 'self' instead of 'this'
			self.highestZIndex++;
			StickerApp.setStickerPlacement(item, 0);
		});
	},

	// Function to generate a random number within a specified range
	getRandomNumber: function(min, max) {
		return Math.random() * (max - min) + min;
	},

	maxRotation: 25,

	// Function to set random rotation to an element
	setRandomRotation: function(element) {
		// Get the existing transform value
		var existingTransform = element.style.transform;
	
		// Extract the existing rotation value if it exists
		var existingRotation = 0;
		var match = existingTransform.match(/rotate\(([-+]?\d+deg)\)/);
		if (match) {
			existingRotation = parseInt(match[1]);
		}
	
		// Generate a random rotation value between -maxRotation and maxRotation
		var additionalRotation = this.getRandomNumber(-this.maxRotation, this.maxRotation);
	
		// Calculate the new rotation including existing rotation
		var totalRotation = existingRotation + additionalRotation;
	
		// Apply the new rotation to the element's style
		element.style.transform = "rotate(" + totalRotation + "deg)";
	},	

	makeDraggable: function () {
		var self = this; // Store a reference to 'this'

		this.stickers_array.forEach(function (item) {

			var clickStartTime; // Variable to store the start time of the click
			var clickEndTime; // Variable to store the end time of the click
			let rafId;


			item.addEventListener("mousedown", startDrag, { passive: false });
			item.addEventListener("touchstart", startDrag, { passive: false });

			// add draggable class
			item.classList.add("draggable");

			// Make it already visible if not doing
			if(self.doReveal == false){
				item.classList.add(self.revealClassName);
			}

			function startDrag(event) {
				//event.preventDefault(); // Prevent default touch behavior

				// add dragging class
				item.classList.add("dragging");

				var isTouch = event.type === "touchstart";
				var offsetX, offsetY;

				clickStartTime = new Date().getTime(); // Record the start time of the click

				// Record initial position
				var initialLeft = parseFloat(item.style.left);
				var initialTop = parseFloat(item.style.top);

				// Get positions and dimensions
				var rect = item.getBoundingClientRect();
				var stickerBookRect = document.getElementById(self.sticker_containerID).getBoundingClientRect();

				// Get scroll positions and client offsets

				var clientTop = document.documentElement.clientTop || 0;
				var clientLeft = document.documentElement.clientLeft || 0;

				// Calculate offsets based on touch or mouse event
				var eventPos = isTouch ? event.touches[0] : event;
				var offsetX  = eventPos.clientX - rect.left + stickerBookRect.left - clientLeft;
				var offsetY = eventPos.clientY - rect.top + stickerBookRect.top - clientTop;

				// z-index stuff
				self.highestZIndex += 1;
				item.style.zIndex = self.highestZIndex;

				function elementDrag(e) {
					if (rafId) return;
					rafId = window.requestAnimationFrame(() => onElementDrag(e));
				}

				function onMove(event) {
					event.preventDefault(); // Prevent default touch behavior

					

					var x, y;

					if (isTouch) {
						var touch = event.touches[0];
						x = touch.clientX - offsetX;
						y = touch.clientY - offsetY;
					} else {
						x = event.clientX - offsetX;
						y = event.clientY - offsetY;
					}

					if (x < 0) x = 0;
					if (y < 0) y = 0;
					if (x + item.offsetWidth > window.innerWidth) x = window.innerWidth - item.offsetWidth;
					if (y + item.offsetHeight > window.innerHeight) y = window.innerHeight - item.offsetHeight - 1;

					item.style.left = x + "px";
					item.style.top = y + "px";

					rafId = null;
				}

				function onEnd() {
					// event.preventDefault();
					event.preventDefault(); // Prevent default touch behavior

					document.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
					document.removeEventListener(isTouch ? "touchend" : "mouseup", onEnd);

					item.classList.remove("dragging");

					clickEndTime = new Date().getTime(); // Record the end time of the click
					var clickDuration = clickEndTime - clickStartTime; // Calculate the duration of the click

					// Log click duration
					console.log("Click duration:", clickDuration);

					// Record final position
					var finalLeft = parseFloat(item.style.left);
					var finalTop = parseFloat(item.style.top);

					// Calculate distance moved
					var distanceX = Math.abs(finalLeft - initialLeft);
					var distanceY = Math.abs(finalTop - initialTop);
					var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)); // Euclidean distance

					// Log distance moved
					console.log("Distance moved:", distance);

					// Check if distance is too low
					if (distance < self.movementThreshold || clickDuration < self.clickDurationThreshold) {
						console.log("Distance moved is too low.");

						var linkElement = event.target.querySelector("a");
						if (linkElement && event.button !== 2) {
							console.log(linkElement);
							// If a link element is found, navigate to it
							window.location.href = linkElement.href;
						}

						// Log message to your log
					} else {
						// Set percentage
						if(self.convertToPercent == true){
							item.style.left = StickerApp.convertPixelToPercent(item.style.left, window.innerWidth);
							item.style.top = StickerApp.convertPixelToPercent(item.style.top, window.innerHeight);
						}
					}
				}

				document.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, { passive: false });
				document.addEventListener(isTouch ? "touchend" : "mouseup", onEnd, { passive: false });
			}
		});
	},

	setSparkle: function (sparkle_itemName) {
		var newx = getRandomInteger(0, window.innerWidth - $(sparkle_itemName).width());
		var newy = getRandomInteger(0, window.innerHeight - $(sparkle_itemName).height());

		// Limit to bounds
		if (newx + $(sparkle_itemName).width() > window.innerWidth) newx = window.innerWidth - $(sparkle_itemName).width();
		if (newx + $(sparkle_itemName).width() <= 0) newx = 0;
		if (newy + $(sparkle_itemName).height() > window.innerHeight) newy = window.innerHeight - $(sparkle_itemName).height();
		if (newy + $(sparkle_itemName).height() <= 0) newy = 0;

		// Pixel to Percentage Conversion
	
		$(sparkle_itemName).css('top', convertPixelToPercent(newy, window.innerHeight));
		$(sparkle_itemName).css('left', convertPixelToPercent(newx, window.innerWidth));

		// Reload Image
		var d = new Date();
		var new_url = "images/particle/sparkle-playonce.png";
		$(sparkle_itemName).find("img").attr("src", new_url + "?" + d.getTime());
	},

	convertPixelToPercent: function (pixelValue, containerWidth) {
		var pixel = parseFloat(pixelValue);
		var percent = (pixel / containerWidth) * 100;
		return percent + "%";
	},

	setIntervalShake: function () {
		setInterval(function () {
			StickerApp.shakeRandomSticker();
		}, this.sticker_shakeInterval);
	}
};

StickerApp.init();
