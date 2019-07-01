var Promise = require('bluebird'),
    promisify = Promise.promisify;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var bcrypt    = require('bcrypt-nodejs');
var pushService    = require('./PushService');
var ObjectId = require('mongodb').ObjectID;
var iplocation = require("iplocation").default;
var constantObj = sails.config.constants;
var geoip = require('geoip-lite');
var geodist = require('geodist');
var NodeGeocoder = require('node-geocoder');
var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));

var LatLngCity = function (lat,lng,callback){
    var options = {
      provider: 'google',
      httpAdapter: 'https', // Default
      apiKey: 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA', // for Mapquest, OpenCage, Google Premier
      formatter: null         // 'gpx', 'string', ...
    };
     
    var geocoder = NodeGeocoder(options);
    geocoder.reverse({lat:lat, lon:lng}, function(err, data) {
        if(err){
        callback({status:false,message:err});
            }else{
               // console.log(data)
        callback({success: true,data: data[0].city}) 
            }
    });
}
var getUserStoreLike = function(userId,callback){

    var query = {};
    query.addedBy=userId;
    query.$or = [
                    { type: 'dispensary'},
                    { type: 'doctor'},
                    { type: 'brand'}
                ]

    
    //{addedBy:(userId),type:'dispensary'}
    Favourite.find(query).populate('item_id').sort({"createdAt":-1}).then(function(storeLike){
        if(storeLike.length==0){
            callback({status:true,data:[]});
        }else{
            callback({status:true,data:storeLike});
        }
    }).catch(function(err){
        callback({status:false,error:err});
    });
}
var getUserProductLike = function(userId,callback){
    Favourite.find({addedBy:(userId),type:'product'}).populate('product_id').sort({"createdAt":-1}).then(function(productLike){
        if(productLike.length==0){
            callback({status:true,data:[]});
        }else{
            callback({status:true,data:productLike});
        }
    }).catch(function(err){
        callback({status:false,error:err});
    });
}

var getUserreviews = function(userId,callback){
    Reviews.find({addedBy:userId}).populate('item_id').sort({"createdAt":-1}).then(function(UserReview){
        if(UserReview.length==0){
            callback({status:true,data:[]});
        }else{
            callback({status:true,data:UserReview});
        }
    }).catch(function(error){
        callback({status:false,error:error})
    })
}

var getUserproductreviews = function(userId,callback){
    Productreviews.find({addedBy:userId}).populate('product_id').sort({"createdAt":-1}).then(function(UserReviews){
        if(UserReviews.length==0){
            callback({status:true,data:[]});
        }else{
            callback({status:true,data:UserReviews});
        }
    }).catch(function(error){
        callback({status:false,error:error})
    })
}

var distance = function (lat1,lon1,lat2,lon2,cb){
/*var distance = require('google-distance');
    distance.apiKey = 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA';
    var destination= "'"+lat2+","+lon2+"'";
    console.log(destination)
    distance.get({
          index: 1,
          origin: lat1+","+lon1,
          destination: destination 
        },
        function(err, data) {
            if (err){
                return cb(200000000); 
            } else{

                return cb(data.distanceValue/1000);
            }
});*/
 var avgdis=geodist({lat: parseFloat(lat2), lon: parseFloat(lon2)}, {lat: lat1, lon: lon1});
 console.log("geodist function response",avgdis*1.60934)
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
        if(err){
                callback({status:false,message:err});
            }else{
     callback({success: true,data: data}) 
            }
    });
}

