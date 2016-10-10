var Botkit = require('botkit');
var config = require('./config.js');
var dialog = require('./dialog.js');
var os = require('os');

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

  bot.reply(message,dialog.introduction)

});

// Create account xxxxxx
contoller.hears('create account (.*)', ['direct_message','direct_mention','mention'], function(bot,message){

  var account = match[1];


});
