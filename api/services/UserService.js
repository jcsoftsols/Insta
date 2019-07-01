/**
  * #DESC:  In this class/files EndUser related functions
  * #Author: JC software
  */
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var bcrypt    = require('bcrypt-nodejs');
var constantObj = sails.config.constants;
var commonServiceObj = require('./commonService');
var transport = nodemailer.createTransport(smtpTransport({
                    host: sails.config.appSMTP.host,
                    port: sails.config.appSMTP.port,
                    debug: sails.config.appSMTP.debug,
                    auth: {
                            user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
                            pass: sails.config.appSMTP.auth.pass
                          }
                }));
emailGeneratedPassword = function (options) { //email generated code 
    var url = options.verifyURL,
        email = options.email,
        password = options.password;

    message = 'Hello ';
    message += options.firstName; 
    message += '<br/>';
    message += 'Your new password has been created successfully';
    message += '<br/><br/>';
    message += 'Email Id : ' + email;
    message += '<br/>';
    message += 'Password : ' + password;

    transport.sendMail({
        from: sails.config.appSMTP.auth.user,
        to: email,
        subject: 'InstaLeaf password reset',
        html: message
    }, function (err, info) {
        
    });

    return {
        success: true,
        data: {
            "message": "Password has been sent to Email"
        }
    }
};
var emailVerifyLink = function (options,cb) { 

    var url = options.verifyURL,
        email = options.email,
    
    message  = 'Hello! ';
    message += options.username;
    message += '<br/><br/>';
    message += 'We heard that you lost your InstaLeaf password. Please click on link to reset your password.';
    message += '<br/><br/>';
    message += '<a href="'+options.verifyURL+'" target="_blankh" >Click here to set new password</a>';
    message += '<br/><br/>';
    message += 'Regards';
    message += '<br/><br/>';
    message += 'InstaLeaf Support Team';

    let msg = '';
    transport.sendMail({
        from: sails.config.appSMTP.auth.user,
        to: email,
        subject: 'InstaLeaf password reset',
        html: message

    }, function (err, info) {
        if(err){
            //msg = "There is some error to send mail to your email id.";
            return cb(err);
        } else {
            
            return cb(null,info)
            //msg = "Link for reset passwork has been sent to your email id.";
        } 
    });
    return cb();
};

