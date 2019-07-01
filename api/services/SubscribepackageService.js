var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    saveSubscribePackage: function(data,context){

        if((!data.name) || typeof data.name == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.package.NAME_REQUIRED} };
        }
      
        let query = {}
        query.isDeleted = false,
        query.name = data.name,
        query.status =  "active";

        return Subscribepackages.findOne(query).then(function(cat) {
            
            if(cat) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.package.PACKAGE_ALREADY_EXIST
                    },
                };

            } else {
                return Subscribepackages.create(data).then(function(catg) {
                    return {
                        success: true,
                        code:200,
                        data: {
                            package:catg,
                            message: constantObj.package.PACKAGE_SAVED
                        },
                    };
                })
                .fail(function(err){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.package.PACKAGE_ALREADY_EXIST
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

    updateSubscribePackage: function(data,context){

        let query = {};

        query.name = data.name;
        query._id = { $nin: [ ObjectID(data.id) ] }
        query._id = String(query._id)
        query.isDeleted = false;
        
        return Subscribepackages.findOne(query).then(function(cat) {
            if( cat == undefined ){

              return Subscribepackages.update(data.id,data).then(function(cats) {
                    return {
                        success: true,
                        code:200,
                        data: {
                            category:cats,
                            message: constantObj.package.UPDATED_PACKAGE
                        },
                    };
                })
                .fail(function(err){
                    
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.package.ISSUE_IN_UPDATE
                        },
                    };   
                });

                
            } else {

                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.package.PACKAGE_ALREADY_EXIST
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
        return Subscribepackages.update(data.id,data)
        .then(function (packages) {
            var result;
            if(packages){
                result =  {
                        "sucess": {
                            "Code": 200,
                            "Message": constantObj.package.DELETE_SUCCESS
                        }
                    }
            } else {
              
                result =  {
                        "error": {
                            "Code": 301,
                            "Message": constantObj.package.ISSUE_IN_DELETE
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