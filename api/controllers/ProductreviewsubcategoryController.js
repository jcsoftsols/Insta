var _request = require('request');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    save: function(req, res) {
        var data = req.body;
            data.addedBy = req.identity.id;
            Productreviewsubcategory.create(data).then(function(response) {
                return res.status(200).jsonx({
                    success: true,
                    data:  response,
                    message: 'Product review tag has been created.'                    
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
		Productreviewsubcategory.update(data.id,data).then(function (Productreviewsubcategory) {
            
            if(Productcategory){
                return res.status(200).jsonx({
                success: true,
                data:  Productreviewsubcategory                    
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
    getProductreviewCategory: function(req, res) {
       var query = {};
       query.isDeleted=false;
       query.status='active';
       query.name=req.params['name'];
        
        Productreviewsubcategory.find(query).then(function(Productreviewsubcategory) {
        if(Productcategory){
        	return res.status(200).jsonx({
                success: true,
                data:  Productreviewsubcategory                    
            });
        }else{
            return res.status(200).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: 'No category found'
                },                   
            });   
        }
        })
    },
    getProductreviewCategoryDetail: function(req, res) {
       var query = {};
       query.isDeleted=false;
       query.status='active';
       query.id=req.params['id'];
        
        Productreviewsubcategory.find(query).then(function(Productreviewsubcategory) {
        if(Productcategory){
            return res.status(200).jsonx({
                success: true,
                data:  Productreviewsubcategory                    
            });
        }else{
            return res.status(200).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: 'No category found'
                },                   
            });   
        }
        })
    },
    getAllProductreviewsCategory: function(req, res, next) {

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

        Productreviewsubcategory.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Productreviewsubcategory.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, productcategory) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
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