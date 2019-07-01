var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;


var getReviewTagCount = function(id,totalReviews,cb){
//console.log('function calling...');
var arrData =[];
var arrData1 =[];
var arrData2 =[];
var arrData3 =[];
    Productreviewsubcategory.find({}).then(function (reviewtags) {
        var totalTags=0;
        var query={};
            query.isDeleted=false;
            query.product_id = id; 
        Productreviews.find(query).then(function (data) { 
            console.log(data);
            /*for (var i=0;i< data.length;i++){
            */     
                // totalTags+=data[i].tags.length;
                totalTags=data.length;
            /*}*/
            console.log('total----------',totalTags);
        var processItems = function(i){
            if(i < reviewtags.length){

            
             var query={};
            query.isDeleted=false;
            query.product_id = id;  
            query.tags={ $all: [reviewtags[i].id] };


        Productreviews.find(query).then(function (data) { 
            var arr={};
         if(data.length){
            arr.tagrecords=data.length;
            arr.percentage=data.length/totalTags * 100;
            arr.tagdetail=reviewtags[i];
            
            if(reviewtags[i].name == 'Effects' || reviewtags[i].name == 'effects'){
                arrData1.push(arr);
            }else if(reviewtags[i].name == 'Medical' || reviewtags[i].name == 'medical'){
                arrData2.push(arr);
            }else{
                arrData3.push(arr);
            }
            
         }

         processItems(i+1); 
        });
        }else{

            arrData.push({"Effects":arrData1});
            arrData.push({"Medical":arrData2});
            arrData.push({"Negative":arrData3});
         cb({status:true,data:arrData});
      } 
       
      } 
      processItems(0);
    });
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
              data.rewardPoint=parseInt(userdata.rewardPoint)+Setting[0].reward.product;
            }else{
              data.rewardPoint=Setting[0].reward.product;  
            }
            Users.update({id:user_id},data).then(function(updsuccess){
             cb({status:true});   
            });
        });
    });
}

