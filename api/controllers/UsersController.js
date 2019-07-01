/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var constantObj = sails.config.constants;
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var commonServiceObj = require('../services/commonService.js');

var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));

module.exports = {
    index: function(req,res){
        API(Registration.adminSideRegistration,req,res);
    },
    register: function(req,res){
        API(Registration.registerUser,req,res);
    },
    
    mobRegister:function(req,res){
        API(Registration.mobRegister,req,res);
    },
    
    signin: function(req,res){
    	API(Registration.signin,req,res);
    },
    
    signinUser:function(req,res){
        API(Registration.signinUser,req,res);
    },

    autologin:function(req,res){
        API(Registration.autoLogin,req,res);
    },

    mobSigninUser:function(req,res){
        API(Registration.mobSigninUser,req,res);
    },
    mobForgotPassword:function(req,res){
        API(UserService.mobForgotPassword,req,res); 
    },

    webForgotPassword:function(req,res){
        API(UserService.webForgotPassword,req,res); 
    },

    resetPassword:function(req,res){
        API(UserService.setpassword,req,res); 
    },

    changePassword: function(req,res){
    	API(UserService.changePassword,req,res); 
    },
    mobChangePassword:function(req,res){
        API(UserService.mobChangePassword,req,res); 
    },
    getUserDetail:function(req,res){
        API(UserService.userInfo,req,res)
    },
    mobGetUserDetail:function(req,res){
        API(UserService.mobGetUserDetail,req,res)
    },
    updateProfile: function(req,res){
        API(UserService.updateUserProfile,req,res)  
    },
    mobUpdateProfile:function(req,res){
        API(UserService.mobUpdateProfile,req,res)  
    },
    contactUs: function(req,res){
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var phone = req.body.phone;
        var website = req.body.website;
        var company = req.body.company;
        var description = req.body.description;
        var fullname = firstname+" "+lastname;


        message = 'Hello Admin,';
        message += '<br/><br/>';
        message += fullname+ " wants to connect with you";
        message += '<br/><br/>';
        message += "Look into"+ " "+fullname+"'s query.";
        message += '<br/><br/>';
        message += "Name : "+ fullname;
        message += '<br/>';
        message += "Email : "+ email;
        message += '<br/>';
        message += "Phone : "+ phone;
        message += '<br/>';
        message += "Website : "+ website;
        message += '<br/>';
        message += "Company : "+ company;
        message += '<br/>';
        message += "Message : "+ description;
        message += '<br/>';
        message += '<br/>';
        message += 'Regards';
        message += '<br/>';
        message += 'InstaLeaf Support Team';

        transport.sendMail({
            //
            from: "Instaleaf Support",
            to: "admin@instaleaf.ca",
            subject: "New Mail",
            html: message
        }, function (err, info) {
            if(err){
                return res.status(400).jsonx({
                    success: false,
                    error:err
                });
            } else{
                return res.status(200).jsonx({
                    success: true,
                    data: {
                        message: "Mail has been sent successfully."
                    }
                });
            }
        });  
    },

    getDashboardData: function(req,res){
        var qry = {};

        Users.native(function(err, allUsers) {
            allUsers.aggregate([
                {
                    $project : { 
                        //month : {$month : new Date("$createdAt")}, 
                        roles:"$roles",
                        year : {"$substr": [ "$createdAt", 0, 4 ] }
                    }
                },
                /*{
                    $sort: { "year": 1 }
                }, */
                {   "$group": {
                        "_id": {
                            "roles":"$roles",
                            "year": "$year"
                        },
                        "count": { "$sum": 1 }
                    }
                },
                {
                    $group: {
                        _id:"$_id.year",
                        'total': {$sum:"$count"},
                        'roles': {
                            $push: {
                                role: "$_id.roles",
                                count: "$count"
                            }
                        }
                    }
                },
                {
                    $sort: { "_id": 1 }
                }, 
            ],function(err, users) {
                if (err) {
                    return res.status(400).jsonx({
                        success: false,
                        error:err
                    });
                } else {
                    return res.status(200).jsonx({
                        success: true,
                        data: users
                    });
                }
            });
        })

        /*qry.$and = [{createdAt: {$gte: new Date(req.param('from'))}}, {createdAt: {$lte: new Date(req.param('to'))}}]
        qry.isDeleted = false
        qry.isExpired = false

        Crops.native(function(err, allcrops) {
            allcrops.aggregate([
            {
                $match: qry
            },
            {
                $project: {
                    approvestatus: {
                        $cond:[{$eq: ["$verified", "Yes"]}, "Verified", {
                            $cond:[{$eq: ["$isApproved", true]}, "Approved", "Not Approved"]
                        }]
                    }
                }
            },
            {
                $group: {
                    _id: "$approvestatus",
                    count: { $sum: 1 }
                }
            }
            ], function(err, crops) {
                if (err) {
                    return res.status(400).jsonx({
                        success: false,
                        error:err
                    });
                } else {
                    return res.status(200).jsonx({
                        success: true,
                        data: crops
                    });
                }
            });
        })*/
    },

    verify: function(req,res){
        let verifyEmail = req.param('email')

        Users.findOne({username:verifyEmail}).then(function (user) {
            console.log("user+++++++++",user)
            
            if( user == undefined ){
                return {"success": false, "error": {"code": 404,"message": constantObj.messages.INVALID_USER} };
            } else {
                if (user.isVerified == 'N') {
                    code = user.code
                    //data.code = code;
                    Users.update({id:user.id},{isVerified: 'Y',date_verified:new Date(),status:"active"}).exec(function(usererr,userInfo){
                        if(userInfo){  
                            //return res.redirect(sails.config.INSTALEAF_FRONT_WEB_URL + "/auth/login-signup?email="+code+"&verify=true");
                            //return res.redirect(sails.config.INSTALEAF_FRONT_WEB_URL + "/auth/login-signup?email="+code+"&verify=true");
                            return res.redirect(sails.config.INSTALEAF_FRONT_WEB_URL + "?email="+code+"&verify=true");
                        } else {
                            return {"success": false, "error": {"code": 404,"message": constantObj.messages.INVALID_USER, "key":"INVALID_USER"} };       
                        }
                    })
                } else {
                    //return res.redirect(sails.config.INSTALEAF_FRONT_WEB_URL + "/auth/login-signup?email="+code+"&verify=false");
                    return res.redirect(sails.config.INSTALEAF_FRONT_WEB_URL + "?email="+code+"&verify=false");
                    //return res.redirect(sails.config.INSTALEAF_FRONT_WEB_URL + "/auth/login-signup?email="+code+"&verify=false");
                    //return {"success": false, "error": {"code": 404,"message": constantObj.messages.ALREADY_VERIFIED, "key":"ALREADY_VERIFIED"} };
                }
            }
        });
    },



    getAllUsers: function(req, res, next) {

        var search      = req.param('search');
        var sortBy      = req.param('sortBy');
        var page        = req.param('page');
        var count       = req.param('count');
        var status       = req.param('status');
        var roles       = req.param('roles');
        //var state       = req.param('state');

        var skipNo      = (page - 1) * count;
        var query       = {};
        if(sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
        if(status) query.status = status;

        if(roles) query.roles = roles;

        if (search) {
           query.$or = [

                {
                    fullName: {
                        'like': '%' + search + '%'
                    }
                },
                {
                    email: {
                        'like': '%' + search + '%'
                    }
                },
                {
                    username1: {
                        'like': '%' + search + '%'
                    }
                },
                {
                    address: {
                        'like': '%' + search + '%'
                    }
                },
                
                /*{
                    state: {
                        'like': '%' + search + '%'
                    }
                },*/
                {
                    mobile: parseInt(search)
                }
                
           ]
       }

       Users.count(query).exec(function(err, total) {
           if (err) {
               return res.status(400).jsonx({
                   success: false,
                   error: err
               });
           } else {
               Users.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, users) {
                    if (err) {
                        return res.status(400).jsonx({
                           success: false,
                           error: err
                        });
                    } else {
                        let counter = 0

                        async.each(users, function(user, callback) {
                            let reviewQuery = {};
                            reviewQuery.addedBy = user.id;
                            reviewQuery.isDeleted = false;
                            Reviews.count(reviewQuery)
                            .then(function(totalReviews){
                                user.totalReviews = totalReviews;
                                Favourite.count(reviewQuery)
                                .then(function(totalFavourite){
                                    user.totalFavourite = totalFavourite;
                                    callback();
                                })
                                .fail(function(errors){
                                    callback(errors);
                                })

                                //callback();
                                counter++;
                            })
                            .fail(function(error){
                                callback(error);
                            })


                            
                            
                        },function(error){
                            if(error){ 
                                console.log("error is here",error);
                            } else {
                                return res.jsonx({
                                    success: true,
                                    data: {
                                        users: users,
                                        total: total
                                    },
                                });
                            }
                        });

                        
                       
                    }
               })
           }
       })
    },

    userProfileData: function(req, res, next){
        
        let query     = {} ;
        query.id      = req.param('id') ;

        Users.findOne(query).exec(function(err, users) {
            if (err) {
                return res.status(400).jsonx({
                   success: false,
                   error: err
                });
            } else {
                return res.status(200).jsonx({ 
                    success: true,
                    data:  users
                });
            }         
        });    
    },

    updateUsername: function(req, res){
      
      console.log("rq",req.body)
        let query     = {} ;
        query.username1      = req.body.username1;

        Users.findOne(query).then(function(users) {
            if (users) {
                return res.status(400).jsonx({
                   success: false,
                   message: "Username already in use"
                });
            } else {
                return res.status(200).jsonx({ 
                    success: true,
                    message: "Username Available"
                });
            }         
        });    
    },
};