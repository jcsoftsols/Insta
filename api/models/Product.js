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
            type: 'string'
        },
        itemId:{
            model:'item'
        },
        type: {
            type: 'string',
            defaultsTo: ""
        },
        reward_type: {
            type: 'string',
            defaultsTo: ""
        },
        slug: {
            type: 'string',
            required: true
        },
        meta_desc: {
            type: 'string'
        },
        meta_name: {
            type: 'string'
        },
        producer:{
            model:'producer'
        },
        second_name:{
            type:'string',
            defaultsTo: ""
        },
        category_id:{
            model:'category'
        },
        product_category:{
            type:'array'
        },
        product_subcategory:{
        type:'array'
        },
        product_subcategoryname:{
            type:'array'
        },
        terpene_profile:{
            type:'array'
        },
        city:{
            type:'string',
            defaultsTo: ""
        },
        thc:{
            type:'float',
            defaultsTo: 0.0   
        },
        cbd:{
            type:'float',
            defaultsTo: 0.0  
        },
        user_visits:{
            type:'integer',
            defaultsTo: 0  
        },
        detail:{
            type:'string',
            defaultsTo: ""  
        },
        image:{
            type:'string',
            defaultsTo: ""    
        },
        totalReviews:{
            type:'integer',
            defaultsTo: 0  
        },
        totalRating:{
            type: 'float',
            defaultsTo: 0.0   
        },
        addedBy:{
            model:'users' 
        },
        updatedBy:{
            model:'users'
        },
        deletedBy:{
            model:'users'
        },
        status: {
            type: 'string',   
            enum: ['active', 'deactive'],
            defaultsTo:'active'
        },
        isFeatured: {
            type: 'boolean',
            defaultsTo:false 
        },
        isForDelivery: {
            type: 'boolean',
            defaultsTo:false   
        },
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false 
        }
    }
};

