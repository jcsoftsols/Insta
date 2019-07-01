var promisify = require('bluebird').promisify;
var bcrypt    = require('bcrypt-nodejs');


module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
    	name: {
            type: 'string'
        },
        email:{
            type:'string'
        },
        code: {
            type: 'integer',
            unique: true
        },
        message:{
            type:'string',
            defaultsTo: ''
        },
        news_id:{
            model:'news'
        },
        comment_id:{
            model:'comments',
            defaultsTo: ''
        },
        shortUrl:{
            type:'string',
            defaultsTo: ''
        },
        originalUrl:{
            type:'string',
            defaultsTo: ''
        },
        status:{
        	type:'boolean',
        	defaultsTo:true
        },
        isDeleted:{
        	type: 'boolean',
            defaultsTo:false
        },
        updatedBy: {
            model:'users'
        },
        addedBy: {
            model:'users'
        }
    }
};