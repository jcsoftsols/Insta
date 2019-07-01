var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
const addSubtractDate = require("add-subtract-date");
var stripe = require("stripe")("sk_test_SH1p9Qv5MVK49i6XTGgx9tDm");
var constantObj = sails.config.constants;


var getDays= function(dateExp,dateCur,cb){
      const date1 = new Date(dateExp);
      const date2 = new Date(dateCur);
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return cb(diffDays);
}

var randomString =function(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}

var paymentForProduct = function(data,id,orgPrice,payPrice,type,cb){
  var d = new Date();
  var order_details =data.body.order_details;
  stripe.charges.create({
    amount: parseInt(payPrice)*100,
    currency: "usd",
    customer: data.body.customer_id,
    source: data.body.token,
    description:'Purchase Product'
  }, function(err, charge) {
    // asynchronously called
    if(err){
      return cb({
              success: false,
              err:  {message:err.message},                    
           });
    }else{
      var data1={};
        data1.transaction_id=charge.balance_transaction;
        data1.order_details=order_details;
        data1.addedBy=id;
        data1.payment_status=charge.status;
        data1.price=payPrice;
        data1.original_price=orgPrice;
        data1.type=type;
        data1.detail= charge;

          Transcation.create(data1).then(function (txnInfo) {
                return cb({
                      success: true,
                      data:  txnInfo,                    
                });  
          });
          
      }
      // return cb({
      //             success: true,
      //             data:  'txnInfo',                    
      //         });
    });
}

var paymentCharge = function(data,id,orgPrice,payPrice,type,planInfo,cb){
  var d = new Date();
  var plan_id=data.body.subscription_id;
  stripe.charges.create({
    amount: parseInt(payPrice)*100,
    currency: "usd",
    customer: data.body.customer_id,
    source: data.body.token,
    description:'User subscription',
    metadata: {'plan_id': plan_id}
  }, function(err, charge) {
    // asynchronously called
    if(err){
      return cb({
              success: false,
              err:  {message:err.message},                    
           });
    }else{
     
        if(planInfo[0].type.name == 'Monthly'){
          var validate_days= 30;
        }else if(planInfo[0].type.name == 'Yearly'){
          var validate_days= 365;
        }else if(planInfo[0].type.name == 'Weekly'){
          var validate_days= 7;
        }

        var data1={};
        data1.exp_date= addSubtractDate.add(d, validate_days, "days");
        data1.transaction_id=charge.balance_transaction;
        data1.plan_id=plan_id;
        data1.addedBy=id;
        data1.payment_status=charge.status;
        data1.price=payPrice;
        data1.original_price=orgPrice;
        data1.plan_type=planInfo[0].type.name;
        data1.val_day=validate_days;
        data1.type=type;

          userDataEntry(data1,data,function(resUserData){})
        
        data1.detail= charge;
        data1.planInfo= planInfo;
        Usersubscription.create(data1).then(function (userInfo) {});
         //console.log(data,'----------------------------------')
           Transcation.create(data1).then(function (txnInfo) {
            return cb({
                  success: true,
                  data:  txnInfo,                    
              });  
          });
          
      }
      // return cb({
      //             success: true,
      //             data:  'txnInfo',                    
      //         });
    });
  
}

var userDataEntry = function(data1,data,cb){
  
          Users.update({id: data1.addedBy},{
                         exp_date:data1.exp_date,
                         plan_id:data1.plan_id,
                         transaction_id:data1.transaction_id 
                       })
                    .then(function(data){});
}

var checkPrice = function(data, cb){
  var currentDate = new Date();
        if( data.identity.exp_date != undefined){
          getDays(data.identity.exp_date,currentDate,function(getDaysRem){
            if(getDaysRem >= 0 || data.identity.transaction_id != 'Demo'){
              Usersubscription.findOne({transaction_id:data.identity.transaction_id}).then(function (currPlanInfo) {
                //console.log(currPlanInfo);
                if(currPlanInfo.plan_type == 'Free'){
                    return cb({
                        success: true,
                        data:{"price":0},                    
                     });
                }else{
                  var lessPrice = (parseInt(currPlanInfo.price) / parseInt(currPlanInfo.val_day))*getDaysRem ;
                  return cb({
                        success: true,
                        data:{"price":lessPrice},                    
                  });
                }
              });
            }else{
             return cb({
                success: true,
                data:{"price":0},                    
             }); 
            }


          })
        }else{
          return cb({
                success: true,
                data:{"price":0},                    
            });
        }
}

