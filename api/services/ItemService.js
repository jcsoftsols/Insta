var Promise = require('bluebird'),
promisify = Promise.promisify;
var bcrypt    = require('bcrypt-nodejs');
//var commonServiceObj = require('./commonService');
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;

 var add_product = function(data,addedBy,cb){
    /*if(data.product_id && typeof data.product_id!='undefined'){
        return cb(null,data.product_id);
    }else{*/
      var productData = {};

       // console.log("===========data ====",data);
      // console.log("===========cbd ====",typeof data.cbd);
      // return false;
      productData.name = data.name;
      productData.addedBy = addedBy;
      productData.itemId = data.dispensary_id;
      productData.category_id = data.category_id;
      productData.detail = data.details;
      productData.meta_desc = data.meta_desc;
      productData.meta_name = data.meta_name;
      if(data.thc=='' && typeof data.thc=='string'){
        productData.thc = 0; 
      }else{
        productData.thc = parseInt(data.thc);
      }
      if(data.cbd=='' && typeof data.cbd=='string'){
        productData.cbd = 0;
      }else{
        productData.cbd = parseInt(data.cbd);
      }
      if(data.isForDelivery && typeof data.isForDelivery!='undefined'){
        productData.isForDelivery = data.isForDelivery;
      }

      productData.slug = data.slug;
      productData.image = data.image;
      //console.log("==========pro=====",productData);
      return Product.create(productData).then(function(newProduct){
            var product_id = newProduct.id;
            return cb(null,product_id);
        }).catch(function(err1){
            return cb(err1);
           
          }); 
    /*}*/
    //return cb();
}


var itemReview = function(dispensary_id,cb){
  return Reviews.find({item_id:dispensary_id}).populate('addedBy').then(function(itemReview){
    return cb(null,itemReview);
  }).catch(function(err1){
      return cb(err1);
  }); 
}

