const fetch = require('node-fetch');
const fs = require('fs');

const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const shopifyStore = 'slutforbutt.myshopify.com';

const query = `
{
  collectionByHandle(handle: "tickets") {
    products(first: 10) {
      edges {
        node {
          title
          handle
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
        }
      }
    }
  }
}
`;

fetch(`https://${shopifyStore}/admin/api/2021-07/graphql.json`, {
	method: 'POST',
	headers: {
		'Content-Type': 'application/graphql',
		'X-Shopify-Access-Token': accessToken,
	},
	body: JSON.stringify({ query }),
})
	.then(res => res.json())
	.then(data => {

		/*
		const products = data.data.collectionByHandle.products.edges;

		let productData = [];

		products.forEach(one_product => {
			const product = one_product.node;

			// add
			productData.push({
				title: product.title,
				url: `https://${shopifyStore}/products/${product.handle}`,
				imageUrl: product.images.edges[0].node.src
			});

		});

		// productData = data;
		*/

		let productData = data;


		fs.writeFileSync('latestProduct.json', JSON.stringify(productData, null, 2));
	})
	.catch(error => {
		console.error('Error fetching latest product:', error);
	});