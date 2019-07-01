var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
	
	checkCoupon: function(req, res){
		Coupons.find({code: req.query['coupon_code']}).exec(function(err, data){
			if(err){
				return res.status(400).jsonx({
                    success: false,                   
                });
			} else {
				if(data.length){
				return res.status(200).jsonx({
                    success: true,
                    data:  data,                    
                });
				}else{
				return res.status(404).jsonx({
                    success: false,
                    error:  {
                    	message:'No Coupon Found.'
                    },                    
                });	
				}
			}
		})
	},
	saveCoupon: function(req,res){
        var data = req.body;
        Coupons.create(data).then(function(response) {
            return res.status(200).jsonx({
                    success: true,
                    data:  response,                    
            });
        	})
            .fail(function(err){
                return res.status(404).jsonx({
                    success: false,
                    error:  {
                    	message:'No Coupon Found.'
                    },                    
                });  
            });
        },
	

};
