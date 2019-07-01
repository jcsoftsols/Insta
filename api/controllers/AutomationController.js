/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _request = require('request');
var ObjectId = require('mongodb').ObjectID;


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

module.exports = {
    save: function(req, res) {

        var userType = req.body.business_type;
        var async = require('async');

        let query = {};
        query.isDeleted = false;

        if(req.body.business_type == 'Brand'){
            query.roles = "B";
        } else if(req.body.business_type == 'Dispensary') {
            query.roles = "D";
        } else if(req.body.business_type == 'Doctor'){
            query.roles = "DR";
        }else {
            return {success: false, code:400}
        }

        Users.find(query).then(function (userslist) {

            if(userslist.length > 0){
                req.body.userslist = userslist;

                 var msg = "Message has been delivered";

                async.each(userslist, function(user,callback) {
                    message = 'Hello ';
                    message += user.username1;
                    message += ",";
                    message += '<br/><br/>';
                    message += req.body.desc;
                    message += '<br/><br/>';
                    message += 'Regards';
                    message += '<br/>';
                    message += 'InstaLeaf Support Team';

                    transport.sendMail({
                        from: sails.config.appSMTP.auth.user,
                        to: user.username,
                        subject: req.body.subject,
                        html: message
                    }, function (err, info) {
                        if(err){
                            console.log("err is",err)
                            callback(err)
                        } else{
                            console.log("access here is")
                            callback();
                        }
                    });
                },function(error){
                    if(error){ 
                        return res.status(400).jsonx({
                            success: false,
                            error:{
                                message:error
                            }
                        });
                    }
                    Automation.create(req.body).then(function (mailData) {
                        return res.jsonx({
                            success: true,
                            data: {
                                message:"Mail has been sent successfully."
                            },
                        });
                    }); 
                });
                
            } else {
                return res.status(400).jsonx({
                    success: false,
                    error:{
                        message:constantObj.product.NO_USER_IN_THIS_GROUP
                    }
                });
            }

        })
    },

    getAllMessageList: function(req, res, next) {

        var item = req.param('item');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        query={};
      
        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        if (item) {
            query.$or = [
                            { business_type: {$regex: item, '$options' : 'i'}},
                            { subject:{$regex: item, '$options' : 'i'}},
                            { desc:{$regex: item, '$options' : 'i'}}
                        ]
        }
        
        Automation.native(function(err, messageList) {
            messageList.aggregate([
                
                {
                    $project: {
                        id: "$_id",
                        business_type: "$business_type",
                        subject: "$subject",
                        desc: "$desc",
                        createdAt:"$createdAt"
                        
                    }
                },
                {
                    $match: query
                }
            ],function (err, totalresults) {
                if (err){
                    
                    return res.status(400).jsonx({
                        success: false,
                        error: err
                    }); 
                } else {

                    messageList.aggregate([
                        {
                            $project: {
                                id: "$_id",
		                        business_type: "$business_type",
		                        subject: "$subject",
		                        desc: "$desc",
		                        createdAt:"$createdAt"
                            }
                        },
                        {
                            $match: query
                        },  
                        {
                            $sort: sortquery
                        },
                        {
                            $skip: skipNo
                        },
                        {
                            $limit: count
                        }
                    ],function (err, results) {

                        
                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            return res.jsonx({
                                success: true,
                                data: {
                                    data: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    },   
};