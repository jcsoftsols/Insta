var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
	
	getCart: function(req, res){
	  	var id = req.identity.id;
		Cart.find({addedBy: id}).populate('product_id').exec(function(err, data){
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
	updateCart: function(req, res){
		var data = req.body;
		Cart.update(data.id,data).then(function(result) {
			return res.status(200).jsonx({
                success: true,
                data:  result,                    
            });
		})
		.fail(function(err){ 
            return res.status(400).jsonx({
                success: false,                   
            });   
        });
	},
	delete: function (req, res) {
        Cart.destroy({id:req.query.id}).then(function (cart) {
        
            //Itemproduct.destroy({createdBy:createdBy}).exec(function(err,data1){
            if(cart){
                return res.status(200).jsonx({
                    success: true,
                    code:200,
                    data: {
                        message: 'Cart Item has been deleted'
                    },                    
                });
                
            } else {
                return res.status(400).jsonx({
                    success: false,                   
                });
            }

        })
        .fail(function(err){ 
            return res.status(400).jsonx({
                    success: false,                   
                });   
        });
    },
	saveCart: function(req, res){
 		var id = req.body.id ;
 		var data = req.body;
 		data.addedBy = req.identity.id;
 		if( req.body.id ){
 			id = data.id;
 		} 
 		
		Cart.findOne( {addedBy: req.identity.id,product_id:req.body.product_id} ).then(function( already ) {
		if( already && already != undefined ){
			var new_quantity=parseInt(req.body.quantity)+ parseInt(already.quantity);

			Cart.update( {addedBy: req.identity.id,product_id:req.body.product_id}, {quantity:new_quantity}).then(function(setting) {
	               return res.status(200).jsonx({
	                    success: true,
	                    data:  setting,
	                    message: constantObj.cart.UPDATED_CART,
	                    
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
				
		}else{

			Cart.create(data).then(function(data) {
	                return res.status(200).jsonx({
	                    success: true,
	                    data:  data,
	                    message: constantObj.cart.SAVED_ITEM	                   
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
});
	},	  

};
