var _request = require('request');
var ObjectId = require('mongodb').ObjectID;

module.exports = {
    save: function(req, res) {
        API(FareService.saveFare, req, res);
    },

    update: function(req, res) {
        API(FareService.updateFare, req, res);
    },

    delete: function(req, res) {
        API(FareService.deleteFare, req, res);
    },

    fares: function(req, res) {
        
        var sortBy = req.param('sortBy');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'startpoint desc';
        }

        query.isDeleted = 'false';
        query.status = "active";
   
        Fare.find(query).sort(sortBy).exec(function(err, fare) {
            
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
                return res.status(200).jsonx({
                    success: true,
                    data: fare
                });
            }
        })
    }  
};