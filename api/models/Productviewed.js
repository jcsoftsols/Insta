module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

        productId: {
            model:'product'
        },
        userId: {
            model:'users'
        },
        ipAddress:{
            type:'string'
        }        
    }
};