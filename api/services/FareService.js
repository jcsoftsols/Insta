
var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    saveFare: function(data,context){
        console.log(data);
        if((!data.name) || typeof data.name == undefined){ 
            return  res.status(404).jsonx({
                    success: false,
                    message: constantObj.category.NAME_REQUIRED
                });
        }
      
        let query = {}
        query.isDeleted = false,
        query.name = data.name,
        query.startpoint = data.startpoint,
        query.endpoint = data.endpoint,
        query.price = data.price,
        query.status =  "active";

        return Fare.create(data).then(function(catg) {
                return  {
                    success: true,
                    message: constantObj.category.CATEGORY_SAVED
                }
            })
            .fail(function(err){
                return {
                    success: false,
                    message: constantObj.category.CATEGORY_ALREADY_EXIST
                }   
            });
        },
    updateFare: function(data,context){

        let query = {};

        query.name = data.name;
        query.startpoint = data.startpoint;
        query.endpoint = data.endpoint;
        query.price = data.price;
        query._id = { $nin: [ ObjectID(data.id) ] }
        query._id = String(query._id)
        query.isDeleted = false;
        
        return Fare.findOne(query).then(function(fre) {
            if( fre == undefined ){

              return Fare.update(data.id,data).then(function(fres) {
                    return {
                        success: true,
                        category:fres,
                        message: constantObj.category.CATEGORY_ALREADY_EXIST
                    } 
                })
                .fail(function(err){
                    
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.category.ISSUE_IN_UPDATE
                        },
                    };
                    return {
                        success: false,
                        message: constantObj.category.ISSUE_IN_UPDATE
                    }    
                });

                
            } else {

                return  {
                        success: false,
                        message: constantObj.category.CATEGORY_ALREADY_EXIST
                }
                
            }
        }).fail(function(err){ 
                return  res.status(400).jsonx({
                        success: false,
                        message: err
                });  
        });
    },

    delete: function (data, context) {
        return API.Model(Fare).update(data.id,data)
        .then(function (categories) {
            var result;
            if(fares){
                return  {
                        success: true,
                        message: "Category deleted successfully."
                } 
            } else {
                return  {
                        success: false,
                        message: "There is some issue with the category deletion."
                }
                
            }
        });
    }

}; // End Delete service class