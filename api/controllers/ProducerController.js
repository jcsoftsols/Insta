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
       saveProducer: function(req,res){
        var data = req.body;
        if((!data.name) || typeof data.name == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.producer.NAME_REQUIRED} });
        }
      
        let query = {}
        query.isDeleted = false,
        query.name = data.name,
        query.city = data.city,
        query.status =  "active";

        Producer.findOne(query).then(function(pro) {
            if(pro) {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.producer.PRODUCER_ALREADY_EXIST
                    },
                });

            } else {
                Producer.create(data).then(function(produ) {
                    return res.jsonx({
                        success: true,
                        code:200,
                        data: {
                            data:produ,
                            message: constantObj.producer.PRODUCER_SAVED
                        },
                    });
                })
                .fail(function(err){
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.producer.PRODUCER_ALREADY_EXIST
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

    updateProducer: function(req,res){
        var data= req.body;
        Producer.update(data.id,data).exec(function(err,pros) {
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
                    message: constantObj.producer.UPDATED_PRODUCER
                },
            })   
            }
               
                
            });
    },
    produceries: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
   
        Producer.find(query).populate('city').sort(sortBy).exec(function(err, producer) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: producer
                });
            }
        })
    },
    getAllProducer: function(req, res) {

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

        Producer.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Producer.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, producer) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                data: producer,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    }    
    
}