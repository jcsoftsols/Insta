module.exports = {
    autoCreatedAt: true,
    autoUpdatedAt: true,
    attributes: {

  		txn_id: {
            type: 'string'
        },
        pck_name: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        price: {
            type: 'float',
            defaultsTo: 0.0
        },
        plan_id : {
            model:'subscribepackages'
        },
        count: {
            type: 'integer',
            defaultsTo: 0
        },
        reviewStatus: {
            type: 'Boolean',
            defaultsTo: true
        },
        val_day: {
            type: 'integer',
            defaultsTo: 0
        },
        exp_date: {
            type: 'date'
        },
        addedBy:{
            model:'users'
        },
        status: {
            type: 'string',
            enum: ['active', 'deactive'],
            defaultsTo:'active'
        }
    }
};