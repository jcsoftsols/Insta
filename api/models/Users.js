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
    autoUpdatedAt: true,

    attributes: {
        firstName: {
            type: 'string',
            //required: true
        },
        gender:{
            type:'string',
        },
        birthday:{
            type:'date'
        },
        lastName: {
            type: 'string',
            //required: true
        },
        fbId: {
            type: 'string',
            maxLength: 100
        },
        roles: {
            type: 'string',
            enum: ['SA', 'A','U','D','B','DR','DRIVER','STOREADMIN'],
            defaultsTo: 'U'
            // required: true
        },
        roleId: {
            model: 'roles',
        },
        gId: {
            type: 'string',
            maxLength: 100
        },
        fullName: {
            type: 'string',
            //required: true
        },     
        username1:{
            type:'string',
            unique: true,
            required: 'Please enter unique username.'
        },
        email:{
            type:'string'
        },
        username: {
            type: 'email'            
        },

        mobile: {
            type: 'string',
           // maxLength: 10,
           // unique: true,
            //required: true
        },
        Type:{
            type:'string',
            required:true
        },
        address: {
            type: 'string',
        },
        delivery_address:{
            type:'array'
        },
        city: {
            type: 'string',
            //required: true
        },

        pincode: {
            
            type: 'string',
            //required: true
        },
        
        state: {
            type: 'string',
            //required: true
        },
        image:{
            type:'string',
        },
        lat: {
            type: 'string',
            defaultsTo: "0",
        },

        lng: {
            type: 'string',
            defaultsTo: "0",
        },
        rewardPoint: {
            type: 'integer',
            defaultsTo: 0,
        },
        shippingDetail:{
            type: 'array',
        },
        paymentMethod:{
            type: 'array',
        },
        password: {
            type: 'string',
            required: true,
            columnName: 'encryptedPassword',
            //minLength: 8
        },

        date_verified: {
            type : 'date'
        },
        isVerified: {
            type: 'string',
            enum: ['Y','N'],
            defaultsTo: 'N'
        },
        domain: {
            type: 'string',
            enum: ['web', 'ios','android']
        },

        code: {
            type: 'integer',
            unique: true,
            type: 'integer'
        },
        
        os: {
            type: 'string',
            enum: ['ANDROID', 'IOS']
        },

        deviceToken: {
            type: 'string',
        },
        addedBy : {
            model:'users'
        },
        plan_id : {
            model:'subscribepackages'
        },
        status: {
            type: 'string',
            enum: ['active', 'deactive', 'inactive'],
            defaultsTo:'deactive'
        },
        date_registered: {
            type: 'date'
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        reviewStatus: {
            type: 'Boolean',
            defaultsTo: true
        },

        comparePassword: function(password) {
            return bcrypt.compareSync(password, this.password);
        },

        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }

    },

    beforeCreate: function(user, next) {
        if(user.firstName && user.lastName) {
            user.fullName = user.firstName + ' ' + user.lastName;
        }

        if (user.hasOwnProperty('password')) {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
            next(false, user);

        } else {
            next(null, user);
        }
    },


    beforeUpdate: function(user, next) {
        if(user.firstName && user.lastName) {
            user.fullName = user.firstName + ' ' + user.lastName;
        }

        if (user.hasOwnProperty('password')) {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
            next(false, user);
        } else {
            next(null, user);
        }
    },

    authenticate: function (username, password) {
        var query = {};
        query.username = username;
        query.$or = [{roles:["SA","A"]}];

        return Users.findOne(query).populate('roleId').then(function(user){ 
        //return API.Model(Users).findOne(query).then(function(user){
            return (user && user.date_verified && user.comparePassword(password))? user : null;
        });
    },

};