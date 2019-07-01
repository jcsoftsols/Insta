

module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

    product_id: {
            model: 'product'
    },
    point: {
            type: 'float'
    },
    user_id: {
            model:'users'
    },
    destination_location: {
            type: 'string'
    },
    source_location: {
            type: 'string'
    },
    addedBy:{
            model:'users'
    },
    updated_by: {
            type: 'string'
    },
    transcation_id: {
            type: 'string'
    },
    status: {
        type: 'string',
        enum: ['pending', 'approved','cancelled'],
        defaultsTo:'pending'
    },
    isDeleted: {
        type: 'Boolean',
        defaultsTo: false
    }
}
};
