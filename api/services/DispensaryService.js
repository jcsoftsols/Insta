var Promise = require('bluebird'),
promisify = Promise.promisify;
var bcrypt    = require('bcrypt-nodejs');
//var commonServiceObj = require('./commonService');
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const iplocation = require("iplocation").default;
var geoip = require('geoip-lite');
var satelize = require('satelize');
var csv=require('csvtojson');
var path = require('path');
var fs = require("fs");
var arraySort = require('array-sort');
var MapboxClient = require('mapbox');
var geocoding = require('mapbox-geocoding')
var NodeGeocoder = require('node-geocoder');
var geodist = require('geodist')
geocoding.setAccessToken('sk.eyJ1IjoiamNjdCIsImEiOiJjam92cXlvZ3Uwa2JuM3JvZHN6NTNpbmNsIn0.WhrkNdtvsyol2Oz_bzMHSw');

var client = new MapboxClient('sk.eyJ1IjoiamNjdCIsImEiOiJjam92cXlvZ3Uwa2JuM3JvZHN6NTNpbmNsIn0.WhrkNdtvsyol2Oz_bzMHSw');



var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));

var checkUser = function(adminId,userData,cb){
    //console.log("userData",userData)
    if(userData.username1 !=''){
        Users.findOne({username1:userData.username1}).then(function (user) {
            if(typeof user !='undefined' && user.username1){
                return cb({status:true,user_id:user.id});
            }else{
                Users.create(userData).then(function (newuser) {
                    return cb({status:true,user_id:newuser.id});
                })
            }
        })
    }else{
        return cb({status:true,user_id:adminId});
    }
   
}

var distance = function (lat1,lon1,lat2,lon2){

 var avgdis=geodist({lat: parseFloat(lat2), lon: parseFloat(lon2)}, {lat: lat1, lon: lon1});
return avgdis*1.60934;

/*3959 * Math.acos (
      cos ( radians(lat1) )
      * cos( radians( lat2 ) )
      * cos( radians( lng2 ) - radians(lng1) )
      + sin ( radians(lat1) )
      * sin( radians( lat2 ) )*/

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
        if(err){
                callback({status:false,message:err});
            }else{
     callback({success: true,data: data}) 
            }
    });
}

var emailGeneratedCode = function (options,callback) { //email generated code 
    //url = options.verifyURL,
    var username = options.username1,
    password = options.password;

    message = 'Hello ';
    message += username;
    message += ",";
    message += '<br/><br/>';
    message += 'Your account has been created. Please login with the following credentials.';
    message += '<br/><br/>';
    message += 'Username is : ' + username;
    message += '<br/>';
    message += 'Password : ' + password;
    message += '<br/><br/>';
    message += 'Regards';
    message += '<br/>';
    message += 'Support Team';

    console.log("message",message)

    transport.sendMail({
        from: sails.config.appSMTP.auth.user,
        to: email,
        subject: 'InstaLeaf Registration',
        html: message
    }, function (err, info) {
        console.log("errro is ",err, info);
    });

    callback({success: true, code:200, data:{message: constantObj.messages.ADDED_SUCCESSFULL, /* data: url */ }});
};

var getLatLng = function(data,callback){
    var geodata = {};
    if(data.businessType !='brand'){
        /*client.geocodeForward(data.address, function(err, GeoData, res) {
            if(err){
                callback({status:false,message:err});
            }else{
                // geo data
                if(GeoData.features.length==0){
                    geodata.lat = 0;
                    geodata.lng = 0;
                    callback({status:true,message:geodata});
                }else{
                    geodata.lng = GeoData.features[0].geometry.coordinates[0];
                    geodata.lat = GeoData.features[0].geometry.coordinates[1];
                    callback({status:true,message:geodata});
                }
            }
        })*/
        var NodeGeocoder = require('node-geocoder');
        var options = {
          provider: 'google',
          httpAdapter: 'https', // Default
          apiKey: 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA', // for Mapquest, OpenCage, Google Premier
          formatter: null         // 'gpx', 'string', ...
        };
         
        var geocoder = NodeGeocoder(options);
        // Using callback
        console.log('address---',data)
        geocoder.geocode(data, function(err, data) {
            if(err){
                callback({status:false,message:err});
            }else{
                if(data.length >0){
                geodata.lat = data[0].latitude;
                geodata.lng = data[0].longitude; 
                 callback({success: true,message: geodata})   
                }else{
                callback({status:false,message:'Please check your address'});    
                }

                
        
         } 
        });
    }else{
        geodata.lat = 0;
        geodata.lng = 0;
        callback({status:true,message:geodata});
    }
    
}

