/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var promisify = require('bluebird').promisify;
var bcrypt    = require('bcrypt-nodejs');

module.exports = {
    autoCreatedAt: true,
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        address: {
            type: 'string',
            required: true
        },
        city: {
            type: 'string',
            maxLength: 100
        },
        postal_code: {
            type: 'string',
            required: true
        },     
        email: {
            type: 'string',
            //required: 'Please enter valid email id.'
        },
        mobile: {
            type: 'string',
            //maxLength: 10,
           // unique: true,
            //required: true
        },
        website: {
            type: 'string',
        },
        logo: {
            type: 'string',
            defaultsTo:"",
        },
        about_us: {
            type: 'string',
            //required: true
        },
        
        lat: {
            type: 'float',
            defaultsTo: "0",
        },

        lng: {
            type: 'float',
            defaultsTo: "0",
        },
        updatedAt: {
            type : 'date'
        },
        addedBy : {
            model:'users'
        },
        isDeleted:{
            type: 'boolean',
            defaultsTo:false
        },
        status: {
            type: 'string',
            enum: ['active', 'deactive'],
            defaultsTo:'active'
        },
        businessType:{
            type:'string',
            defaultsTo:''
        },
        medical:{
            type:'boolean',
            defaultsTo:false
        },
        recreational:{
            type:'boolean',
            defaultsTo:false
        },
        recreation:{
            type:'boolean',
            defaultsTo:false
        },
        isFeatured:{
            type: 'boolean',
            defaultsTo:false
        },
        userVisit:{
            type:'integer',
            defaultsTo: 0
        },
        totalReviews:{
            type:'integer',
            defaultsTo: 0
        },
        totalRating:{
            type: 'float',
            defaultsTo: 0.0
        },
        scheduler:{
            type:'array'
        },
        Type:{
            type:'string'
        },
        source:{
            type:'string'
        }
    },

};