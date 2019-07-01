var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
	
	getType: function(req, res){
		Subscribetype.find({}).exec(function(err, data){
			if(err){
				return res.status(400).jsonx({
                    success: false,                   
                });
			} else {
				return res.status(200).jsonx({
                    success: true,
                    data:  data,                    
                });
			}
		})
	},
	updateType: function(req, res){
		var id = req.body.id ;
 		var data = req.body;
 		data.addedBy = req.identity.id;
 		if( req.body.id ){
 			id = data.id;
 		}
		Subscribetype.update( {id: id}, data).then(function(setting) {
	               return res.status(200).jsonx({
	                    success: true,
	                    data:  setting,
	                    message: constantObj.messages.STYPE_UPDATE,
	                    
	                });
	        })
	        .fail(function(err){
	    		 return res.status(400).jsonx({
	          		success: false,
	          		error: {
	            		code: 400,
	            		message: err
	                },
	      		});
	    	});	
	},
	getTypeDetails: function(req, res){
	  	var id = req.param('id');
		Subscribetype.find({id: id}).exec(function(err, data){
			if(err){
				return res.status(400).jsonx({
                    success: false,                   
                });
			} else {
				return res.status(200).jsonx({
                    success: true,
                    data:  data,                    
                });
			}
		})
	},
	saveType: function(req, res){
 		var id = req.body.id ;
 		var data = req.body;
 		data.addedBy = req.identity.id;
 		if( req.body.id ){
 			id = data.id;
 		}
 		Subscribetype.create(data).then(function(data) {
	                return res.status(200).jsonx({
	                    success: true,
	                    data:  data,
	                    message: constantObj.messages.STYPE_SAVE                   
	                });
	        })
	        .fail(function(err){
	    		 return res.status(400).jsonx({
	          		success: false,
	          		error: {
	            		message: err
	                },
	      		});
	    	});	
	},
	getAllType: function(req, res, next) {

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

        Subscribetype.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Subscribetype.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, subtype) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                category: subtype,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    }   	  

};
