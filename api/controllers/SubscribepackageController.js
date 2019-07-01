/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _request = require('request');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    save: function(req, res) {
        API(SubscribepackageService.saveSubscribePackage, req, res);
    },

    update: function(req, res) {
        API(SubscribepackageService.updateSubscribePackage, req, res);
    },

    delete: function(req, res) {
        API(SubscribepackageService.deleteSubscribePackage, req, res);
    },

    subscribePackage: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
   
        Subscribepackages.find(query).sort(sortBy).populate('name').populate('type').exec(function(err, packages) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: packages
                });
            }
        })
    },
    getAllSubscribePackage: function(req, res) {

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

        query.isDeleted = 'false';

        if (search) {
            query.$or = [{
                    name: {
                        'like': '%' + search + '%'
                    }
                }

            ]
        }       

        Subscribepackages.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Subscribepackages.find(query).populate('name').populate('type').sort(sortBy).skip(skipNo).limit(count).exec(function(err, packages) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                subscribepackage: packages,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    },
    subscribePackageDetail: function(req, res) {
        var query = {};
        query.id=req.param('id');
        Subscribepackages.find(query).populate('name').populate('type').exec(function(err, packages) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: packages
                });
            }
        })
    },
    subscribePackage: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
   
        Subscribepackages.find(query).sort(sortBy).populate('name').populate('type').exec(function(err, packages) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: packages
                });
            }
        })
    },
    subscribeAllPackage: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
        query.$or=[
                     {$and : [
                             { dispensaries: { $exists: true }},{ dispensaries:{$in:[req.identity.id]}}]}, 
                     {dispensaries: { $exists: false }}
                ]
                console.log(query,'-----------------------')
        Subscribepackages.find(query).sort(sortBy).populate('name').populate('type').exec(function(err, packages) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: packages
                });
            }
        })
    },      
};