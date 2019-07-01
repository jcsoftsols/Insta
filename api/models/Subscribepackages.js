module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

  		name: {
            model: 'subscribename'
        },
        type: {
            model: 'subscribetype'
        },
        detail: {
            type: 'string'
        },
        price: {
            type: 'float',
            defaultsTo: 0.0
        },
        count: {
            type: 'integer',
            defaultsTo: 0
        },
        reviewStatus: {
            type: 'Boolean',
            defaultsTo: false
        },
        validateDay: {
            type: 'integer',
            defaultsTo: 0
        },
        dispensaries: {
            type: 'array'
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