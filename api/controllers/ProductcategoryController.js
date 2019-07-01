var _request = require('request');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    save: function(req, res) {
        var data = req.body;
            data.addedBy = req.identity.id;
            Productcategory.create(data).then(function(response) {
                return res.status(200).jsonx({
                    success: true,
                    data:  response,
                    message: 'Product category has been creted.'                    
                });
            })
            .fail(function(err){
                return res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: 'Database issue.'
                    },                   
                });   
            });
    },
    update: function(req,res){
    	var data=req.body;

        data.updatedBy = req.identity.id;
		Productcategory.update(data.id,data).then(function (Productcategory) {
            
            if(Productcategory){
                return res.status(200).jsonx({
                success: true,
                data:  Productcategory                    
            	});
                
            } else {
                return res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: 'Database issue.'
                    },                   
                });
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
    getProductCategory: function(req, res) {
       var query = {};
       query.isDeleted=false;
       query.status='active';
       query.name=req.params['name'];
        
        Productcategory.find(query).then(function(Productcategory) {
        if(Productcategory){
        	return res.status(200).jsonx({
                success: true,
                data:  Productcategory                    
            });
        }else{
            return res.status(400).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: 'No category found'
                },                   
            });   
        }
        })
    },
    getProductSubcategoryDeatil: function(req, res) {
       var query = {};
       query.isDeleted=false;
       query.status='active';
       query.id=req.params['id'];
        
        Productcategory.find(query).then(function(Productcategory) {
        if(Productcategory){
            return res.status(200).jsonx({
                success: true,
                data:  Productcategory                    
            });
        }else{
            return res.status(400).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: 'No detail found'
                },                   
            });   
        }
        })
    },
    getAllProductCategory: function(req, res, next) {

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

        Productcategory.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Productcategory.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, productcategory) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.status(200).jsonx({
                            success: true,
                            data: {
                                category: productcategory,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    },
    
}