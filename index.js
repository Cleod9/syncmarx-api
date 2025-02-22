var fs = require('fs');
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

// Providers
var DropboxAuth = require('dropbox').DropboxAuth;
var google = require('googleapis').google;
var BoxSDK = require('box-node-sdk');

var settings = {
  dropbox: {
    CLIENT_ID: process.env.DROPBOX_CLIENT_ID,
    CLIENT_SECRET: process.env.DROPBOX_CLIENT_SECRET,
    REDIRECT_URI: process.env.DROPBOX_REDIRECT_URI
  },
  googledrive: {
    CLIENT_ID: process.env.GOOGLEDRIVE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLEDRIVE_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLEDRIVE_REDIRECT_URI
  },
  box: {
    CLIENT_ID: process.env.BOX_CLIENT_ID,
    CLIENT_SECRET: process.env.BOX_CLIENT_SECRET,
    REDIRECT_URI: process.env.BOX_REDIRECT_URI
  }
}
var PORT = process.env.PORT;

// Token page Template
const TOKEN_TEMPLATE = fs.readFileSync(__dirname + '/public/token.htm', { encoding: 'utf8' });

/**
 * Serves the express app
 */
var serve = function () {
  // Create express app
  var app = express();

  app.use(cors());

  // URL encoded parsing support
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get('/token.htm', function (req, res) {
    // Disallow direct access to this page
    res.status(404).send('<pre>Cannot GET /token.htm</pre>');
  });

  // Static file support
  app.use(express.static('public'));

  // Auth endpoint for dropbox
  app.get('/auth/dropbox', function (req, res) {
    // Require data param to be passed
    if (!req.query.code) {
      res.status(500).send('Missing field');
      return;
    }

    var dbx = new DropboxAuth({ clientId: settings.dropbox.CLIENT_ID, clientSecret: settings.dropbox.CLIENT_SECRET });
    dbx.getAccessTokenFromCode(settings.dropbox.REDIRECT_URI, req.query.code)
      .then(function (token) {
        var responseText = TOKEN_TEMPLATE.replace(/\{\{TOKEN\}\}/g, token.result.access_token + ':' + token.result.refresh_token);
        res.status(200).send(responseText);
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        //console.error(error);
      });  
  });
  
  // Auth endpoint for dropbox
  app.post('/auth/dropbox/refreshtoken', function (req, res) {
    // Require data param to be passed
    if (!req.query.refresh_token) {
      res.status(500).send('Missing field');
      return;
    }

    var dbx = new DropboxAuth({ clientId: settings.dropbox.CLIENT_ID, clientSecret: settings.dropbox.CLIENT_SECRET, refreshToken: req.query.refresh_token });
    dbx.refreshAccessToken()
      .then(function () {
        res.json({ access_token: dbx.getAccessToken() });
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        //console.error(error);
      });  
  });

  // Auth endpoint for Google Drive
  app.get('/auth/googledrive', function (req, res) {
    // Require data param to be passed
    if (!req.query.code) {
      res.status(500).send('Missing field');
      return;
    }

    var oauth2Client = new google.auth.OAuth2(
      settings.googledrive.CLIENT_ID,
      settings.googledrive.CLIENT_SECRET,
      settings.googledrive.REDIRECT_URI
    );

    oauth2Client.getToken(req.query.code)
      .then(function (response) {
        var responseText = TOKEN_TEMPLATE.replace(/\{\{TOKEN\}\}/g, response.tokens.access_token + ':' + response.tokens.refresh_token);
        res.status(200).send(responseText);
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        //console.error(error);
      });  
  });

  // Handles refreshing the Google API token
  app.post('/auth/googledrive/refreshtoken', function (req, res) {
    // Require data param to be passed
    if (!req.query.refresh_token) {
      res.status(500).send('Missing field');
      return;
    }

    var oauth2Client = new google.auth.OAuth2(
      settings.googledrive.CLIENT_ID,
      settings.googledrive.CLIENT_SECRET,
      settings.googledrive.REDIRECT_URI
    );
    oauth2Client.setCredentials({
      refresh_token: req.query.refresh_token
    });

    oauth2Client.getAccessToken()
      .then(function (response) {
        res.json({ access_token: response.token });
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        //console.error(error);
      });  
  });

  // Auth endpoint for Box
  app.get('/auth/box', function (req, res) {
    // Require data param to be passed
    if (!req.query.code) {
      res.status(500).send('Missing field');
      return;
    }

    var sdk = new BoxSDK({
      clientID: settings.box.CLIENT_ID,
      clientSecret: settings.box.CLIENT_SECRET
    });

    sdk.tokenManager.getTokensAuthorizationCodeGrant(req.query.code)
      .then(function (tokenInfo) {
        //console.log('Token info ', tokenInfo, '!');
        var responseText = TOKEN_TEMPLATE.replace(/\{\{TOKEN\}\}/g, tokenInfo.accessToken + ':' + tokenInfo.refreshToken);
        res.status(200).send(responseText);
      })
      .catch(function (err) {
        //console.error('Got an error!', err);
        res.status(500).send('Unknown error');
      }); 
  });

  // Handles refreshing the Box API token
  app.post('/auth/box/refreshtoken', function (req, res) {
    // Require data param to be passed
    if (!req.query.refresh_token) {
      res.status(500).send('Missing field');
      return;
    }

    var sdk = new BoxSDK({
      clientID: settings.box.CLIENT_ID,
      clientSecret: settings.box.CLIENT_SECRET
    });

    sdk.tokenManager.getTokensRefreshGrant(req.query.refresh_token)
      .then(function (tokenInfo) {
        res.json({ access_token: tokenInfo.accessToken, refresh_token: tokenInfo.refreshToken });
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        //console.error(error);
      });  
  });

  // Handles revoking the Box API token
  app.post('/auth/box/revoke', function (req, res) {
    // Require data param to be passed
    if (!req.query.access_token) {
      res.status(500).send('Missing field');
      return;
    }

    var sdk = new BoxSDK({
      clientID: settings.box.CLIENT_ID,
      clientSecret: settings.box.CLIENT_SECRET
    });

    sdk.tokenManager.revokeTokens(req.query.access_token)
      .then(function () {
        res.json({ });
      })
      .catch(function(error) {
        res.status(500).send('Unknown error');
        //console.error(error);
      });  
  });

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.htm');
  });
  
  app.listen(PORT);

  console.log('App started.');
};

serve();
