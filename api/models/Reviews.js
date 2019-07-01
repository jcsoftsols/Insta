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

        product_id: {
            model:'product'
        },
        item_id: {
            model:'item'
        },
        
        type:{
            type:'string'
        },
        rating:{
            type:'integer'
        },
        detail:{
            type:'string'
        },
        replies:{
            type:'string',
            defaultsTo: ''
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
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        },
        isRevoked: {
            type: 'Boolean',
            defaultsTo: false
        }
    }
};

