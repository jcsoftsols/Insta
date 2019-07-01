/**
  * #DESC:  In this class/files crops related functions
  * #sRequest param: Crops add form data values
  * #Return : Boolen and sucess message
  * #Author: JCsoftware Solution
*/

var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));

/*var sendEmail = function (options) { //email generated code 
    var email = options.username,
    
    

    

    return {success: true, code:200, data:{message: constantObj.messages.EMAIL_SEND_SUCCESSFULL, /* data: url  }};
};*/

module.exports = {

        
}; // End Delete service class