module.exports = {
    allcities:function(data,context){
        return City.find({isDeleted:false,status:"active"}).sort({name:1}).then(function(cities) {
            if(cities.length==0){
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.CITY_NOT_FOUND
                    },
                };
            }else{
                return {
                    success: true,
                    data: {
                        code: 200,
                        data:cities
                    },
                };
            }
        })
    },

    getcity:function(data,context){
        return City.findOne({id:data.id,isDeleted:false,status:"active"}).then(function(cities) {
            if(!cities){
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.CITY_NOT_FOUND
                    },
                };
            }else{
                return {
                    success: true,
                    data: {
                        code: 200,
                        city:cities
                    },
                };
            }
        })
    },

    saveCity: function(data,context){
        if((!data.name) || typeof data.name == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.city.NAME_REQUIRED} };
        }            
        
        return City.findOne({name:data.name,isDeleted:false,status:"active"}).then(function(cityInfo) {
            console.log("cityInfo",cityInfo)
            
            if(cityInfo) {
                console.log("here")
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.city.CITY_ALREADY_EXIST
                    },
                };

            } else {
                console.log("heret",data)

                return City.create(data).then(function(prod) {
                    console.log("prod",prod)
                    return {
                        success: true,
                        code:200,
                        data: {
                            city:prod,
                            message: constantObj.city.SAVED_CITY
                        },
                    };
                })
                .fail(function(err){
                    console.log("err",err)
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.product.ISSUE_IN_DB
                        },
                    };   
                });
            }
        }).fail(function(err){ 
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: err
                    },
                };   
        });
    },

    updateCity: function(data,context){

        console.log("here",data)

        return City.update(data.id,data).then(function (cityInfo) {
            
            if(cityInfo){
                return {
                    success: true,
                    code:200,
                    data: {
                        city:cityInfo,
                        message: constantObj.city.UPDATED_CITY
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

    delete: function (data, context) {

        return City.destroy({id:data.id}).then(function (cityInfo) {
            //Itemproduct.destroy({createdBy:createdBy}).exec(function(err,data1){
            if(cityInfo){
                return {
                    success: true,
                    code:200,
                    data: {
                        message: constantObj.city.DELETED_CITY
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

    allBrands:function(data,context){
        var query ={};
        query.isDeleted = false;
        
        return Item.find(query).sort({name:1}).then(function(brands) {
            if(brands.length==0){
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.BRAND_NOT_FOUND
                    },
                };
            }else{
                return {
                    success: true,
                    data: {
                        code: 200,
                        data:brands
                    },
                };
            }
        })
    },
    searchCity:function(data,context,req,res){
        var city = req.param('city');
        var query = {};
        if(city !=''){
            query.name = new RegExp(city, 'i');
            query.status = "active";
            query.isDeleted = false;
        }
        
        City.find(query).then(function(cities){
            if(cities.length == 0){
                return res.status(200).jsonx({
                    success:true,
                    message: constantObj.messages.CITY_NOT_FOUND
                });
            }else{
                return res.status(200).jsonx({
                    success:true,
                    data: cities
                });
            }

        }).fail(function(err){
            return res.status(400).jsonx({
                success: false,
                error: err
            });
        })

    },
    mobFeaturedItem:function(data,context,req,res){
        var query = {};

        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        
        var businessType = req.body.businessType;
        var city = req.body.city;
        var search = req.body.search;

        //console.log("=======",req.ip)
        var ip = req.ip;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3]; //'56.70.97.8';
        
        var sortquery = {};
        count = parseInt( count );

        query.isFeatured = true;
        query.isDeleted = false;
        query.status = 'active';

        var ip = ipAddres;
        var geo = geoip.lookup(ip);

        
        
        if(typeof search !='undefined' && search!=''){
            query.name = new RegExp(search, 'i');

        }else{
            return LatLngCity(req.param('lat'),req.param('lng'),function(geoResponse){
                if(geoResponse.data){
                    query.city = new RegExp(geoResponse.data, 'i');
                }else{
                    query.city = new RegExp(geo.city, 'i');
                }

                if(typeof city !='undefined' && city !=''){
                    query.city = new RegExp(city, 'i');
                }
                if(typeof businessType !='undefined' && businessType.length > 0){
            query.$and = [
                {businessType:{$in:businessType}}
            ]
        }
        console.log(query)
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
                    ],function (err, results) {

                        
                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            });  
                        } else {
                            var group_to_values = results.reduce(function (obj, item) {
                                obj[item.businessType] = obj[item.businessType] || [];
                                obj[item.businessType].push(item);
                                return obj;
                            }, {});
                            //console.log("============data ",group_to_values);
                            return res.status(200).jsonx({
                                success: true,
                                 items: group_to_values
                            }); 
                        }
                    });
                }
            });
           
        })
            });
        }

        if(typeof businessType !='undefined' && businessType.length > 0){
            query.$and = [
                {businessType:{$in:businessType}}
            ]
        }
        console.log(query)
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
                    ],function (err, results) {

                        
                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            });  
                        } else {
                            var group_to_values = results.reduce(function (obj, item) {
                                obj[item.businessType] = obj[item.businessType] || [];
                                obj[item.businessType].push(item);
                                return obj;
                            }, {});
                            //console.log("============data ",group_to_values);
                            return res.status(200).jsonx({
                                success: true,
                                 items: group_to_values
                            }); 
                        }
                    });
                }
            });
           
        })

    },
    FeaturedData:function(data,context,req,res){ 
        if((!data.businessType) || typeof data.businessType == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.messages.BUSINESS_TYPE, key: 'BUSINESS_TYPE'} };
        }

        var search = req.param('product');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var city   = req.param('city');
        var ip = req.ip;
        ipArray = ip.split(":");
        //var ipAddres =/* ipArray[3];*/ '198.50.177.44';

        var ipAddres = ipArray[3];
        var businessType = req.param('businessType');
        
        
       
        var sortquery = {};
        
        // if (sortBy) {
        //     var typeArr = new Array();
        //     typeArr = sortBy.split(" ");
        //     var sortType = typeArr[1];
        //     var field = typeArr[0];
        // }

        count = parseInt( count );

        //sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        var query = {}

        if(businessType){
           var query = { businessType: {$regex: businessType, '$options' : 'i'}}
        }
        query.isFeatured = true;
        query.isDeleted = false;
        //query.status = "active";

        var ip = ipAddres;
        var geo = geoip.lookup(ip);
         
       if(typeof city !='undefined' && city !=''){
            query.city = new RegExp(city, 'i');
        }else{
            query.city = new RegExp(geo.city, 'i');
        }

        console.log("query for featured data is",query)
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
                    slug:"$slug",
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
                                slug:"$slug",
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
                        },
                        
                        {
                            $skip: skipNo
                        },
                        {
                            $limit: count
                        }
                    ],function (err, results) {
                        if (err){
                            return res.jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            if(results.length){
                                console.log("results of aggregation",results)
                                var j=0;
                                /*return res.jsonx({
                                    success: true,
                                    data: {
                                        items: results,
                                        total: totalresults.length
                                    }
                                })*/ 

                                addressLatLng(geo.city,function(geoResponse){
                                var userlat=req.query['lat']?req.query['lat']:geoResponse.data[0].latitude;
                                var userlng=req.query['lng']?req.query['lng']:geoResponse.data[0].longitude;
                                for(var i=0;i<results.length;i++){
                                    var avgdis=geodist({lat: parseFloat(userlat), lon: parseFloat(userlng)}, {lat: results[j].lat, lon: results[j].lng});
                                    //distance(results[j].lat, results[j].lng, geo.ll[0], geo.ll[1],function(resp){
                                        results[j].kilometers=avgdis*1.60934;  
                                    
                                        if(j+1 ==results.length){
                                            return res.jsonx({
                                                success: true,
                                                data: {
                                                    items: results,
                                                    total: totalresults.length
                                                },
                                            });
                                        }else{
                                            j++;
                                        }      
                                    //}); 
                                }
                            })
                            }else{
                                return res.jsonx({
                                    success: true,
                                    data: {
                                        items: [],
                                        total: []
                                    },
                                });
                            }
                        }
                    });
                }
            });
                   
        })
        
    },
    mobUserLiked:function(data,context,req,res){
        var addedBy = context.identity.id;
        Users.findOne({id:addedBy}).then(function(userDetail){
            delete userDetail.password;
            getUserStoreLike(addedBy,function(storeResponse){
                getUserProductLike(addedBy,function(productResponse){
                    getUserreviews(addedBy,function(reviewResponse){
                        getUserproductreviews(addedBy,function(productReviewResponse){
                            if(reviewResponse.status !=false){
                                return res.status(200).jsonx({
                                    success: true,
                                    message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                                    userDetail:userDetail,
                                    storeLike:storeResponse.data,
                                    productLike:productResponse.data,
                                    reviews:reviewResponse.data,
                                    reviews_strain:productReviewResponse.data
                                });
                            }else{
                                if(productResponse.status !=false){
                                    return res.status(200).jsonx({
                                        success: true,
                                        message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                                        userDetail:userDetail,
                                        storeLike:storeResponse.data,
                                        productLike:productResponse.data,
                                        reviews:[],
                                        reviews_strain:productReviewResponse.data
                                        
                                    });
                                }else{
                                    if(storeResponse.status !=false){
                                        return res.status(200).jsonx({
                                            success: true,
                                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                                            userDetail:userDetail,
                                            storeLike:storeResponse.data,
                                            productLike:[],
                                            reviews:[],
                                            reviews_strain:productReviewResponse.data
                                            
                                        });
                                    }
                                }
                            }
                    })
                    
                })
                })
                
                
            })
            
            
        }).catch(function(err){
            return res.status(400).jsonx({
                success: false,
                message: err,
                key:err
            });
            
        }); 
    },
    getUniqueCode: function () {
        let code = Math.floor(Math.random()*900001258) + 100009852;
        return code;
    },
};

	