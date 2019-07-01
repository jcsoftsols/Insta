


var moment = require('node-moment');
var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;
var distance = require('google-distance-matrix');

var getDistance = function(data,cb){
distance.key('AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA');
var origins = data.source_location;
var destinations = data.destination_location;
var values=0;
distance.matrix(origins, destinations, function (err, distances) {
    if (!err)
      var dataArray=  distances.rows[0].elements;
        var j=0;
    for(var i=0;dataArray.length >i;i++){
        if(dataArray[j].distance){
       values += dataArray[j].distance.value;
    if(j+1 == dataArray.length){
        cb({status:true,data:values/1000});
       }else{
        j++;
       }
   }else{
    j++;
   }
    }
})
}

var randomString =function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}

var getFare = function(array,cb){
    var response=[];
    var j=0;
    for(var i=0;i< array[0].length;i++){
        if(array[0][j].min < array[1] && array[0][j].max > array[1]){
            response.push({charge:array[0][j].charges});
        }
        if(j+1==array[0].length){
            if(response.length>0){
             cb({status:true,data:response});   
            }else{
            cb({status:false,data:response});
            }
        }else{
            j++;
        } 
    }

}



module.exports = {
    save: function(req, res) {
        var data = req.body;
            data.addedBy = req.identity.id;
            data.order_number =randomString(8, '#aA');
            Orders.create(data).then(function(response) {
                return res.status(200).jsonx({
                    success: true,
                    data:  response,
                    message: constantObj.orders.ORDER_SAVED                    
                });
            })
            .fail(function(err){
                return res.status(200).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.orders.ISSUE_IN_DB
                    },                   
                });   
            });
    },
    getFareCharges: function(req, res) {
       var data = req.body;
        getDistance(data,function(response){

        Settings.find({}).then(function(Setting) {
        getFare([Setting[0].fare_charges,response.data],function(Fare){
        if(Fare.status == true){
            data.fare_charges=Fare.data[0];
            data.distance =response.data;
            data.tax =Setting[0].tax;
            return res.status(200).jsonx({
                success: true,
                data:  data                    
            });
        }else{
            return res.status(200).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: 'we dont deliver in Your area'
                },                   
            });   
        }
        })
        });
        });
    },

    update: function(req, res) {
        API(OrdersService.updateOrder, req, res);
    },
    moborderstatusupdate: function(req, res) {
        API(OrdersService.moborderstatusupdate, req, res);
    },
    mobgetOrders: function(req, res){
        
    var start = moment(req.query['start']).startOf('day');
    var end = moment(req.query['end']).endOf('day');
      var id = req.identity.id;
        Orders.find({driver_id: id}).where({ "order_date" : { ">=" : new Date(start), "<" : new Date(end) }}).exec(function(err, data){
            if(err){
                return res.status(400).jsonx({
                    success: false,                   
                });
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data:  data,                    
                });
            }
        })
    },
    orderList:function(req,res){
        Orders.find({status:'active',isDeleted:false}).sort({name:1}).exec(function(err,orders){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: orders
                }); 
            }

        });
    },
    orderProductList:function(req,res){
        Orders.find({status:'active',isDeleted:false,addedBy:req.identity.id}).sort({createdAt:-1}).exec(function(err,orders){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: orders
                }); 
            }

        });
    },
    moborderList:function(req,res){
        var id = req.identity.id;
        Orders.find({status:'active',isDeleted:false,driver_id:id}).exec(function(err,orders){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: orders
                }); 
            }

        });
    },
    delete:function(req,res){
        API(OrdersService.delete,req,res);
    },
}