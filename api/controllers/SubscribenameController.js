var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
	
	getName: function(req, res){
	  	var id = req.identity.id;
		Subscribename.find({addedBy: id}).exec(function(err, data){
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
	getNameDetails: function(req, res){
	  	var id = req.param('id');
		Subscribename.find({id: id}).exec(function(err, data){
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
	updateName: function(req, res){
		var id = req.body.id ;
 		var data = req.body;
 		data.addedBy = req.identity.id;
 		if( req.body.id ){
 			id = data.id;
 		}
		Subscribename.update( {id: id}, data).then(function(setting) {
	               return res.status(200).jsonx({
	                    success: true,
	                    data:  setting,
	                    message: constantObj.messages.SNAME_SAVE,
	                    
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
	saveName: function(req, res){
 		var id = req.body.id ;
 		var data = req.body;
 		data.addedBy = req.identity.id;
 		if( req.body.id ){
 			id = data.id;
 		}
 		Subscribename.create(data).then(function(data) {
	                return res.status(200).jsonx({
	                    success: true,
	                    data:  data,
	                    message: constantObj.messages.SNAME_SAVE  	                   
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
	 getAllName: function(req, res, next) {

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

        Subscribename.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Subscribename.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, subname) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                category: subname,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    }   

};
