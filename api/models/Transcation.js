module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {
        addedBy:{
            model:'users'
        },
        plan_id:{
            model:'subscribepackages'
        },
        order_details: {
            type: 'array'
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