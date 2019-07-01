/**
  * #DESC:  In this class/files crops related functions
  * #sRequest param: Crops add form data values
  * #Return : Boolen and sucess message
  * #Author: JCsoftware Solution
*/


//Marketplaceproduct service
var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;
var path = require('path');

var rn = require('random-number');
var gen = rn.generator({
  min:  1000, max:  99999, integer: true
})



module.exports = {

    add_product:function(data,context,req,res){
        var data = req.body;
        if((!data.name) || typeof data.name == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.marketplace.PRODUCT_NAME} });
        }
                
        if((!data.quantity) || typeof data.quantity == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.marketplace.PRODUCT_QTY} });
        }
        if((!data.price) || typeof data.price == undefined){ 
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.marketplace.PRICE} });
        }
        
        data.addedBy = req.identity.id;
        data.code = 'PROD'+gen();
        Marketplaceproduct.find({name:data.name,category_id:data.category_id}).then(function(result){
            if(result.length == 0){
                Marketplaceproduct.create(data).then(function(prod) {
                    return res.jsonx({
                        success: true,
                        code:200,
                        data: {
                            product:prod,
                            message: constantObj.product.PRODUCT_SAVED
                        },
                    });
                }).fail(function(err){
                    return res.jsonx({
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.product.ISSUE_IN_DB+' '+err
                        },
                    });   
                });
            }else{
                return res.jsonx({
                    success: false,
                    error: {
                        code: 200,
                        message: constantObj.marketplace.PRODUCT_ALREADY_EXIST
                    },
                });   
            }
        }).fail(function(err){
            res.status(400).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: constantObj.product.ISSUE_IN_DB
                },
            });  
        });
    },
    edit_product:function(data,context,req,res){
        var id = req.param('id');
        if(!id || typeof id==undefined){
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.product.ID_REQUIRED} });
        }else{
            var data = req.body;
            if((!data.name) || typeof data.name == undefined){ 
                return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.marketplace.PRODUCT_NAME} });
            }
                    
            if((!data.quantity) || typeof data.quantity == undefined){ 
                return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.marketplace.PRODUCT_QTY} });
            }
            if((!data.price) || typeof data.price == undefined){ 
                return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.marketplace.PRICE} });
            }
            Marketplaceproduct.update({id:(id)}, data).then(function(resdata) {
                if(data){
                    return res.jsonx({
                        success: true,
                        code:200,
                        data: {
                            product:resdata,
                            message: constantObj.product.UPDATED_PRODUCT
                        },
                    });
                }
            }).fail(function(err){
            res.status(400).jsonx({
                success: false,
                error: {
                    code: 400,
                    message: constantObj.product.ISSUE_IN_DB+err 
                },
            });  
        });
        }
        
    },
    productList: function(data,context,req,res) {
        var search = req.param('product');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
       
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
        
        query.isDeleted = false;


        if (search) {
            query.$or = [
                            { name: {$regex: search, '$options' : 'i'}},
                            { shortDescription:{$regex: search, '$options' : 'i'}},
                            { slug:{$regex: search, '$options' : 'i'}}
                        ]
        }
        Marketplaceproduct.native(function(err, productlist) {
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
                        Code: "$code",
                        slug: "$slug",
                        category: "$category.name",
                        shortDescription: "$shortDescription",
                        addedBy: "$addedBy.username1",
                        status: "$status",
                        price:'$price',
                        quantity:'$quantity',
                        images:'$image',
                        isSpecial:'$isSpecial',
                        inStock:'$inStock',
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
                                Code: "$code",
                                slug: "$slug",
                                category: "$category.name",
                                shortDescription: "$shortDescription",
                                addedBy: "$addedBy.username1",
                                status: "$status",
                                price:'$price',
                                quantity:'$quantity',
                                images:'$image',
                                isSpecial:'$isSpecial',
                                inStock:'$inStock',
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
    productDetail:function(data,context,req,res){
        var id = req.param('id')
        if(!id || typeof id==undefined){
            return res.jsonx({"success": false, "error": {"code": 404,"message": constantObj.product.ID_REQUIRED} });
        }
        var query = {id: (id)};
        Marketplaceproduct.findOne(query).populate('category_id').then(function (product_detail) {
            if(product_detail){
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

    marketplaceFeatured:function(data,context,req,res){  

        var search = req.param('product');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        
        var sortquery = {}

        count = parseInt( count );
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;

        var query = {}

        query.isFeatured = true;
        query.isDeleted = false;
        query.status = "active";

        console.log("query for featured data is",query)
        Marketplaceproduct.native(function(err, marketproductlist) {
            marketproductlist.aggregate([
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
                    Code: "$code",
                    slug: "$slug",
                    shortDescription: "$shortDescription",
                    addedBy: "$addedBy.username1",
                    status: "$status",
                    price:'$price',
                    quantity:'$quantity',
                    images:'$image',
                    isSpecial:'$isSpecial',
                    inStock:'$inStock',
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

                    marketproductlist.aggregate([
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
                                Code: "$code",
                                slug: "$slug",
                                shortDescription: "$shortDescription",
                                addedBy: "$addedBy.username1",
                                status: "$status",
                                price:'$price',
                                quantity:'$quantity',
                                images:'$image',
                                isSpecial:'$isSpecial',
                                inStock:'$inStock',
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
                                return res.jsonx({
                                    success: true,
                                    data: {
                                        items: results,
                                        total: totalresults.length
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
}