module.exports = {
    decodeBase64Image: function(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches) {

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');
        } else {
            response.error = constantObj.messages.INVALID_IMAGE;
        }

        return response;
    },
    bulkUpload:function(data,context,req,res){
        
        var uuid = require('uuid');
        var randomStr = uuid.v4();
        var date = new Date();
        var currentDate = date.valueOf();
        var name = randomStr + "-" + currentDate;

        var csvdata = req.body.data;
        imageBuffer = this.decodeBase64Image(csvdata);

        var imageType = imageBuffer.type;

        var typeArr = new Array();
        typeArr = imageType.split("/");
        var fileExt = typeArr[1];

        if (fileExt === 'csv') {

            //console.log("fileExt",fileExt)
            var fullPath = name + '.' + fileExt;
            var imagePath = 'assets/importData/' + name + '.' + fileExt;
            //console.log("imagePath",imagePath,"++++=++===========>",fullPath)

            fs.writeFile(imagePath, imageBuffer.data, function(fileerr, filedata) {
                targetPath = path.resolve(imagePath);
                var csvFilePath=targetPath;
                var successData = [];
                var failData = [];
                var alreadyExist = [];
                if (fileerr) {
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: fileerr
                        },
                    });
                } else {
                    csv()
                    .fromFile(csvFilePath)
                    .then((jsonObj)=>{
                        var len = jsonObj.length;
                        var counter = 0;
                        var userRole;
                        jsonObj.forEach(function(item,index){
                          /*  console.log("item=========>>>>>",item)*/
                            if(item.Business_Type == "Doctor" || item.Business_Type == "doctor" || item.Business_Type == "DOCTOR"){
                                userRole = "DR"
                            } else if(item.Business_Type == "Dispensary" || item.Business_Type == "dispensary" || item.Business_Type == "DISPENSARY"){
                                userRole = "D"
                            } else if(item.Business_Type == "Brand" || item.Business_Type == "brand" || item.Business_Type == "BRAND"){
                                userRole = "B"
                            } else{
                                userRole = "D1"
                            }
                            var adminId = context.identity.id;
                            var userdata = {username1:item.Username,date_verified:new Date(),email:item.Email,username:item.Email,password:42434445,firstName:item.Username,lastName:item.Username,Type:userRole,roles:userRole,fullName:item.Username,mobile:item.Phone_Number,isVerified:"Y",status:'active'}
                            
                            checkUser(adminId,userdata,function(userResponse){
                                var addedBy = userResponse.user_id;
                                var dis_type = item.Business_Type;
                                var scheduler = item.Hours_of_Operation;
                                var recreation = null;
                                var recreational = null;
                                var medical = null;
                                if(item.Dispensary_Category=='Recreational'){
                                    recreation = true;
                                    recreational = true;
                                }
                                if(item.Dispensary_Category=='Medical'){
                                    medical = true;
                                }
                                item.businessType = dis_type.toLowerCase();
                                
                                var geoData = {address:item.Address}
                                var importData = [];
                                //console.log("===importData ",importData);
                                var completeAddress =item.Address+ ',' +item.city+','+item.postal_code;
                                getLatLng(completeAddress,function(geoResponse){
                                    if(geoResponse.status==false){
                                        item.lat = 0;
                                        item.lng = 0;
                                    }else{
                                        item.lat = geoResponse.message.lat;
                                        item.lng = geoResponse.message.lng;
                                    }
                                    /*console.log("===item 1234",item);*/

                                    importData.push({name:item.Name,lat:item.lat,lng:item.lng,address:item.Address,city:item.City,postal_code:item.Postal_Code,email:item.Email,mobile:item.Phone_Number,website:item.Website,about_us:item.about_us,source:'file',addedBy:addedBy,businessType:item.businessType,recreation:recreation,recreational:recreational});

                                    /*console.log("===importData ",importData);*/
                                    /*import_*/
                                    Item.findOne({address:item.Address}).exec(function(errData,isdata){
                                        if(errData){
                                            failData.push(errData); 
                                        }else{
                                           if(isdata){
                                                alreadyExist.push(importData); 
                                            }else{
                                                Item.create(importData).then(function(data){
                                                    if(item.Email !=''){
                                                        /*emailGeneratedCode(userdata,function(responseEmail){
                                                            console.log("responseEmail ",responseEmail)
                                                        });*/
                                                       /* var username = userdata.username1,
                                                        password = userdata.password;
                                                        
                                                        message = 'Hello ';
                                                        message += username;
                                                        message += ",";
                                                        message += '<br/><br/>';
                                                        message += 'Your account has been created. Please login with the following credentials.';
                                                        message += '<br/><br/>';
                                                        message += 'Username is : ' + username;
                                                        message += '<br/>';
                                                        message += 'Password : ' + password;
                                                        message += '<br/><br/>';
                                                        message += 'Regards';
                                                        message += '<br/>';
                                                        message += 'Support Team';

                                                        console.log("message",message,dispensary.email,"------")

                                                        //console.log("message",sails.config.appSMTP.auth.user, "---",item.Email)

                                                        transport.sendMail({
                                                            from: sails.config.appSMTP.auth.user,
                                                            to: dispensary.email,
                                                            subject: 'InstaLeaf Registration',
                                                            html: message
                                                        }, function (err, info) {
                                                            console.log("err",err,info)
                                                            if(err){
                                                                console.log("hello in error")
                                                                return res.jsonx({
                                                                    success: false,
                                                                    data: {
                                                                        message: constantObj.messages.DISPENSARY_ERROR,
                                                                        key:err
                                                                    }
                                                                })

                                                            } else {
                                                                console.log("hello in success")
                                                                return res.jsonx({
                                                                    success: true,
                                                                    data: {
                                                                        message: constantObj.messages.DISPENSARY_SUCCESS,
                                                                        key:dispensary
                                                                    }
                                                                })
                                                            }
                                                            console.log("errro is ",err, info);
                                                        });*/
                                                        return res.jsonx({
                                                            success: true,
                                                            data: {
                                                                message: constantObj.messages.DISPENSARY_SUCCESS,
                                                                key:dispensary
                                                            }
                                                        })
                                                        }
                                                    
                                                    successData.push(importData);  
                                                }).catch(function(err){
                                                    failData.push(err); 
                                                });
                                            } 
                                        }
                                        if(++counter >= len){
                                            return res.status(200).jsonx({
                                                success: true,
                                                message: constantObj.messages.IMPORTED_SUCCESSFULLY,
                                                successData:successData,
                                                alreadyExist:alreadyExist,
                                                failData:failData
                                            })
                                        }
                                    })                                    
                                });
                            })                           
                        })
                    }).catch(function(err){
                        return res.status(400).jsonx({
                            success: false,
                            message: err,
                            key:err
                        });
                    });
                }
            })
        }else{
            return res.jsonx({
                success: false,
                error: {
                    code: 400,
                    message: constantObj.messages.NOT_UPLOADED

                },
            });
        }
    },
    getDispensary:function(data,context,req,res){
        var addedBy = context.identity.id;
       /* console.log("addedBy",addedBy)*/
        Item.findOne({addedBy:addedBy}).exec(function(err,data){
            if(err){
                return res.jsonx({
                    success: false,
                    data: {
                        message: err,
                    }
                })
            }else{
                
                //var length = data.length;
                if(data){
                    return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key:data
                        }
                    })
                    
                }else{
                    return res.jsonx({
                        success: false,
                        data: {
                            message: constantObj.messages.NO_DATA_FOUND,
                        }
                    })
                }
            }

        });
    },
	addDispensary:function(data,context,req,res){
		var date = new Date();
        data.user_email = data.email;

        
		
		if((!data.name) || typeof data.name == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_NAME_REQUIRED, key: 'DISPENSARY_NAME_REQUIRED'} };
        }
        if((!data.address) || typeof data.address == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_ADDRESS_REQUIRED, key: 'DISPENSARY_ADDRESS_REQUIRED'} };
        }
        if((!data.city) || typeof data.city == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_CITY_REQUIRED, key: 'DISPENSARY_CITY_REQUIRED'} };
        }
        if((!data.postal_code) || typeof data.postal_code == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_POSTALCODE_REQUIRED, key: 'DISPENSARY_POSTALCODE_REQUIRED'} };
        }
        
        
        /*if((!data.email) || typeof data.email == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_EMAIL_REQUIRED, key: 'DISPENSARY_EMAIL_REQUIRED'} };
        }
        if((!data.mobile) || typeof data.mobile == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.MOBILE_REQUIRED, key: 'MOBILE_REQUIRED'} };
        }*/
        var str=data.name;
        var slug =str.replace(/\s+/g, '-');
        if(context.identity.roles=='SA'){
            if((!data.user_email) || typeof data.user_email == undefined){ 
                return {"success": false, "error": {"code": 404,"message": constantObj.news.EMAIL_REQUIRED, key: 'EMAIL_REQUIRED'} };
            }
        }
        var completeAddress =data.address+ ',' +data.city+','+data.postal_code;
        getLatLng(completeAddress,function(geoResponse){
            if(geoResponse.status==false){
                return res.jsonx({
                    success: false,
                    error: {message:geoResponse.message}
                });  
            }else{
                data.lat = geoResponse.message.lat;
                data.lng = geoResponse.message.lng;
                /*console.log("==========",geoResponse);*/
                if(context.identity.roles=='SA'){
                    /*console.log("hi",data);*/
                    var user_email = data.user_email;
                    delete data.user_email;
                    delete data.roles;
                    /*console.log("==========",geoResponse);*/
                  var userRole;
                    if(data.businessType == "Doctor" || data.businessType == "doctor" || data.businessType == "DOCTOR"){
                        userRole = "DR"
                    } else if(data.businessType == "Dispensary" || data.businessType == "dispensary" || data.businessType == "DISPENSARY"){
                        userRole = "D"
                    } else if(data.businessType == "Brand" || data.businessType == "brand" || data.businessType == "BRAND"){
                        userRole = "B"
                    } else{
                        userRole = "D"
                    }
                    return Users.findOne({username1:data.username,isDeleted:false}).then(function (user) {
                        /*console.log("=====================================>",user)*/
                        if(typeof user !='undefined' && user.username){
                        /*console.log("testing in if condition");*/
                            data.addedBy =  user.id;

                            return res.jsonx({
                                success: false,
                                 error: {
                                     message: constantObj.messages.USER_EXIST,
                                     key:constantObj.messages.USER_EXIST
                                }
                            });
                            
                            /*return API.Model(Item).create(data).then(function (dispensary) { 
                                return res.jsonx({
                                    success: true,
                                    data: {
                                        message: constantObj.messages.DISPENSARY_SUCCESS,
                                        key:dispensary
                                    }
                                });

                            }).catch(function(err){
                                return res.jsonx({
                                    success: false,
                                     error: {
                                         message: constantObj.messages.DISPENSARY_ERROR,
                                         key:error
                                    }
                                });
                                
                            });*/ 
                        }else{
                            var userdata = {username1:data.username,date_verified:new Date(),email:user_email,username:user_email,password:42434445,firstName:data.name,lastName:data.name,Type:userRole,roles:userRole,fullName:data.name,mobile:data.mobile} 
                            
                            return Users.create(userdata).then(function (newuser) {
                                
                                var user_id = newuser.id;
                                data.addedBy =  user_id;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                return API.Model(Item).findOne({slug:slug,isDeleted:false}).then(function (dispensaryResponse) {
                                    /*console.log("=====================================>",user)*/
                                    if(typeof dispensaryResponse !='undefined' && dispensaryResponse.slug){
                                      data.slug= slug+'-'+Math.floor(Math.random()*(999-100+1)+100);    
                                    }else{
                                       data.slug=slug;
                                   }
                                return API.Model(Item).create(data).then(function (dispensary) { 
                                    /*console.log("dispensary",dispensary)*/
                                    /*emailGeneratedCode(userdata,function(responseEmail){
                                        console.log("responseEmail ",responseEmail)
                                    });*/
                                    var username = userdata.username1,
                                    password = userdata.password;
                                    
                                    message = 'Hello ';
                                    message += username;
                                    message += ",";
                                    message += '<br/><br/>';
                                    message += 'Your account has been created. Please login with the following credentials.';
                                    message += '<br/><br/>';
                                    message += 'Username is : ' + username;
                                    message += '<br/>';
                                    message += 'Password : ' + password;
                                    message += '<br/><br/>';
                                    message += 'Verification URL : ' + constantObj.messages.DISPENSARY_ADD_URL+user_id;
                                    message += '<br/><br/>';
                                    message += 'Regards';
                                    message += '<br/>';
                                    message += 'Support Team';  

                                    console.log("message",message,dispensary.email,"------")

                                    //console.log("message",sails.config.appSMTP.auth.user, "---",item.Email)

                                    transport.sendMail({
                                        from: sails.config.appSMTP.auth.user,
                                        to: dispensary.email,
                                        subject: 'InstaLeaf Registration',
                                        html: message
                                    }, function (err, info) {
                                        console.log("err",err,info)
                                        if(err){
                                            console.log("hello in error")
                                            return res.jsonx({
                                                success: false,
                                                data: {
                                                    message: constantObj.messages.DISPENSARY_ERROR,
                                                    key:err
                                                }
                                            })

                                        } else {
                                            console.log("hello in success")
                                            return res.jsonx({
                                                success: true,
                                                data: {
                                                    message: constantObj.messages.DISPENSARY_SUCCESS,
                                                    key:dispensary
                                                }
                                            })
                                        }
                                        console.log("errro is ",err, info);
                                    });
                                    return res.jsonx({
                                        success: true,
                                        data: {
                                            message: constantObj.messages.DISPENSARY_SUCCESS,
                                            key:dispensary
                                        }
                                    })
                                }).catch(function(err){
                                   /* console.log("hello in catchhhhhhhhhhh error")*/
                                   return res.jsonx({
                                        success: false,
                                        error: {
                                             message: constantObj.messages.DISPENSARY_ERROR,
                                             key:err
                                        }
                                    })
                                });
                            });
                            });
                        }
                        
                    }).catch(function(err){
                        return res.jsonx({
                            success: false,
                             error: {
                                 message: constantObj.messages.DISPENSARY_ERROR,
                                 key:err
                            }
                        });
                        
                    }); 
                }else{
                   /* console.log("bye");*/
                   return API.Model(Item).findOne({slug:slug,isDeleted:false}).then(function (dispensaryResponse) {
                                    /*console.log("=====================================>",user)*/
                                    if(typeof dispensaryResponse !='undefined' && dispensaryResponse.slug){
                                      data.slug= slug+'-'+Math.floor(Math.random()*(999-100+1)+100);    
                                    }else{
                                       data.slug=slug;
                                   }
                    data.addedBy = context.identity.id;
                    return API.Model(Item).create(data).then(function (dispensary) { 
                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.messages.DISPENSARY_SUCCESS,
                                key:dispensary
                            }
                        })
                    }).catch(function(err){
                        return res.jsonx({
                            success: false,
                            error: {
                                 message: constantObj.messages.DISPENSARY_ERROR,
                                 key:err
                            }
                        })
                    }); 
                
                });
                }
        
            }
        });
        
        
        
    },
    dispensary:function(data,context){
        var id = ObjectID(data.id);
       /* console.log("=============",data)*/
        return Item.find({id:data.id}).then(function (dispensary) {
            if(dispensary.length==0){
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.DISPENSARY_NOT_FOUND
                    },
                };
            }else{
                return {
                    success: true,
                    data: {
                        code: 200,
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                        key:dispensary
                    },
                };
            }
        });

    },
    editDispensary:function(data,context,req,res){
        var date = new Date();
        
        if((!data.name) || typeof data.name == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_NAME_REQUIRED, key: 'DISPENSARY_NAME_REQUIRED'} };
        }
       
        if((!data.address) || typeof data.address == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_ADDRESS_REQUIRED, key: 'DISPENSARY_ADDRESS_REQUIRED'} };
        }
        if((!data.city) || typeof data.city == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_CITY_REQUIRED, key: 'DISPENSARY_CITY_REQUIRED'} };
        }
        if((!data.postal_code) || typeof data.postal_code == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_POSTALCODE_REQUIRED, key: 'DISPENSARY_POSTALCODE_REQUIRED'} };
        }
        /*if((!data.email) || typeof data.email == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.DISPENSARY_EMAIL_REQUIRED, key: 'DISPENSARY_EMAIL_REQUIRED'} };
        }
        if((!data.mobile) || typeof data.mobile == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.MOBILE_REQUIRED, key: 'MOBILE_REQUIRED'} };
        }*/
       
        //data.addedBy = context.identity.id





        data.updatedAt = date;
        var completeAddress =data.address+ ', ' +data.city+','+data.postal_code;

        return Item.findOne({id:data.id}).then(function(itemDetail) {
            var itemUsername = itemDetail.username;

            getLatLng(completeAddress,function(geoResponse){
                if(geoResponse.status==false){
                    return res.jsonx({
                        success: false,
                        error: geoResponse.message
                    });
                }else{
                    /*console.log(geoResponse)*/
                    data.lat = geoResponse.message.lat;
                    data.lng = geoResponse.message.lng;
                    var id = data.id;
                    delete data.id;


                    return Item.update({id:id}, data).then(function(dispensary) {
                        console.log("dispensaryyyyyyyy",dispensary)
                        if(dispensary.length>0){
                            
                            let query     = {} ;
                            query.username1      = data.username;
                            query.id = {$ne:itemDetail.addedBy}
                            query.isDeleted = false
                            console.log("query",query)

                            return Users.findOne(query).then(function(users) {
                                console.log("users",users)
                                
                                if (users) {
                                    return res.status(400).jsonx({
                                       success: false,
                                       error: "Username already in use"
                                    });
                                } else {
                                    console.log("itemUsername111",itemUsername)
                                    return Users.findOne({username1:itemUsername}).then(function(foundUser) {
                                            console.log("foundUser",foundUser)
                                        if(foundUser){

                                            userupdate={};
                                            userupdate.username1 = data.username
                                            userupdate.updatedBy = context.identity.id;
                                            console.log("userupdate",userupdate)

                                            return Users.update({username1:itemUsername}, userupdate).then(function(userupdated) {
                                                console.log("userupdated",userupdated)
                                                return res.jsonx({
                                                    success: true,
                                                    data: {
                                                         message: constantObj.messages.DISPENSARY_UPDATED,
                                                        key: 'DISPENSARY_UPDATED'
                                                    }
                                                })   
                                            })
                                        } else {
                                            if(dispensary[0].businessType == "Doctor" || dispensary[0].businessType == "doctor" || dispensary[0].businessType == "DOCTOR"){
                                                userRole = "DR"
                                            } else if(dispensary[0].businessType == "Dispensary" || dispensary[0].businessType == "dispensary" || dispensary[0].businessType == "DISPENSARY"){
                                                userRole = "D"
                                            } else if(dispensary[0].businessType == "Brand" || dispensary[0].businessType == "brand" || dispensary[0].businessType == "BRAND"){
                                                userRole = "B"
                                            } else{
                                                userRole = "D1"
                                            }
                                            var userdata = {username1:dispensary[0].username,date_verified:new Date(),email:dispensary[0].email,username:dispensary[0].email,password:42434445,firstName:dispensary[0].username,lastName:dispensary[0].username,Type:userRole,roles:userRole,fullName:dispensary[0].name,mobile:dispensary[0].mobile,isVerified:"Y",status:'active'}
                                            console.log("userdata",userdata)
                                            return Users.create(userdata).then(function(usercreated) {
                                                console.log("usercreated",usercreated)
                                                return res.jsonx({
                                                    success: true,
                                                    data: {
                                                        message: constantObj.messages.DISPENSARY_UPDATED,
                                                        key: 'DISPENSARY_UPDATED'
                                                    }
                                                })   
                                            })

                                        }
                                    })
                                }
                            })
                        }                    
                       
                    })
                    .catch(function(err){
                        return res.status(400).jsonx({
                               success: false,
                               error: "Username already in use"
                            }); 
                       
                    });
                }
            })
        })
            
            
    },

    addSlugDispensary:function(data,context,req,res){
        
        return Item.find({}).then(function(itemDetail) {
            var counter=0; 
            var x=0;
            
            var processItems = function(x){
              if( x < itemDetail.length ) {
                var str=itemDetail[x].name;
                var slug =str.replace(/\s+/g, '-');
                data.meta_desc = itemDetail[x].about_us;
                data.meta_name = itemDetail[x].name;
                Item.findOne({slug:slug}).then(function (dispensaryResponse) {
                   
                  if(typeof dispensaryResponse != undefined){
                      data.slug= slug+'-'+Math.floor(Math.random()*(999-100+1)+100);    
                    }else{
                       data.slug=slug;
                    } 

                console.log('----------------------',x)
                     console.log(data)
                    Item.update({id:itemDetail[x].id}, data).then(function(dispensary) {processItems(x+1);});
                   if(counter+1 == itemDetail.length){
                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.messages.DISPENSARY_UPDATED,
                                key: 'DISPENSARY_UPDATED'
                            }
                        })
                    }else{
                        counter++;
                    } 
                });

                  // add some code here to process the response

                  
                
              }
            };