module.exports = {
    postReview: function(req,res){
    	var data = req.body;
        if(((!data.product_id) || typeof data.product_id == undefined)){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.product.ID_REQUIRED} });
        }
        
        data.addedBy = req.identity.id;

        var query = {};
        query.isDeleted = false;
        query.status = "active";
        query.type = data.type;
        query.addedBy = req.identity.id;

        if(data.product_id){
            query.product_id = data.product_id;
        }  

        Productreviews.findOne(query).then(function(pro) {
            
            if(pro) {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.product.REVIEW_ALREADY_EXIST
                    },
                });

            } else {
                Settings.find({}).then(function(Setting) {
                    data.reward_point=Setting[0].reward.product;
                    Productreviews.create(data).then(function(prod) {
                        var productQuery = {};
                        //var Model = {}
                        var businessType = prod.type

                        if(prod.type == 'product'){
                            var Model = sails.models['product'];
                            productQuery.id = data.product_id;
                        }

                        Model.findOne(productQuery).then(function(success){
                            
                            let rateQuery = {};
                            let numberOfReviews = success.totalReviews;
                            let averageRating = success.totalRating;

                            rateQuery.totalReviews = numberOfReviews + 1;
                            rateQuery.totalRating = parseFloat(((numberOfReviews*averageRating) + prod.rating)/(numberOfReviews+1))
                            
                            if(success){
                                addreward(req.identity.id,function(addrewardStatus){})
                                    Model.update({id:success.id},rateQuery).then(function(updsuccess){
                                        if(updsuccess){
                                            return res.jsonx({
                                                success: true,
                                                code:200,
                                                data: {
                                                    product:prod,
                                                    message: constantObj.product.REVIEW_SAVED
                                                },
                                            });
                                        } else {
                                            return res.jsonx({
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
                                return res.jsonx({
                                    success: false,
                                    error: {
                                        code: 400,
                                        message: constantObj.product.ISSUE_IN_DB
                                    },
                                });  
                            }
                        });
                    })
                    .fail(function(err){
                        return res.jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: constantObj.product.ISSUE_IN_DB
                            },
                        });   
                    });
                })
                .fail(function(err){
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.product.ISSUE_IN_DB
                        },
                    });   
                });
            }
        }).fail(function(err){ 
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: err
                    },
                });   
        });
    },

    getReview: function(req,res){

        //var ObjectId = require('mongodb').ObjectID;
        var queryReview = {};
        queryReview.addedBy = req.identity.id;
        queryReview.isDeleted = false;

        console.log("queryReview",queryReview);

        Product.findOne(queryReview).then(function(dispensaryDetailForReview) {
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
                Productreviews.find(result).populate('addedBy').then(function (reviewlist) {
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

                        return res.jsonx({
                            success: true,
                            code:200,
                            data: {
                                reviews:reviewlist,
                                count:totalRcd,
                                avg:reviewsAvg,
                                message: constantObj.product.GET_REVIEWS_SUCCESSFULLY
                            },
                        });
                        
                    } else {
                        console.log("here123")
                        return res.jsonx({
                            success: true,
                            code: 200,
                            data: {
                                message: constantObj.messages.NO_REVIEWS_FOUND
                            },
                        });
                    }

                }).fail(function(err){ 
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: err
                        },
                    });   
                });
            } else {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.ITEM_NOT_FOUND
                    },
                });
            } 
        });
    },
    updatereviewdetail: function(req,res){
    	var data = req.body;
        data.updatedBy = req.identity.id;
        var totalReviews = 0;
        var totalRating = 0;
        Productreviews.update(data.id,data).then(function (reviewInfo) {

            if(reviewInfo){
                var productQuery={};
                productQuery.product_id = reviewInfo[0].product_id;
                productQuery.isDeleted = false;

                Productreviews.find(productQuery).then(function (allreviewsData) {
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

                    Product.update(productId,dataforUpdate).then(function(success){
                        return res.jsonx({
                            success: true,
                            code:200,
                            data: {
                                key:reviewInfo,
                                message: constantObj.product.REVIEW_UPDATED
                            },
                        });
                    }).fail(function(err){
                        return res.jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: err
                            },
                        });   
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
            } else {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.product.ISSUE_IN_DB
                    },
                });
            }

        })
        .fail(function(err){ 
            return res.jsonx({
                success: false,
                error: {
                    code: 400,
                    message: err
                },
            });   
        });
    },
    reviewDetail:function(req,res){
        console.log(req.params)
    	var data = req.params;
        if((!data.id) || typeof data.id == undefined){ 
          return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.messages.PRODUCT_ID_REQUIRED} });
        }
        var query = {id:data.id}
        
        Productreviews.findOne(query).populate('product_id').populate('addedBy').then(function (review_detail) {
            
            if(review_detail){
               Productreviewsubcategory.find({ "id" : {$in:review_detail.tags}}).then(function (reviewtags) { 
                return res.jsonx({
                    success: true,
                    data: {
                        key:review_detail,
                        tagdetail:reviewtags,
                        message: constantObj.messages.SUCCESSFULLY_EXECUTED
                    }
                })
            });
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
    getAllReview: function(req,res){

        //var ObjectId = require('mongodb').ObjectID;
        var queryReview = {};
        queryReview.id = req.params['id'];
        queryReview.isDeleted = false;

         
        Product.findOne(queryReview).then(function(dispensaryDetailForReview) {
            //console.log("here =====>", dispensaryDetailForReview);

            if(dispensaryDetailForReview != undefined){
                var arrData=[];
                var result= {};
                result.status = "active";
                result.isDeleted = false;
                //result.type = dispensaryDetailForReview.businessType;
                result.product_id = req.params['id'];    
                
                Productreviews.find(result).populate('addedBy').then(function (reviewlist) {
                    
                    if(reviewlist.length>0){
                        console.log("here")
                        let reviewsAvg = 0;
                        let avg = 0;
                        let totalRcd =  reviewlist.length ;
                        
                        reviewlist.forEach( function(row){
                            avg = row.rating + avg ;
                        });
                        
                        reviewsAvg = avg / totalRcd;
                         getReviewTagCount(req.params['id'],reviewlist.length,function(response){
         
                        return res.jsonx({
                            success: true,
                            code:200,
                            data: {
                                reviews:reviewlist,
                                count:totalRcd,
                                avg:reviewsAvg,
                                tagcount:response.data,
                                message: constantObj.product.GET_REVIEWS_SUCCESSFULLY
                            },
                        });
                     });
                    } else {
                        console.log("here123")
                        return res.jsonx({
                            success: true,
                            code: 200,
                            data: {
                                message: constantObj.messages.NO_REVIEWS_FOUND
                            },
                        });
                    }

                }).fail(function(err){ 
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: err
                        },
                    });   
                });
            } else {
                return res.jsonx({
                    success: false,
                    error: {
                        code: 400,
                        message: constantObj.messages.ITEM_NOT_FOUND
                    },
                });
            } 
        });
    },
   
}