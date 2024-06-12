
const fetch = require('node-fetch');

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

fetch(`https://${shopifyStore}/admin/api/2021-07/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/graphql',
    'X-Shopify-Access-Token': accessToken,
  },
  body: query,
})
  .then(res => res.json())
  .then(data => {
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
    } else {
      console.log('Products:', data.data.products);
    }
  })
  .catch(error => {
    console.error('Error fetching products:', error);
  });