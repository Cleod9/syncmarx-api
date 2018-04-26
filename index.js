require('isomorphic-fetch');
var express = require('express');
var bodyParser = require('body-parser');
var bluebird = require('bluebird');
var cors = require('cors');
var Dropbox = require('dropbox').Dropbox;

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var PORT = process.env.PORT;
var DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI;


/**
 * Serves the express app
 */
var serve = function () {
  // Create express app
  var app = express();

  app.use(cors());

  // URL encoded parsing support
  app.use(bodyParser.urlencoded());

  // Static file support
  app.use(express.static('public'));

  // Auth post endpoint
  app.get('/auth/dropbox', function (req, res) {
    // Require data param to be passed
    if (!req.query.code) {
      res.status(500).send('Missing field');
      return;
    }

    var dbx = new Dropbox({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
    dbx.getAccessTokenFromCode(DROPBOX_REDIRECT_URI, req.query.code)
      .then(function (token) {
        res.status(200).send('Copy and paste the following token into the syncmarx app/extension:<br/><br/>' + token);
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        console.log(error, CLIENT_ID, CLIENT_SECRET);
      });
    
  });

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.htm');
  });
  
  app.listen(PORT);

  console.log('App started.');
};

serve();
