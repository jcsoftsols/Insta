module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

  		name: {
            type: 'string'
        },
        tagname: {
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