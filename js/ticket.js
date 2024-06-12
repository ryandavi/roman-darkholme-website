document.addEventListener("DOMContentLoaded", function () {
	const ticketsContainer = document.getElementById('tickets-container');
	const loading = document.getElementById('loading');

	// Define Shopify store URL
	const shopifyUrl = 'https://slutforbutt.myshopify.com';

	// Intersection Observer options
	const options = {
		root: null,
		rootMargin: '0px',
		threshold: 0.1 // Percentage of target element visible in the viewport
	};

	// Intersection Observer callback
	const callback = (entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				// Show loading animation
				loading.style.display = 'block';
				// Load Shopify tickets
				fetchShopifyTickets();
				// Unobserve the trigger element once it's intersecting
				observer.unobserve(entry.target);
			}
		});
	};

	// Create an Intersection Observer instance
	const observer = new IntersectionObserver(callback, options);

	// Observe the trigger element
	observer.observe(ticketsContainer);

	// Function to fetch Shopify tickets
	function fetchShopifyTickets() {
		fetch(`https://hunterclem.com/api/shopify.php`)
			.then(response => response.json())
			.then(data => {
				// Hide loading animation
				loading.style.display = 'none';

				const tickets = data.data.collectionByHandle.products.edges;

				if(tickets.length == 0){
					document.getElementById('no-event').style.display = 'block';
					return;
				}

				tickets.forEach(ticket => {
					const node = ticket.node;
					const title = node.title;
					const handle = node.handle;
					const imageUrl = node.images.edges[0].node.src;

					// Split the title by "|"
					const parts = title.split('|').map(part => part.trim());

					// Assign parts to variables
					const event = parts[0];
					const dateStr = parts[2];
					const venue = parts[3];

					// Extract and format the date
					const dateRegex = /(\d{1,2})-(\d{1,2})-(\d{2})/;
					const dateMatch = dateStr.match(dateRegex);
					let formattedDate = dateStr;
					let dayOfWeek = '';

					if (dateMatch) {
						const month = parseInt(dateMatch[1], 10) - 1; // JavaScript months are 0-based
						const day = parseInt(dateMatch[2], 10);
						const year = 2000 + parseInt(dateMatch[3], 10);

						const date = new Date(year, month, day);

						const options = { month: 'long', day: 'numeric', year: 'numeric' };
						formattedDate = date.toLocaleDateString('en-US', options);

						// Get day of the week
						dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
					}

					const ticketDiv = document.createElement('div');
					ticketDiv.classList.add('ticket');

					const titleElement = document.createElement('h2');
					titleElement.classList.add('title');
					titleElement.textContent = event;

					const dateElement = document.createElement('p');
					dateElement.classList.add('date');
					dateElement.textContent = formattedDate;

					const dayOfWeekElement = document.createElement('p');
					dayOfWeekElement.classList.add('dayOfWeek');
					dayOfWeekElement.textContent = dayOfWeek;

					const venueElement = document.createElement('p');
					venueElement.classList.add('venue');
					venueElement.textContent = venue;

					const productUrl = `${shopifyUrl}/products/${handle}`;

					const imageLinkElement = document.createElement('a');
					imageLinkElement.classList.add('image-wrapper');
					imageLinkElement.href = productUrl;
					imageLinkElement.target = '_blank'; // Opens link in a new window
					
					const imageElement = document.createElement('img');
					imageElement.src = imageUrl;
					imageElement.alt = title;
					
					imageLinkElement.appendChild(imageElement);
					
					const linkElement = document.createElement('a');
					linkElement.href = productUrl;
					linkElement.classList.add('button');
					linkElement.textContent = 'Buy Tickets';
					linkElement.target = '_blank'; // Opens link in a new window


					const dataDiv = document.createElement('div');
					dataDiv.classList.add('data');

					dataDiv.appendChild(dayOfWeekElement);
					dataDiv.appendChild(dateElement);
					dataDiv.appendChild(titleElement);
					dataDiv.appendChild(venueElement);

					ticketDiv.appendChild(dataDiv);

					ticketDiv.appendChild(imageLinkElement);
					ticketDiv.appendChild(linkElement);

					ticketsContainer.appendChild(ticketDiv);
				});
			})
			.catch(error => {
				console.error('Error fetching Shopify tickets:', error);
				// Hide loading animation on error
				loading.style.display = 'none';
			});
	}
});