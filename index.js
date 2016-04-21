var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var pg = require('pg');

var token = "EAAINjmZBbO3IBAPETswkn6IN47EMXRZBJWaLti70FuHLqyCma7edPhBYh8j7UekZC95fgNDtaTzehKUjZCZCZBkwMfYSWfFfL3wgjM5H9majnuZBuSjUbUx2Avf84fTHMcZA79mohADc5PZAK78Vh08QrBZANuvXCY6v4X0Ps2aZBZBAUgZDZD";
var uses = 0;

//connect to Database
pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');

  client
    .query('SELECT table_schema,table_name FROM information_schema.tables;')
    .on('row', function(row) {
      console.log(JSON.stringify(row));
    });
});

//change to RB Tree */
var users = [];

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.send('Hello World!');
});


function sendTextMessage(sender, text) {
  uses++;

  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function topStoryList() {

}
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'yolo__123__justin') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token')
  }
});

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      sendTextMessage(sender,text.substring(0, 200));
    }
  }
  res.sendStatus(200);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.on('uncaughtException', function (err) {
  console.log(err);
})
