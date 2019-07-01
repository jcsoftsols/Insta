module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

        productId: {
            model:'marketplaceproduct'
        },
        userId: {
            model:'users'
        },
        ipAddress:{
            type:'string'
        }        
    }
};  