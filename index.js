/**
 * port:  port server
 * host: host server
 * username: username for authentication
 * password: username's password for authentication
 * events: this parameter determines whether events are emited.
 **/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Load environment variables from .env file
require('dotenv').config();

configAsteriskPort=process.env.CONFIG_ASTERISK_PORT;
configAsteriskHost=process.env.CONFIG_ASTERISK_HOST;
configAsteriskUser=process.env.CONFIG_ASTERISK_USER;
configAsteriskPassword=process.env.CONFIG_ASTERISK_PASSWORD;
configAsteriskReconnect=process.env.CONFIG_ASTERISK_RECONNECT;
configAsteriskContext=process.env.CONFIG_ASTERISK_CONTEXT;
configAsteriskExten=process.env.CONFIG_ASTERISK_EXTEN;
configAsteriskCallerID=process.env.CONFIG_ASTERISK_CALLER_ID;

var client = new require('asterisk-manager')(
  configAsteriskPort,
  configAsteriskHost,
  configAsteriskUser,
  configAsteriskPassword, true); 

// In case of any connectiviy problems we got you coverd.
client.keepConnected();

// Listen for any/all AMI events.
client.on('managerevent', function(event) {
  console.log('AMI event managerevent:', event);  
});

// Listen for specific AMI events. A list of event names can be found at
// https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events
client.on('hangup', function(event) {
  console.log('AMI event hangup:', event); 
});
client.on('confbridgejoin', function(event) {
  console.log('AMI event confbridgejoin:', event);  
});

// Listen for Action responses.
client.on('response', function(event) {
  console.log('AMI event close:', event);  
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route to make a call
app.post('/makeCall', (req, res) => {
  const { phoneNumber } = req.body;

  const originateAction = {
    Action: 'Originate',
    Channel: `PJSIP/${phoneNumber}`,
    Context: configAsteriskContext,
    Exten: configAsteriskExten,
    Priority: 1,
    CallerID: configAsteriskCallerID,
  };

  client.action(originateAction, (err, response) => {
    if (err) {
      console.error('Failed to initiate call:', err);
      res.status(500).send('Failed to initiate call');
      return;
    }

    console.log('Call initiated successfully:', response);
    res.status(200).send('Call initiated successfully');
  });

});

// Add more routes for other management tasks if needed

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});