module.exports = {
  addUserItemProduct:function(data,context,req,res){

    var createdBy = context.identity.id;
    var date = new Date();
      var data = data.data;
       if(data.length==0){
          return res.jsonx({
              success: true,
              data: {
                  message: constantObj.messages.NO_DATA_FOUND,
              }
          })
      }else{
          Itemproduct.find({createdBy:createdBy}).exec(function (err,itemProductData) {
              if(err){
                return res.jsonx({
                    success: false,
                    data: {
                        message: err,
                    }
                })
            }else{
                var length = itemProductData.length;
                //console.log("Yes ",length);
                if(length > 0){
                    Itemproduct.destroy({createdBy:createdBy}).exec(function(err,data1){
                      if(err){
                          return res.jsonx({
                              success: false,
                              data: {
                                  message: err,
                              }
                          })
                      }else{
                        var counter = 0;
                        //console.log("===========data ",data);
                        //console.log("=============",data); 
                        //return false;
                        data.forEach(function(item,index){
                            //console.log("Index ",index);
                            item.createdBy = context.identity.id;
                            if(item.product_id=='' || typeof item.product_id=='undefined'){
                                var condition = {name:item.name}; 
                            }else{
                                var condition = {product_id:ObjectID(item.product_id)}; 
                            }
                            condition.dispensary_id = ObjectID(item.dispensary_id);
                            if(item.brand_name !=''){
                              condition.brand_name = item.brand_name;
                            }
                            condition.createdBy = context.identity.id;
                            //console.log("====ss===============condition======",condition)
                            Itemproduct.find(condition).exec(function (err,itemproducts) {
                              if(itemproducts.length > 0){
                                  return res.jsonx({
                                      success: true,
                                      data: {
                                          message: constantObj.messages.ALREADY_EXIST_ANOTHER_BRAND,
                                          key:item.name
                                      }
                                  })

                              }else{
                                delete item.id;
                                  add_product(item,context.identity.id,function(error,ProductResponse){
                                      item.product_id = ProductResponse;
                                      API.Model(Itemproduct).create(item).then(function (itemproduct) {
                                           if(counter == (data.length-1)){
                                             return res.jsonx({
                                                  success: true,
                                                  data: {
                                                      message: constantObj.messages.ITEM_PRODUCT_SUCCESS,
                                                  }
                                              })
                                          }
                                          counter++;
                                      });
                                  });
                              }
                            });
                        })
                      }
                      
                    })
                }else{
                  var counter = 0;
                  data.forEach(function(item,index){
                      //console.log("Index ",index);
                      item.createdBy = context.identity.id;
                      if(item.product_id=='' || typeof item.product_id=='undefined'){
                          var condition = {name:item.name}; 
                      }else{
                          var condition = {product_id:ObjectID(item.product_id)}; 
                      }
                      condition.dispensary_id = ObjectID(item.dispensary_id);
                      if(item.brand_name !=''){
                        condition.brand_name = item.brand_name;
                      }
                      condition.createdBy = context.identity.id;
                      //console.log("===mmmm================condition======",condition)
                      Itemproduct.find(condition).exec(function (err,itemproducts) {
                        //console.log("====itemproducts",itemproducts)
                        if(itemproducts.length > 0){
                            return res.jsonx({
                                success: true,
                                data: {
                                    message: constantObj.messages.ALREADY_EXIST_ANOTHER_BRAND,
                                    key:item.name
                                }
                            })

                        }else{
                          //console.log("item ",item);
                          delete item.id;
                            add_product(item,context.identity.id,function(error,ProductResponse){
                                item.product_id = ProductResponse;
                                API.Model(Itemproduct).create(item).then(function (itemproduct) {
                                     if(counter == (data.length-1)){
                                       return res.jsonx({
                                            success: true,
                                            data: {
                                                message: constantObj.messages.ITEM_PRODUCT_SUCCESS,
                                            }
                                        })
                                    }
                                    counter++;
                                });
                            });
                        }
                      });
                  })
                }
            }
          });
      }

  },
  addItemProduct:function(data,context,req, res){
		    var date = new Date();
		    var data = data.data;
        console.log("==============",data);
        //console.log("=====================",data.length);
        var counter = 0;
        if(data.length==0){
          console.log('hello-----------------')
            return res.jsonx({
                success: true,
                data: {
                    message: constantObj.messages.NO_DATA_FOUND,
                }
            })
        }else{
            data.forEach(function(item,index){
                console.log("Index ",index);
                item.createdBy = context.identity.id;
                //var condition = {};
                if(item.product_id=='' || typeof item.product_id=='undefined'){
                    var condition = {name:item.name}; 
                }else{
                    var condition = {product_id:ObjectID(item.product_id)}; 
                }
                condition.dispensary_id = item.dispensary_id;
                if(item.brand_name !=''){
                  condition.brand_name = item.brand_name;
                }

                if(item.pre_roll==null){
                  item.pre_roll = 0;
                }
                if(item.Eighth==null){
                  item.Eighth = 0;
                }
                if(item.quarter==null){
                  item.quarter = 0;
                }
                if(item.grams==null){
                  item.grams = 0;
                }
                if(item.half==null){
                  item.half = 0;
                }
                if(item.ounce==null){
                  item.ounce = 0;
                }
                if(item.thc==null){
                  item.thc = 0;
                }
                if(item.cbd==null){
                  item.cbd = 0;
                }
  
            Settings.find({}).then(function (SettingData) {
                  item.commsion=SettingData[0].commission;
                  item.fare_charges=SettingData[0].fare_charges;
                })
                  item.isForDelivery=item.isForDelivery;
                  var str=item.name;
                  var slug =str.replace(/\s+/g, '-');
                  item.slug=slug;
                Itemproduct.find(condition).then(function (itemproducts) {
                    if(itemproducts.length > 0){
                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.messages.ALREADY_EXIST_ANOTHER_BRAND,
                                key:item.name
                            }
                        })

                    }else{
                      
                        add_product(item,context.identity.id,function(error,ProductResponse){
                            //console.log("=========error ,",error);
                            //console.log("=========ProductResponse ,",ProductResponse);
                            if(error){
                                return res.jsonx({
                                    success: false,
                                    error: error
                                });
                            }else{
                              console.log("I am here jhjhvjhvj",item);
                                item.product_id = ProductResponse;
                                API.Model(Itemproduct).create(item).then(function (itemproduct) {
                                     if(counter == (data.length-1)){
                                       return res.jsonx({
                                            success: true,
                                            data: {
                                                message: constantObj.messages.ITEM_PRODUCT_SUCCESS,
                                            }
                                        })
                                    }
                                    counter++;
                                }).catch(function(err1){
                                  return res.jsonx({
                                    success: false,
                                    error: err1
                                  });
                                }); 
                            }
                            
                        });
                    }
                }).catch(function(err){
                    return res.jsonx({
                      success: false,
                      error: err1
                    });
                }); 
            });
        }
    },
    editItemProduct :function(data,context,req, res){
      var id = data.id;
      console.log("Id ",id)
      delete data.id;
      Itemproduct.find({id:id}).exec(function(err,itemproduct){
          if(err){
              return res.jsonx({
                  success: false,
                  data: {
                      message: err,
                  }
              })
          }else{
              var _id = itemproduct[0].id;
              var product_id = data.product_id;
              
              if(context.identity.id===itemproduct[0].createdBy){
                Itemproduct.update({id:id}, data).exec(function(updatedData) {
                  var productData = {thc:data.thc,cbd:data.cbd,detail:data.details}
                  Product.update({id:product_id},productData).exec(function(err,data){
                      return res.jsonx({
                          success: true,
                          code:200,
                          data: {
                              message: constantObj.messages.ITEM_PRODUCT_UPDATED,
                              key: 'ITEM_PRODUCT_UPDATED',
                          },
                      })
                  })
                })
              }else{
                  return res.jsonx({
                    success: true,
                    code:200,
                    data: {
                        message: constantObj.messages.NO_ACCESS,
                        key: 'NO_ACCESS',
                    },
                })
              }
          }
      })
    },
    getItemProduct:function(data,context,req, res){
      console.log("data ",data)
      Itemproduct.find({id:data.id}).exec(function(err,itemproduct){
          if(err){
              return res.jsonx({
                  success: false,
                  data: {
                      message: err,
                  }
              })
          }else{
              return res.jsonx({
                  success: true,
                  code:200,
                  data: {
                      message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                      key: itemproduct,
                  },
              })
          }
      });

    },
    AllProductItemByMap:function(data,context,req, res){
      var NodeGeocoder = require('node-geocoder');
 
      var options = {
      provider: 'google',

      // Optional depending on the providers
      httpAdapter: 'https', // Default
      apiKey: 'AIzaSyDmvz3A-BAjR77dy4PsaoHJC15mUdffLSA', // for Mapquest, OpenCage, Google Premier
      formatter: null         // 'gpx', 'string', ...
      };

      var geocoder = NodeGeocoder(options);
      var lat=req.query['lat'];
      var lon=req.query['lon'];
      geocoder.reverse({lat:lat, lon:lon}, function(err, responce) {
        
      
      if(responce){
      var city=responce[0].city;
      Item.find({city:city}).exec(function(err,itemproduct){
          if(err){
              return res.jsonx({
                  success: false,
                  data: {
                      message: err,
                  }
              })
          }else{
              return res.jsonx({
                  success: true,
                  code:200,
                  data: {
                      message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                      key: itemproduct,
                  },
              })
          }
      });
    }else{

    }
    });
    },
    AllProductByUser:function(data,context,req,res){
        var addedBy = context.identity.id;
        Itemproduct.find({createdBy:addedBy}).exec(function(err,data){
            if(err){
                return res.jsonx({
                    success: false,
                    data: {
                        message: err,
                    }
                })
            }else{
                var length = data.length;
                if(length == 0){
                    return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.NO_DATA_FOUND,
                        }
                    })
                }else{
                    return res.jsonx({
                        success: true,
                        data: {
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key:data
                        }
                    })
                }
            }

        });
    },
    mobAllProductsByItem:function(data,context,req,res){
        console.log("================",data);
        Itemproduct.find({dispensary_id:(data.id)}).populate('category_id').exec(function(err,itemproduct){
          if(err){
              return res.status(400).jsonx({
                  success: false,
                  error: err
              }); 
              
          }else{
            Item.find({id:data.id}).exec(function(err,item){
                var group_to_values = itemproduct.reduce(function (obj, item) {
                                obj[item.category_id.name] = obj[item.category_id.name] || [];
                                obj[item.category_id.name].push(item);
                                return obj;
                            }, {});
                            console.log("============data ",group_to_values);
                if(err){
                  return res.status(400).jsonx({
                      success: false,
                      message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                      key: group_to_values,
                  }); 
                  
                }else{
                  itemReview(data.id,function(err,ItemReviews){
                    if(err){
                        return res.status(200).jsonx({
                            success: true,
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key: group_to_values,
                            item:item
                        });
                    }else{
                        return res.status(200).jsonx({
                            success: true,
                            message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                            key: group_to_values,
                            item:item,
                            ItemReviews:ItemReviews
                        });
                    }
                  })
                   
                }
            });
          }
      });
    },
    AllProductsByItem:function(data,context,req, res){
      console.log("================",data);
        Itemproduct.find({dispensary_id:(data.id)}).populate('category_id').exec(function(err,itemproduct){
          if(err){
              return res.jsonx({
                  success: false,
                  data: {
                      message: err,
                  }
              })
          }else{
            Item.find({id:data.id}).exec(function(err,item){
                if(err){
                  return res.jsonx({
                      success: true,
                      code:200,
                      data: {
                          message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                          key: itemproduct,
                      },
                  })
                }else{
                  return res.jsonx({
                      success: true,
                      code:200,
                      data: {
                          message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                          key: itemproduct,
                          item:item
                      },
                  })
                }
            });
          }
      });
    },
    ItemReviewsWithProduct:function(data,context,req,res){
        var itemId = req.param('id');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var name = req.param('name');
        var category_id = req.param('category_id');
        var price = req.param('price');
        var range = price.split("-");
        var startPrice = parseInt(range[0]);
        var endPrice = parseInt(range[1]);

        console.log("data ",data);
        console.log("=========startPrice ",startPrice);

        console.log("====endPrice===",endPrice)

        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        var query = {};
        if(price !=''){
              if(startPrice == 40){
                var query = {Eighth:{$gt:startPrice}}
              }else{
                var query = {Eighth:{$gt:startPrice,$lte:endPrice}}
              }
        }
       

        query.dispensary_id = ObjectID(itemId);
        
        if(category_id){
          query.category_id = ObjectID(category_id);
        }

       
        if (name) {
            query.$or = [
                            { name: {$regex: name, '$options' : 'i'}},
                            { details: {$regex:name,'$options':'i'}}
                        ]
        }

        console.log("====================",query)

        Itemproduct.native(function(err, itemList) {
            itemList.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
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
                        dispensary_id:"$dispensary_id",
                        name: "$name",
                        pre_roll: "$pre_roll",
                        Eighth: "$Eighth",
                        quarter:"$quarter",
                        half:"$half",
                        ounce: "$ounce",
                        addedBy: "$addedBy.username1",
                        category_id: "$category_id",
                        details: "$details",
                        thc: "$thc",
                        grams: "$grams",
                        quarter: "$quarter",
                        image:"$image",
                        isDeleted:"$isDeleted",
                        cbd:"$cbd",
                        status:"$status",
                        brand_name:"$brand_name",
                        product_id:"$product_id",
                        createdBy:"$createdBy",
                        createdAt:"$createdAt"
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
                                localField: 'createdBy',
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
                                dispensary_id:"$dispensary_id",
                                name: "$name",
                                pre_roll: "$pre_roll",
                                Eighth: "$Eighth",
                                quarter:"$quarter",
                                half:"$half",
                                ounce: "$ounce",
                                addedBy: "$addedBy.username1",
                                category_id: "$category_id",
                                details: "$details",
                                thc: "$thc",
                                grams: "$grams",
                                quarter: "$quarter",
                                image:"$image",
                                isDeleted:"$isDeleted",
                                cbd:"$cbd",
                                status:"$status",
                                brand_name:"$brand_name",
                                product_id:"$product_id",
                                createdBy:"$createdBy",
                                createdAt:"$createdAt"
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
    AllProductItemByCategory:function(data,context,req,res){
        var category_id = req.param('category_id');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var sortquery = {};
        //var query={};
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );
        var query = {createdBy:ObjectID(context.identity.id)};

        if(category_id){
             query.category_id = ObjectID(category_id);
        }

        if(category_id !=''){
            query.category_id = ObjectID(category_id);
        }
        query.isDeleted = false;
        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;
        console.log("============",query);
        Itemproduct.native(function(err, ItemproductList) {
            ItemproductList.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
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
                        pre_roll: "$pre_roll",
                        Eighth: "$Eighth",
                        quarter:"$quarter",
                        half:"$half",
                        ounce: "$ounce",
                        addedBy: "$addedBy.username1",
                        category_id: "$category_id",
                        details: "$details",
                        thc: "$thc",
                        image:"$image",
                        isDeleted:"$isDeleted",
                        cbd:"$cbd",
                        status:"$status",
                        brand_name:"$brand_name",
                        brand_name:"$brand_name",
                        dispensary_id:"$dispensary_id",
                        createdBy:"$createdBy",
                        createdAt:"$createdAt",
                        grams:"$grams"
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

                    ItemproductList.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'createdBy',
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
                              pre_roll: "$pre_roll",
                              Eighth: "$Eighth",
                              quarter:"$quarter",
                              half:"$half",
                              ounce: "$ounce",
                              addedBy: "$addedBy.username1",
                              category_id: "$category_id",
                              details: "$details",
                              thc: "$thc",
                              image:"$image",
                              isDeleted:"$isDeleted",
                              cbd:"$cbd",
                              status:"$status",
                              brand_name:"$brand_name",
                              brand_name:"$brand_name",
                              dispensary_id:"$dispensary_id",
                              createdBy:"$createdBy",
                              createdAt:"$createdAt",
                              grams:"$grams"
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
    addSlugItemProduct:function(data,context,req,res){
        
        return Itemproduct.find({}).then(function(itemDetail) {
            console.log(itemDetail)
            var counter=0; 
            var x=0;
            
            var processItems = function(x){
              if( x < itemDetail.length ) {
                var str=itemDetail[x].name;
                var slug =str.replace(/\s+/g, '-');
                
                data.meta_name = itemDetail[x].name;
                Itemproduct.findOne({slug:slug}).then(function (dispensaryResponse) {
                   
                  if(typeof dispensaryResponse != undefined){
                      data.slug= slug+'-'+Math.floor(Math.random()*(999-100+1)+100); 
                      data.meta_desc = itemDetail[x].details;   
                    }else{
                       data.slug=slug;
                       data.meta_desc = itemDetail[x].details;
                    } 

                console.log('----------------------',x)
                     console.log(data)
                    Itemproduct.update({id:itemDetail[x].id}, data).then(function(dispensary) {processItems(x+1);});
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
              }
            };
          processItems(0);  
         });
    },
}
