var Botkit = require('botkit');
var config = require('./config.js');
var os = require('os');
var request = require('request');

var accountReq = '^[A-Za-z0-9\-]+wkr|api$';


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

controller.hears('do my laundry',['direct_message','direct_mention','mention'],function(bot,message){
  bot.reply(message, 'Here you are :shirt: :shirt: :jeans:');
});

controller.hears(['help','who are you','what do you do', 'identify yourself'], ['direct_message','direct_mention','mention'], function(bot,message){
  bot.reply(message,'I am authbot, a slackbot built for handling auth0 accounts within the Inmar custom database.\n'
  +'Hear are some things you can command me to do\n'
  +'*create account xxxxx-api/wkr*\n' + '>creates an account for APIs or workers in Auth0 inmarb2b-dev database. Names must end with "-wkr" or "-api" to be accepted. I append "dev-" to what you provide\n'
  +'*create service account xxxxxx*\n' + '>This is for accounts that are not APIs or workers. I will append "svc-" at the beggining\n'
  +'*delete account xxxxx*\n' + '>deletes the account of course\n'
  +'*refresh account xxxx*\n' + '>if this account exists I will refresh the password');
});

controller.hears('delete account (.*)',['direct_message','direct_mention','mention'],function(bot,message){
  var account = message.match[1];
  bot.reply(message, "Sure! one sec");

  var createAccountOptions = {
    url: config.urlEdit + account,
    method: 'Delete'
  };

  request(createAccountOptions, function(error, response, body){
    if(!error && response.statusCode == '200'){
      bot.reply(message, 'The account has been deleted');
    }
    else if(response.statusCode == 504 || response.statusCode == 404){
      bot.reply(message,"Well this is embarrassing... Seems the service is unavaliable and I recieved a status code of " + response.statusCode);
    }
    else{
      bot.reply(message,"Error "+response.statusCode+": "+JSON.parse(body));
    }
  })

});

controller.hears('refresh account (.*)',['direct_message','direct_mention','mention'],function(bot,message){
  var account = message.match[1];
  bot.reply(message, "Of course! Please hold on to your password :upside_down_face:");

  var createAccountOptions = {
    url: config.urlEdit + account,
    method: 'Put'
  };

  request(createAccountOptions, function(error, response, body){
    if(!error && response.statusCode == '201'){
      var responseBody = JSON.parse(body);
      bot.reply(message, 'Here you are!' +  '\n' + '>>> AccountName: ' + responseBody.account.appName + '\n' + 'Password: ' + responseBody.account.password);
    }
    else if(response.statusCode == 504 || response.statusCode == 404){
      bot.reply(message,"Well this is embarrassing... Seems the service is unavaliable and I recieved a status code of " + response.statusCode);
    }
    else{
      bot.reply(message,"Error "+response.statusCode+": "+JSON.parse(body));
    }
  })

});

// Create account xxxxxx
controller.hears('create account (.*)', ['direct_message','direct_mention','mention'], function(bot,message){

  var account = message.match[1];

  // Check to see if account matches the expected value...
  if(account.match(accountReq)){

    bot.reply(message, "Got it! one moment...");
    accountName = 'dev-' + account;

    // Create request call
    var createAccountOptions = {
      url: config.url + accountName,
      method: 'POST'
    }

    request(createAccountOptions, function(error, response, body){
      if(!error && response.statusCode == '201'){
        var responseBody = JSON.parse(body);
        bot.reply(message, 'Here you are!' +  '\n' + '>>> AccountName: ' + responseBody.account.appName + '\n' + 'Password: ' + responseBody.account.password);
      }
      else if(response.statusCode == 504 || response.statusCode == 404){
        bot.reply(message,"Well this is embarrassing... Seems the service is unavaliable and I recieved a status code of " + response.statusCode);
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
