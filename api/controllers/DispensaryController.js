/**
 * DispensaryController
 *
 * @description :: Server-side logic for managing dispensary
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
    add: function(req,res){
        API(DispensaryService.addDispensary,req,res);
    },
    edit:function(req,res){
        API(DispensaryService.editDispensary,req,res);
    },
    addSlugDispensary:function(req,res){
    	API(DispensaryService.addSlugDispensary,req,res);
    },
    delete:function(req,res){
    	API(DispensaryService.deleteDispensary,req,res);
    },
    list:function(req,res){
    	API(DispensaryService.list,req,res);
    },
    dispensary:function(req,res){
        API(DispensaryService.dispensary,req,res);
    },
    getDispensary:function(req,res){
        API(DispensaryService.getDispensary,req,res);
    },
    itemDetail:function(req,res){
        API(DispensaryService.itemDetail,req,res);
    },
    itemFavorite:function(req,res){
        API(DispensaryService.itemFavorite,req,res);
    },
    itemLocator:function(req,res){
        API(DispensaryService.itemLocator,req,res);
    },
    itemSearchByLocation:function(req,res){
        API(DispensaryService.itemSearchByLocation,req,res);
    },
    mobItemSearchByLocation:function(req,res){
        API(DispensaryService.mobItemSearchByLocation,req,res);
    },
    graphData:function(req,res){
        API(DispensaryService.graphData,req,res);
    },
    dispensaryForSlider:function(req,res){
    API(DispensaryService.dispensaryForSlider,req,res);
    },
    getAllItems: function(req, res, next) {

        var item = req.param('item');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var name = req.param('name');
        var city = req.param('city');
        
       
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
        
        //query.isDeleted = 'true' ;
        if (item) {
            query.$or = [
                            { name: {$regex: item, '$options' : 'i'}},
                            { city:{$regex: item, '$options' : 'i'}},
                            { businesstype:{$regex: item, '$options' : 'i'}}
                        ]
        }
        query.isDeleted = false;

        
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
                    $lookup: {
                        from: 'category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: "category"
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
                        user_visits: "$userVisit",
                        reviews:"$totalReviews",
                        rating:"$totalRating",
                        detail: "$detail",
                        addedBy: "$addedBy.username1",
                        category:"$category.name",
                        status: "$status",
                        isFeatured: "$isFeatured",
                        isDeleted: "$isDeleted",
                        createdAt:"$createdAt",
                        updatedAt:"$updatedAt",
                        businesstype:"$businessType",
                        medical:"$medical",
                        address:"$address",
                        postal_code:"$postal_code",
                        scheduler:"$scheduler",
                        recreational:"$recreational"
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
                                name: "$name",
                                city: "$city",
                                user_visits: "$userVisit",
                                reviews:"$totalReviews",
                                rating:"$totalRating",
                                detail: "$detail",
                                addedBy: "$addedBy.fullName",
                                status: "$status",
                                isFeatured: "$isFeatured",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt",
                                businesstype:"$businessType",
                                medical:"$medical",
                                address:"$address",
                                postal_code:"$postal_code",
                                scheduler:"$scheduler",
                                recreational:"$recreational"
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
    mobDispensaryList: function(req, res, next) {

        var item = req.param('item');
        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var name = req.param('name');
        var city = req.param('city');
        var search = req.param('search');
        
       
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
        
        //query.isDeleted = 'true' ;
        if (item) {
            query.$or = [
                            { name: {$regex: item, '$options' : 'i'}},
                            { city:{$regex: item, '$options' : 'i'}},
                            { businesstype:{$regex: item, '$options' : 'i'}}
                        ]
        }
        if(search){
            query.businesstype = new RegExp(search, 'i');
        }
        console.log("==============",query)
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
                    $lookup: {
                        from: 'category',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: "category"
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
                        user_visits: "$userVisit",
                        reviews:"$totalReviews",
                        image:"$image",
                        rating:"$totalRating",
                        detail: "$detail",
                        addedBy: "$addedBy.username1",
                        category:"$category.name",
                        status: "$status",
                        isFeatured: "$isFeatured",
                        isDeleted: "$isDeleted",
                        createdAt:"$createdAt",
                        updatedAt:"$updatedAt",
                        businesstype:"$businessType",
                        medical:"$medical",
                        recreational:"$recreational"
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
                                name: "$name",
                                city: "$city",
                                user_visits: "$userVisit",
                                reviews:"$totalReviews",
                                image:"$image",
                                rating:"$totalRating",
                                detail: "$detail",
                                addedBy: "$addedBy.fullName",
                                status: "$status",
                                isFeatured: "$isFeatured",
                                isDeleted: "$isDeleted",
                                createdAt:"$createdAt",
                                updatedAt:"$updatedAt",
                                businesstype:"$businessType",
                                medical:"$medical",
                                recreational:"$recreational"
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
                            return res.status(200).jsonx({
                                success: true,
                                data: results,
                                total: totalresults.length
                            });
                        }
                    });
                }
            });
           
        })
    },
    alldespensary:function(req,res){
        var query= {};
        query.isDeleted = false;
        query.businessType = "dispensary";

        Item.find(query).exec(function(err, productList) {
            if (err) {
                return res.status(400).jsonx({
                   success: false,
                   error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: {
                        dispensaryList: productList
                    },
                });
            }
        })
    },
    bulkUpload:function(req,res){
        API(DispensaryService.bulkUpload,req,res);
    }
    
};