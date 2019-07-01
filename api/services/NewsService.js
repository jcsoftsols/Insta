var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var commonServiceObj = require('../services/commonService.js');
var ObjectID = require('mongodb').ObjectID;


	slugify = function(string) {
	  return string
        .replace(/<[^>]*>/g, '')
	    .toString()
	    .trim()
	    .toLowerCase()
	    .replace(/\s+/g, "-")
	    .replace(/[^\w\-]+/g, "")
	    .replace(/\-\-+/g, "-")
	    .replace(/^-+/, "")
	    .replace(/-+$/, "");
	}

 
module.exports = {
    addSlugNews:function(data,context,req,res){
        
        return News.find({}).then(function(newsDetail) {
            var counter=0; 
            var x=0;
            
            var processItems = function(x){
              if( x < newsDetail.length ) {
                var str=newsDetail[x].title;
                var name=newsDetail[x].title;
                var desc=newsDetail[x].description;
                data.slug = slugify(str);
                data.meta_desc = desc.replace(/<[^>]*>/g, '').toString().trim().replace(/[^\w\-]+/g, " ").replace(/^-+/, "").replace(/-+$/, "");
                data.meta_name = name.replace(/<[^>]*>/g, '').toString().trim().replace(/[^\w\-]+/g, " ").replace(/^-+/, "").replace(/-+$/, "");
                News.update({id:newsDetail[x].id}, data).then(function(dispensary) {processItems(x+1);});
                   if(counter+1 == newsDetail.length){
                        return res.jsonx({
                            success: true,
                            data: {
                                message: constantObj.news.UPDATED_NEWS,
                                key: 'UPDATED_NEWS'
                            }
                        })
                    }else{
                        counter++;
                    } 
  
              }
            };
          processItems(0);  
         });
    },
    saveNews: function(data,context){

    	if((!data.title) || typeof data.title == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.news.TITLE_REQUIRED, key: 'TITLE_REQUIRED'} };
        }

    	if((!data.subtitle) || typeof data.subtitle == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.news.TITLE_REQUIRED, key: 'TITLE_REQUIRED'} };
        }        

        if((!data.description) || typeof data.description == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.news.DESCRIPTION_REQUIRED, key: 'DESCRIPTION_REQUIRED' } };
        }
      	
		data.slug = slugify(data.title);
		data.createdBy = context.identity.id;
		
		let query = {}
	
      	query.title = data.title;
		query.isDeleted = false;

      	return News.findOne(query).then(function(news) {
      		            
            if(news) {
            	return {
                  	success: false,
                  	error: {
	                    code: 400,
	                    message: constantObj.news.NEWS_ALREADY_EXIST,
	                    key: 'NEWS_ALREADY_EXIST',
                    },
                };

            } else {
            	return News.create(data).then(function(addednews) {
		        	
	                return {
	                    success: true,
	                    code:200,
	                    data: {
	                        news: addednews,
	                        message: constantObj.news.SAVED_NEWS,
	                        key: 'SAVED_NEWS',
	                    },
	                };
		        })
		        .fail(function(err){
	        		return {
                  		success: false,
                  		error: {
                    		code: 400,
                    		message: err
                        },
              		};   
		    	});
           	}
     	}).fail(function(err){ 
		        return {
                  	success: false,
                  	error: {
                    	code: 400,
                    	message: err
                    },
                };   
		});
    },
    updateNews: function(data,context){

		data.slug = slugify(data.title);
		data.createdBy = context.identity.id;
      	let _id = data.id;
        return News.update({id:_id}, data).then(function(news) {

                return {
                    success: true,
                    code:200,
                    data: {
                        news: news,
                        message: constantObj.news.UPDATED_NEWS,
                        key: 'UPDATED_NEWS',
                    },
                };
        })
        .fail(function(err){
        		return {
              success: false,
              error: {
                code: 400,
                message: err
                
              },
          };   
    	});
    },

    saveNewsComments: function(data,context){

    	var code = commonServiceObj.getUniqueCode();

    	//var url = require('short-url');

    	//var apiKey = 'AIzaSyArbbwXx518MqJjii_tovfiyPEYOc9sYbk'; 

    	/*url.shorten('http://www.google.com/'+code+'/', function(err, url) {
  			console.log("short url is",url); // http://goo.gl/fbsS
		});*/

    	/*if((!data.name) || typeof data.name == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.news.TITLE_REQUIRED, key: 'TITLE_REQUIRED'} };
        }

    	if((!data.email) || typeof data.email == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.news.EMAIL_REQUIRED, key: 'EMAIL_REQUIRED'} };
        } */       

        if((!data.message) || typeof data.message == undefined){ 
            return {"success": false, "error": {"code": 404,"message": constantObj.news.MESSAGE_REQUIRED, key: 'MESSAGE_REQUIRED' } };
        }
      	
		//data.news_id = ObjectID(data.news_id)
		data.addedBy = context.identity.id;
		data.code = code;

        var domainName = sails.getBaseUrl();
        var mainUrl = domainName+ "/"+code;
        
        var urls={};
        data.originalUrl = domainName+'/news/detail/'+data.news_id+'/'+code
        data.shortUrl = mainUrl;

        console.log("data",data)
        
        return Comments.create(data).then(function(addedcomment) {

            if(addedcomment) {
                              
                return Comments.findOne({id:addedcomment.id}).populate('addedBy').then(function(commentInfo) {

                        return {
                            success: true,
                            code:200,
                            data: {
                                news: commentInfo,
                                message: constantObj.news.COMMENTS_SAVE,
                                key: 'COMMENTS_SAVE',
                            },
                        };
                })
            	
            } else {

                return {
                    success: false,
                    code:400,
                    data: {
                        message: constantObj.product.ISSUE_IN_DB
                    },
                };
            }
        })
        .fail(function(err){
    		return {
          		success: false,
          		error: {
            		code: 400,
            		message: err
                },
      		};   
    	});
    },

    saveCommentsReplies: function(data,context){

      	
		//data.news_id = ObjectID(data.news_id)
		data.repliedBy = context.identity.id;
		
		return Comments.create(data).then(function(addedcomment) {
	        console.log("addedcomment is",addedcomment)
            return {
                success: true,
                code:200,
                data: {
                    comments: addedcomment,
                    message: constantObj.news.COMMENTS_SAVE,
                    key: 'COMMENTS_SAVE',
                },
            };
        })
        .fail(function(err){
    		return {
          		success: false,
          		error: {
            		code: 400,
            		message: err
                },
      		};   
    	});
    },

    newsDetail:function(data,context){
        if((!data.id) || typeof data.id == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.news.NEWS_ID_REQUIRED, key: 'NEWS_ID_REQUIRED'} };
        }

        //var query = {id:ObjectID(data.id)}
        var query = {};
        //query.id = data.id;
        query.news_id = data.id;
        console.log("query is",query)

        return Comments.find(query).populate('addedBy').populate("comment_id").then(function (news_detail) {
        	console.log("news_detail",news_detail)
            if(news_detail != undefined){
            	console.log("here",news_detail)
	            return {
	                success: true,
	                code:200,
	                data: news_detail
	            }
	        } else {
	        	console.log("herewwwwwwww",news_detail)

              	return {
	                success: false,
	                error: {
	                	code: 404,
	                    message: constantObj.news.NO_NEWS_FOUND,
	                }
            	}
            }
        })
    },

    getCommentViaCode:function(data,context){
        if((!data.id) || typeof data.id == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.news.NEWS_ID_REQUIRED, key: 'NEWS_ID_REQUIRED'} };
        }

        var query = {};
        query.code = data.id;
        console.log("query is",query)

        return Comments.find(query).populate('addedBy').populate("news_id").then(function (commentInfo) {
        	console.log("news_detail",commentInfo)
            if(commentInfo != undefined){
            	console.log("here",commentInfo)
	            return {
	                success: true,
	                code:200,
	                data: {
	                	commentInfo:commentInfo
	                }
	            }
	        } else {
	        	return {
	                success: false,
	                error: {
	                	code: 404,
	                    message: constantObj.news.NO_NEWS_FOUND,
	                }
            	}
            }
        })
    },
};