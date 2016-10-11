var Botkit = require('botkit');
var config = require('./config.js');
var dialog = require('./dialog.js');
var os = require('os');
var request = require('request');

var accountReq = '^[A-Za-z0-9\-]+wkr|api$';

var G


if (!config.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

// connect the bot to a stream of messages
controller.spawn({
  token: config.token,
}).startRTM();

// Bot conversation
controller.hears(['hello','hi'],['direct_message','direct_mention','mention'],function(bot,message) {

    controller.storage.users.get(message.user, function(err, user){
      if(user && user.name){
        bot.reply(message, 'Hello' + user.name + '!!');
      }else{
        bot.reply(message, 'Hello.');
      }
    });
});

controller.hears(['help','who are you','what do you do', 'identify yourself'], ['direct_message','direct_mention','mention'], function(bot,message){
  bot.reply(message,dialog.introduction);

});

// Create account xxxxxx
controller.hears('create account (.*)', ['direct_message','direct_mention','mention'], function(bot,message){

  var account = message.match[1];

  // Check to see if account matches the expected value...
  if(account.match(accountReq)){

    bot.reply(message, "Got it! one moment...")
    accountName = 'dev-' + account;

    // Create request call
    var createAccountOptions = {
      url: 'https://rebates-auth0-account-api.ops.aws-nonprod.psn.inmar.com/api/v1/account/internal/' + accountName,
      method: 'POST'
    }

    request(createAccountOptions, function(error, response, body){
      if(!error && response.statusCode == '201'){
        var responseBody = JSON.parse(body);
        bot.reply(message, 'Here you are!' +  '\n' + '>>> AccountName: ' + responseBody.account.appName + '\n' + 'Password: ' + responseBody.account.password);
      }
      else{
        bot.reply(message,"Error "+response.statusCode+": "+JSON.parse(body));
      }
    })


  }
  else{
    bot.reply(message,"The account provided does not match the naming requirments");
  }
});
