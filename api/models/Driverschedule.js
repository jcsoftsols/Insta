module.exports = {

  autoCreatedAt: true,
  autoUpdatedAt: true,
    attributes: {
		driver_id: {
            model:'users'
        },
        replace_driver_id: {
            model:'users'
        },
        schedule_date:{
            type:'date'
        },
        schedule_time_to:{
            type:'string'
        },
        schedule_time_from:{
            type:'string'
        },
        openshift_time_to:{
            type:'string'
        },
        openshift_time_from:{
            type:'string'
        },
        availability_time_to:{
            type:'string'
        },
        availability_time_from:{
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
