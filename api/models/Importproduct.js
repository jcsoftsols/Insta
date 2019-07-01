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
        category_id:{
            model:'category'
        },
        cities:{
            type:'array'
        },
        thc:{
            type:'integer',
            defaultsTo: 0
        },
        cbd:{
            type:'integer',
            defaultsTo: 0
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
        source:{
            type:'string'
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
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        }
    }
};

