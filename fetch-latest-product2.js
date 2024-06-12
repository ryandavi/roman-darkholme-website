const fetch = require('node-fetch');
const fs = require('fs');

// Use environment variables for sensitive data
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

async function fetchAndWriteProducts() {
  try {
    const response = await fetch(`https://${shopifyStore}/api/2023-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    fs.writeFileSync('latestProduct.json', JSON.stringify(data, null, 2));
    console.log('Product data written to latestProduct.json');
  } catch (error) {
    console.error('Error fetching and writing product data:', error);
  }
}

fetchAndWriteProducts();