
var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");
var path = require('path');

module.exports = {
    
    updateOrder: function(data,context){

        data.updatedBy = context.identity.id;

        return Orders.update(data.id,data).then(function (productInfo) {
            
            if(productInfo){
                return {
                    success: true,
                    code:200,
                    data: {
                        product:productInfo,
                        message: constantObj.orders.UPDATED_ORDER
                    },
                };
                
            } else {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.orders.ISSUE_IN_DB
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
    moborderstatusupdate: function(data,context,req,res){
        data=req.body;
        data.updatedBy = context.identity.id;
        Orders.update(data.id,data).then(function (orderInfo) {
            
            if(orderInfo){
                return res.status(200).jsonx({
                    success: true,
                    product:orderInfo,
                    message:constantObj.orders.UPDATED_ORDER
                });
                
            } else {
                return res.status(400).jsonx({
                    success: false,
                    message: constantObj.orders.ISSUE_IN_DB
                });
            }

        })
        .fail(function(err){ 
            return res.status(400).jsonx({
                    success: false,
                    message: err
            });   
        });
    },    
    delete: function (data, context) {
        data.deletedBy = context.identity.id;
        data.isDeleted = true;

        return Orders.update(data.id,data).then(function (productInfo) {
            
            if(productInfo){
                return {
                    success: true,
                    code:200,
                    data: {
                        product:productInfo,
                        message: constantObj.orders.DELETED_ORDER
                    },
                };
                
            } else {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.orders.ISSUE_IN_DB
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
    
    
            
}