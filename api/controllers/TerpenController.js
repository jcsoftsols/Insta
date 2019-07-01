/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
       saveTerpen: function(req,res){
        var data = req.body;
        if((!data.name) || typeof data.name == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.terpen.NAME_REQUIRED} });
        }
      
        let query = {}
        query.isDeleted = false,
        query.name = data.name,
        query.city = data.city,
        query.status =  "active";

        Terpen.findOne(query).then(function(pro) {
            if(pro) {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.terpen.TERPEN_ALREADY_EXIST
                    },
                });

            } else {
                Terpen.create(data).then(function(produ) {
                    return res.jsonx({
                        success: true,
                        code:200,
                        data: {
                            data:produ,
                            message: constantObj.terpen.TERPEN_SAVED
                        },
                    });
                })
                .fail(function(err){
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.terpen.TERPEN_ALREADY_EXIST
                        },
                    });   
                });
            }
        }).fail(function(err){ 
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: err
                    },
                });   
        });
    },

    updateTerpen: function(req,res){
        var data= req.body;
        Terpen.update(data.id,data).exec(function(err,pros) {
            if(err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            }else{
              return res.jsonx({
                success: true,
                code:200,
                data: {
                    data:pros,
                    message: constantObj.terpen.UPDATED_TERPEN
                },
            })   
            }
               
                
            });
    },
    terpens: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
   
        Terpen.find(query).sort(sortBy).exec(function(err, terpen) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: terpen
                });
            }
        })
    },
    getAllTerpen: function(req, res) {

        var search = req.param('search');
        var sortBy = req.param('sortBy');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';

        if (search) {
            query.$or = [{
                    name: {
                        'like': '%' + search + '%'
                    }
                }

            ]
        }       

        Terpen.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Terpen.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, terpen) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                data: terpen,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    },
    terpenDetail:function(req,res){
        var data = req.params;
        if((!data.id) || typeof data.id == undefined){ 
          return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.messages.PRODUCT_ID_REQUIRED} });
        }
        var query = {id:data.id}
        console.log(query);
        Terpen.findOne(query).then(function (review_detail) {
            if(review_detail){
               return res.jsonx({
                    success: true,
                    data: {
                        key:review_detail,
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED
                    }
                })
            }else{
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.NO_PRODUCT,
                    }
                })
            }
        })
    },    
    
} 