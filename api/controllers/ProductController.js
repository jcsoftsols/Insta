/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
    save: function(req, res) {
        var data=req.body;
        var count=0;
        var arr=[];
        var arr1=[];
        if((!data.name) || typeof data.name == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.product.NAME_REQUIRED} });
        }
                
        if((!data.user_visits) || typeof data.user_visits == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.messages.ITEM_USERVISIT_REQUIRED} });
        }
        if((!data.category_id) || typeof data.category_id == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.messages.ITEM_CATEGORY_REQUIRED} });
        }
        if((data.city.length==0) || typeof data.city.length==undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.messages.ITEM_CITY_REQUIRED} });
        }
        data.addedBy = req.identity.id;

            var subcategories=data.product_subcategory;
            Productcategory.find({id:{ $in: subcategories } }).then(function(pro_cat){
            var processItems = function(x){
                if( x < pro_cat.length ) {
                arr.push(pro_cat[x].name);   
                arr1.push(pro_cat[x].subcategoryname); 
                
                processItems(x+1);  
                }else{
                    data.product_category=arr
                    data.product_subcategoryname=arr1
                    var str=data.name;
                    var slug =str.replace(/\s+/g, '-');
                    data.slug=slug;
                Product.create(data).then(function(prod) {
                    return res.jsonx({
                        success: true,
                        code:200,
                        data: {
                            product:data,
                            message: constantObj.product.PRODUCT_SAVED
                        },
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
            }
            processItems(0);
            });
    },
    update: function(req, res) {
        var data= req.body;
        var arr=[];
        var arr1=[];

        data.updatedBy = req.identity.id;
        var subcategories=data.product_subcategory;

            Productcategory.find({id:{ $in: subcategories } }).then(function(pro_cat){

            var processItems = function(x){
                if( x < pro_cat.length ) {
                arr.push(pro_cat[x].name);   
                arr1.push(pro_cat[x].subcategoryname); 
                
                processItems(x+1);  
                }else{
                    data.product_category=arr
                    data.product_subcategoryname=arr1
                  console.log(data,'-------------data');
          Product.update(data.id,data).then(function (productInfo) {
            
             if(productInfo){
                 return res.jsonx({
                     success: true,
                     code:200,
                     data: {
                         product:productInfo,
                         message: constantObj.product.UPDATED_PRODUCT
                     },
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
         }
        }
            processItems(0);
        });
    },
    get_products:function(req,res){
        API(ProductService.get_products,req,res);
    },
    productDetail:function(req,res){
        API(ProductService.productDetail,req,res);
    },
    productDeliverDetail:function(req,res){
        API(ProductService.productDeliverDetail,req,res);
    },
    getReviewsDetail:function(req,res){
        API(ProductService.reviewDetail,req,res);
    },
    updateReviewDetail:function(req,res){
        API(ProductService.updatereviewdetail,req,res);
    },

    updateItemReviewDetail:function(req,res){
        API(ProductService.updateItemReviewDetail,req,res);
    },
    deleteReviews: function(req, res) {
        API(ProductService.deleteReviews, req, res);
    },
    itemdeleteReviews: function(req, res) {
        API(ProductService.itemdeleteReviews, req, res);
    },
    delete: function(req, res) {
        API(ProductService.delete, req, res);
    },
    bulkProductUpload:function(req,res){
        API(ProductService.bulkProductUpload,req,res);
    },
    addSlugProduct:function(req,res){
        API(ProductService.addSlugProduct,req,res);
    },
    viewProduct: function(req,res) {
        let Id = ObjectId(req.param('id'));

        var query ={};
        query.id = req.param('id');

        let ip = req.ip
        var viewquery = {}
        viewquery.ipAddress = ip;

        var count = 0;
        
        Product.findOne(query).populate('addedBy').populate('producer').populate('category_id').then(function(productInfo){

            viewquery.productId = Id;

            if(productInfo){
                var totalview = productInfo.userVisit;

                Productviewed.find(viewquery).exec(function(err,response){
                Terpen.find({ id: { $in: productInfo.terpene_profile}}).exec(function(err,terperProfile){
                    productInfo.terpenDetail=terperProfile;
                    if(response == undefined || response == ''){
                            if(req.param('userid')){
                                viewquery.userid = req.param('userid') ;            
                            }
                            Productviewed.create(viewquery).then(function (viewentry) {
                                totalview = totalview + 1;
                                Product.update({id: req.param('id')},{userVisit:totalview}).then(function (productdetail) {
                                    
                                    return res.jsonx({
                                        success: true,
                                        code: 200,
                                        data: productInfo
                                        
                                    });
                            
                                })
                            })
                    } else {
                        
                        return res.jsonx({
                            success: true,
                            code: 200,
                            data: productInfo
                            
                        });
                    }
                
                })
                })
            } else {
               return res.status(400).jsonx({
                    success: false,
                    error: constantObj.product.PRODUCT_DETAIL_ISSUE
                }); 
            }
        });
    },
    viewSlugProduct: function(req,res) {
        var query ={};
        query.slug = req.param('slug');

        let ip = req.ip
        var viewquery = {}
        viewquery.ipAddress = ip;

        var count = 0;
        
        Product.findOne(query).populate('addedBy').populate('producer').populate('category_id').then(function(productInfo){

            viewquery.productId = productInfo['id'];

            if(productInfo){
                var totalview = productInfo.userVisit;

                Productviewed.find(viewquery).exec(function(err,response){
                Terpen.find({ id: { $in: productInfo.terpene_profile}}).exec(function(err,terperProfile){
                    productInfo.terpenDetail=terperProfile;
                    if(response == undefined || response == ''){
                            if(req.param('userid')){
                                viewquery.userid = req.param('userid') ;            
                            }
                            Productviewed.create(viewquery).then(function (viewentry) {
                                totalview = totalview + 1;
                                Product.update({id: req.param('id')},{userVisit:totalview}).then(function (productdetail) {
                                    
                                    return res.jsonx({
                                        success: true,
                                        code: 200,
                                        data: productInfo
                                        
                                    });
                            
                                })
                            })
                    } else {
                        
                        return res.jsonx({
                            success: true,
                            code: 200,
                            data: productInfo
                            
                        });
                    }
                
                })
                })
            } else {
               return res.status(400).jsonx({
                    success: false,
                    error: constantObj.product.PRODUCT_DETAIL_ISSUE
                }); 
            }
        });
    }, 
    prodctList:function(req,res){
        
       sails.sockets.broadcast('192.168.43.207','192.168.43.207', { greeting: 'Hola!' });
        //sails.sockets.broadcast(req)
         console.log(req)
        //sails.sockets.emit('192.168.43.207', req);
        //console.log(req,'-------')
        //req.isSocket === true;

        Product.find({status:'active',isDeleted:false}).populate('producer').sort({name:1}).exec(function(err,products){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: products
                }); 
            }

        });
    },
    getAllProduct: function(req, res, next) {

        var search = req.param('product');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var name = req.param('name');
        var city = req.param('city');
        var type = req.param('type');
        
       
        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        if(city){
            var query = {city:city};
        }else{
            var query = {};
        }
        
        query.isDeleted = false;

        if(type){
            query.type=type;    
        }

        if (search) {
            query.$or = [
                            { name: {$regex: search, '$options' : 'i'}},
                            { city:{$regex: search, '$options' : 'i'}},
                            { category: {$regex: search, '$options' : 'i'}}
                        ]
        }
        /*req.isSocket === true

        if(sails.sockets.public('192.168.43.207', {owl: 'hoot'})){
            console.log('hiiii')
        }else{
            console.log('bye')
        }*/
        Product.native(function(err, productlist) {
            productlist.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'addedBy',
                        foreignField: '_id',
                        as: "addedBy"
                    }
                },
                {
                    $lookup: {
                        from: 'producer',
                        localField: 'producer',
                        foreignField: '_id',
                        as: "producer"
                    }
                },
                
                {
                    $lookup: {
                        from: 'category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: "category"
                    }
                },
                /*{
                    $lookup: {
                        from: 'productcategory',
                        localField: 'product_subcategory',
                        foreignField: '_id',
                        as: "product_subcategory"
                    }
                },*/
               /* { "$unwind": "$product_category" },
                // Do the lookup matching
                { "$lookup": {
                   "from": "productcategory",
                   "localField": "product_category",
                   "foreignField": "_id",
                   "as": "productObjects"
                }},
                // Unwind the result arrays ( likely one or none )
                { "$unwind": "$productObjects" },
                // Group back to arrays
                { "$group": {
                    "_id": "$_id",
                    "products": { "$push": "$products" },
                    "productObjects": { "$push": "$productObjects" }
                }},*/

                {
                    $unwind: '$category'
                },
                {
                    $unwind: {
                      path: '$producer',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: '$addedBy'
                },
                /*{
                    $unwind: '$product_subcategory'
                },*/
                {
                    $project: {
                        id: "$_id",
                        name: "$name",
                        city: "$city",
                        thc: "$thc",
                        cbd: "$cbd",
                        type: "$type",
                        user_visits: "$user_visits",
                        category: "$category.name",
                        reviews:"$totalReviews",
                        rating:"$totalRating",
                        detail: "$detail",
                        product_category: "$product_category",
                        product_subcategory: "$product_subcategory",
                        product_subcategoryname: "$product_subcategoryname",
                        producer: "$producer",
                        second_name: "$second_name",
                        addedBy: "$addedBy.username1",
                        status: "$status",
                        isFeatured: "$isFeatured",
                        isDeleted: "$isDeleted",
                        createdAt:"$createdAt",
                        updatedAt:"$updatedAt",
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

                    productlist.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "addedBy"
                            }
                        },
                        {
                            $lookup: {
                                from: 'producer',
                                localField: 'producer',
                                foreignField: '_id',
                                as: "producer"
                            }
                        },
                        
                        {
                            $lookup: {
                                from: 'category',
                                localField: 'category_id',
                                foreignField: '_id',
                                as: "category"
                            }
                        },
                        /*{
                            $lookup: {
                                from: 'productcategory',
                                localField: 'product_subcategory',
                                foreignField: '_id',
                                as: "product_subcategory"
                            }
                        },*/
                        /*{ "$unwind": "$product_category" },
                        // Do the lookup matching
                        { "$lookup": {
                           "from": "productcategory",
                           "localField": "product_category",
                           "foreignField": "_id",
                           "as": "productObjects"
                        }},
                        // Unwind the result arrays ( likely one or none )
                        { "$unwind": "$productObjects" },
                        // Group back to arrays
                        { "$group": {
                            "_id": "$_id",
                            "products": { "$push": "$products" },
                            "productObjects": { "$push": "$productObjects" }
                        }},*/
                        {
                            $unwind: '$category'
                        },
                        {
                           $unwind: {
                              path: '$producer',
                              preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: '$addedBy'
                        },
                        /*{
                            $unwind: '$product_subcategory'
                        },*/
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                city: "$city",
                                thc: "$thc",
                                cbd: "$cbd",
                                type: "$type",
                                user_visits: "$user_visits",
                                category: "$category.name",
                                reviews:"$totalReviews",
                                rating:"$totalRating",
                                detail: "$detail",
                                product_category: "$product_category",
                                product_subcategory: "$product_subcategory",
                                product_subcategoryname: "$product_subcategoryname",
                                producer: "$producer",
                                second_name: "$second_name",
                                addedBy: "$addedBy.username1",
                                status: "$status",
                                isFeatured: "$isFeatured",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt",
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
                                    products: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    }, 
    mobAllProducts: function(req, res, next) {

        var search = req.param('search');
        // var page = req.param('page');
        // var count = req.param('count');
        // var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var name = req.param('name');
        var city = req.param('city');
        var categorySearch = req.body.category;
        
        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        //count = parseInt( count );
       

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        if(city){
            var query = {city:city};
        }else{
            var query = {};
        }
        
        query.isDeleted = false;

        if (search) {
            query.name = new RegExp(search, 'i')
            // query.$or = [
            //                 { name: {$regex: search, '$options' : 'i'}},
            //                 { city:{$in:[search]}},
            //                 { category: {$regex: search, '$options' : 'i'}}
            //             ]
        }

        if(typeof categorySearch !='undefined' && categorySearch.length > 0){
            query.$or = [
                {category:{$in:categorySearch}}
            ]
        }
        console.log("===========query ",query)
       
         
        Product.native(function(err, productlist) {
            productlist.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'addedBy',
                        foreignField: '_id',
                        as: "addedBy"
                    }
                },
                
                {
                    $lookup: {
                        from: 'category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: "category"
                    }
                },
                {
                    $unwind: '$category'
                },
                {
                    $unwind: '$addedBy'
                },
                {
                    $project: {
                        id: "$_id",
                        name: "$name",
                        city: "$city",
                        thc: "$thc",
                        cbd: "$cbd",
                        user_visits: "$user_visits",
                        category: "$category.name",
                        reviews:"$totalReviews",
                        rating:"$totalRating",
                        detail: "$detail",
                        addedBy: "$addedBy.username1",
                        status: "$status",
                        isFeatured: "$isFeatured",
                        isDeleted: "$isDeleted",
                        createdAt:"$createdAt",
                        updatedAt:"$updatedAt",
                        image:"$image"
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

                    productlist.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "addedBy"
                            }
                        },
                        
                        {
                            $lookup: {
                                from: 'category',
                                localField: 'category_id',
                                foreignField: '_id',
                                as: "category"
                            }
                        },
                        {
                            $unwind: '$category'
                        },
                        {
                            $unwind: '$addedBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                city: "$city",
                                thc: "$thc",
                                cbd: "$cbd",
                                user_visits: "$user_visits",
                                category: "$category.name",
                                reviews:"$totalReviews",
                                rating:"$totalRating",
                                detail: "$detail",
                                addedBy: "$addedBy.username1",
                                status: "$status",
                                isFeatured: "$isFeatured",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt",
                                image:"$image"
                            }
                        },
                        {
                            $match: query
                        },
                        {
                            $sort: sortquery
                        }
                    ],function (err, results) {

                        
                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            
                            var group_to_values = results.reduce(function (obj, item) {
                                obj[item.category] = obj[item.category] || [];
                                obj[item.category].push(item);
                                return obj;
                            }, {});
                            console.log("==========data ",group_to_values)
                            return res.status(200).jsonx({
                                success: true,
                                products: group_to_values
                            });
                        }
                    });
                }
            });
           
        })
    },
    mobProductReviews:function(req,res,next){
        var search = req.param('product');
        // var page = req.param('page');
        // var count = req.param('count');
        // var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var id = req.param('id');

        var query = {}
        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        //count = parseInt( count );

        query.isDeleted = false;
        query.type = "product";
        query.product_id =  ObjectId(id); 
        //query.product_id = id; 

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        /*if (search) {
            query.$or = [
                            { addedby: {$regex: search, '$options' : 'i'}},
                            { detail: {$regex: search, '$options' : 'i'}}                            
                        ]
        }*/

        console.log("query is",query);
        Reviews.native(function(err, reviewlist) {
            reviewlist.aggregate([
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
                        product_id:"$product_id",
                        rating:"$rating",
                        detail: "$detail",
                        type:"$type",
                        addedby: "$addedBy.username1",
                        image:"$addedBy.image",
                        status: "$status",
                        isFeatured: "$isFeatured",
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

                    reviewlist.aggregate([
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
                                product_id:"$product_id",
                                rating:"$rating",
                                type:"$type",
                                detail: "$detail",
                                addedby: "$addedBy.username1",
                                image:"$addedBy.image",
                                status: "$status",
                                isFeatured: "$isFeatured",
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
                        }
                    ],function (err, results) {

                        
                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            Product.findOne({id:id}).then(function(productDetail){
                                
                                if(typeof productDetail=='undefined'){
                                    Itemproduct.findOne({id:id}).then(function(productDetail){
                                        return res.status(200).jsonx({
                                            success: true,
                                            productDetail:productDetail,
                                            products: results,
                                            total: totalresults.length
                                        });
                                    })
                                }else{
                                    return res.status(200).jsonx({
                                        success: true,
                                        productDetail:productDetail,
                                        products: results,
                                        total: totalresults.length
                                    });
                                }
                               
                            })
                            
                        }
                    });
                }
            });
           
        })


    },
    getReviewsOfProduct: function(req, res, next) {

        var search = req.param('product');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var id = req.param('id');

        var query = {}
        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );

        query.isDeleted = false;
        query.type = "product";
        query.product_id =  ObjectId(id); 
        //query.product_id = id; 

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        /*if (search) {
            query.$or = [
                            { addedby: {$regex: search, '$options' : 'i'}},
                            { detail: {$regex: search, '$options' : 'i'}}                            
                        ]
        }*/
       
        console.log("query is",query);
        Productreviews.native(function(err, reviewlist) {
            reviewlist.aggregate([
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
                        product_id:"$product_id",
                        rating:"$rating",
                        detail: "$detail",
                        type:"$type",
                        addedby: "$addedBy.username1",
                        status: "$status",
                        isFeatured: "$isFeatured",
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

                    reviewlist.aggregate([
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
                                product_id:"$product_id",
                                rating:"$rating",
                                type:"$type",
                                detail: "$detail",
                                addedby: "$addedBy.username1",
                                status: "$status",
                                isFeatured: "$isFeatured",
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
                                    products: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    },

    getReviewsOfItems: function(req, res, next) {

        var search = req.param('product');
        var page = req.param('page');
        var type = req.param('type');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var id = req.param('id');

        var query = {}
        var sortquery = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );

        query.isDeleted = false;
        //query.type = "dispensary";
        //query.type = type;
        query.item_id =  ObjectId(id); 
        //query.product_id = id; 

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        if(search) {
            query.$or = [
                            { addedby: {$regex: search, '$options' : 'i'}},
                            { addedBy: {$regex: search, '$options' : 'i'}},
                            { detail: {$regex: search, '$options' : 'i'}}                            
                        ]
        }
       
        console.log("query is",query);
        Reviews.native(function(err, reviewlist) {
            reviewlist.aggregate([
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
                        item_id:"$item_id",
                        rating:"$rating",
                        detail: "$detail",
                        type:"$type",
                        addedby: "$addedBy.username1",
                        addedBy: "$addedBy.username1",
                        image:"$addedBy.image",
                        status: "$status",
                        isFeatured: "$isFeatured",
                        isDeleted: "$isDeleted",
                        createdAt:"$createdAt",
                        updatedAt:"$updatedAt",
                        replies:"$replies"
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

                    reviewlist.aggregate([
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
                                item_id:"$item_id",
                                rating:"$rating",
                                type:"$type",
                                detail: "$detail",
                                addedby: "$addedBy.username1",
                                addedBy: "$addedBy.username1",
                                image:"$addedBy.image",
                                status: "$status",
                                isFeatured: "$isFeatured",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt",
                                replies:"$replies"
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
                                    products: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });           
        })
    },

    mobpostreviews: function(req, res) {
        API(ProductService.mobpostreview, req, res);
    },
    postReviews: function(req, res) {
        API(ProductService.postReview, req, res);
    },      

    getReviewsWithType: function(req, res) {
        API(ProductService.getReview, req, res);
    },

    makeFavourite: function(req, res) {
        API(ProductService.addFavourite, req, res);
    },
    mobFavourite:function(req,res){
        API(ProductService.mobFavourite, req, res);
    },
    myDispensaries: function(req, res, next) {

        console.log("test test te");

        var page        = req.param('page');
        var count       = req.param('count');
        var skipNo      = (page - 1) * count;
        var search      = req.param('search');
        var sortBy      = req.param('sortBy');
        var query       = {};

        var sortquery ={};

        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count= parseInt(count);
        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;
       

        //query.addedBy = req.identity.id;
        query.addedBy = ObjectId( req.identity.id ) ;
        query.type = 'dispensary';


        if (search) {
            query.$or = [
                            { name: {$regex: search, '$options' : 'i'}},
                            { address:{$regex: search, '$options' : 'i'}}, 
                            { about_us:{$regex: search, '$options' : 'i'}}, 
                            { city:{$regex: search, '$options' : 'i'}} 
                            
                        ]
        }
        console.log("page is",page)
        console.log("count is",count)
        console.log("sortBy is",sortBy)
        console.log("query is",query,sortquery)

        Favourite.native(function(err, favouriteList) {
            console.log("favouriteList",favouriteList)
            favouriteList.aggregate([
                {
                    $lookup: {
                        from: "item",
                        localField: "item_id",
                        foreignField: "_id",
                        as: "dispensary"
                    }
                },
                {
                    $unwind: '$dispensary'
                },
                
                {
                    $project: {
                        id: "$dispensary.id",
                        dispensary_id: "$dispensary.id",
                        name: "$dispensary.name",
                        address: "$dispensary.address",
                        city: "$dispensary.city",
                        postal_code: "$dispensary.postal_code",
                        mobile: "$dispensary.mobile",
                        userVisit: "$products.userVisit",
                        totalReviews: "$products.totalReviews",
                        totalRating: "$products.totalRating",
                        about_us: "$dispensary.about_us",
                        image:"$dispensary.image",
                        businessType: "$dispensary.businessType",
                        medical: "$dispensary.medical",
                        isDeleted: "$dispensary.isDeleted",
                        createdAt:"$dispensary.createdAt",
                        meta_desc:"$dispensary.meta_desc",
                        meta_name:"$dispensary.meta_name",
                        slug:"$dispensary.slug",
                        addedBy:"$addedBy",
                        type:"$type",
                        item_id:"$item_id"
                    }
                },
                {
                    $match: query
                }
            ],function (err, totalresults) {

                console.log("totalresults",totalresults)
                if (err){
                    return res.status(400).jsonx({
                        success: false,
                        error: err
                    }); 
                } else {

                    favouriteList.aggregate([
                        {
                            $lookup: {
                                from: "item",
                                localField: "item_id",
                                foreignField: "_id",
                                as: "dispensary"
                            }
                        },
                        {
                            $unwind: '$dispensary'
                        },
                        
                        {
                            $project: {
                                id: "$dispensary.id",
                                dispensary_id: "$dispensary.id",
                                name: "$dispensary.name",
                                address: "$dispensary.address",
                                city: "$dispensary.city",
                                userVisit: "$products.userVisit",
                                totalReviews: "$products.totalReviews",
                                totalRating: "$products.totalRating",
                                postal_code: "$dispensary.postal_code",
                                mobile: "$dispensary.mobile",
                                about_us: "$dispensary.about_us",
                                image:"$dispensary.image",
                                businessType: "$dispensary.businessType",
                                medical: "$dispensary.medical",
                                isDeleted: "$dispensary.isDeleted",
                                createdAt:"$dispensary.createdAt",
                                meta_desc:"$dispensary.meta_desc",
                                meta_name:"$dispensary.meta_name",
                                slug:"$dispensary.slug",
                                addedBy:"$addedBy",
                                type:"$type",
                                item_id:"$item_id"
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
                                    productList: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    },

    myProducts: function(req, res, next) {

        var page        = req.param('page');
        var count       = req.param('count');
        var skipNo      = (page - 1) * count;
        var search      = req.param('search');
        var sortBy      = req.param('sortBy');
        var query       = {};

        var sortquery ={};

        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count= parseInt(count);
        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        //query.addedBy = req.identity.id;
        query.addedBy = ObjectId( req.identity.id ) ;
        query.type = 'product';
//console.log("query is ",typeof query.addedBy);

        /*if (search) {
            query.$or = [
                            { name: {$regex: search, '$options' : 'i'}},
                            { detail:{$regex: search, '$options' : 'i'}}
                            
                        ]
        }*/

        //console.log("query is ",query);


        Favourite.native(function(err, favProduct) {
            favProduct.aggregate([
                {
                    $lookup: {
                        from: "product",
                        localField: "product_id",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $unwind: '$products'
                },
                
                {
                    $project: {
                        id: "$_id",
                        name: "$products.name",
                        thc: "$products.thc",
                        cbd: "$products.cbd",
                        slug: "$products.slug",
                        meta_name: "$products.meta_name",
                        meta_desc: "$products.meta_desc",
                        detail: "$products.detail",
                        user_visit: "$products.user_visits",
                        totalReviews: "$products.totalReviews",
                        totalRating: "$products.totalRating",
                        image:"$products.image",
                        isFeatured: "$products.isFeatured",
                        isDeleted: "$products.isDeleted",
                        createdAt:"$products.createdAt",
                        addedBy:"$addedBy",
                        type:"$type",
                        product_id:"$product_id"
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

                    favProduct.aggregate([
                        {
                            $lookup: {
                                from: "product",
                                localField: "product_id",
                                foreignField: "_id",
                                as: "products"
                            }
                        },
                        {
                            $unwind: '$products'
                        },
                        
                        {
                            $project: {
                                id: "$_id",
                                name: "$products.name",
                                thc: "$products.thc",
                                cbd: "$products.cbd",
                                slug: "$products.slug",
                                meta_name: "$products.meta_name",
                                meta_desc: "$products.meta_desc",
                                user_visit: "$products.user_visits",
                                detail: "$products.detail",
                                totalReviews: "$products.totalReviews",
                                totalRating: "$products.totalRating",
                                image:"$products.image",
                                isFeatured: "$products.isFeatured",
                                isDeleted: "$products.isDeleted",
                                createdAt:"$products.createdAt",
                                addedBy:"$addedBy",
                                type:"$type",
                                product_id:"$product_id"
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
                                    productList: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    },
    productHomeSlider: function(req, res, next) {
        var query ={}

        Product.native(function(err, productlist) {
            productlist.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "createdBy"
                            }
                        },
                        
                        {
                            $lookup: {
                                from: 'category',
                                localField: 'category_id',
                                foreignField: '_id',
                                as: "category"
                            }
                        },
                        {
                            $unwind: '$category'
                        },
                        {
                            $unwind: '$createdBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                brand_name: "$brand_name",
                                Eighth: "$Eighth",
                                half: "$half",
                                image: "$image",
                                ounce: "$ounce",
                                pre_roll: "$pre_roll",
                                quarter: "$quarter",
                                product_id: "$product_id",
                                dispensary_id: "$dispensary_id",
                                thc: "$thc",
                                cbd: "$cbd",
                                category: "$category.name",
                                detail: "$detail",
                                addedBy: "$createdBy.username1",
                                status: "$status",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt",
                                image:"$image",
                                type:"$type",
                                slug:"$slug",
                                meta_name:"$meta_name",
                                meta_desc:"$meta_desc",
                                isForDelivery:"$isForDelivery"
                            }
                        },
                        {
                            $match: {"type" :"reward", "isDeleted": false}
                        }
                    ],function (err, results) {
                        var arr=[];
                        var arr1=[];

                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            var group_to_values = results.reduce(function (obj, item) {
                                obj[item.category] = obj[item.category] || [];
                                obj[item.category].push(item);
                                return obj;
                            }, {});
                            for(var prop in group_to_values) {
                              arr.push(prop);
                               arr1.push(group_to_values[prop]);  
                            }
                            //console.log("==========data ",group_to_values)
                            return res.status(200).jsonx({
                                success: true,
                                products: arr1,
                                categories:arr
                            });
                        }
                    });
                });
    },
     getProductsWithFilter: function(req, res) {


        var search = req.param('search');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var catgIds;
        var rateIds;
        var brand;
        var producer;
       
        if(req.param('ratingIds')) rateIds = JSON.parse(req.param('ratingIds'));
        if(req.param('brandId')) brand = req.param('brandId');
        if(req.param('producerId')) producer = req.param('producerId');


        if(req.param('categoryIds')){
            let parsedcatgIds = JSON.parse(req.param('categoryIds'));
            catgIds = []

            parsedcatgIds.forEach((obj,i)=> {
                catgIds.push(ObjectId(obj))
            })
        }

        var query = {};
        var sortquery ={};

        if(rateIds != undefined && rateIds.length > 0){
            if (req.param('ratingIds')) {
                if(rateIds.length > 1){
                    rateIds.sort();
                    
                    var firstElement = rateIds[0];
                    var lastElement = rateIds[rateIds.length - 1]
                    var firstElementArr = new Array();
                    firstElementArr = firstElement.split(" - ");
                    var firstElementRange = firstElementArr[0];

                    var secondElementArr = new Array();
                    var secondElementRange;

                    if(lastElement == '5' || rateIds[0] == '5.0' || rateIds[0] == 5.0 || lastElement== 5.0 || lastElement == 5){
                        secondElementRange = lastElement
                    } else {
                        secondElementArr = lastElement.split(" - ");
                        secondElementRange = secondElementArr[1];
                    }

                    query.totalRating =  { $gte :  parseFloat( firstElementRange ), $lte : parseFloat( secondElementRange ) } ;

                } else {
                    if(rateIds[0] == '5' || rateIds[0] == '5.0'){
                        query.totalRating =  { $eq :  parseFloat( rateIds[0] ) } ;
                    } else{
                        var rateArr = new Array();
                        rateArr = rateIds[0].split(" - ");
                        var startRange = rateArr[0];
                        var endRange = rateArr[1];
                        query.totalRating =  { $gte :  parseFloat( startRange ), $lte : parseFloat( endRange ) } ;
                    }
                }
                
            }
        }

        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }
        count= parseInt(count);

        sortquery[field?field:'totalRating'] = sortType?(sortType=='desc'?-1:1):-1;

        query.isDeleted = false;

        if (search) {
            query.$or = [
                            { name: {$regex: search, '$options' : 'i'}},
                            { thc:parseFloat(search)}, 
                            { cbd:parseFloat(search)}, 
                            { detail:{$regex: search, '$options' : 'i'}}
                        ]
        }

        // Filter on Category
        if(catgIds != undefined && catgIds.length > 0){
            query.category_id = {"$in" : catgIds };   
        }

        if(req.param('product_category')){
            query.product_category = {"$in" :[req.param('product_category')]};   
        }

        if(req.param('product_subcategory')){
            query.product_subcategory = {"$in" :[req.param('product_subcategory')]};   
        }

        if(req.param('brandId')){
            query.producerId = ObjectId(brand);
        }

        if(req.param('producerId')){
            query.producerId = ObjectId(producer);
        }
        console.log(query)
        Product.native(function(err, productList) {
            productList.aggregate([
                {
                    $lookup: {
                        from: "category",
                        localField: "category_id",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $unwind: '$category'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'addedBy',
                        foreignField: '_id',
                        as: "users"
                    }
                },
                {
                    $unwind: '$users'
                },
                {
                    $lookup: {
                        from: 'producer',
                        localField: 'producer',
                        foreignField: '_id',
                        as: "producerId"
                    }
                },
                {
                    $unwind: '$producerId'
                },
               /* {
                    $lookup: {
                        from: 'itemproduct',
                        localField: '_id',
                        foreignField: 'product_id',
                        as: "itemproduct"
                    }
                },
                {
                    $unwind: '$itemproduct'
                },*/
                {
                    $lookup: {
                        from: "item",
                        localField: "itemId",
                        foreignField: "_id",
                        as: "item"
                    }
                },
                {
                    $unwind: {
                        path: '$item',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        id: "$_id",
                        name: "$name",
                        isDeleted:"$isDeleted",
                        category: "$category.name",
                        category_id: "$category_id",
                        detail: "$detail",
                        details: "$detail",
                        thc: "$thc",
                        cbd: "$cbd",
                        image:"$image",
                        user_visits: "$user_visits",
                        totalReviews: "$totalReviews",
                        totalRating: "$totalRating",
                        producerId: "$producer",
                        producer: "$producerId",
                        product_category: "$product_category",
                        product_subcategory: "$product_subcategory",
                        product_subcategoryname: "$product_subcategoryname",
                        item:"$item.name",
                        itemId:"$itemId",
                        slug:"$slug",
                        meta_name:"$meta_name",
                        meta_desc:"$meta_desc",
                        addedBy: "$users.username1",
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

                    productList.aggregate([
                        {
                            $lookup: {
                                from: "category",
                                localField: "category_id",
                                foreignField: "_id",
                                as: "category"
                            }
                        },
                        {
                            $unwind: '$category'
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "users"
                            }
                        },
                        {
                            $unwind: '$users'
                        },
                        {
                            $lookup: {
                                from: 'producer',
                                localField: 'producer',
                                foreignField: '_id',
                                as: "producerId"
                            }
                        },
                        {
                            $unwind: '$producerId'
                        },
                        /*{
                            $lookup: {
                                from: 'itemproduct',
                                localField: '_id',
                                foreignField: 'product_id',
                                as: "itemproduct"
                            }
                        },
                        {
                            $unwind: '$itemproduct'
                        },*/
                        {
                            $lookup: {
                                from: "item",
                                localField: "itemId",
                                foreignField: "_id",
                                as: "item"
                            }
                        },
                        {
                            $unwind: {
                                path: '$item',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                isDeleted:"$isDeleted",
                                category: "$category.name",
                                category_id: "$category_id",
                                detail: "$detail",
                                details: "$detail",
                                thc: "$thc",
                                cbd: "$cbd",
                                image:"$image",
                                user_visits: "$user_visits",
                                totalReviews: "$totalReviews",
                                totalRating: "$totalRating",
                                producerId: "$producer",
                                producer: "$producerId",
                                product_category: "$product_category",
                                product_subcategory: "$product_subcategory",
                                product_subcategoryname: "$product_subcategoryname",
                                item:"$item.name",
                                itemId:"$itemId",
                                slug:"$slug",
                                meta_name:"$meta_name",
                                meta_desc:"$meta_desc",
                                addedBy: "$users.username1",
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
                                    products: results,
                                    total: totalresults.length
                                },
                            });
                        }
                    });
                }
            });
           
        })
    },
    gethomesliderproduct: function(req, res, next) {
        var query ={}
        query.isDeleted= false;
        query.type = "reward";
        Product.native(function(err, productlist) {
            productlist.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "createdBy"
                            }
                        },
                        
                        {
                            $lookup: {
                                from: 'category',
                                localField: 'category_id',
                                foreignField: '_id',
                                as: "category"
                            }
                        },
                        {
                            $unwind: '$category'
                        },
                        {
                            $unwind: '$createdBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                city: "$city",
                                category: "$category.name",
                                thc: "$thc",
                                cbd: "$cbd",
                                detail: "$detail",
                                user_visits: "$user_visits",
                                image: "$image",
                                isFeatured: "$isFeatured",
                                product_category: "$product_category",
                                product_subcategory: "$product_subcategory",
                                terpene_profile: "$terpene_profile",
                                second_name: "$second_name",
                                producer: "$producer",
                                type: "$type",
                                product_subcategoryname: "$product_subcategoryname",
                                totalReviews: "$totalReviews",
                                totalRating: "$totalRating",
                                addedBy: "$createdBy.username1",
                                status: "$status",
                                isForDelivery: "$isForDelivery",
                                meta_desc: "$meta_desc",
                                meta_name: "$meta_name",
                                slug: "$slug",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt"
                            }
                        },
                        {
                            $match: query
                        }
                    ],function (err, results) {
                        var arr=[];
                        var arr1=[];

                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            return res.status(200).jsonx({
                                success: true,
                                products: results
                            });
                        }
                    });
                });
    },

    getRewardFilterProduct: function(req, res, next) {
        var query ={}
        var city = req.param('city');
        if(city){
            query.city=city;
        }
        query.isDeleted= false;
        query.type = "reward";
        query.reward_type = req.query['reward_type'];
        Product.native(function(err, productlist) {
            productlist.aggregate([
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'addedBy',
                                foreignField: '_id',
                                as: "createdBy"
                            }
                        },
                        
                        {
                            $lookup: {
                                from: 'category',
                                localField: 'category_id',
                                foreignField: '_id',
                                as: "category"
                            }
                        },
                        {
                            $unwind: '$category'
                        },
                        {
                            $unwind: '$createdBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                name: "$name",
                                city: "$city",
                                category: "$category.name",
                                thc: "$thc",
                                cbd: "$cbd",
                                detail: "$detail",
                                user_visits: "$user_visits",
                                image: "$image",
                                isFeatured: "$isFeatured",
                                product_category: "$product_category",
                                product_subcategory: "$product_subcategory",
                                terpene_profile: "$terpene_profile",
                                second_name: "$second_name",
                                producer: "$producer",
                                type: "$type",
                                reward_type: "$reward_type",
                                reward_point: "$reward_point",
                                product_subcategoryname: "$product_subcategoryname",
                                totalReviews: "$totalReviews",
                                totalRating: "$totalRating",
                                addedBy: "$createdBy.username1",
                                status: "$status",
                                isForDelivery: "$isForDelivery",
                                meta_desc: "$meta_desc",
                                meta_name: "$meta_name",
                                slug: "$slug",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt"
                            }
                        },
                        {
                            $match: query
                        }
                    ],function (err, results) {
                        var arr=[];
                        var arr1=[];

                        if (err){
                            return res.status(400).jsonx({
                                success: false,
                                error: err
                            }); 
                        } else {
                            return res.status(200).jsonx({
                                success: true,
                                products: results
                            });
                        }
                    });
                });
    },
};