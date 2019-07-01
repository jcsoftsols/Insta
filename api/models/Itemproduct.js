var promisify = require('bluebird').promisify;
var bcrypt    = require('bcrypt-nodejs');


module.exports = {
    autoCreatedAt: true,
    attributes: {
    	name: {
            type: 'string',
            required: true
        },
        product_id:{
            model:'product'
        },
        dispensary_id:{
        	model:'item'
        },
        pre_roll:{
        	type:'integer',
            defaultsTo: 0
        },
        Eighth:{
        	type:'integer',
            defaultsTo: 0
        },
        quarter:{
        	type:'integer',
            defaultsTo: 0
        },
        half:{
        	type:'integer',
            defaultsTo: 0
        },
        ounce:{
        	type:'integer',
            defaultsTo: 0
        },
        category_id:{
        	model:'category'
        },
        details:{
        	type:'string',
            defaultsTo: ''
        },
        thc:{
        	type:'integer',
            defaultsTo: 0
        },
        cbd:{
        	type:'integer',
            defaultsTo: 0
        },
        image:{
        	type:'string',
            defaultsTo: ''
        },
        status:{
        	type:'string',
        	enum: ['active', 'deactive'],
            defaultsTo:'active'
        },
        isDeleted:{
        	type: 'boolean',
            defaultsTo:false
        },
        updatedAt: {
            type : 'date'
        },
        updatedBy: {
            model:'users'
        },
        createdBy: {
            model:'users'
        },
        brand_name:{
        	type:'string',
            defaultsTo: ''
        },
        grams:{
            type:'integer',
            defaultsTo: 0
        }
    }
};