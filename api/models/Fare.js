
module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

  		name: {
            type: 'string'
        },
        startpoint: {
            type: 'string'
        },
        endpoint: {
            type: 'string'
        },
        price: {
            type: 'string',
            defaultsTo:0
        },
        status: {
            type: 'string',
            enum: ['active', 'deactive'],
            defaultsTo:'active'
        },
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        }
    }
};