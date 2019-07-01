/**
  * #DESC:  In this class/files crops related functions
  * #sRequest param: Crops add form data values
  * #Return : Boolen and sucess message
  * #Author: JCsoftware Solution
*/

var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");
var path = require('path');
var csv=require('csvtojson');

function getCategory(catData,cb){
    Category.findOne({name:catData.name}).exec(function(errData,isdata){
        //console.log("====isdata===",isdata.id);
        if(errData){
            return cb({cat_id:0});
        }else{
            if(isdata.length==0){
                return cb({cat_id:0});
            }else{
                return cb({cat_id:isdata.id});
            }
        }
    });
}
var addreward= function(user_id,cb){
    var query={};
    //query.rewardPoint={ $exists: true }
    query.id=user_id;
    var data={};
    Users.findOne(query).then(function(userdata){
        Settings.find({}).then(function(Setting) {
            //console.log(userdata)
            if(userdata.rewardPoint){
              data.rewardPoint=parseInt(userdata.rewardPoint)+Setting[0].reward.dispensary;
            }else{
              data.rewardPoint=Setting[0].reward.dispensary;  
            }
            Users.update({id:user_id},data).then(function(updsuccess){
             cb({status:true});   
            });
        });
    });
}
var subtractreward= function(user_id,name,cb){
    var query={};
    //query.rewardPoint={ $exists: true }
    query.id=user_id;
    var data={};
    
    Users.findOne(query).then(function(userdata){
        if(userdata){
        Settings.find({}).then(function(Setting) {
            
            if(name =='product'){
                var rewards=Setting[0].reward.product;
            }else{
                var rewards=Setting[0].reward.dispensary;
            }
            if(userdata.rewardPoint){
              data.rewardPoint=parseInt(userdata.rewardPoint)-rewards;
            }
            Users.update({id:user_id},data).then(function(updsuccess){
             cb({status:true});   
            });
        });
    }else{

        cb({status:true});   
    }
    });
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
    bulkProductUpload:function(data,context,req,res){
        
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
            var fullPath = name + '.' + fileExt;
            var imagePath = 'assets/importProductData/' + name + '.' + fileExt;
            
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
                }else{
                    csv()
                    .fromFile(csvFilePath)
                    .then((jsonObj)=>{
                        var len = jsonObj.length;
                        var counter = 0;
                        jsonObj.forEach(function(item,index){
                            //console.log("====ITEM "+index,item);
                            item.businessType = 'dispensary';
                            var addedBy = context.identity.id;
                            var catData = {name:item.Category}
                            var importData = [];
                            getCategory(catData,function(catResponse){
                                item.category_id = catResponse.cat_id;
                                importData.push({name:item.Name,source:'file',addedBy:addedBy,category_id:item.category_id,thc:item.THC,cbd:item.CBD,detail:item.Details});
                                Importproduct.findOne({name:item.Name,category_id:item.category_id}).exec(function(errData,isdata){
                                    if(errData){
                                        failData.push(errData); 
                                    }else{
                                       if(isdata){
                                            alreadyExist.push(importData); 
                                        }else{
                                            Importproduct.create(importData).then(function(data){
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
    

    
    delete: function (data, context) {
        data.deletedBy = context.identity.id;
        data.isDeleted = true;

        return Product.update(data.id,data).then(function (productInfo) {
            
            if(productInfo){
                return {
                    success: true,
                    code:200,
                    data: {
                        product:productInfo,
                        message: constantObj.product.DELETED_PRODUCT
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
    mobpostreview: function(data,context,req,res){
        if(((!data.product_id) || typeof data.product_id == undefined) && ((!data.item_id) || typeof data.item_id == undefined)){ 
            res.status(404).jsonx({
                success: false,
                error: {code: 404,message: constantObj.product.ID_REQUIRED}
            });
        }
        
        data.addedBy = context.identity.id;

        var query = {};
        query.isDeleted = false;
        query.status = "active";
        query.type = data.type;
        query.addedBy = context.identity.id;

        if(data.product_id){
            query.product_id = data.product_id;
        }else {
            query.item_id = data.item_id
        }   
        return Reviews.findOne(query).then(function(pro) {
            
            if(pro) {
                res.status(400).jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.product.REVIEW_ALREADY_EXIST
                    },
                });

            } else {
                
                return Settings.find({}).then(function(Setting) {
                    data.reward_point=Setting[0].reward.dispensary
                console.log("in else",data)
                return Reviews.create(data).then(function(prod) {
                    console.log("prod",prod);
                    var productQuery = {};
                    var Model;
                    //var Model = {}
                    var businessType = prod.type

                    if(prod.type == 'product'){
                        Model = sails.models['product'];
                        productQuery.id = data.product_id;
                    } else {
                        productQuery.id = data.item_id
                        Model = sails.models['item'];
                    } 
                    return Model.findOne(productQuery).then(function(success){
                        let rateQuery = {};
                        let numberOfReviews = success.totalReviews;
                        let averageRating = success.totalRating;

                        rateQuery.totalReviews = numberOfReviews + 1;
                        rateQuery.totalRating = parseFloat(((numberOfReviews*averageRating) + prod.rating)/(numberOfReviews+1))
                        
                        if(success){
                            return Model.update({id:success.id},rateQuery).then(function(updsuccess){
                                if(updsuccess){
                                    addreward(context.identity.id,function(addrewardStatus){});
                                    res.status(200).jsonx({
                                        success: true,
                                        code:200,
                                        data: {
                                            product:prod,
                                            message: constantObj.product.REVIEW_SAVED
                                        },
                                    });
                                    
                                }

                            })
                        } else{
                            res.status(400).jsonx({
                                success: false,
                                error: {
                                    code: 400,
                                    message: constantObj.product.ISSUE_IN_DB
                                },
                            });  
                        }
                    });
                })
                })
                .fail(function(err){
                    res.status(400).jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.product.ISSUE_IN_DB
                        },
                    });  
                });
            }
        }).fail(function(err){ 
                    res.status(400).jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: err
                        },
                    });  
                });
    },
    postReview: function(data,context){
        if(((!data.product_id) || typeof data.product_id == undefined) && ((!data.item_id) || typeof data.item_id == undefined)){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.product.ID_REQUIRED} };
        }
        
        data.addedBy = context.identity.id;

        var query = {};
        query.isDeleted = false;
        query.status = "active";
        query.type = data.type;
        query.addedBy = context.identity.id;

        if(data.product_id){
            query.product_id = data.product_id;
        }else {
            query.item_id = data.item_id
        }   

        return Reviews.findOne(query).then(function(pro) {
            
            if(pro) {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.product.REVIEW_ALREADY_EXIST
                    },
                };

            } else {
                return Settings.find({}).then(function(Setting) {
                    data.reward_point=Setting[0].reward.dispensary
                return Reviews.create(data).then(function(prod) {
                    var productQuery = {};
                    //var Model = {}
                    var businessType = prod.type

                    if(prod.type == 'product'){
                        var Model = sails.models['product'];
                        productQuery.id = data.product_id;
                    } else {
                        productQuery.id = data.item_id
                        var Model = sails.models['item'];
                    } 

                    return Model.findOne(productQuery).then(function(success){
                        
                        let rateQuery = {};
                        let numberOfReviews = success.totalReviews;
                        let averageRating = success.totalRating;

                        rateQuery.totalReviews = numberOfReviews + 1;
                        rateQuery.totalRating = parseFloat(((numberOfReviews*averageRating) + prod.rating)/(numberOfReviews+1))
                        
                        if(success){
                            addreward(context.identity.id,function(addrewardStatus){})
                            return Model.update({id:success.id},rateQuery).then(function(updsuccess){
                                if(updsuccess){
                                    return {
                                        success: true,
                                        code:200,
                                        data: {
                                            product:prod,
                                            message: constantObj.product.REVIEW_SAVED
                                        },
                                    };
                                } else {
                                    return {
                                        success: true,
                                        code:200,
                                        data: {
                                            product:prod,
                                            message: constantObj.product.REVIEW_SAVED
                                        },
                                    };
                                }

                            })
                        } else{
                            return {
                                success: false,
                                error: {
                                    code: 400,
                                    message: constantObj.product.ISSUE_IN_DB
                                },
                            };  
                        }
                    });
                })
                })
                .fail(function(err){
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

    getReview: function(data,context){

        //var ObjectId = require('mongodb').ObjectID;
        var queryReview = {};
        queryReview.addedBy = context.identity.id;
        queryReview.isDeleted = false;

        console.log("queryReview",queryReview);

        return Item.findOne(queryReview).then(function(dispensaryDetailForReview) {
            //console.log("here =====>", dispensaryDetailForReview);

            if(dispensaryDetailForReview != undefined){
                
                var result= {};
                result.status = "active";
                result.isDeleted = false;
                //result.type = dispensaryDetailForReview.businessType;
            
                if(dispensaryDetailForReview.businessType == 'product'){
                    result.product_id = dispensaryDetailForReview.id;    
                } else {
                    result.item_id = dispensaryDetailForReview.id;    
                }
                return Reviews.find(result).populate('addedBy').then(function (reviewlist) {
                    console.log("reviewlist",reviewlist);

                    if(reviewlist.length>0){
                        console.log("here")
                        let reviewsAvg = 0;
                        let avg = 0;
                        let totalRcd =  reviewlist.length ;
                        
                        reviewlist.forEach( function(row){
                            avg = row.rating + avg ;
                        });
                        
                        reviewsAvg = avg / totalRcd;

                        return {
                            success: true,
                            code:200,
                            data: {
                                reviews:reviewlist,
                                count:totalRcd,
                                avg:reviewsAvg,
                                message: constantObj.product.GET_REVIEWS_SUCCESSFULLY
                            },
                        };
                        
                    } else {
                        console.log("here123")
                        return {
                            success: true,
                            code: 200,
                            data: {
                                message: constantObj.messages.NO_REVIEWS_FOUND
                            },
                        };
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
            } else {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.ITEM_NOT_FOUND
                    },
                };
            } 
        });
    },

    get_products:function(data,context,req,res){
        data.addedBy = context.identity.id
        var name = data.name;
        
        if((!data.name) || typeof data.name == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.messages.ITEM_PRODUCT_NAME_REQUIRED, key: 'ITEM_PRODUCT_NAME_REQUIRED'} };
        }

        var condition = {name: 
            {
                $regex: new RegExp(name, 'i')
            }
        };
        
        var fields = {"name":1,}
        Product.find(condition,fields).populate('producer').then(function (products) {
            if(products.length > 0){
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                        key:products
                    }
                })
            } else {
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.NO_PRODUCT,
                    }
                })
            }
        })
    },
  
    productDetail:function(data,context,req,res){
        if((!data.id) || typeof data.id == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.messages.PRODUCT_ID_REQUIRED, key: 'PRODUCT_ID_REQUIRED'} };
        }

         var query = {id: ObjectID(data.id)};

        console.log("==============",query);
        Product.find(query).populate('producer').then(function (product_detail) {
            if(product_detail.length > 0){
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                        key:product_detail
                    }
                })
            }else{
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.NO_PRODUCT,
                    }
                })
            }
        })

        
    },

    productDeliverDetail:function(data,context,req,res){
        if((!data.id) || typeof data.id == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.messages.PRODUCT_ID_REQUIRED, key: 'PRODUCT_ID_REQUIRED'} };
        }
        var query ={};
        query.id = data.id;
        query.isDeleted = false;

        // Itemproduct.find(query).populate("dispensary_id").then(function (product_detail) {
        Product.find(query).populate("category_id").then(function (product_detail) {
            if(product_detail.length > 0){
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                        key:product_detail
                    }
                })
            }else{
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.NO_PRODUCT,
                    }
                })
            }
        })

        
    },

    reviewDetail:function(data,context,req,res){
        if((!data.id) || typeof data.id == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.messages.PRODUCT_ID_REQUIRED} };
        }
        var query = {id:data.id}
        
        Reviews.findOne(query).then(function (review_detail) {
            
            if(review_detail){
                return res.jsonx({
                    success: true,
                    data: {
                        key:review_detail,
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED
                    }
                })
            }else{
                return res.jsonx({
                    success: true,
                    data: {
                        message: constantObj.messages.NO_PRODUCT,
                    }
                })
            }
        })
    },

    updatereviewdetail: function(data,context){

        data.updatedBy = context.identity.id;
        var totalReviews = 0;
        var totalRating = 0;
        return Reviews.update(data.id,data).then(function (reviewInfo) {

            if(reviewInfo){
                var productQuery={};
                productQuery.product_id = reviewInfo[0].product_id;
                productQuery.isDeleted = false;

                return Reviews.find(productQuery).then(function (allreviewsData) {
                    console.log("allreviewsData",allreviewsData)
                    for(var j=0;j<allreviewsData.length;j++){
                        totalRating += allreviewsData[j].rating;
                    }
                    totalReviews = allreviewsData.length;
                    totalRating = totalRating/totalReviews;
                    console.log("totalRating",totalRating, "-----",totalReviews);

                    
                    var productId = reviewInfo[0].product_id;
                    var dataforUpdate = {};
                    dataforUpdate.totalRating = totalRating;
                    dataforUpdate.totalReviews = totalReviews;

                    return Product.update(productId,dataforUpdate).then(function(success){
                        return {
                            success: true,
                            code:200,
                            data: {
                                key:reviewInfo,
                                message: constantObj.product.REVIEW_UPDATED
                            },
                        };
                    }).fail(function(err){
                        return {
                            success: false,
                            error: {
                                code: 400,
                                message: err
                            },
                        };   
                    });
                }).fail(function(errinfind){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: errinfind
                        },
                    };   
                });
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

    updateItemReviewDetail: function(data,context){

        data.updatedBy = context.identity.id;
        var totalReviews = 0;
        var totalRating = 0;
        return Reviews.update(data.id,data).then(function (reviewInfo) {

            if(reviewInfo){
                var productQuery={};
                productQuery.item_id = reviewInfo[0].item_id;
                productQuery.isDeleted = false;

                return Reviews.find(productQuery).then(function (allreviewsData) {
                    console.log("allreviewsData",allreviewsData)
                    for(var j=0;j<allreviewsData.length;j++){
                        totalRating += allreviewsData[j].rating;
                    }
                    totalReviews = allreviewsData.length;
                    totalRating = totalRating/totalReviews;
                    console.log("totalRating",totalRating, "-----",totalReviews);

                    
                    var itemId = reviewInfo[0].item_id;
                    var dataforUpdate = {};
                    dataforUpdate.totalRating = totalRating;
                    dataforUpdate.totalReviews = totalReviews;

                    return Item.update(itemId,dataforUpdate).then(function(success){
                        return {
                            success: true,
                            code:200,
                            data: {
                                key:reviewInfo,
                                message: constantObj.product.REVIEW_UPDATED
                            },
                        };
                    }).fail(function(err){
                        return {
                            success: false,
                            error: {
                                code: 400,
                                message: err
                            },
                        };   
                    });
                }).fail(function(errinfind){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: errinfind
                        },
                    };   
                });
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
    mobFavourite:function(data,context,req,res){
        if(((!data.product_id) || typeof data.product_id == undefined) && ((!data.item_id) || typeof data.item_id == undefined)){ 
            return res.status(400).jsonx({
                success: false,
                message: constantObj.product.ID_REQUIRED
            }); 

        }
        console.log("=============dara ",data);
        data.addedBy = context.identity.id;

        var query = {};

        if(data.type == 'product'){
            query.product_id = data.product_id;
            if(data.item_id){
                query.item_id = data.item_id
            }
        } else {
            query.item_id = data.item_id;
        }

        query.addedBy = context.identity.id;

        console.log("=========query ",query);

        Favourite.findOne(query).then(function(pro) {
            console.log("=========pro ",pro);
            if(pro) {
                var deletedquery = {}
                deletedquery.id = pro.id
                Favourite.destroy(deletedquery).then(function(deletedProduct) {
                    return res.status(200).jsonx({
                        success: true,
                        message: constantObj.favourite.REMOVED_FAVOURITE
                    }); 
                })

            } else {
                Favourite.create(data).then(function(prod) {
                    console.log("=========prod ",prod);
                    return res.status(200).jsonx({
                        success: true,
                        product:prod,
                        message: constantObj.product.ADD_FAVOURITE
                    }); 
                })
                .fail(function(err){
                    return res.status(400).jsonx({
                        success: false,
                        message: constantObj.product.ISSUE_IN_DB+"===+"+err
                    });    
                });
            }
        }).fail(function(err){ 
                return res.status(400).jsonx({
                    success: false,
                    message: constantObj.product.ISSUE_IN_DB+"="+err
                }); 
        });
    },
    addFavourite:function(data,context){

        if(((!data.product_id) || typeof data.product_id == undefined) && ((!data.item_id) || typeof data.item_id == undefined)){ 

            return {"success": false, "error": {"code": 404,"message": constantObj.product.ID_REQUIRED} };
        }
        data.addedBy = context.identity.id;

        var query = {};

        if(data.type == 'product'){
            query.product_id = data.product_id;
            if(data.item_id){
                query.item_id = data.item_id
            }
        } else {
            query.item_id = data.item_id;
        }

        query.addedBy = context.identity.id;

        return Favourite.findOne(query).then(function(pro) {

            if(pro) {
                var deletedquery = {}
                deletedquery.id = pro.id
                return Favourite.destroy(deletedquery).then(function(deletedProduct) {

                    return {
                        success: true,
                        data: {
                            message: constantObj.favourite.REMOVED_FAVOURITE
                        },
                    };
                })

            } else {
                return Favourite.create(data).then(function(prod) {
                    return {
                        success: true,
                        code:200,
                        data: {
                            product:prod,
                            message: constantObj.product.ADD_FAVOURITE
                        },
                    };
                })
                .fail(function(err){
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
                        message: constantObj.product.ISSUE_IN_DB
                    },
                };   
        });

    },
    addSlugProduct:function(data,context,req,res){
        
        return Product.find({}).then(function(itemDetail) {
            console.log(itemDetail)
            var counter=0; 
            var x=0;
            
            var processItems = function(x){
              if( x < itemDetail.length ) {
                var str=itemDetail[x].name;
                var slug =str.replace(/\s+/g, '-');
                
                data.meta_name = itemDetail[x].name;
                Product.findOne({slug:slug}).then(function (dispensaryResponse) {
                   
                  if(typeof dispensaryResponse != undefined){
                      data.slug= slug+'-'+Math.floor(Math.random()*(999-100+1)+100); 
                      data.meta_desc = itemDetail[x].detail;   
                    }else{
                       data.slug=slug;
                       data.meta_desc = itemDetail[x].detail;
                    } 

                console.log('----------------------',x)
                     console.log(data)
                    Product.update({id:itemDetail[x].id}, data).then(function(dispensary) {processItems(x+1);});
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
    deleteReviews: function (data, context) {

        return Productreviews.update(data.id,data).then(function (deletedInfo) {
            console.log("deletedInfo",deletedInfo)
            
            if(deletedInfo){
                var totalReviews = 0;
                var totalRating = 0; 

                var deletedProductQuery={};
                deletedProductQuery.product_id = deletedInfo[0].product_id;
                deletedProductQuery.isDeleted = false;

                return Productreviews.find(deletedProductQuery).then(function (reviewsData) {
                    var dataforUpdate = {};
                    var productId = deletedInfo[0].product_id;
                    
                    if(reviewsData.length>0){
                        for(var j=0;j<reviewsData.length;j++){
                            totalRating += reviewsData[j].rating;
                        }
                        
                        totalReviews = reviewsData.length;
                        totalRating = totalRating/totalReviews;
                    }                
                    dataforUpdate.totalRating = totalRating;
                    dataforUpdate.totalReviews = totalReviews;

                    return Product.update(productId,dataforUpdate).then(function(success){
                        subtractreward(deletedInfo[0].addedBy,'product',function(addrewardStatus){});
                        return {
                            success: true,
                            code:200,
                            data: {
                                key:deletedInfo,
                                message: constantObj.product.DELETED_REVIEWS
                            },
                        };
                        
                    }).fail(function(err){
                        return {
                            success: false,
                            error: {
                                code: 400,
                                message: err
                            },
                        };   
                    });
                }).fail(function(errinfind){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: errinfind
                        },
                    };   
                });                
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
    itemdeleteReviews: function (data, context) {

        return Reviews.update(data.id,data).then(function (deletedInfo) {
                        
            if(deletedInfo){
                var totalReviews = 0;
                var totalRating = 0;

                var deletedProductQuery={};
                deletedProductQuery.item_id = deletedInfo[0].item_id;
                deletedProductQuery.isDeleted = false;

                return Reviews.find(deletedProductQuery).then(function (reviewsData) {
                    var dataforUpdate = {};
                    var itemId = deletedInfo[0].item_id;
                    
                    if(reviewsData.length>0){
                        for(var j=0;j<reviewsData.length;j++){
                            totalRating += reviewsData[j].rating;
                        }
                        
                        totalReviews = reviewsData.length;
                        totalRating = totalRating/totalReviews;
                    }                            
                        dataforUpdate.totalRating = totalRating;
                        dataforUpdate.totalReviews = totalReviews;
                    /*} else {
                        dataforUpdate.totalRating = 0;
                        dataforUpdate.totalReviews = 0;
                    }*/
                    subtractreward(deletedInfo[0].addedBy,'dispensary',function(addrewardStatus){});
                    return Item.update(itemId,dataforUpdate).then(function(success){
                        return {
                            success: true,
                            code:200,
                            data: {
                                key:deletedInfo,
                                message: constantObj.product.DELETED_REVIEWS
                            },
                        };
                    }).fail(function(err){
                        return {
                            success: false,
                            error: {
                                code: 400,
                                message: err
                            },
                        };   
                    });
                    
                }).fail(function(errinfind){
                    return {
                        success: false,
                        error: {
                            code: 400,
                            message: errinfind
                        },
                    };   
                });                
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
}; // End Delete service class