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
        
        addedBy:{
            model:'users'
        },
        updatedBy:{
            model:'users'
        }
    }
};

