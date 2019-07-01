module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        product_id:{
            model:'Marketplaceproduct'
        },
        quantity:{
            type:'integer',
            defaultsTo: 0
        },
        price:{
            type:'float',
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
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        }
    }
};

