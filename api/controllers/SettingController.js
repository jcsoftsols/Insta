/**
 * SettingController
 *
 * @description :: Server-side logic for managing settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var constantObj = sails.config.constants;
var geodist = require('geodist')
var geoip = require('geoip-lite');
var NodeGeocoder = require('node-geocoder');
var distance = function (lat1,lon1,lat2,lon2){

 var avgdis=geodist({lat: parseFloat(lat2), lon: parseFloat(lon2)}, {lat: lat1, lon: lon1});
return avgdis*1.60934;
}

var addressLatLng = function (data,callback){
     var options = {
      provider: 'google',
      httpAdapter: 'https', // Default
      apiKey: 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA', // for Mapquest, OpenCage, Google Premier
      formatter: null         // 'gpx', 'string', ...
    };
    var geocoder = NodeGeocoder(options);
    // Using callback
    geocoder.geocode(data, function(err, data) {
     callback({success: true,data: data})
    });
}

module.exports = {
	getLatLng: function(req, res){

	 	var NodeGeocoder = require('node-geocoder');
 		var options = {
		  provider: 'google',
		  httpAdapter: 'https', // Default
		  apiKey: 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA', // for Mapquest, OpenCage, Google Premier
		  formatter: null         // 'gpx', 'string', ...
		};
		 
		var geocoder = NodeGeocoder(options);
		 
		// Using callback
		geocoder.geocode(req.params['address'], function(err, data) {
		 return res.jsonx({
					success: true,
					data: data
				}) 
		});
	},
	setting: function(req, res){

	 	let type  = req.param('type') ;

		Settings.find({}).exec(function(err, data){
			
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
	shoppingstatus: function(req, res){

		var query = {}
		var ip = req.ip;
		var data = [];
        ipArray = ip.split(":");
        var ipAddres = ipArray[3];
		query.status = 'active';
        query.isDeleted = false;
        query.isForDelivery = true;
        
        var ip = ipAddres;
        var geo = geoip.lookup(ip);

        var userlat=req.query['lat']?req.query['lat']:geo.ll[0];
        var userlng=req.query['lng']?req.query['lng']:geo.ll[1];
        var counter=0;
		City.find(query).then(function(city){

		for(var i=0;i < city.length;i++){
	 		addressLatLng(city[i].name,function(geoResponse){
            var lat=geoResponse.data[0].latitude;
            var lng=geoResponse.data[0].longitude;
                var kilometers=distance(lat,lng, parseFloat(userlat), parseFloat(userlng));
        	    //console.log('kilometers-----------',kilometers);
        	    if(kilometers <= constantObj.setting.DISTANCE){
                    data.push(city[counter]);
                }
        	if(counter+1 == city.length){

           
                if(data.length>0){
                	console.log(data.length)
                    return res.jsonx({
                        success: true,
                        message: constantObj.setting.SHOPPING_AVAILABLE
                    })
            	}else{
            		return res.jsonx({
                        success: false,
                        message: constantObj.setting.SHOPPING_NOT_AVAILABLE
                    })
            	}
            }
            counter++;
           	});
        }
        }).catch(function(err){
        return res.status(400).send({message: err});
    });
	},
	saveSetting: function(req, res){
 		let id = req.body.id ;
 		let data = req.body;

 		if( req.body.id ){
 			id = data.id;
 		}

		Settings.findOne( {id: id} ).then(function( already ) {

		if( already && already != undefined ){

			Settings.update( {id: id}, data).then(function(setting) {
	               return res.status(200).jsonx({
	                    success: true,
	                    code:200,
	                    data:  setting,
	                    message: constantObj.setting.UPDATED_SETITING,
	                    key: 'UPDATED_SETITING',
	                    
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

			Settings.create(data).then(function(setting) {
	                return res.status(200).jsonx({
	                    success: true,
	                    code:200,
	                    data:  setting,
	                    message: constantObj.setting.SAVED_SETITING,
	                    key: 'SAVED_SETITING',	                   
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
	    }

	    });

	},	

};

