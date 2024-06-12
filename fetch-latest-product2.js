const fetch = require('node-fetch');
const fs = require('fs');

const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const shopifyStore = 'slutforbutt.myshopify.com';

const query = `
{
  products(first: 10, sortKey: CREATED_AT, reverse: false, query: "collection:tickets") {
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
`;

fetch(`https://${shopifyStore}/api/2023-04/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': accessToken,
  },
  body: JSON.stringify({ query }),
})
  .then(res => res.json())
  .then(data => {
    if (data && data.data && data.data.products && data.data.products.edges && data.data.products.edges.length > 0) {
      const products = data.data.products.edges.map(edge => {
        if (edge && edge.node) { // Add this null check
          const product = edge.node;
          return {
            title: product.title,
            url: `https://${shopifyStore}/products/${product.handle}`,
            imageUrl: product.images?.edges.length > 0 ? product.images.edges[0].node.src : null
          };
        }
        return null; // Return null for undefined edges
      }).filter(product => product !== null); // Filter out null values

      fs.writeFileSync('latestProducts.json', JSON.stringify(products, null, 2));
    } else {
      console.error('Error: No product data found in the response');
    }
  })
  .catch(error => {
    console.error('Error fetching latest product:', error);
  });