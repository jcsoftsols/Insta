var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

function addDays(theDate, days) {
    return new Date(theDate.getTime() + days*24*60*60*1000);
}
module.exports = {
	
	getPlan: function(req, res){
	  	var id = req.identity.id;
		Usersubscription.find({addedBy: id}).populate('addedBy').populate('plan_id').sort({'createdAt':-1}).exec(function(err, data){
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
	getTxn: function(req, res){
	  	var id = req.identity.id;
		Transcation.find({addedBy: id}).populate('addedBy').populate('plan_id').sort({'createdAt':-1}).exec(function(err, data){
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
	getActivePlan: function(req, res){ 
	  	var id = req.identity.id;
	  	var d = new Date();
		Usersubscription.find({addedBy: id,status:'active'}).populate('plan_id').populate('addedBy').sort({'createdAt':-1}).limit(1).exec(function(err, data){
			if(err){
				return res.status(400).jsonx({
                    success: false,
                    error: {  
                    	message: err 
                    }                
                });
			} else {
				if(data.length && d <= data[0].exp_date){
					return res.status(200).jsonx({
	                    success: true,
	                    data:  data,                    
                	});
				}else{
					return res.status(200).jsonx({
	                    success: false,
	                    error: {
	                    	message: constantObj.plan.NO_FOUND 
	                    }                   
                	});
				}
				
			}
		})
	},
	getPlanDetail: function(req, res){
	  	var query={};
	  	query.id = req.param('id');
		Usersubscription.find(query).populate('plan_id').populate('addedBy').exec(function(err, data){
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
	savePlan: function(req, res){
 		var data = req.body;
		data.exp_date = addDays(new Date(), parseInt(data.val_day));
 		data.addedBy = req.identity.id;
		Usersubscription.create(data).then(function(data) {
                return res.status(200).jsonx({
                    success: true,
                    data:  data,
                    message: constantObj.plan.SAVED_PLAN	                   
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

};
