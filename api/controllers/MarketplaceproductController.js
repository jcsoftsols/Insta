var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

// marketplace product controller

module.exports = {

    addProduct:function(req,res){
        API(MarketplaceproductService.add_product,req,res);
    },
    marketplaceFeatured:function(req,res){ 
        API(MarketplaceproductService.marketplaceFeatured,req,res);
    },
    editProduct:function(req,res){
        API(MarketplaceproductService.edit_product,req,res);
    },
    productList:function(req,res){
        API(MarketplaceproductService.productList,req,res);
    },
    productDetail:function(req,res){
        API(MarketplaceproductService.productDetail,req,res);
    }, 
    marketplaceproductSlider: function(req, res, next) {
        var query ={}
        Marketplaceproduct.native(function(err, productlist) {
            productlist.aggregate([
                {
                    $match: {"isDeleted": false}
                },
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
                        as: "productcategory"
                    }
                },
                {
                    $unwind: '$productcategory'
                },
                {
                    $unwind: '$createdBy'
                },
                {
                    $project: {
                         id: "$_id",
                        name: "$name",
                        Code: "$code",
                        slug: "$slug",
                        addedBy: "$createdBy.username1",
                        status: "$status",
                        category:'$productcategory.name',
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
                    
                    return res.status(200).jsonx({
                        success: true,
                        products: arr1,
                        categories:arr
                    });
                }
            });
        });
    },
    viewSlugMarketPlaceProduct: function(req,res) {
        var query ={};
        query.slug = req.param('slug');

        let ip = req.ip
        var viewquery = {}
        viewquery.ipAddress = ip;

        var count = 0;

        Marketplaceproduct.findOne(query).populate('addedBy').populate('category_id').then(function(productInfo){

            viewquery.productId = productInfo['id'];

            if(productInfo){
                var totalview = productInfo.userVisit;

                Markproductviewed.find(viewquery).exec(function(err,response){
                    if(response == undefined || response == ''){
                            if(req.param('userid')){
                                viewquery.userid = req.param('userid') ;            
                            }
                            Markproductviewed.create(viewquery).then(function (viewentry) {
                                totalview = totalview + 1;
                                Marketplaceproduct.update({id: req.param('id')},{userVisit:totalview}).then(function (productdetail) {

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
            } else {
               return res.status(400).jsonx({
                    success: false,
                    error: constantObj.product.PRODUCT_DETAIL_ISSUE
                }); 
            }
        });
    }, 

}