saveCardToken = function(req,cb){
  var query ={};
       stripe.tokens.create({
              card: {
                number: req.body.card_number,
                exp_month: req.body.exp_month,
                exp_year: req.body.exp_year,
                cvc: req.body.cvc,
                name:req.body.ownerName
              }
        }, function(err, token) {
            if(err){
            return cb({
                success: false,
                err:  {message:err.message},                    
             })
            }else{ 
              if(req.identity){
              if( req.identity.paymentMethod != undefined){
                if(req.identity.paymentMethod.length >0){
                  stripe.customers.createSource(req.identity.paymentMethod[0].customer_id,{
                      source: token.id
                    },function(err, customer) {
                        
                    var query = req.identity.paymentMethod;
                    query[req.identity.paymentMethod.length]={ customer_id: req.identity.paymentMethod[0].customer_id, card_id:customer.id,last4:customer.last4,exp_month:customer.exp_month,exp_year:customer.exp_year,ownerName:req.body.ownerName};
                        Users.update({email: req.body.email},{
                         paymentMethod:query 
                       })
                    .then(function(data){});
                    return cb({
                      success: true,
                      data:  customer,                    
                    })
                    })
                }
                }else{
                    stripe.customers.create({
                      description: req.body.email,
                      source: token.id // obtained with Stripe.js
                    }, function(err, customer) {
                    var query =[{ customer_id: customer.id, card_id:customer.default_source,last4:customer.sources.data[0].last4,exp_month:customer.sources.data[0].exp_month,exp_year:customer.sources.data[0].exp_year,ownerName:req.body.ownerName  }];

                      Users.update({email: req.body.email},{
                         paymentMethod:query 
                       })
                    .then(function(data){});
                      return cb({
                        success: true,
                        data:  customer,                    
                      })
                    })

                }  
                }else{
                  stripe.customers.create({
                      description: req.body.email,
                      source: token.id // obtained with Stripe.js
                    }, function(err, customer) {
                    var query =[{ customer_id: customer.id, card_id:customer.default_source,last4:customer.sources.data[0].last4,exp_month:customer.sources.data[0].exp_month,exp_year:customer.sources.data[0].exp_year,ownerName:req.body.ownerName  }];

                      Users.update({email: req.body.email},{
                         paymentMethod:query 
                       })
                    .then(function(data){});
                      return cb({
                        success: true,
                        data:  customer,                    
                      })
                    })
                }                    
                }
              })
}

getLoginData = function(id,cb){
  var query ={};
      query.id = id;
    Users.findOne(query).then(function (user) {
     Tokens.generateToken({
          client_id: user.id,
          user_id: user.id
      }).then(function (token) {
          user.access_token = token.access_token;
          user.refresh_token = token.refresh_token;
              var lastLoginUpdate = {}
              lastLoginUpdate.lastLogin = new Date(); 
              lastLoginUpdate.status = 'active' ;
              lastLoginUpdate.isDeleted = false;
              lastLoginUpdate.isVerified = 'Y' ;
            Users.update({id:user.id}, lastLoginUpdate).then(function() {
                  return cb({success: true, code:200, message: constantObj.messages.SUCCESSFULLY_LOGGEDIN, data: user});
              }).fail(function(errr) {
                console.log(errr)
                  return cb({"success": false, "error": {"code": 400,"message": errr} });
              });
          });
      });
}

