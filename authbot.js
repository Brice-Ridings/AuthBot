var Botkit = require('botkit');
var config = require('./config.js');
var dialog = require('./dialog.js');
var os = require('os');
var Regex = require('Regex')

var accountReq = new Regex('^[A-Za-z0-9\-]+wkr|api$');

var testString = 'rebates-submission-master-api';

if(accountReq.test(testString)){
  console.log("well that works");
}

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

  bot.reply(message, "got it: ");
  var account = message.match[1];
  bot.reply(message, account);

  // Check to see if account matches the expected value...
  if(accountReq.test(account) == true){
    bot.replay(message, "matched");  }
  else{
    bot.reply(message,"The account provided does not match the naming requirments ");
  }
});
