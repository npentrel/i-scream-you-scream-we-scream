// This example uses JavaScript language features present in Node.js 6+
'use strict';

const twilio = require('twilio');
const SpotifyWebApi = require('spotify-web-api-node');
const urlencoded = require('body-parser').urlencoded;
const express = require('express');
const app = express();
const env = require('node-env-file');

var randomUsername = require('./randos');


env(__dirname + '/.env');

const MODERATOR = process.env.TWILIO_PHONE_NUMBER;

var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');
var bodyParser = require('body-parser');

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console

var client = new twilio.RestClient(accountSid, authToken);

var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENT_ID,
  clientSecret :  process.env.SPOTIFY_CLIENT_SECRET
});


// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(express.static('.'))

app.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
})

// Get an artist
spotifyApi.getTrack('20I6sIOMTCkB6w7ryavxtO')
  .then(function(data) {
    var preview_url = data.body['preview_url'];
    
    
    console.log(preview_url);

  }, function(err) {
    console.error(err);
  });



// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {

  // Use the Twilio Node.js SDK to build an XML response
  let twiml = new twilio.TwimlResponse();

  if(request.body.To === "+447927475341") {
    console.log('executed')
    console.log('calling ' + request.body.To)
    twiml.dial({ callerId: process.env.TWILIO_PHONE_NUMBER}, function() {
      // wrap the phone number or client name in the appropriate TwiML verb
      // by checking if the number given has only digits and format symbols
      if (/^[\d\+\-\(\) ]+$/.test(request.body.To)) {
        this.number(request.body.To);
      } else {
        this.client(request.body.To);
      }
    });
  } else {
    // Start with a <Dial> verb
  twiml.dial(function(dialNode) {
    // If the caller is our MODERATOR, then start the conference when they
    // join and end the conference when they leave
    if(request.body.From == "+447927475341") {
      console.log("moderator called: " + request.body.From);
      dialNode.conference('My conference', {
        startConferenceOnEnter: true,
        endConferenceOnExit: true
      });
    } else {
      // Otherwise have the caller join as a regular participant
      console.log("player called: " + request.body.From);
      dialNode.conference('My conference', {
        startConferenceOnEnter: false,
        waitUrl: 'https://p.scdn.co/mp3-preview/335bede49342352cddd53cc83af582e2240303bb?cid=null',
        waitMethod: 'GET'
      });
    }
  });
  }



  // Render the response as XML in reply to the webhook request
  response.type('text/xml');
  response.send(twiml.toString());
});


app.get('/token', function(request, response) {
  var identity = 'WebRTCWebCLient';

  var capability = new twilio.Capability(process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN);
  capability.allowClientOutgoing(process.env.TWILIO_TWIML_APP_SID);
  capability.allowClientIncoming(identity);
  var token = capability.generate();

  // Include identity and token in a JSON response
  response.send({
    identity: identity,
    token: token
  });
});

// Create an HTTP server and listen for requests on port 3000
app.listen(3000, function () {
  console.log('listening on port 3000!')
})