module.exports = {
    checkUserPlan: function(req, res) {
      checkPrice(req, function(responce){
        return res.status(200).jsonx(responce);
      })

    },
    getBankToken: function(req, res) {
        stripe.tokens.create({
              bank_account: {
                country: 'US',
                currency: 'usd',
                account_holder_name: 'Jenny Rosen',
                account_holder_type: 'individual',
                routing_number: '110000000',
                account_number: '000123456789'
              }
            }, function(err, token) {
                  if(err){
                    return res.status(404).jsonx({
                        success: false,
                        err:  {message:err.message},                    
                     });
                    }else{
                     return res.status(200).jsonx({
                        success: true,
                        data:  token,                    
                     });
                    }
            });
    },
    getCardToken: function(req, res) {
      var query ={};
       stripe.tokens.create({
              card: {
                number: req.body.card_number,
                exp_month: req.body.exp_month,
                exp_year: req.body.exp_year,
                cvc: req.body.cvc,
                name:req.body.ownerName
              }
            }, function(err, token) {
                if(err){
                return res.status(404).jsonx({
                    success: false,
                    err:  {message:err.message},                    
                 });
                }else{ 
                  if( req.identity.paymentMethod != undefined){
                    if(req.identity.paymentMethod.length >0){
                      stripe.customers.createSource(req.identity.paymentMethod[0].customer_id,{
                          source: token.id
                        },function(err, customer) {
                            
                        var query = req.identity.paymentMethod;
                        query[req.identity.paymentMethod.length]={ customer_id: req.identity.paymentMethod[0].customer_id, card_id:customer.id,last4:customer.last4,exp_month:customer.exp_month,exp_year:customer.exp_year,ownerName:req.body.ownerName};
                            Users.update({email: req.body.email},{
                             paymentMethod:query 
                           })
                        .then(function(data){});
                        return res.status(200).jsonx({
                          success: true,
                          data:  customer,                    
                        });
                        })
                    }
                    }else{
                        stripe.customers.create({
                          description: req.body.email,
                          source: token.id // obtained with Stripe.js
                        }, function(err, customer) {
                        var query =[{ customer_id: customer.id, card_id:customer.default_source,last4:customer.sources.data[0].last4,exp_month:customer.sources.data[0].exp_month,exp_year:customer.sources.data[0].exp_year,ownerName:req.body.ownerName  }];

                          Users.update({email: req.body.email},{
                             paymentMethod:query 
                           })
                        .then(function(data){});
                        return res.status(200).jsonx({
                          success: true,
                          data:  customer,                    
                        });
                        })

                    }                      
                    }
                  })

    },
    chargePayment: function(req,res){
      var data={};
      var d = new Date();
      var plan_id=req.body.subscription_id;
      Subscribepackages.find({id:plan_id}).populate('type').populate('name').then(function (planInfo) {
        //console.log(planInfo);
        var planInfo=planInfo;
        if(planInfo[0].type.name == 'Free'){
            data.exp_date= addSubtractDate.add(d,parseInt(planInfo[0].validityDays) , "days");
            data.plan_id=plan_id;
            data.addedBy=req.identity.id;
            data.payment_status='successful';
            data.price=0;
            data.plan_type=planInfo[0].type.name;
            data.val_day=planInfo[0].validityDays;
            data.transaction_id="Demo";
              Usersubscription.create(data).then(function (userInfo) {
              Users.update({id: req.identity.id},{
                             exp_date:data.exp_date,
                             plan_id:data.plan_id,
                             transaction_id:'Demo' 
                           })
                        .then(function(data){
              
                return res.status(200).jsonx({
                          success: true,
                          data:  userInfo,                    
                       });
              });
              });
        }else{
          if((req.identity.exp_date != undefined && req.identity.transaction_id == 'Demo')|| req.identity.exp_date == undefined){
            var paymentPrice =planInfo[0].price;
            var originalPrice=planInfo[0].price;
            var type='Normal'; 
            //console.log(originalPrice,paymentPrice,type,planInfo);
            paymentCharge(req,req.identity.id,originalPrice,paymentPrice,type,planInfo,function(responce){
              // console.log('--------------------------------',responce);
              return res.status(200).jsonx(responce);
            })
          }else{
            //console.log(originalPrice,paymentPrice,type,planInfo);
            checkPrice(req, function(result){
              var paymentPrice =parseInt(planInfo[0].price)+result.data.price;
              var originalPrice=planInfo[0].price;
              var type='Upgrade'; 
              //console.log(originalPrice,paymentPrice,type,planInfo);
              paymentCharge(req,req.identity.id,originalPrice,paymentPrice,type,planInfo,function(responce){
                //console.log('--------------------------------',responce);
              return res.status(200).jsonx(responce);
              })
            })
          }
        
        
        }
      });

        
    },
    directCardPayment: function(req,res){
      Users.find({id:req.body.id}).then(function (userInfo) {
        req.body.email = userInfo[0].email;
        saveCardToken(req,function(responce){
          if(responce.success){
            var plan_id=req.body.subscription_id;
          Subscribepackages.find({id:plan_id}).populate('type').populate('name').then(function (planInfo) {
              var planInfo=planInfo;
              var paymentPrice =parseInt(planInfo[0].price);
              var originalPrice=parseInt(planInfo[0].price);
              var type='Normal';
              req.body.customer_id=responce.data.id;
              req.body.token=responce.data.default_source;
                paymentCharge(req,req.body.id,originalPrice,paymentPrice,type,planInfo,function(responce){
                    if(responce.success){
                      getLoginData(req.body.id,function(result){
                        return res.status(200).jsonx(result);
                      })
                    }else{
                      return res.status(200).jsonx(responce);
                    }
                    
                    
                })
            })
            }else{
             return res.status(200).jsonx(responce); 
            }
          
        })
      })
    },
    marketPlaceProductPayment: function(req,res){
      var data=req.body;
      var d = new Date();
      var paymentPrice =data.price;
      var originalPrice=data.price;
      var type='ProductOrder'; 
        //console.log(originalPrice,paymentPrice,type,planInfo);
        paymentForProduct(req,req.identity.id,originalPrice,paymentPrice,type,function(responce){
          if(responce.success){
            data.order_number =randomString(8, '#aA');
            data.invoice_number =randomString(8, '#aA');
            data.totalprice =paymentPrice;
            data.payment_status ='successful';
            data.order_date =d;
            data.addedBy=req.identity.id;
            data.transcation_id =responce.data.id;
              Orders.create(data).then(function(result) {
                return res.status(200).jsonx(responce);
              });
          }else{
            return res.status(200).jsonx(responce);
          }
          
        })  
    },
};


// var cron = require('node-cron');
 
// cron.schedule('* * * * *', () => {
//   var d = new Date();
//   var checkDate = addSubtractDate.add(d, 1, "days");
//   var query={};
//   query.exp_date= {$gt: checkDate};
//   //query.renewStatus=true;
//   Users.find(query).then(function (userInfo) {
// console.log(userInfo.length)
  

//   });
// });