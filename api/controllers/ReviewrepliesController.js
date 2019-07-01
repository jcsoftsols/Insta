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
        API(ReviewrepliesService.saveReplies, req, res);
    },

    delete: function(req, res) {
        API(ReviewrepliesService.deleteReplies, req, res);
    },
};