var Promise = require('q');
var constantObj = sails.config.constants;
var gm = require('gm');
var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var distance = require('google-distance-matrix');

var crypt = require('crypt');
var util = require('util');
var crypto = require('crypto');
var iplocation = require("iplocation").default;
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

/**
 * CommonController
 *
 * @description :: Server-side logic for managing equipment
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var subtractreward= function(user_id,point,cb){
    var query={};
    //query.rewardPoint={ $exists: true }
    query.id=user_id;
    var data={};
    
    Users.findOne(query).then(function(userdata){
        if(userdata){
            if(userdata.rewardPoint){
              data.rewardPoint=parseInt(userdata.rewardPoint)-parseInt(point);
            }
            Users.update({id:user_id},data).then(function(updsuccess){
             cb({status:true});   
            });
    }else{

        cb({status:true});   
    }
    });
}


var totalRedeemed= function(user_id,cb){
    var query={};
    var total=0;
    var j=0;
        query.addedBy=user_id;
        query.$or = [
                { status: 'pending'},
                { status: 'approve'}
            ]
        query.isDeleted=false;
    Rewardorders.find(query).then(function(userRewardOrders) {
        if(userRewardOrders.length > 0){
            for (var i = userRewardOrders.length - 1; i >= 0; i--) {
                total= total+ parseInt(userRewardOrders[i].point);

                if(j+1 == userRewardOrders.length){
                  return  cb({total:total});
                }else{
                    j++;
                }
            }
        }else{
            return  cb({total:0});
        }    

    });
}


module.exports = {

    allcities :function(req,res){
        API(commonService.allcities,req,res);
    },
    addcities :function(req,res){
        API(commonService.saveCity,req,res);
    },
    getcity :function(req,res){
        API(commonService.getcity,req,res);
    },
    updatecities :function(req,res){
        console.log("hi in city")
        API(commonService.updateCity,req,res);
    },
    deletecities :function(req,res){
        API(commonService.delete,req,res);
    },
    brandList :function(req,res){
        API(commonService.allBrands,req,res);
    },
    searchCity:function(req,res){
         API(commonService.searchCity,req,res);
    },
    mobUserLiked:function(req,res){
        API(commonService.mobUserLiked,req,res);
    },
    mobUploadImage: function(req, res) {
        console.log(req.body);
        var fs = require('fs');
        var uuid = require('uuid');
        var randomStr = uuid.v4();
        var date = new Date();
        var currentDate = date.valueOf();

        var modelName = req.body.type;

        console.log("modelname",modelName)

        var Model = sails.models[modelName];
        var name = randomStr + "-" + currentDate;
        var imagedata = req.body.data;
        console.log("imagedata=======>",imagedata)

        imageBuffer = this.decodeBase64Image(imagedata);

        var imageType = imageBuffer.type;

        console.log("imageType=======>",imageType)

        var typeArr = new Array();
        typeArr = imageType.split("/");
        var fileExt = typeArr[1];

        console.log("fileExt=======>",fileExt)

        var size = Buffer.byteLength(imagedata, "base64");
        var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
        var test = Math.round(size / Math.pow(1024, i), 2);

        if (size <= 10737418) {
            console.log("here in size")

            if ((fileExt === 'jpeg') || (fileExt === 'JPEG') || (fileExt === 'JPG') || (fileExt === 'jpg') || (fileExt === 'PNG') || (fileExt === 'png')) {
                if (imageBuffer.error) return imageBuffer.error;

                var fullPath = name + '.' + fileExt;
                var imagePath = '/images/' + modelName + '/' + name + '.' + fileExt;
                var uploadLocation = 'assets/images/' + modelName + '/' + name + '.' + fileExt;

                var thumbnails = [];
                fs.writeFile('assets/images/' + modelName + '/' + name + '.' + fileExt, imageBuffer.data, function(imgerr, img) {
                    if (imgerr) {
                        return res.status(400).jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: imgerr
                            },
                        });
                        
                    } else {

                        fs.readFile(uploadLocation, function(err, data) {
                            if (err) {
                                return res.status(400).jsonx({
                                    success: false,
                                    error: {
                                        code: 400,
                                        message: err
                                    },
                                });
                            }
                            if (data) {
                                var thumbpath = 'assets/images/' + modelName + '/thumbnail/200/' + name + '.' + fileExt;
                                //var thumbtempLocation = '.tmp/public/images/'+ modelName + '/thumbnail/' +'200_' +name + '.' + fileExt ;
                                gm(data)
                                    .resize('200', '200', '^')
                                    .write(thumbpath, function(err) {
                                        if (!err) {
                                            var thumbpath1 = 'assets/images/' + modelName + '/thumbnail/300/' + name + '.' + fileExt;
                                            thumbnails.push(thumbpath)
                                            gm(data)
                                                .resize('300', '300', '^')
                                                .write(thumbpath1, function(error) {

                                                    if (!error) {
                                                        thumbnails.push(thumbpath1)
                                                        var thumbpath2 = 'assets/images/' + modelName + '/thumbnail/500/' + name + '.' + fileExt;
                                                        gm(data)
                                                            .resize('500', '500', '^')
                                                            .write(thumbpath2, function(er) {
                                                                if (!er) {

                                                                    var userId = req.identity.id;
                                                                    Users.update({id:userId},{image:fullPath}).exec(function(usererr,userInfo){
                                                                        console.log("userInfo",userInfo)
                                                                        if(userInfo){  
                                                                            return res.status(200).jsonx({
                                                                                success: true,
                                                                                data: {
                                                                                    fullPath: fullPath,
                                                                                    imagePath: imagePath,
                                                                                    //thumbpath : thumbnails
                                                                                },
                                                                            });
                                                                        } else {
                                                                            return res.status(400).jsonx({
                                                                                success: false,
                                                                                error: {
                                                                                    message: "There is some issue with upload image."
                                                                                    
                                                                                },
                                                                            });
                                                                        }
                                                                    })

                                                                    

                                                                }

                                                            })
                                                    } else {
                                                        return res.status(400).jsonx({
                                                            success: false,
                                                            error: {
                                                                code: 400,
                                                                message: constantObj.messages.NOT_UPLOADED
                                                            },
                                                        });
                                                    }

                                                })
                                        } else {
                                            return res.status(400).jsonx({
                                                success: false,
                                                error: {
                                                    code: 400,
                                                    message: constantObj.messages.NOT_UPLOADED
                                                },
                                            });
                                        }
                                    });
                            }
                        });
                    }

                });

            } else {
                return res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.INVALID_IMAGE
                    },
                });

            }
        } else {
            return res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.SIZE_EXCEEDED
                    },
                });
        }
    },
    uploadImages: function(req, res) {
        var fs = require('fs');
        var uuid = require('uuid');
        var randomStr = uuid.v4();
        var date = new Date();
        var currentDate = date.valueOf();

        var modelName = req.body.type;

        var Model = sails.models[modelName];
        var name = randomStr + "-" + currentDate;

        var imagedata = req.body.data;
        imageBuffer = this.decodeBase64Image(imagedata);

        var imageType = imageBuffer.type;

        var typeArr = new Array();
        typeArr = imageType.split("/");
        var fileExt = typeArr[1];

        var size = Buffer.byteLength(imagedata, "base64");
        var i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
        var test = Math.round(size / Math.pow(1024, i), 2);

        if (size <= 10737418) {

            if ((fileExt === 'jpeg') || (fileExt === 'JPEG') || (fileExt === 'JPG') || (fileExt === 'jpg') || (fileExt === 'PNG') || (fileExt === 'png')) {
                if (imageBuffer.error) return imageBuffer.error;

                var fullPath = name + '.' + fileExt;
                var imagePath = '/images/' + modelName + '/' + name + '.' + fileExt;
                var uploadLocation = 'assets/images/' + modelName + '/' + name + '.' + fileExt;

                var thumbnails = [];
                fs.writeFile('assets/images/' + modelName + '/' + name + '.' + fileExt, imageBuffer.data, function(imgerr, img) {
                    if (imgerr) {

                        return res.jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: imgerr

                            },
                        });
                    } else {

                        fs.readFile(uploadLocation, function(err, data) {
                            if (err) {
                                return res.jsonx({
                                    success: false,
                                    error: {
                                        code: 400,
                                        message: err
                                    },
                                });
                            }
                            if (data) {
                                var thumbpath = 'assets/images/' + modelName + '/thumbnail/200/' + name + '.' + fileExt;
                                //var thumbtempLocation = '.tmp/public/images/'+ modelName + '/thumbnail/' +'200_' +name + '.' + fileExt ;
                                gm(data)
                                    .resize('200', '200', '^')
                                    .write(thumbpath, function(err) {
                                        if (!err) {
                                            var thumbpath1 = 'assets/images/' + modelName + '/thumbnail/300/' + name + '.' + fileExt;
                                            thumbnails.push(thumbpath)
                                            gm(data)
                                                .resize('300', '300', '^')
                                                .write(thumbpath1, function(error) {

                                                    if (!error) {
                                                        thumbnails.push(thumbpath1)
                                                        var thumbpath2 = 'assets/images/' + modelName + '/thumbnail/500/' + name + '.' + fileExt;
                                                        gm(data)
                                                            .resize('500', '500', '^')
                                                            .write(thumbpath2, function(er) {
                                                                if (!er) {

                                                                    return res.jsonx({
                                                                        success: true,
                                                                        data: {
                                                                            fullPath: fullPath,
                                                                            imagePath: imagePath,
                                                                            //thumbpath : thumbnails
                                                                        },
                                                                    });

                                                                }

                                                            })
                                                    } else {
                                                        return res.jsonx({
                                                            success: false,
                                                            error: {
                                                                code: 400,
                                                                message: constantObj.messages.NOT_UPLOADED1

                                                            },
                                                        });
                                                    }

                                                })
                                        } else {
                                            return res.jsonx({
                                                success: false,
                                                error: {
                                                    code: 400,
                                                    message: constantObj.messages.NOT_UPLOADED

                                                },
                                            });
                                        }
                                    });
                            }
                        });
                    }

                });

            } else {

                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.INVALID_IMAGE

                    },
                });

            }
        } else {
            return res.jsonx({
                success: false,
                error: {
                    code: 400,
                    message: constantObj.messages.SIZE_EXCEEDED

                },
            });
        }
    },

    /*function to decode base64 image*/
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

    delete: function(req, res) {

        var modelName = req.param('model');
        var Model = sails.models[modelName];
        var itemId = req.param('id');

        let query = {};
        query.id = itemId;

        Model.find(query).exec(function(err, data) {
            if (err) {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.DATABASE_ISSUE
                    }
                });
            } else {

                Model.update({
                    id: itemId
                }, {
                    isDeleted: true,
                    deletedBy: req.identity.id
                }, function(err, data) {
                    if (data) {
                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.messages.DELETE_RECORD
                            }
                        });
                    } else {
                        return res.jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: constantObj.messages.DATABASE_ISSUE
                            }
                        });
                    }

                });
            }
        })
    },

    changeStatus: function(req, res) {

        var modelName = req.param('model');
        var Model = sails.models[modelName];
        var itemId = req.param('id');
        var updated_status = req.param('status');

        let query = {};
        query.id = itemId;

        Model.findOne(query).exec(function(err, data) {

            if (err) {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.DATABASE_ISSUE
                    }
                });
            } else {

                Model.update({
                    id: itemId
                }, {
                    status: updated_status
                }, function(err, response) {
                    if (err) {
                        return res.jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: constantObj.messages.DATABASE_ISSUE
                            }
                        });

                    } else {

                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.messages.STATUS_CHANGED
                            }
                        });
                    }
                });
            }
        })
    },
    FeaturedData:function(req,res){
        API(commonService.FeaturedData,req,res);
    },
    mobFeaturedItem:function(req,res){
        API(commonService.mobFeaturedItem,req,res);
    },
    Search:function(req,res){
        var ip = req.ip;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3]; //'56.70.97.8';
        var city = req.body.city;
        var SearchName = req.body.name;
        var queryItem = {}

	if(city != '') {
            queryItem       = { city:  new RegExp(city, 'i')};            
        }
  
        if(SearchName !=''){
            queryItem.name = new RegExp(SearchName, 'i');
        }

        Item.find(queryItem).then(function(Item){
            var geo = geoip.lookup(ipAddres);
            var len = Item.length;
            var counter = 0;
		    
            if(len >0){
                Item.forEach(function(itemData,index){
                    var latitude =geo.ll[0];
                    var longitude = geo.ll[1];
                    var dist = geodist({lat: latitude, lon: longitude}, {lat: itemData.lat, lon: itemData.lng});
                    Item[index].kilometers = dist*1.60934;
                    if(++counter >= len){
                        return res.jsonx({
                            success: true,
                            data: {
                                Item: Item
                            },
                        });
                    }
                });
		    }else{
		        return res.jsonx({
                    success: true,
                    data: {
                        Item: []
                    },
                });
		    }
        }).fail(function(err){
            console.log("error ",err)
            return res.status(400).jsonx({
                success: false,
                error: err
            });
        })
    },

    subscription: function(req,res){
        var email = req.body.email;

        Subscription.findOne({email:email}).then(function (subscibedUser) {
            
            if(subscibedUser != undefined){
                return res.jsonx({
                    success: true,
                    code: 200,
                    data: {
                        message: "You have already subscribed for InstaLeaf Updates. InstaLeaf will get back to you very soon."
                    }
                });
            } else {
                message = 'Hello Admin,';
                message += '<br/>';
                message += "A user whose email id is <b>"+ email +"</b> wants to connect with you";
                message += '<br/><br/>';
                message += 'Regards';
                message += '<br/>';
                message += 'InstaLeaf Support Team';

                transport.sendMail({
                    from: sails.config.appSMTP.auth.user,
                    to: "nishant.pratham@yopmail.com",
                    subject: "Subscription Email",
                    html: message
                }, function (err, info) {
                    if(err){
                        console.log("message",message)
                        return res.status(400).jsonx({
                            success: false,
                            error:err
                        });
                    } else{
                         
                        Subscription.create({email:email}).then(function (viewentry) {
                            return res.jsonx({
                                success: true,
                                code: 200,
                                data: {
                                    message: "You have been subscribed successfully."
                                }
                            });
                        })
                    }
                });
            }
        })  
    }, 

    onLoadLocation:function(req,res){
        
        var ip = req.ip;
        var options = {
          provider: 'google',
          httpAdapter: 'https', // Default
          apiKey: 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA', // for Mapquest, OpenCage, Google Premier
          formatter: null         // 'gpx', 'string', ...
        };
        var geocoder = NodeGeocoder(options);

    // Using callback;
        ipArray = ip.split(":");
        var ipAddres = ipArray[3]; //'56.70.97.8';

        var geo = geoip.lookup(ipAddres);

        if(geo.city != "" || req.query['lat'] != "") {
            if(req.query['lat']){
            geocoder.reverse({lat:req.query['lat'], lon:req.query['lng']}, function(err, data) {
            return res.jsonx({
                success: true,
                data: {
                    city: data[0].city
                },
            });
            });
            }else{
              return res.jsonx({
                success: true,
                data: {
                    city: geo.city
                },
            });  
            } 
        } else {
            return res.jsonx({
                success: false,
                error: {
                    message: constantObj.city.CITY_NOT_FOUND
                },
            });
        }
    },

    getAllCities: function(req, res, next) {

        var search = req.param('search');
        var sortBy = req.param('sortBy');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = false;

        if (search) {
            query.$or = [{
                    name: {
                        'like': '%' + search + '%'
                    }
                },
                {
                    province: {
                        'like': '%' + search + '%'
                    } 
                }

            ]
        } 
        console.log("query is ",query)     

        City.count(query).exec(function(err, total) {
            console.log("total",total)
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                City.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, city) {
                    console.log("city",city)
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                city: city,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    },

    allprovince:function(req, res){
        Province.find({isDeleted:false,status:"active"}).sort({name:1}).then(function(provinces) {
            if(provinces.length==0){
                return res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.CITY_NOT_FOUND
                    }
                });
            }else{
                return res.jsonx({
                    success: true,
                    data: {
                        city: provinces
                    },
                });
            }
        })
    },
    getReward:function(req,res){
        var query = {};
        query.addedBy = req.identity.id;
        var totalProductReviews = 0;
        var totalDispensaryReviews = 0;
       
        Productreviews.find(query).populate('product_id').sort({'createdAt':-1}).then(function (allreviewsproduct) {
            var condition=query;
            condition.isDeleted=false;
            Productreviews.find(condition).then(function (allreviewsproductCount) {
                query.type='dispensary';
                delete query.isDeleted;
                //console.log(query)
                Reviews.find(query).populate('item_id').sort({'createdAt':-1}).exec(function (err,allreviewdispensary) {
                    condition.type='dispensary';
                    Reviews.find(condition).exec(function (err,allreviewdispensaryCount) {
                        Settings.find({}).then(function (setting) {
                            var query={};
                            query.id=req.identity.id;
                            Users.findOne(query).then(function(userData) {
                            
                                totalRedeemed(req.identity.id,function(totalredeem){

                                    return res.jsonx({
                                            success: true,
                                            data: {
                                                strainPoints: allreviewsproductCount.length*setting[0].reward.product,
                                                dispensaryPoints: allreviewdispensaryCount.length*setting[0].reward.dispensary,
                                                totalEarn:userData.rewardPoint?userData.rewardPoint:'0',
                                                totalRewarded:totalredeem.total,
                                                totalReviewProduct: allreviewsproduct,
                                                totalReviewDispensary: allreviewdispensary,
                                                
                                            },
                                    });
                                });     
                             
                            });  
                        });  
                    })
                })
            })
        }).fail(function(errinfind){
            return res.jsonx({
                success: false,
                error: {
                    code: 400,
                    message: errinfind
                },
            });   
        });
        
    },
    revokedReview: function(req,res){
        var data = req.body;
        
        if(data.type=='product'){
            var modelName ='productreviews';
        }else{
            var modelName ='reviews';
        }

        
        var Model = sails.models[modelName];
       // console.log(Model)
        delete data.type;
        //console.log(data)
        Model.update(data.id,data).then(function (deletedInfo) {
            //console.log(deletedInfo)
            subtractreward(deletedInfo[0].addedBy,deletedInfo[0].reward_point,function(addrewardStatus){});
            return res.jsonx({
                    success: true,
                    data: {
                        data: deletedInfo
                    },
                });

        }).fail(function(errinfind){
            return res.jsonx({
                success: false,
                error: {
                    code: 400,
                    message: errinfind
                },
            });   
        });
    },
    analyticReport: function(req,res){
        var query ={};
       /* query.createdAt={
                $gte: req.body.date_start,
                $lt: req.body.date_end
            };*/
        /*query.product_id=req.params('product_id');
        
        query.item_id=req.params('item_id');*/
       // console.log(query,'')
        Promise.all([
                Reviews.count({"item_id":req.query['item_id']}).then(),
                Favourite.count({"product_id":req.query['product_id']}).then(),
                Productviewed.count({"productId":req.query['product_id']}).then(),
            ]).spread(function(Reviews,Favourite,Productviewed) {

                console.log(Reviews,'------------------')
                console.log(Favourite,'------------------')
                console.log(Productviewed,'------------------')



            });


            if(req.query['type'] == 'yearly'){
                var condition={
                       "date_year" : {
                          "$year" : "$createdAt"
                       },
                        "detail":"$product",
                        "product_id":"$product_id",
                    }
            }else if(req.query['type']== 'monthly'){
                var condition={
                       "date_year" : {
                          "$year" : "$createdAt"
                       },
                          "date_month" : {
                             "$month" : "$createdAt"
                       },
                        "detail":"$product",
                        "product_id":"$product_id",
                    }
            }else{
                var condition={
                       "date_year" : {
                          "$year" : "$createdAt"
                       },
                          "date_month" : {
                             "$month" : "$createdAt"
                       },
                           "day": {
                             "$dayOfMonth": "$createdAt" 
                        },
                        "detail":"$product",
                        "product_id":"$product_id",
                    }
            }

            Favourite.native(function(err, itemList) {
            itemList.aggregate([
                {
                    $lookup: {
                        from: 'product',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: "product"
                    }
                },
                
                {
                    $unwind: '$addedBy'
                },
                {
                 "$group" : {
                    "_id" : condition ,
                    "count" : {
                       "$sum" : 0
                    },
                    "sum" : {
                       "$sum" : 1
                    }
                 }
              },
              {
                 "$sort" : {
                    "createdAt" : -1
                 }
              },
              {
                 "$project" : {
                    "Year" : "$_id.date_year",
                    "Month" : "$_id.date_month",
                    "Day" : "$_id.day",
                    "detail":"$_id",
                    "name":"$_id.name",
                    "sum" : 1.0, //show it
                    "_id" : 0.0 //hide it
                 }
              },
              {
                 "$limit" : 10.0
              }
           ],function (err, totalresults) {
                if (err){
                    return res.status(400).jsonx({
                        success: false,
                        error: err
                    }); 
                } else {
                    return res.jsonx({
                        success: true,
                        data: {
                            data: totalresults
                        },
                    });
                }
            });
        })

    },
    adminAllTxn:function(req, res){

        var page = req.query['page'];
        var count = parseInt(req.query['count']);
        var skipNo = (page - 1) * count;
        var sortBy = req.query['sortBy'];
        var query = {};
        var sortquery = {};
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }
        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        if(typeof search !='undefined' && search!=''){
            query.name = new RegExp(search, 'i');

        }
        query.isDeleted = false;

                
        Transcation.native(function(err, txnList) {
            txnList.aggregate([
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
                        exp_date: "$exp_date",
                        transaction_id: "$transaction_id",
                        payment_status: "$payment_status",
                        price:"$original_price",
                        plan_type:"$plan_type",
                        val_day: "$val_day",
                        addedBy: "$addedBy.username1",
                        addedByID: "$addedBy._id",
                        type:"$type",
                        detail: "$detail",
                        isDeleted: "$isDeleted",
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

                    txnList.aggregate([
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
                                exp_date: "$exp_date",
                                transaction_id: "$transaction_id",
                                payment_status: "$payment_status",
                                price:"$original_price",
                                plan_type:"$plan_type",
                                val_day: "$val_day",
                                addedBy: "$addedBy.username1",
                                addedByID: "$addedBy._id",
                                type:"$type",
                                detail: "$detail",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt"
                            }
                        },
                        {
                            $match: query
                        },
                        {
                            $sort: sortquery
                        },
                        {
                            $skip: skipNo
                        },
                        {
                            $limit: count
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
}; // End of module export
