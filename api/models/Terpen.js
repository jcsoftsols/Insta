module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

  		name: {
            type: 'string'
        },
        image: {
            type: 'string'
        },
        description: {
            type: 'string'
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