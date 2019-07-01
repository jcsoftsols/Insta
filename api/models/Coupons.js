module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        percentage:{
            type:'integer',
            defaultsTo: 0
        },
        code:{
            type:'string'
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

