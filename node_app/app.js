// This example uses JavaScript language features present in Node.js 6+
'use strict';

const twilio = require('twilio');
const urlencoded = require('body-parser').urlencoded;
const express = require('express');
const app = express();
const env = require('node-env-file');
// const Phaser = require('./phaser.min.js')
// const main = require('./main.js')


env(__dirname + '/.env');

const MODERATOR = process.env.NAOMI_SKYPE;

var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var bodyParser = require('body-parser');

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

var client = new twilio.RestClient(accountSid, authToken);


// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(express.static('.'))

app.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
})

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {

  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  // Start with a <Dial> verb
  twiml.dial(function(dialNode) {
    // If the caller is our MODERATOR, then start the conference when they
    // join and end the conference when they leave
    if(request.body.From == MODERATOR) {
      console.log("moderator called: " + request.body.From);
      dialNode.conference('My conference', {
        startConferenceOnEnter: true,
        endConferenceOnExit: true
      });
    } else {
      // Otherwise have the caller join as a regular participant
      console.log("player called: " + request.body.From);
      dialNode.conference('My conference', {
        startConferenceOnEnter: false
      });
    }
  });

  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
app.listen(3000, function () {
  console.log('listening on port 3000!')
})
