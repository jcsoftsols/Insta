module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

  		name: {
            type: 'string'
        },
        addedBy : {
            model:'users'
        },
        isDeleted: {
            type: 'Boolean',
            defaultsTo: false
        }
    }
};