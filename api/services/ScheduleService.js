var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {
    mobGetSchedule: function(data,context,req,res){
        console.log(req.query)
        let query = {};
         query.schedule={$elemMatch: {date: req.query['date']}};
         Driverschedule.findOne(query).then(function(data) {
            if(data){
                return res.status(200).jsonx({
                    success: true,
                    data:data
                });
            }    
        });
    },
}