<?php

// Your Shopify store URL
$shopify_url = 'https://slutforbutt.myshopify.com';



// GraphQL query
$query = '
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
';

// Set up cURL
$curl = curl_init();

// Set the Shopify API endpoint URL
curl_setopt($curl, CURLOPT_URL, $shopify_url . '/admin/api/2021-07/graphql.json');

// Set the request method to POST
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");

// Your Shopify access token
$access_token = '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';

// Set the request headers
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    "Content-Type: application/graphql",
    "X-Shopify-Access-Token: " . $access_token
));

// Set the request body to contain the GraphQL query
curl_setopt($curl, CURLOPT_POSTFIELDS, $query);

// Return the response instead of outputting it
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// Execute the cURL request
$response = curl_exec($curl);

// Close cURL session
curl_close($curl);

// Handle the response
if ($response === false) {
    // cURL error occurred
    echo 'Error: ' . curl_error($curl);
} else {
    // Parse the JSON response
    $json_response = json_decode($response, true);
    
    // Check if the response contains any errors
    if (isset($json_response['errors'])) {
        // Handle GraphQL errors
        echo 'GraphQL Errors: ';
        print_r($json_response['errors']);
    } else {
        // Output the data
        echo 'Products: ';
        print_r($json_response['data']['products']);
    }
}
?>