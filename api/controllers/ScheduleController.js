var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var moment = require('node-moment');
var constantObj = sails.config.constants;

var search =function(nameValue, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].date === nameValue) {
            return myArray[i];
        }
    }
}
module.exports = {
	mobGetSchedule: function(req,res){
        let query = {};
         query.driver_id=req.identity.id;
         Driverschedule.find(query).then(function(data) {
            if(data){
                return res.status(200).jsonx({
                    success: true,
                    data:data,
                    message:constantObj.schedule.SCHEDULE_DATA
                });
            }else{
            	return res.status(400).jsonx({
                    success: false,
                    message:constantObj.schedule.SCHEDULE_ERR
                });
            }    
        });
    },
    mobGetAvailablelist: function(req,res){
        let query = {};
         query.driver_id=req.identity.id;
         query.availability_time_from != '';
         Driverschedule.findOne(query).then(function(data) {
            if(data){
                return res.status(200).jsonx({
                    success: true,
                    data:data,
                    message:constantObj.schedule.AVAILABEL_DATA
                });
            }else{
            	return res.status(400).jsonx({
                    success: false,
                    message:constantObj.schedule.AVAILABEL_ERR
                });
            }    
        });
    },
    mobAddAvailable: function(req,res){
        var id=req.body.id;
        var data=req.body;
        Driverschedule.update( {id: id}, data).then(function(setting) {
                return res.status(200).jsonx({
                    success: true,
                    data:  setting,
                    message: constantObj.schedule.UPDATED_SCHEDULE,
                    key: 'UPDATED_SCHEDULE',
                    
                });
            })
            .fail(function(err){
                return res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: err
                    },
                });
            }); 
    },
    mobGetAvailablelist: function(req,res){
        let query = {};
         query.driver_id=req.identity.id;
         query.availability_time_from != '';
         Driverschedule.findOne(query).then(function(data) {
            if(data){
                return res.status(200).jsonx({
                    success: true,
                    data:data,
                    message:constantObj.schedule.AVAILABEL_DATA
                });
            }else{
                return res.status(400).jsonx({
                    success: false,
                    message:constantObj.schedule.AVAILABEL_ERR
                });
            }    
        });
    },
    mobTommorrowSchedule: function(req,res){
        let query = {};
        /*var time = new Date();
        var current_time =moment(time).format("hh:mmA")
        console.log(current_time)*/
         query.driver_id=req.identity.id;
         query.schedule_date=moment(req.query['date']).format("YYYY-MM-DD");
         Driverschedule.find(query).then(function(data) {
            if(data){
                return res.status(200).jsonx({
                    success: true,
                    data:data,
                    message:constantObj.schedule.SCHEDULE_DATA
                });
            }else{
            	return res.status(400).jsonx({
                    success: false,
                    message:constantObj.schedule.SCHEDULE_ERR
                });
            }    
        });
    },
    mobGetOpenShift: function(req,res){
        let query = {};
         query.replace_driver_id=req.identity.id;
         var start = moment(req.query['start']).startOf('day');
         var end = moment(req.query['end']).endOf('day');
         Driverschedule.find(query).where({ "schedule_date" : { ">=" : new Date(start), "<" : new Date(end) }}).then(function(data) {
            if(data){
                return res.status(200).jsonx({
                    success: true,
                    data:data,
                    message:constantObj.schedule.SCHEDULE_DATA
                });
            }else{
                return res.status(400).jsonx({
                    success: false,
                    message:constantObj.schedule.SCHEDULE_ERR
                });
            }    
        });
    },
	schedule: function(req, res){
	  let id  = req.query['id'];

		Driverschedule.find({id: id}).populate('driver_id').populate('replace_driver_id').exec(function(err, data){
			
			if(err){
				return res.jsonx({
					success: false
				})
			} else {
				return res.jsonx({
					success: true,
					data: data
				})
			}
		})
	},
    scheduleAll: function(req, res){
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');

      Driverschedule.find({skip:parseInt(skipNo) ,limit: parseInt(count),sort: sortBy}).populate('driver_id').populate('replace_driver_id').exec(function(err, data){
         Driverschedule.find({}).exec(function(err, totaldata){   
            if(err){
                return res.jsonx({
                    success: false
                })
            } else {
                return res.jsonx({
                    success: true,
                    data: data,
                    total: totaldata.length
                })
            }
        })
        })
    },
	saveSchedule: function(req, res){
 		let id = req.body.id ;
 		let data = req.body;
 		if( req.body.id ){
 			id = data.id;
 		}

        var date = moment(req.body.schedule_date).format("YYYY-MM-DD");
       
        data.schedule_date=date;
        var date1=date;
        var jsondata={};
		Driverschedule.findOne( {id: id} ).then(function( already ) {
			
		if( already && already != undefined ){

			Driverschedule.update( {id: id}, data).then(function(setting) {

	                return res.status(200).jsonx({
	                    success: true,
	                    code:200,
	                    data:  setting,
	                    message: constantObj.schedule.UPDATED_SCHEDULE,
	                    key: 'UPDATED_SCHEDULE',
	                    
	                });
	        })
	        .fail(function(err){
	    		return res.status(400).jsonx({
	          		success: false,
	          		error: {
	            		code: 400,
	            		message: err
	                },
	      		});
	    	});	
				
		}else{
            var j=0;
        for(var i=0;i<parseInt(req.body.day);i++){
            if(i === 0){
                data
            }else{
            date1 = new Date(date1);
            date1.setDate(date1.getDate() + 1);
            data.schedule_date=date1;
            }
            
			Driverschedule.create(data).then(function(setting) {
                if(j+1 == parseInt(req.body.day)){
	                return res.status(200).jsonx({
	                    success: true,
	                    code:200,
	                    data:  setting,
	                    message: constantObj.schedule.SAVED_SCHEDULE,
	                    key: 'SAVED_SCHEDULE',	                   
	                });
                }else{
                    j++;
                }
	        })
	        .fail(function(err){
	    		 return res.status(400).jsonx({
	          		success: false,
	          		error: {
	            		code: 400,
	            		message: err
	                },
	      		});
	    	});
            }	
	    }

	    });

	},	  

};
