const request = require('request');
const express = require("express");

const app = express();



// Example route for processing payments
app.post('/pay', (req, res) => {
  const options = {
    url: 'https://api.flutterwave.com/v3/payments',
    headers: {
      Authorization: 'Bearer FLWSECK_TEST-09ddf6bab7cc913d71d378a188ef4ea9-X',
      'Content-Type': 'application/json'
    },
    body: {
      tx_ref: 'unique-transaction-reference',
      amount: '100',
      currency: 'NGN',
      payment_options: 'card',
      redirect_url: 'http://localhost:3000/success'
    },
    json: true
  };

  request.post(options, (error, response, body) => {
    if (error) {
      console.error(error);
      return res.status(500).json({
        message: 'An error occurred while processing the payment'
      });
    }

    // If the payment was successful, redirect the customer to the payment page
    res.redirect(body.data.link);
  });
});
