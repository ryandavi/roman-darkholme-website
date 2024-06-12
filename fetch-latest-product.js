const fetch = require('node-fetch');
const fs = require('fs');

const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const shopifyStore = 'slutforbutt.myshopify.com';

const query = `
{
  products(first: 1, sortKey: CREATED_AT, reverse: true, query: "product_type:your_product_type") {
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
    const product = data.data.products.edges[0].node;
    const productData = {
      title: product.title,
      url: `https://${shopifyStore}/products/${product.handle}`,
      imageUrl: product.images.edges[0].node.src
    };
    fs.writeFileSync('latestProduct.json', JSON.stringify(productData, null, 2));
  })
  .catch(error => {
    console.error('Error fetching latest product:', error);
  });