generatePassword = function () { // action are perform to generate random password for user 
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-=+;:,.?",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};
generatePassword1 = function () { // action are perform to generate random password for user 
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

module.exports = {
    emailGeneratedPassword: emailGeneratedPassword, //emailgeneratecode()
    generatePassword: generatePassword,   //generatepassword()
    forgotPassword: function (data, context) {
        return Users.findOne({email: data.email})
            .then(function(data){
                if(data===undefined){
                    return {
                        success: false,
                        error: {
                            "code": 404,
                            "message": "No such user exist"
                        }
                    }
                }
                else{
                    var password = generatePassword()
                    var encryptedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
                    return Users.update({email: data.email},{encryptedPassword:encryptedPassword})
                            .then(function(data){
                                return emailGeneratedPassword({
                                    email: data[0].email,
                                    password: password,
                                    firstName: data[0].firstName,
                                    verifyURL: sails.config.security.server.url + "/users/verify/" + data[0].email + "?code=" + data[0].password,
                                })
                            })
                    }
                
            })
    },
    webForgotPassword: function(data, context) {
        return Users.findOne({username1: data.username1})
            .then(function(user){
                if(user){
                    let options = {
                        email: user.email,
                        username: data.username1,                                  
                        verifyURL:sails.config.INSTALEAF_FRONT_WEB_URL + "/auth/reset/"+user.id
                    }
                    return emailVerifyLink(options,function(error,success){
                        if(error){
                            return {
                                success: false,
                                data: {
                                     message: constantObj.messages.ERROR_MAIL,
                                     key:"ERROR_MAIL"
                                    //"message": "There is some error to send mail to your email id."
                                }
                            } 
                        } else {
                            return {
                                success: true,
                                data: {
                                    message: constantObj.messages.LINK_MAIL,
                                    key:"LINK_MAIL"
                                    //"message": "Link for reset passwork has been sent to your email id. "
                                }
                            } 
                        }
                    })

                }
                else
                {
                    return {
                        success: false,
                        error: {
                            "code": 404,
                            message: constantObj.messages.INVALID_USER,
                            key:"INVALID_USER"
                            //"message": "No such user exist"
                        }
                    }
                }
                
              
                
            })
    },

    userForgotPassword: function(data, context) {
        return Users.findOne({email: data.email})
            .then(function(user){
                if(user){
                    let options = {
                        email: data.email,
                        firstName: user.firstName,                                  
                        verifyURL:sails.config.PAYTM_FRONT_WEB_URL + "/resetpassword/"+user.id
                    }
                    return emailVerifyLink(options,function(error,success){
                        if(error){
                            return {
                                success: false,
                                data: {
                                     message: constantObj.messages.ERROR_MAIL,
                                     key:"ERROR_MAIL"
                                    //"message": "There is some error to send mail to your email id."
                                }
                            } 
                        } else {
                            return {
                                success: true,
                                data: {
                                    message: constantObj.messages.LINK_MAIL,
                                    key:"LINK_MAIL"
                                    //"message": "Link for reset passwork has been sent to your email id. "
                                }
                            } 
                        }
                    })

                }
                else
                {
                    return {
                        success: false,
                        error: {
                            "code": 404,
                            message: constantObj.messages.INVALID_USER,
                            key:"INVALID_USER"
                            //"message": "No such user exist"
                        }
                    }
                }
                
              
                
            })
    },
    mobForgotPassword: function(data, context,req,res) {
        Users.findOne({username: data.username})
            .then(function(user){
                if(user){
                    var  randomPass = generatePassword1();

                    var encryptedPassword = bcrypt.hashSync(randomPass, bcrypt.genSaltSync(10));

                    
                    Users.update({username: data.username},{encryptedPassword:encryptedPassword}).then(function (user) {
                        let options = {
                            email: data.username,
                            firstName: data.username,                                  
                            verifyURL:'',
                            password:randomPass
                        }
                        var emailstatus = emailGeneratedPassword(options);
                        
                        if(emailstatus['success']==true){
                            return res.status(200).jsonx({
                                success: true,
                                message: constantObj.messages.FORGOT_PASWORD, 
                                Key:"PASSWORD_CHANGED"
                            });
                        }else{
                            return res.status(400).jsonx({
                                success: false,
                                message: constantObj.messages.INVALID_USER,
                                key:"INVALID_USER"
                            });     
                        }
                    });
                    
                }else{
                    return res.status(404).jsonx({
                        success: false,
                        message: constantObj.messages.INVALID_USER,
                        key:"INVALID_USER"
                    });
                }
            })
    },
    mobChangePassword:function(data,context,req,res){
        let newPassword = data.newPassword;
        let confirmPassword = data.confirmPassword;
        let currentPassword = data.currentPassword;

        let query = {};
        query.id = context.identity.id;


        Users.findOne(query).then(function(user) {
            
            if ( !bcrypt.compareSync(currentPassword, user.password) ) {
                return res.status(404).jsonx({
                    success: false,
                    message: constantObj.messages.CURRENT_PASSWORD,
                    key:"CURRENT_PASSWORD"
                });

            } else {
                if(newPassword != confirmPassword)
                {
                    return res.status(404).jsonx({
                        success: false,
                        message: 'new password and confirmPassword does not match',
                        key:"WRONG_PASSWORD"
                    });
                } else {
                    var encryptedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                    Users.update({id: context.identity.id},{encryptedPassword:encryptedPassword}).then(function (user) {
                        return res.status(200).jsonx({
                            success: true,
                            message: constantObj.messages.PASSWORD_CHANGED,
                            key:"PASSWORD_CHANGED"
                        });
                        
                    });
                }
            }
        });
    },
    changePassword: function(data, context){
        
        let newPassword = data.newPassword;
        let confirmPassword = data.confirmPassword;
        let currentPassword = data.currentPassword;

        let query = {};
        query.id = context.identity.id;


        return Users.findOne(query).then(function(user) {
            
            if ( !bcrypt.compareSync(currentPassword, user.password) ) {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.CURRENT_PASSWORD, key: 'CURRENT_PASSWORD'} };
            } else {
                if(newPassword != confirmPassword)
                {
                    return {"success": false, "error": {"code": 404,"message": "new password and confirmPassword does not match", key: 'WRONG_PASSWORD'} };
                } else {
                    var encryptedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                    return Users.update({id: context.identity.id},{encryptedPassword:encryptedPassword}).then(function (user) {
                        return {"success": true, "code":200, message: constantObj.messages.PASSWORD_CHANGED, Key:"PASSWORD_CHANGED"};
                    });
                }
            }
        });
    },

    setpassword: function(data, context){
        
        let newPassword = data.newPassword;
        let confirmPassword = data.confirmPassword;

        let query = {};
        query.id = data.id;

        return Users.findOne(query).then(function(user) {
            if(newPassword != confirmPassword)
            {
                return {"success": false, "error": {"code": 404,"message": "new password and confirmPassword does not match", key: 'WRONG_PASSWORD'} };
            } else {
                var encryptedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                return Users.update({id: data.id},{encryptedPassword:encryptedPassword}).then(function (user) {
                    return {"success": true, "code":200, message: constantObj.messages.PASSWORD_CHANGED, Key:"PASSWORD_CHANGED"};
                });
            }
        });
    },

    userInfo:function(data,context){

        let query = {};
        query.id = context.identity.id;

        return Users.findOne(query).then(function(user) {
            if(user){
                return {
                    success: true,
                    code:200,
                    data: {
                        user:user
                    },
                };
            }    
        });
    },
    mobGetUserDetail:function(data,context,req,res){
        let query = {};
        query.id = context.identity.id;

         Users.findOne(query).then(function(user) {
            if(user){
                return res.status(200).jsonx({
                    success: true,
                    user:user
                });
            }    
        });
    },
    mobUpdateProfile:function(data,context,req,res){
        console.log("data",data);
        var query = {}
        query.id = context.identity.id;

        Users.update(query, data).then(function(updatedUser) {
            console.log("updatedUser "+query.id,updatedUser)
            if(updatedUser){
                return res.status(200).jsonx({
                    success: true,
                    user:updatedUser,
                    message : constantObj.user.USER_UPDATED
                });
            }else{
                return res.status(400).jsonx({
                   success: false,
                   error: constantObj.user.USER_UPDATION_ISSUE 
                });
            }
        })
    },
    mobUpdateImage:function(data,context,req,res){
        console.log("data",data);
        var query = {}
        query.id = data.id;
        Users.update(query, data).then(function(updatedUser) {
            if(updatedUser){
                return res.status(200).jsonx({
                    success: true,
                    user:updatedUser,
                    message : constantObj.user.USER_UPDATED
                });
            }else{
                return res.status(400).jsonx({
                   success: false,
                   error: constantObj.user.USER_UPDATION_ISSUE 
                });
            }
        })
    },
    updateUserProfile:function(data,context){
        console.log("data",data);
        
        var query = {}
        query.id = context.identity.id;
        return Users.update(query, data).then(function(updatedUser) {
            if(updatedUser){
                return {
                    success: true,
                    code:200,
                    data: {
                        user:updatedUser,
                        message : constantObj.user.USER_UPDATED,
                    },
                };
            } else {
                return res.status(400).jsonx({
                   success: false,
                   error: constantObj.user.USER_UPDATION_ISSUE 
                });
            }
        })
    },

    contactUs:function(data,context){
        
        return Users.update(query, data).then(function(updatedUser) {
            if(updatedUser){
                return {
                    success: true,
                    code:200,
                    data: {
                        user:updatedUser,
                        message : constantObj.user.USER_UPDATED,
                    },
                };
            } else {
                return res.status(400).jsonx({
                   success: false,
                   error: constantObj.user.USER_UPDATION_ISSUE 
                });
            }
        })
    },


}; 