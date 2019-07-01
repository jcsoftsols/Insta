var Promise = require('bluebird'),
promisify = Promise.promisify;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var bcrypt    = require('bcrypt-nodejs');
var commonServiceObj = require('./commonService');
var constantObj = sails.config.constants;



var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));


var emailGeneratedCode = function (options) { //email generated code 
    //url = options.verifyURL,
    var email = options.username,
    password = options.password;

    message = 'Hello ';
    message += options.firstName;
    message += ",";
    message += '<br/><br/>';
    message += 'Your account has been created. Please login with the following credentials.';
    message += '<br/><br/>';
    message += 'Email Id : ' + email;
    message += '<br/>';
    message += 'Password : ' + password;
    message += '<br/><br/>';
    message += 'Regards';
    message += '<br/>';
    message += 'Support Team';

    transport.sendMail({
        //from: sails.config.appSMTP.auth.user,
        from: 'InstaLeaf Registration <' + sails.config.appSMTP.auth.user +'>' ,
        to: email,
        subject: 'Registration Verification',
        html: message
    }, function (err, info) {
        console.log("errro is ",err, info);
    });

    return {success: true, code:200, data:{message: constantObj.messages.ADDED_SUCCESSFULL, /* data: url */ }};
};

emailVerifyLink = function (options) { //email generated code 
    var url = options.verifyURL,
    email = options.username;

    message = 'Hello ';
    message += options.username1;
    message += ",";
    message += '<br/><br/>';
    message += 'You are one step away from verifying your account and joining the InstaLeaf community. With this account you will be able to save your favorite business/ strain profiles, along with leave reviews of your experiences to help others in the community make the right choices! Were also working on adding InstaLeaf points to give back to the community and you will be the first to be notified.';
    message += '<br/><br/>';
    message += 'Please verify your account by clicking the link below.';
    message += '<br/><br/>';
    message += '<a href="'+options.verifyURL+'" target="_blank" >Click and Verify</a>';
    message += '<br/><br/><br/>';
    message += 'Welcome to the InstaLeaf community!';
    message += '<br/><br/><br/>';
    message += '<img src="https://instaleaf.ca:1337/images/unnamed.png" width="300px">';
    //message += 'Regards,';
    //message += '<br/>';
    //message += 'Support Team';


    transport.sendMail({
        from: 'InstaLeaf Registration <' + sails.config.appSMTP.auth.user +'>' ,
        to: email,
        subject: 'Activate InstaLeaf Account',
        html: message
    }, function (err, info) {
        console.log("errro is ",err, info);
    });

    return {success: true, code:200, data:{message: constantObj.messages.ADDED_SUCCESSFULL, /* data: url */ }};
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
    
module.exports = {
    emailGeneratedCode: emailGeneratedCode,
    currentUser: function(data,context){
      return context.identity;
    },
    registerUser: function (data, context) {
        var date = new Date();

        if((!data.username) || typeof data.username == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_REQUIRED, key: 'USERNAME_REQUIRED'} };
        }
        if((!data.Type) || typeof data.Type == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.TYPE, key: 'TYPE'} };
        }
        if((!data.password) || typeof data.password == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.PASSWORD_REQUIRED, key: 'PASSWORD_REQUIRED'} };
        }
        var query = {}
        code = commonServiceObj.getUniqueCode();
        data.code = code;

        console.log("data",data);
        if(data.roles == 'U'){
            query.$or = [{ username1: data.username1}, {username: data.username}]
        } else {
            query.username1 = data.username1
        }

        return Users.findOne(query).then(function (user) {
            if (user !== undefined) {
                if(user.username1 == data.username1 && user.username != data.username){
                    return {"success": false, "error": {"code": 301,"message": constantObj.messages.USER_EXIST, key: 'USER_EXIST'} };
                } else if(user.username == data.username && user.username1 != data.username1){
                    return {"success": false, "error": {"code": 301,"message": constantObj.messages.EMAIL_EXIST, key: 'EMAIL_EXIST'} };
                } else {
                    return {"success": false, "error": {"code": 301,"message": constantObj.messages.USERNAME_EMAIL_EXIST, key: 'USERNAME_EMAIL_EXIST'} };                   
                }
            }else{
                data['date_registered'] = date;
                data['date_verified'] = date;
                data["status"] = "active";

                                
                return API.Model(Users).create(data).then(function (user) { 
                    context.id = user.username;
                    context.type = 'Email';
                    console.log("user",user)
                    return Tokens.generateToken({
                        user_id: user.id,
                        client_id: Tokens.generateTokenString()
                    });
    
                }).then(function (token) {
                    /*return emailGeneratedCode({
                        id: context.id,
                        type: context.type,
                        username: data.username,
                        password: data.password,
                        firstName: data.firstName,
                        verifyURL: sails.getBaseUrl() + "/user/verify/" + data.username + "?code=" + token.code
                    });*/
                    console.log("token",token)
                    return emailVerifyLink({
                        id: context.id,
                        type: context.type,
                        username: data.email,
                        username1: data.username1,
                        //verifyURL: sails.getBaseUrl() + "/verify/" + data.email
                        verifyURL: constantObj.serverUrl.HOST + "/verify/" + data.email 
                    });
                });                
            }
        })
    },
    mobRegister: function (data, context,req,res) {
        var date = new Date();
        
        if((!data.username1) || typeof data.username1 == undefined){ 
            return res.status(404).jsonx({
                success: false,
                message: constantObj.messages.USERNAME_REQUIRED,
                key: 'USERNAME_REQUIRED'
            });
        }
        if((!data.Type) || typeof data.Type == undefined){ 
            return res.status(404).jsonx({
                success: false,
                message: constantObj.messages.TYPE,
                key: 'TYPE'
            });
        }
        if((!data.domain) || typeof data.domain == undefined){ 
            return res.status(404).jsonx({
                success: false,
                message: constantObj.messages.DOMAIN,
                key: 'DOMAIN'
            });
        }
        
        if((!data.password) || typeof data.password == undefined){ 
            return res.status(404).jsonx({
                success: false,
                message: constantObj.messages.PASSWORD_REQUIRED,
                key: 'PASSWORD_REQUIRED'
            });
        }
        code = commonServiceObj.getUniqueCode();
        data.code = code;
        return Users.findOne({username1 :data.username1}).then(function (user) {
            if (user !== undefined) {
                return res.status(400).jsonx({
                    success: false,
                    message: constantObj.messages.USER_EXIST,
                    key: 'USER_EXIST'
                });
            }else{
                data['date_registered'] = date;
                data['date_verified'] = date;
                //data['isVerified'] = "Y";
                //data["fullName"] = data.firstName + ' ' + data.lastName;
                data["status"] = "active";

                                
                return API.Model(Users).create(data).then(function (user) { 
                    context.id = user.username;
                    context.type = 'Email';
                    return Tokens.generateToken({
                        user_id: user.id,
                        client_id: Tokens.generateTokenString()
                    });
    
                }).then(function (token) {
                    /*return emailGeneratedCode({
                        id: context.id,
                        type: context.type,
                        username: data.email,
                        username1: data.username1,
                        password: data.password,
                        firstName: data.firstName,
                        verifyURL: sails.getBaseUrl() + "/user/verify/" + data.username + "?code=" + token.code
                    });*/
                    return emailVerifyLink({
                        id: context.id,
                        type: context.type,
                        username: data.email,
                        username1: data.username1,
                        //verifyURL: sails.getBaseUrl() + "/user/verification/" + code 
                        //verifyURL: sails.getBaseUrl() + "/user/verification/" + res.code 
                        //verifyURL: sails.getBaseUrl() + "/verify/" + data.email 
                        verifyURL: constantObj.serverUrl.HOST + "/verify/" + data.email 
                    });

                    /*return emailVerifyLink({
                        id: context.id,
                        type: context.type,
                        username: data.email,
                        username1: data.username1,
                        //verifyURL: sails.getBaseUrl() + "/user/verification/" + code 
                        //verifyURL: sails.getBaseUrl() + "/user/verification/" + res.code 
                        verifyURL: constantObj.serverUrl.HOST + "/verify/" + data.email 
                    });*/
                });                
            }
        })
    },
    signin:function(data,context){
        console.log("Data in service",data)
        let query = {};
        query.username1 = data.username;
        query.$or = [{'roles':data.roles}]
        return Users.findOne(query).then(function (user) {
           

            if( user == undefined ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.WRONG_USERNAME, key: 'WRONG_USERNAME'} };
            }

            if (user != undefined && user.roles == 'U' && user.isVerified != 'Y' && user.status == 'deactive') {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_NOT_VERIFIED, key: 'USERNAME_NOT_VERIFIED'} };
            }

            if (user != undefined && user.status == 'deactive') {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_INACTIVE, key: 'USERNAME_INACTIVE'} };
            }

            if(user != undefined && user.status != "active" && user.isVerified != "Y"){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_INACTIVE, key: 'USERNAME_INACTIVE'} };
            }

            if(!bcrypt.compareSync(data.password, user.password) ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.WRONG_PASSWORD, key: 'WRONG_PASSWORD'} };
            }else{
                let inputData = {};
                if(data.gcm_id){ inputData.gcm_id = data.gcm_id; }
                if(data.device_token){ inputData.device_token = data.device_token; }
                inputData.device_type = data.device_type;
                inputData.user = user.id;
                if(data.device_type == ''){ inputData.device_type = "Web"; }

                return Tokens.generateToken({
                    client_id: user.id,
                    user_id: user.id
                }).then(function (token) {
                    user.access_token = token.access_token;
                    user.refresh_token = token.refresh_token;
                    
                    inputData.access_token = token.access_token;

                    return Userslogin.create(inputData).then(function(){
                        var lastLoginUpdate = {}
                        lastLoginUpdate.lastLogin = new Date(); 
                        lastLoginUpdate.status = 'active' ;
                        // console.log("eeeeeeeee", lastLoginUpdate);
                    if(data.domain == 'mobile'){             
                        lastLoginUpdate.deviceToken = data.device_token ;
                        lastLoginUpdate.domain = data.domain ;
                        lastLoginUpdate.device_type = data.device_type ;
                    }

                    // console.log("sdsdsdsds",lastLoginUpdate);
                    
                        return Users.update({id:user.id}, lastLoginUpdate).then(function() {
                            return {success: true, code:200, message: constantObj.messages.SUCCESSFULLY_LOGGEDIN, data: user};
                        }).fail(function(errr) {
                            return {"success": false, "error": {"code": 400,"message": errr} };
                        });
                    });
                });
            }
        });
    },
    signinUser: function (data, context) {
        
        let query = {};
        console.log("checking", data);
        query.username1 = data.username1;
        // query.status = {$ne:"deactive"};
        //query.isVerified = "Y";
        query.$or = [{'roles':'U'},{'roles':'D'},{'roles':'B'},{'roles':'DR'}]

      
        //return Users.findOne({username:username, roles:'U'}).then(function (user) {
        return Users.findOne(query).then(function (user) {
           

            if( user == undefined ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.WRONG_USERNAME, key: 'WRONG_USERNAME'} };
            }

            if (user != undefined && user.roles == 'U' && user.isVerified != 'Y' /*&& user.status == 'deactive'*/) {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_NOT_VERIFIED, key: 'USERNAME_NOT_VERIFIED'} };
            }

            if (user != undefined && user.status == 'deactive') {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_INACTIVE, key: 'USERNAME_INACTIVE'} };
            }

            if(user != undefined && user.status != "active" && user.isVerified != "Y"){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_INACTIVE, key: 'USERNAME_INACTIVE'} };
            }

            if(!bcrypt.compareSync(data.password, user.password) ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.WRONG_PASSWORD, key: 'WRONG_PASSWORD'} };
            }else{
                let inputData = {};
                if(data.gcm_id){ inputData.gcm_id = data.gcm_id; }
                if(data.device_token){ inputData.device_token = data.device_token; }
                inputData.device_type = data.device_type;
                inputData.user = user.id;
                if(data.device_type == ''){ inputData.device_type = "Web"; }

                return Tokens.generateToken({
                    client_id: user.id,
                    user_id: user.id
                }).then(function (token) {
                    user.access_token = token.access_token;
                    user.refresh_token = token.refresh_token;
                    
                    inputData.access_token = token.access_token;

                    return Userslogin.create(inputData).then(function(){
                        var lastLoginUpdate = {}
                        lastLoginUpdate.lastLogin = new Date(); 
                        lastLoginUpdate.status = 'active' ;
                        // console.log("eeeeeeeee", lastLoginUpdate);
                    if(data.domain == 'mobile'){             
                        lastLoginUpdate.deviceToken = data.device_token ;
                        lastLoginUpdate.domain = data.domain ;
                        lastLoginUpdate.device_type = data.device_type ;
                    }

                    // console.log("sdsdsdsds",lastLoginUpdate);
                    
                        return Users.update({id:user.id}, lastLoginUpdate).then(function() {
                            return {success: true, code:200, message: constantObj.messages.SUCCESSFULLY_LOGGEDIN, data: user};
                        }).fail(function(errr) {
                            return {"success": false, "error": {"code": 400,"message": errr} };
                        });
                    });
                });
            }
        });
    },
    autoLogin: function (data, context) {
        
        let query = {};
        console.log("checking", data);
        //query.username1 = data.username1;
        // query.status = {$ne:"deactive"};
        //query.isVerified = "Y";
        query.code = data.code;
        query.$or = [{'roles':'U'},{'roles':'D'},{'roles':'B'},{'roles':'DR'}]

      
        //return Users.findOne({username:username, roles:'U'}).then(function (user) {
        return Users.findOne(query).then(function (user) {

            if( user == undefined ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.WRONG_USERNAME, key: 'WRONG_USERNAME'} };
            }

            if (user != undefined && user.roles == 'U' && user.isVerified != 'Y' /*&& user.status == 'deactive'*/) {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_NOT_VERIFIED, key: 'USERNAME_NOT_VERIFIED'} };
            }

            if (user != undefined && user.status == 'deactive') {
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_INACTIVE, key: 'USERNAME_INACTIVE'} };
            }

            if(user != undefined && user.status != "active" && user.isVerified != "Y"){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_INACTIVE, key: 'USERNAME_INACTIVE'} };
            /*}

            if(!bcrypt.compareSync(data.password, user.password) ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.WRONG_PASSWORD, key: 'WRONG_PASSWORD'} };*/
            }else{
                let inputData = {};
                if(data.gcm_id){ inputData.gcm_id = data.gcm_id; }
                if(data.device_token){ inputData.device_token = data.device_token; }
                inputData.device_type = data.device_type;
                inputData.user = user.id;
                if(data.device_type == ''){ inputData.device_type = "Web"; }

                return Tokens.generateToken({
                    client_id: user.id,
                    user_id: user.id
                }).then(function (token) {
                    user.access_token = token.access_token;
                    user.refresh_token = token.refresh_token;
                    
                    inputData.access_token = token.access_token;

                    return Userslogin.create(inputData).then(function(){
                        var lastLoginUpdate = {}
                        lastLoginUpdate.lastLogin = new Date(); 
                        lastLoginUpdate.status = 'active' ;
                        lastLoginUpdate.code = 0 ;                        
                        var dateChanged = Date.now();
                        //dateChanged.setDate(dateChanged.getTime()); 
                        
                        lastLoginUpdate.code = dateChanged ;
                        //lastLoginUpdate.$unset = {"code":""};
                        // console.log("eeeeeeeee", lastLoginUpdate);
                    if(data.domain == 'mobile'){             
                        lastLoginUpdate.deviceToken = data.device_token ;
                        lastLoginUpdate.domain = data.domain ;
                        lastLoginUpdate.device_type = data.device_type ;
                    }
            console.log("test",lastLoginUpdate)


                    // console.log("sdsdsdsds",lastLoginUpdate);
                    
                        return Users.update({id:user.id}, lastLoginUpdate).then(function() {
                            return {success: true, code:200, message: constantObj.messages.SUCCESSFULLY_LOGGEDIN, data: user};
                        }).fail(function(errr) {
                            return {"success": false, "error": {"code": 400,"message": errr} };
                        });
                    });
                });
            }
        });
    },
    mobSigninUser: function (data, context,req,res) {
        
        let query = {};
        console.log("checking", data);
        query.username1 = data.username1;
        // query.status = {$ne:"deactive"};
        //query.isVerified = "Y"; 
        query.$or = [{'roles':'U'},{'roles':'D'},{'roles':'B'},{'roles':'DR'},{'roles':'DRIVER'}]

      
        //return Users.findOne({username:username, roles:'U'}).then(function (user) {
        Users.findOne(query).then(function (user) {
           

            if( user == undefined ){
                return res.status(403).jsonx({
                    success: false,
                    message: constantObj.messages.WRONG_USERNAME,
                    key: 'WRONG_USERNAME'
                });
            }

            if (user != undefined && user.roles == 'U' && user.isVerified != 'Y' /*&& user.status == 'deactive'*/) {
                return res.status(403).jsonx({
                    success: false,
                    message: constantObj.messages.USERNAME_NOT_VERIFIED,
                    key: 'USERNAME_NOT_VERIFIED'
                });
            }

            if (user != undefined && user.status == 'deactive') {
                return res.status(403).jsonx({
                    success: false,
                    message: constantObj.messages.USERNAME_INACTIVE,
                    key: 'USERNAME_INACTIVE'
                });

            }

            if(user != undefined && user.status != "active" && user.isVerified != "Y"){
                return res.status(403).jsonx({
                    success: false,
                    message: constantObj.messages.USERNAME_INACTIVE,
                    key: 'USERNAME_INACTIVE'
                });
            }

            if(!bcrypt.compareSync(data.password, user.password) ){
                return res.status(403).jsonx({
                    success: false,
                    message: constantObj.messages.WRONG_PASSWORD,
                    key: 'WRONG_PASSWORD'
                });

            }else{
                let inputData = {};
                if(data.gcm_id){ inputData.gcm_id = data.gcm_id; }
                if(data.device_token){ inputData.device_token = data.device_token; }
                inputData.device_type = data.device_type;
                inputData.user = user.id;
                if(data.device_type == ''){ inputData.device_type = "Web"; }

                return Tokens.generateToken({
                    client_id: user.id,
                    user_id: user.id
                }).then(function (token) {
                    user.access_token = token.access_token;
                    user.refresh_token = token.refresh_token;
                    
                    inputData.access_token = token.access_token;

                    return Userslogin.create(inputData).then(function(){
                        var lastLoginUpdate = {}
                        lastLoginUpdate.lastLogin = new Date(); 
                        lastLoginUpdate.status = 'active' ;
                        // console.log("eeeeeeeee", lastLoginUpdate);
                    if(data.domain == 'mobile'){             
                        lastLoginUpdate.deviceToken = data.device_token ;
                        lastLoginUpdate.domain = data.domain ;
                        lastLoginUpdate.device_type = data.device_type ;
                    }

                    // console.log("sdsdsdsds",lastLoginUpdate);
                    
                        Users.update({id:user.id}, lastLoginUpdate).then(function() {
                            return res.status(200).jsonx({
                                success: true,
                                message: constantObj.messages.SUCCESSFULLY_LOGGEDIN,
                                key: 'SUCCESSFULLY_LOGGEDIN',
                                data:user
                            });
                            
                        }).fail(function(errr) {
                            return res.status(400).jsonx({
                                success: false,
                                message: errr
                            });
                            
                        });
                    });
                });
            }
        });
    },
    adminSideRegistration: function (data, context) {
        var date = new Date();
        
        if((!data.username1) || typeof data.username1 == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.USERNAME_REQUIRED, key: 'USERNAME_REQUIRED'} };
        }
        /*if((!data.mobile) || typeof data.mobile == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.MOBILE_REQUIRED, key: 'MOBILE_REQUIRED'} };
        }*/
        var query = {}
        if(data.roles == 'U'){
            query.$or = [{ username1: data.username1}, {username: data.username}]
        } else {
            query.username1 = data.username1
        }

        return Users.findOne(query).then(function (user) {
            
            if (user !== undefined) {
                if(user.username1 == data.username1 && user.username != data.username){
                    return {"success": false, "error": {"code": 301,"message": constantObj.messages.USER_EXIST, key: 'USER_EXIST'} };
                } else if(user.username == data.username && user.username1 != data.username1){
                    return {"success": false, "error": {"code": 301,"message": constantObj.messages.EMAIL_EXIST, key: 'EMAIL_EXIST'} };
                } else {
                    return {"success": false, "error": {"code": 301,"message": constantObj.messages.USERNAME_EMAIL_EXIST, key: 'USERNAME_EMAIL_EXIST'} };                   
                }                  
            } else {
                /*if(data.roles == 'SA'){
                    data['roles'] = data.roles;

                } else {
                    data['roles'] = 'U';
                }*/
                data['roles'] = data.roles;
                data['Type'] = data.roles;
                if(!data['password']){
                    //data['password'] = generatePassword();
                    data['password'] = 42434445;
                }

                data['date_registered'] = date;
                data['date_verified'] = date;
                data['isVerified'] = "Y";
                data['addedBy'] ='1';
                /*if(data.mobile){
                    if(typeof data.mobile == 'string'){
                        var phExpression = /^\d+$/;
                        if(data.mobile.match(phExpression)) {
                            if(data.mobile.length>10 || data.mobile.length<10){
                                return {"success": false, "error": {"code": 412,"message": constantObj.messages.PHONE_NUMBER, key: 'PHONE_NUMBER'} };
                            }

                            data['mobile'] = data.mobile;
                            
                        } else {
                            return {"success": false, "error": {"code": 412,"message": constantObj.messages.PHONE_INVALID, key: 'PHONE_INVALID'} };                
                        } 
                    } else {
                        var mobile = data.mobile.toString();
                            if(mobile.length>10 || mobile.length<10){
                                return {"success": false, "error": {"code": 412,"message": constantObj.messages.PHONE_NUMBER, key: 'PHONE_NUMBER'} };
                            } else {
                                data['mobile'] = data.mobile;
                            }
                    } 

                }*/
                data['mobile'] = data.mobile; 
                //data["fullName"] = data.firstName + ' ' + data.lastName;
                data["status"] = "active";

                
                code = commonServiceObj.getUniqueCode();
                data.code = code;

                
                return API.Model(Users).create(data).then(function (user) { 
                
                    context.id = user.username;
                    context.type = 'Email';
                   return Tokens.generateToken({
                            user_id: user.id,
                            client_id: Tokens.generateTokenString()
                   });
    
                }).then(function (token) {
                    return emailVerifyLink({
                        id: context.id,
                        type: context.type,
                        username: data.email,
                        username1: data.username1,
                        verifyURL: constantObj.serverUrl.HOST + "/verify/" + data.email 
                    });
                    /*return emailGeneratedCode({
                        id: context.id,
                        type: context.type,
                        username: data.username,
                        password: data.password,
                        firstName: data.username1,
                        verifyURL: sails.getBaseUrl() + "/user/verify/" + data.username + "?code=" + token.code
                    });*/
                });                
            }
        })
    },

    
};