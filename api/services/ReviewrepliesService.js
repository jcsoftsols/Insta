/**
  * #DESC:  In this class/files crops related functions
  * #sRequest param: Crops add form data values
  * #Return : Boolen and sucess message
  * #Author: JCsoftware Solution
*/

var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    saveReplies: function(data,context){
        if((!data.review_id) || typeof data.review_id == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.product.REVIEW_ID_REQUIRED} };
        }
        data.repliedBy = context.identity.id;
        
        return Reviewreplies.findOne({review_id:data.review_id,isDeleted:false,status:"active",repliedBy:context.identity.id}).then(function(replies) {
            
            if(replies) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message1: constantObj.product.REPLY_ALREADY_EXIST
                    },
                };

            } else {
                return Reviewreplies.create(data).then(function(prod) {

                        console.log("testing estin")
                    if(prod){
                        var comment={};
                        comment.replies = data.detail;
                        console.log("comment is",comment)
                        return Reviews.update(prod.review_id,comment).then(function (reviewSave) {
                            console.log("reviewSave",reviewSave)
                            return {
                                success: true,
                                code:200,
                                data: {
                                    product:prod,
                                    message: constantObj.product.REPLY_SAVED
                                },
                            };
                        })  
                    }
                    
                })
                .fail(function(err){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.product.ISSUE_IN_DB
                        },
                    };   
                });
            }
        }).fail(function(err){ 
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: err
                    },
                };   
        });
    },
    
    deleteReplies: function (data, context) {
        data.deletedBy = context.identity.id;
        data.isDeleted = true;

        return Reviewreplies.update(data.id,data).then(function (replyInfo) {
            
            if(replyInfo){
                return {
                    success: true,
                    code:200,
                    data: {
                        product:replyInfo,
                        message: constantObj.product.DELETED_REPLY
                    },
                };
                
            } else {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.product.ISSUE_IN_DB
                    },
                };
            }

        })
        .fail(function(err){ 
            return {
                success: false,
                error: {
                    code: 400,
                    message: err
                },
            };   
        });
    },

       

}; // End Delete service class