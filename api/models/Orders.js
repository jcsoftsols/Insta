

module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

    order_number: {
            type: 'string'
    },
    order_details: {
            type: 'array'
    },
    invoice_number: {
            type: 'string'
    },
    totalprice:{
            type: 'string'
    },
    totalquanity: {
            type: 'string'
    },
    destination_location: {
            type: 'array'
    },
    source_location: {
            type: 'array'
    },
    payment_status: {
            type: 'string'
    },
    payment_mode: {
            type: 'string'
    },
    order_date: {
            type: 'date'
    },
    addedBy: {
            model: 'users'
    },
    updated_by: {
            type: 'string'
    },
    deleted_by: {
            type: 'string'
    },
    driver_id: {
        model: 'users'
    },
    assign_date: {
            type: 'string'
    },
    driver_status: {
            type: 'string'
    },
    transcation_id: {
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
    },
    isCancel: {
        type: 'Boolean',
        defaultsTo: false
    }
}
};