/*
                console.log('----------------------',i)*/
            /*     setTimeout(function(){ ++i;}, 5000);
            if(!itemDetail[i].slug){
                if(counter+1 == itemDetail.length){
                    return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.DISPENSARY_UPDATED,
                            key: 'DISPENSARY_UPDATED'
                        }
                    })
                }else{
                    counter++;
                }
            }*//*else{

                var str=itemDetail[i].name;
                var slug =str.replace(/\s+/g, '-');
                data.meta_desc = itemDetail[i].about_us;
                data.meta_name = itemDetail[i].name;
                Item.findOne({slug:slug}).then(function (dispensaryResponse) {
                   
                  if(typeof dispensaryResponse != undefined){
                      data.slug= slug+Math.floor(Math.random()*(999-100+1)+100);    
                    }else{
                       data.slug=slug;
                    } 
                     console.log(data)
                    Item.update({id:itemDetail[i].id}, data).then(function(dispensary) {});
                   if(counter+1 == itemDetail.length){
                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.messages.DISPENSARY_UPDATED,
                                key: 'DISPENSARY_UPDATED'
                            }
                        })
                    }else{
                        counter++;
                    } 
                });
                
             }*/
          processItems(0);  
         });
    },
    deleteDispensary:function(data,context){
        
        data.deletedBy = context.identity.id;
        data.isDeleted = true;
        return Item.update(data.id,data).then(function (itemInfo) {
            
            if(itemInfo){
                Users.update({username1:itemInfo[0].username},{isDeleted: true}).then(function (userInfo) {
                })
                return {
                    success: true,
                    data: {
                        code: 200,
                        message: constantObj.messages.DISPENSARY_DELETED
                    },
                };
                
            } else {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.product.ISSUE_IN_DB
                    },
                };
            }

        })
        .fail(function(err){ 
            return {
                success: false,
                error: {
                    code: 400,
                    message: err
                },
            };   
        });
    },
    list:function(data,context){
        var addedBy = context.identity.id;
        return Item.find({addedBy:addedBy}).sort({createdAt:-1}).then(function(dispensary) {
            if(dispensary.length==0){
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.DISPENSARY_NOT_FOUND
                    },
                };
            }else{
                return {
                    success: true,
                    data: {
                        code: 200,
                        data:dispensary
                    },
                };
            }
        })

    },
    itemFavorite:function(data,context,req,res){
        var addedBy = context.identity.id;
        var query = {item_id:data.id}
        query.addedBy = addedBy;
        //console.log("============",query)
        return Favourite.findOne(query).then(function(data){
            if(data){
                return {
                    success: true,
                    data: {
                        code: 200,
                        data:data
                    },
                };
                
            } else {
                console.log("test1234",data)
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: constantObj.messages.NO_DATA_FOUND
                    },
                };
            }            
        })
    },
    itemDetail:function(data,context,req,res){
        var query = {slug:data.slug}
        Item.native(function(err, itemList) {
            itemList.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'addedBy',
                        foreignField: '_id',
                        as: "addedBy"
                    }
                },
                {
                    $unwind: '$addedBy'
                },
                {
                    $project: {
                        id: "$_id",
                        name:"$name",
                        address: "$address",
                        city: "$city",
                        postal_code: "$postal_code",
                        email:"$email",
                        mobile:"$mobile",
                        website: "$website",
                        addedBy: "$addedBy.username1",
                        about_us: "$about_us",
                        image: "$image",
                        lat: "$lat",
                        logo:"$logo",
                        lng:"$lng",
                        businessType:"$businessType",
                        medical:"$medical",
                        recreation:"$recreation",
                        isFeatured:"$isFeatured",
                        scheduler:"$scheduler",
                        isDeleted:"$isDeleted",
                        slug:"$slug",
                        status:"$status",
                        recreational:"$recreational",
                        userVisit:"$userVisit",
                        totalReviews:"$totalReviews",
                        totalRating:"$totalRating",
                        createdAt:"$createdAt",
                        updatedAt:"$updatedAt"
                    }
                },
                {
                    $match: query
                }
            ],function (err, totalresults) {
                if (err){
                    
                    return res.status(400).jsonx({
                        success: false,
                        error: err
                    }); 
                } else {

                    itemList.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "addedBy"
                            }
                        },
                        {
                            $unwind: '$addedBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                name:"$name",
                                address: "$address",
                                city: "$city",
                                postal_code: "$postal_code",
                                email:"$email",
                                mobile:"$mobile",
                                website: "$website",
                                addedBy: "$addedBy.username1",
                                about_us: "$about_us",
                                image: "$image",
                                lat: "$lat",
                                logo:"$logo",
                                lng:"$lng",
                                businessType:"$businessType",
                                medical:"$medical",
                                recreation:"$recreation",
                                isFeatured:"$isFeatured",
                                scheduler:"$scheduler",
                                isDeleted:"$isDeleted",
                                slug:"$slug",
                                status:"$status",
                                recreational:"$recreational",
                                userVisit:"$userVisit",
                                totalReviews:"$totalReviews",
                                totalRating:"$totalRating",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt"
                            }
                        },
                        {
                            $match: query
                        }
                    ],function (err, results) {

                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            
                            return res.jsonx({
                                success: true,
                                data: {
                                    data: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    },
    /*mobItemSearchByLocation:function(data,context,req,res){
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var search = req.body.location;
        var businessType = req.body.businessType;
        
       var query = {}
        
        var ip = req.ip;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3];

        query.status = 'active';
        query.isDeleted = false;

        if (search) {
            query.$or = [
                            { address:new RegExp(search, 'i')},
                            { city:new RegExp(search, 'i')},
                        ]            
        }

        if(businessType != undefined && businessType !=''){
            query.businessType = businessType;
        }

        var ip = ipAddres;
        var geo = geoip.lookup(ip);
         
       

        Item.find(query).then(function(items){
            
            var len = items.length;
            var counter = 0;
            var features = [];
            if(len > 0){
            features.push({type: "Feature",geometry:{type:"Point",coordinates:[geo.ll[1],geo.ll[0]]}});
            //console.log("features ",features); //return false;
            items.forEach(function(item,index){

                var geometry = {};
                var properties = {};
                geometry.type = 'Point';

                geometry.coordinates = [item.lng,item.lat];
                properties.item_id=item.id;
                properties.businessType=item.businessType;
                properties.name=item.name;
                properties.image=item.image;
                properties.rating=item.totalRating;
                properties.review=item.totalReviews;
                properties.phone = item.mobile;
                properties.address = item.address;
                properties.city = item.city;
                properties.postalCode = item.postal_code;
                properties.crossStreet=item.address;
                properties.scheduler=item.scheduler;


                features.push({type:'Feature',geometry:geometry,properties:properties});
                console.log("features===================================================>",features);
                if(++counter >= len){
                    return res.status(200).send({data:features}); 
                }
            })
       }else{
        return res.status(404).send({message:'Data not found.'});
       }
        }).catch(function(err){
            return res.status(400).send({message: err});  
        });
    },*/
    mobItemSearchByLocation:function(data,context,req,res){
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var location = req.body.location;
        var businessType = req.body.businessType;
        var name = req.body.name;
        
        var ip = req.ip;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3];
        console.log("ipAddres  ",ipAddres);
        var geo = geoip.lookup(ipAddres);

        var userlat=latitude?latitude:geo.ll[0];
        var userlng=longitude?longitude:geo.ll[1];
        var search = req.body.search;

        /*latitude = '30.7464';
        longitude = '76.6687'*/


        // var ip = ipAddres;
        // var geo = geoip.lookup(ip);

        // console.log("=========geo ",geo);

        // console.log(geo.ll[0]);
        // console.log(geo.ll[1]);

        var query = {};
        /*if(latitude !='' && latitude !='null' && typeof latitude !='undefined'){
            query.lat = latitude;
        }
        if(longitude !='' && longitude !='null' && typeof longitude !='undefined'){
            query.lng = longitude;
        }*/
        if(typeof search !='undefined' && search!=''){
            query.name = new RegExp(search, 'i');

        }
        
        if(location !='' && location !='null' && typeof location !='undefined'){
            query.city = new RegExp(location, 'i');
        } else {
            query.city = new RegExp(geo.city, 'i');
        }

        if(typeof businessType !='undefined' && businessType.length > 0){
            query.businessType = {$in:businessType}
        }

        if(typeof name !='undefined' && name != ''){
            query.name = new RegExp(name, 'i');
        }

        
        query.isDeleted = false;
        query.status = 'active';
        //query.businessType = 'dispensary';
        //query.isFeatured = true; 
        //return false;
       // geocoding.reverseGeocode('mapbox.places', latitude, longitude, function (err, geoData) {
         //   console.log("geoData",geoData)
            Item.native(function(err, itemlist) {
            itemlist.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'addedBy',
                        foreignField: '_id',
                        as: "addedBy"
                    }
                },
                
                {
                    $unwind: '$addedBy'
                },
                {
                    $project: {
                        id: "$_id",
                        name: "$name",
                        city: "$city",
                        address: "$address",
                        postal_code: "$postal_code",
                        email: "$email",
                        mobile: "$mobile",
                        website:"$website",
                        about_us:"$about_us",
                        image: "$image",
                        addedBy: "$addedBy.username1",
                        logo: "$logo",
                        lat: "$lat",
                        businessType: "$businessType",
                        medical:"$medical",
                        recreation:"$recreation",
                        lng:"$lng",
                        isFeatured:"$isFeatured",
                        scheduler:"$scheduler",
                        isDeleted:"$isDeleted",
                        status:"$status",
                        recreational:"$recreational",
                        userVisit:"$userVisit",
                        totalReviews:"$totalReviews",
                        totalRating:"$totalRating",
                        createdAt:"$createdAt",

                    }
                },
                {
                    $match: query
                }
            ],function (err, totalresults) {
                if (err){
                    
                    return res.status(400).jsonx({
                        success: false,
                        error: err
                    }); 
                } else {

                    itemlist.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "addedBy"
                            }
                        },
                        
                        {
                            $unwind: '$addedBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                city: "$city",
                                address: "$address",
                                postal_code: "$postal_code",
                                email: "$email",
                                mobile: "$mobile",
                                website:"$website",
                                about_us:"$about_us",
                                image: "$image",
                                addedBy: "$addedBy.username1",
                                logo: "$logo",
                                lat: "$lat",
                                businessType: "$businessType",
                                medical:"$medical",
                                recreation:"$recreation",
                                lng:"$lng",
                                isFeatured:"$isFeatured",
                                scheduler:"$scheduler",
                                isDeleted:"$isDeleted",
                                status:"$status",
                                recreational:"$recreational",
                                userVisit:"$userVisit",
                                totalReviews:"$totalReviews",
                                totalRating:"$totalRating",
                                createdAt:"$createdAt",
                            }
                        },
                        {
                            $match: query
                        }
                    ],function (err, item) {

                        
                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            });  
                        } else {
        
            //console.log("=============item ",item);
                            if(item.length==0){
                                return res.status(200).send({message: constantObj.messages.NO_DATA_FOUND});      
                            }else{
                                var j=0;
                                var data=[];
                                for(var i=0;i<item.length;i++){
                                var kilometers=distance(item[j].lat, item[j].lng, parseFloat(userlat), parseFloat(userlng));
                                if(kilometers <= constantObj.setting.DISTANCE){
                                item[j].distance=kilometers;
                                data.push(item[j]);
                                }
                                if(j+1 == item.length){
                                    return res.status(200).send({data:arraySort(data,'distance')});
                                }else{
                                    j++;
                                }
                                }
                                 
                            }
                        }
                    });
                }
            });
        });
            
        //});   

        
    },
    itemSearchByLocation:function(data,context,req,res){
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var location = req.body.location;

        var query = {};
        if(latitude !='' && latitude !='null' && typeof latitude !='undefined'){
            query.lat = latitude;
        }
        if(longitude !='' && longitude !='null' && typeof longitude !='undefined'){
            query.lng = longitude;
        }
        if(location !='' && location !='null' && typeof location !='undefined'){
            query.city = new RegExp(location, 'i');
        }
       
        console.log("===== lat ",typeof latitude);
        console.log("===== longitude ",typeof longitude);
        query.isDeleted = false;
        query.status = 'active';
        query.businessType = 'dispensary';
        query.isFeatured = true;
    
        console.log("============query ",query);
        Item.find(query).then(function(item){
            console.log("=============item ",item);
            if(item.length==0){
                return res.status(200).send({message: constantObj.messages.NO_DATA_FOUND});
                // return res.jsonx({
                //     success: true,
                //     error: {
                //         code: 200,
                //         message: constantObj.messages.NO_DATA_FOUND
                //     },
                // });   
            }else{
                return res.status(200).send({data:item});

                // return res.jsonx({
                //     success: true,
                //     error: {
                //         code: 200,
                //         data: item
                //     },
                // });   
            }

        }).catch(function(err){
            return res.status(400).send({message: err});
            // return res.jsonx({
            //     success: false,
            //     error: {
            //         code: 400,
            //         message: err
            //     },
            // });   
        });

    },
    itemLocator:function(data,context,req,res){

        //var addedBy = context.identity.id //'5bc0eb01c23a392078b88a65'; //;
        var medical        = req.param('medical');
        var recreation     = req.param('recreational');
        var businessType   = req.param('businessType');
        var search         = req.param('search');

        var query = {}
        
        var ip = req.ip;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3];

        query.status = 'active';
        query.isDeleted = false;

        if (search) {
            query.$or = [
                            { name: new RegExp(search, 'i')},
                            { address:new RegExp(search, 'i')},
                            { city:new RegExp(search, 'i')},
                            { about_us:new RegExp(search, 'i')},
                            { businessType:new RegExp(search, 'i')}
                        ]
            
        }

        if(recreation){
            query.recreation = true
        }

        if(medical){
            query.medical = true
        }

        if(businessType != undefined && businessType !=''){
            query.businessType = businessType;
        }

        var ip = ipAddres;
        var geo = geoip.lookup(ip);
        
        /*console.log('geo',geo);
        console.log("geo1",geo.ll[0]);
        console.log("geo",geo.ll[1]);*/
       
        Item.find(query).then(function(items){
            var len = items.length;
            var counter = 0;
            var features = [];
            addressLatLng(geo.city,function(geoResponse){
            var userlat=req.query['lat']?req.query['lat']:geoResponse.data[0].latitude;
            var userlng=req.query['lng']?req.query['lng']:geoResponse.data[0].longitude;
            features.push({type: "Feature",geometry:{type:"Point",coordinates:[userlat,userlng]}});
            
            if(len > 0){
            
            items.forEach(function(item,index){
               
                var geometry = {};
                var properties = {};
                geometry.type = 'Point';
                
                var diffrence=distance(item.lat, item.lng, parseFloat(userlat), parseFloat(userlng));
                
                    if (diffrence <= constantObj.setting.DISTANCE){
                    geometry.coordinates = [item.lng,item.lat];
                    properties.distance=diffrence;
                    properties.item_id=item.id;
                    properties.businessType=item.businessType;
                    properties.name=item.name;
                    properties.image=item.image;
                    properties.rating=item.totalRating;
                    properties.review=item.totalReviews;
                    properties.phone = item.mobile;
                    properties.address = item.address;
                    properties.city = item.city;
                    properties.postalCode = item.postal_code;
                    properties.crossStreet=item.address;
                    properties.scheduler=item.scheduler;
                    properties.slug=item.slug;
                    features.push({type:'Feature',geometry:geometry,properties:properties});
                }
                if(++counter >= len){
                    
                     return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key:arraySort(features, 'properties.distance')
                        }
                    })
                }
            
            })
        }else{
            return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key:features
                        }
                    })
        }
       })
        }).catch(function(err){
            return {
                success: false,
                error: {
                    code: 400,
                    message: err
                },
            };   
        });
    },
    dispensaryForSlider:function(data,context,req,res){
        var query = {}
        
        var ip = req.ip;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3];

        query.status = 'active';
        query.isDeleted = false;
        query.businessType = 'dispensary';
        
        var ip = ipAddres;
        var geo = geoip.lookup(ip);
        
        /*console.log('geo',geo);
        console.log("geo1",geo.ll[0]);
        console.log("geo",geo.ll[1]);*/
        Item.find(query).then(function(items){
            
            var len = items.length;
            var counter = 0;
            var features = [];
            addressLatLng(geo.city,function(geoResponse){
            var userlat=req.query['lat']?req.query['lat']:geoResponse.data[0].latitude;
            var userlng=req.query['lng']?req.query['lng']:geoResponse.data[0].longitude;
            features.push({type: "Feature",geometry:{type:"Point",coordinates:[userlat,userlng]}});
            if(len > 0){
            items.forEach(function(item,index){
                var geometry = {};
                var properties = {};
                geometry.type = 'Point';
                var distances=distance(item.lat, item.lng, userlat, userlng);

                    if (distances <= constantObj.setting.DISTANCE){
                    geometry.coordinates = [item.lng,item.lat];
                    properties.distance=distances;
                    properties.item_id=item.id;
                    properties.businessType=item.businessType;
                    properties.name=item.name;
                    properties.image=item.image;
                    properties.rating=item.totalRating;
                    properties.review=item.totalReviews;
                    properties.phone = item.mobile;
                    properties.address = item.address;
                    properties.city = item.city;
                    properties.postalCode = item.postal_code;
                    properties.crossStreet=item.address;
                    properties.scheduler=item.scheduler;
                    properties.medical=item.medical;
                    properties.recreation=item.recreation;
                    properties.slug=item.slug;
                    properties.meta_name=item.meta_name;
                    properties.meta_desc=item.meta_desc;
                    features.push({type:'Feature',geometry:geometry,properties:properties});
                }
                if(++counter >= len){
                    
                     return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key:arraySort(features, 'properties.distance')
                        }
                    })
                }
            
            })
        }else{
            return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key:arraySort(features, 'properties.distance')
                        }
                    })
        }
       })
        }).catch(function(err){
            return {
                success: false,
                error: {
                    code: 400,
                    message: err
                },
            };   
        });
    },
    graphData:function(data,context,req,res){

        var query = {};
        var months = [];
        var graphData = [];
        for(var i=1;i<=12;i++){
            months.push(i);
        }
        Item.native(function(err, itemlist) {
            itemlist.aggregate([
                {
                   $project:{
                     businessType:"$businessType",
                   } 
                },
                {
                    $group:{
                        _id:{
                            month:'$month',
                            businessType:'$businessType',
                            createdAt:'$createdAt',
                        },
                        count:{
                            $sum:1
                        }
                    }
                }
            ]).then(function(item){
            console.log("========Item ",item);
        });
        });
        
        // Item.find().then(function(itemData){
        //     console.log("========Item ",itemData);
            
        //     itemData.forEach(function(item,index){
        //         if(typeof graphData['dispensary'] =='undefined'){
        //             graphData['dispensary'][date] = [];
        //         }
        //         graphData['dispensary'][date].push(1);
        //     })
        //     console.log("==============",graphData);
        // })
        
    }
}

