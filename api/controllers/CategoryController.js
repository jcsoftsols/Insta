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
        API(CategoryService.saveCategory, req, res);
    },

    update: function(req, res) {
        API(CategoryService.updateCategory, req, res);
    },

    delete: function(req, res) {
        API(CategoryService.delete, req, res);
    },

    categories: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
   
        Category.find(query).sort(sortBy).exec(function(err, category) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: category
                });
            }
        })
    },
    categoryList:function(req,res){
        sortBy = 'name asc';
        var fields = {"name":1,"_id":1}
        Category.find({status:'active',isDeleted:false},fields).sort(sortBy).exec(function(err, category) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.jsonx({
                    success: true,
                    data: {
                        category: category
                    },
                });
            }
        })
    },
    mobCategoryList:function(req,res){
        sortBy = 'name asc';
        var fields = {"name":1,"_id":1}
        Category.find({status:'active',isDeleted:false},fields).sort(sortBy).exec(function(err, category) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.status(200).jsonx({
                    success: true,
                    category: category
                });
            }
        })
    },
    getAllCategory: function(req, res, next) {

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

        Category.count(query).exec(function(err, total) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                Category.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err, category) {
                    if (err) {
                        return res.status(400).jsonx({
                            success: false,
                            error: err
                        });
                    } else {
                        return res.jsonx({
                            success: true,
                            data: {
                                category: category,
                                total: total
                            },
                        });
                    }
                })
            }
        })
    }    
};