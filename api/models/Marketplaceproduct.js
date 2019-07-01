/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        code: {
            type: 'string',
            required: true
        },
        category_id:{
            model:'category'
        },
        slug: {
            type: 'string',
            defaultsTo: ""
        },
        metaName: {
            type: 'string',
            defaultsTo: ""    
        },
        metaDesc: {
            type: 'string',
            defaultsTo: ""
        },
        shortDescription: {
            type: 'string',
            defaultsTo: ""
        },
        description:{
            type:'string',
            defaultsTo: ""
        },
        price:{
            type: 'float',
            defaultsTo: 0.0 
        },
        quantity:{
            type:'integer',
            defaultsTo: 0  
        },
        images:{
            type:'array'   
        },
        inStock:{
            type: 'boolean',
            defaultsTo:true 
        },
        isSpecial:{
            type: 'boolean',
            defaultsTo:false   
        },
        addedBy:{
            model:'users' 
        },
        isFeatured: {
            type: 'boolean',
            defaultsTo:false 
        },
        status: {
            type: 'string',   
            enum: ['active', 'deactive'],
            defaultsTo:'active'
        },
        isDeleted:{
            type: 'boolean',
            defaultsTo:false  
        },
        deletedBy:{
            model:'users'  
        },
        start_date:{
            type: 'date',
            defaultsTo:null
        },
        end_date:{
            type: 'date',
            defaultsTo:null
        }
    }
};

