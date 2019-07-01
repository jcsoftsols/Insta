module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

        product_id: {
            model:'product'
        },        
        type:{
            type:'string'
        },
        tags:{
            type:'array'
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

