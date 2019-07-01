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

        business_type: {
            type: 'string'
        },
        subject:{
            type:'string'
        },
        desc:{
            type:'string'
        },
        userslist:{
            type:'array'
        }
    }
};

