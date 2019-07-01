/**
 * ItemproductController
 *
 * @description :: Server-side logic for map item with products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    add: function(req,res){
        API(ItemService.addItemProduct,req,res);
    },
    edit:function(req,res){

    	API(ItemService.editItemProduct,req,res); 
    },
    getItemProduct:function(req,res){
        API(ItemService.getItemProduct,req,res);
    },
    AllProductsByItem:function(req,res){
        API(ItemService.AllProductsByItem,req,res);
    },
    mobAllProductsByItem:function(req,res){
        API(ItemService.mobAllProductsByItem,req,res);
    },
    ItemReviewsWithProduct:function(req,res){
        API(ItemService.ItemReviewsWithProduct,req,res);
    },
    AllProductByUser:function(req,res){
        API(ItemService.AllProductByUser,req,res);
    },
    addUserItemProduct:function(req,res){
        API(ItemService.addUserItemProduct,req,res);
    },
    AllProductItemByCategory:function(req,res){
        API(ItemService.AllProductItemByCategory,req,res);
    },
    AllProductItemByMap:function(req,res){
        API(ItemService.AllProductItemByMap,req,res);
    },
    addSlugItemProduct:function(req,res){
        API(ItemService.addSlugItemProduct,req,res);
    },
    getItemProductSlug:function(req, res){
        var query={};
        query.slug=req.params['slug'];
      Itemproduct.find(query).exec(function(err,itemproduct){
          if(err){
              return res.jsonx({
                  success: false,
                  data: {
                      message: err,
                  }
              })
          }else{
              return res.jsonx({
                  success: true,
                  code:200,
                  data: {
                      message: constantObj.messages.SUCCESSFULLY_EXECUTED,
                      key: itemproduct,
                  },
              })
          }
      });

    },
    // delete:function(req,res){
    // 	API(DispensaryService.deleteDispensary,req,res);
    // },
    // list:function(req,res){
    // 	API(DispensaryService.list,req,res);
    // }
    
};