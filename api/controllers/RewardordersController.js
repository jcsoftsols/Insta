


var moment = require('node-moment');
var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
    save: function(req, res) {
        var data = req.body;
            data.addedBy = req.identity.id;
        var query=  {}  
         query.id=  req.identity.id;  
            Users.find(query).then(function(userData) {
                if(parseFloat(userData[0].rewardPoint) >= parseFloat(data.point)){
                    query.rewardPoint=parseFloat(userData[0].rewardPoint)- parseFloat(data.point);
                    data.order_id='ORD_'+Date.now();
                    Rewardorders.create(data).then(function(response) {
                        Users.update(query.id,query).then(function (productInfo) {
                            return res.status(200).jsonx({
                                success: true,
                                data:  response,
                                message: constantObj.orders.ORDER_SAVED                    
                            });
                        });
                    })
                    .fail(function(err){
                        return res.status(200).jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: constantObj.orders.ISSUE_IN_DB
                            },                   
                        });   
                    });
                }else{
                        return res.status(200).jsonx({
                            success: false,
                            error: {
                                code: 400,
                                message: 'Please Check Your Reward Points.'
                            },                   
                        }); 
                }
            });
    },
    rewardOrderList:function(req,res){
        Rewardorders.find({addedBy:req.identity.id,isDeleted:false}).populate('product_id').populate('addedBy').sort({'createdAt':-1}).exec(function(err,orders){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: orders
                }); 
            }

        });
    },
    rewardOrderListAdmin:function(req,res){
        Rewardorders.find({isDeleted:false}).populate('product_id').populate('addedBy').exec(function(err,orders){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: orders
                }); 
            }

        });
    },
    rewardOrderDetail:function(req,res){
        var id=req.params['id'];
        Rewardorders.find({isDeleted:false,id:id}).populate('product_id').populate('addedBy').exec(function(err,orders){
            if (err){
                return res.status(400).jsonx({
                    success: false,
                    error: err
                }); 
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: orders
                }); 
            }

        });
    },
    updateStatus: function(req, res) {
        var data = req.body;
        var query=  {}   
            query.id= data.id;
            query.status=data.status;
            query.updatedBy = req.identity.id;;
            Rewardorders.update(query.id,query).then(function(updateStatus) {
                if(data.status =='Cancel' || data.status =='cancel' || data.status =='cancelled' || data.status =='Cancelled'){
                 Users.find({id:updateStatus[0].addedBy}).exec(function(err,userData){
                var query ={}
                  query.rewardPoint=parseFloat(userData[0].rewardPoint)+ parseFloat(updateStatus[0].point);
                  query.id=updateStatus[0].addedBy;    
                    Users.update(query.id,query).then(function (userInfo) {});
                 });
                }
                return res.status(200).jsonx({
                    success: true,
                    message: constantObj.orders.ORDER_SAVED                    
                });
            });
    },
    getAllOrders: function(req, res, next) {

        var page = req.param('page');
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var sortBy = req.param('sortBy');
        var sortquery = {};
        var query = {};
        
        if (sortBy) {
            var typeArr = new Array();
            typeArr = sortBy.split(" ");
            var sortType = typeArr[1];
            var field = typeArr[0];
        }

        count = parseInt( count );

        sortquery[field?field:'createdAt'] = sortType?(sortType=='desc'?-1:1):-1;
        query.isDeleted = false;
        Rewardorders.native(function(err, orderlist) {
            orderlist.aggregate([
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
                        from: 'product',
                        localField: 'product_id',
                        foreignField: '_id',
                        as: "productDetail"
                    }
                },
                {
                    $unwind: {
                      path: '$productDetail',
                      preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: '$addedBy'
                },
                {
                    $project: {
                        id: "$_id",
                        product_id: "$product_id",
                        order_id: "$order_id",
                        productDetail: "$productDetail",
                        point: "$point",
                        destination_location: "$destination_location",
                        source_location: "$source_location",
                        status: "$status",
                        addedBy: "$addedBy",
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

                    orderlist.aggregate([
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
                                from: 'product',
                                localField: 'product_id',
                                foreignField: '_id',
                                as: "productDetail"
                            }
                        },
                        {
                            $unwind: {
                              path: '$productDetail',
                              preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $unwind: '$addedBy'
                        },
                        {
                            $project: {
                                id: "$_id",
                                product_id: "$product_id",
                                order_id: "$order_id",
                                productDetail: "$productDetail",
                                point: "$point",
                                destination_location: "$destination_location",
                                source_location: "$source_location",
                                status: "$status",
                                addedBy: "$addedBy",
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

}