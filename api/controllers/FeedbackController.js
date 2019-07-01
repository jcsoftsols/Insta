var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
	
	mobgetFeedback: function(req, res){
		var moment = require('node-moment');
	var start = moment(req.query['start']).startOf('day');
    var end = moment(req.query['end']).endOf('day');
	  var id = req.identity.id;
		Feedback.find({driver_id: id}).where({ "createdAt" : { ">=" : new Date(start), "<" : new Date(end) }}).populate('addedBy').exec(function(err, data){
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
	getFeedback: function(req, res){
	var id = req.query['driver_id'];
		Feedback.find({driver_id: id}).populate('addedBy').exec(function(err, data){
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
	setFeedback: function(req, res){
 		
 		let data = req.body;
		Feedback.create(data).then(function(data) {
                return res.status(200).jsonx({
                    success: true,
                    data:  data	                   
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
}
};

