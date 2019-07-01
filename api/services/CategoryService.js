/**
  * #DESC:  In this class/files crops related functions
  * #Request param: Crops add form data values
  * #Return : Boolen and sucess message
  * #Author: JCsoftware Solution
*/

var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    saveCategory: function(data,context){

        if((!data.name) || typeof data.name == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.category.NAME_REQUIRED} };
        }
      
        let query = {}
        query.isDeleted = false,
        query.name = data.name,
        query.status =  "active";

        return Category.findOne(query).then(function(cat) {
            
            if(cat) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.category.CATEGORY_ALREADY_EXIST
                    },
                };

            } else {
                return Category.create(data).then(function(catg) {
                    return {
                        success: true,
                        code:200,
                        data: {
                            category:catg,
                            message: constantObj.category.CATEGORY_SAVED
                        },
                    };
                })
                .fail(function(err){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.category.CATEGORY_ALREADY_EXIST
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

    updateCategory: function(data,context){

        let query = {};

        query.name = data.name;
        query._id = { $nin: [ ObjectID(data.id) ] }
        query._id = String(query._id)
        query.isDeleted = false;
        
        return Category.findOne(query).then(function(cat) {
            if( cat == undefined ){

              return Category.update(data.id,data).then(function(cats) {
                    return {
                        success: true,
                        code:200,
                        data: {
                            category:cats,
                            message: constantObj.category.UPDATED_CATEGORY
                        },
                    };
                })
                .fail(function(err){
                    
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.category.ISSUE_IN_UPDATE
                        },
                    };   
                });

                
            } else {

                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.category.CATEGORY_ALREADY_EXIST
                    },
                };
                
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

    delete: function (data, context) {
        return API.Model(Category).update(data.id,data)
        .then(function (categories) {
            var result;
            if(categories){
                result =  {
                        "sucess": {
                            "Code": 200,
                            "Message": "Category deleted successfully."
                        }
                    }
            } else {
              
                result =  {
                        "error": {
                            "Code": 301,
                            "Message": "There is some issue with the category deletion."
                        }
                    }
            }
        return {
                "Status": true,
                  result
                };
        });
    }

}; // End Delete service class