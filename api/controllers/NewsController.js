/**
 * BlogsController
 *
 * @description :: Server-side logic for managing Blog
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */




module.exports = {
	
	save: function(req, res) {
		API(NewsService.saveNews,req,res);
	
	},
	edit: function(req, res) {
		API(NewsService.updateNews,req,res);
	
	},
	slugupdate: function(req, res) {
		API(NewsService.addSlugNews,req,res);
	
	},

	getNews: function(req, res, next) {
		//API(NewsService.newsDetail,req,res);

		var query = {};
        //var sortBy = 'name ASC';
        query.news_id = req.param('id');
        query.isDeleted = 'false';
        query.status = true;
        //query.comment_id = '';
        News.find({id:req.param('id')}).exec(function(err, newsInfo) {
        	if(newsInfo){

		        Comments.find(query).populate('addedBy').sort('createdAt:asc').exec(function(err, parentComments) {
		            if (err) {
		                return res.status(400).jsonx({
		                    success: false,
		                    error: err
		                });
		            } else {
		 
		        	//console.log("parentComments",parentComments)

		                var qry={};
		                var count = 0;
		                
		                async.each(parentComments, function(parentComment, callback) {
		                    qry.comment_id = parentComment.id;
		                    qry.isDeleted = false;

							Comments.find(qry).populate('addedBy').then(function(childComments){
		                    
		                        parentComment['replies'] = []
		                        parentComment['replies'] = childComments;

		                        
		                        callback();
		                    })
		                    .fail(function(error){
		                        callback(error);
		                    })
		                    count++;
		                },function(error){
		                    if(error){ 
		                        
		                    } else {
		                        return res.jsonx({
		                            success: true,
		                            data   : {
		                            	news:newsInfo,
		                            	parentComments : parentComments
		                            }
		                        });
		                    }
		                });
		            }
		        })
		    }
		})
	},
	newsdetail: function(req, res, next) {
		//API(NewsService.newsDetail,req,res);

		var query = {};
        //var sortBy = 'name ASC';
        /*query.slug = req.param('slug');
        query.isDeleted = 'false';
        query.status = true;*/
        //query.comment_id = '';
        News.find({slug:req.param('slug')}).exec(function(err, newsInfo) {
        	if(newsInfo){
        		//var sortBy = 'name ASC';
		        query.news_id = newsInfo[0].id;
		        query.isDeleted = 'false';
		        query.status = true;
		        //query.comment_id = '';
		        Comments.find(query).populate('addedBy').sort('createdAt:asc').exec(function(err, parentComments) {
		            if (err) {
		                return res.status(400).jsonx({
		                    success: false,
		                    error: err
		                });
		            } else {
		 
		        	//console.log("parentComments",parentComments)

		                var qry={};
		                var count = 0;
		                
		                async.each(parentComments, function(parentComment, callback) {
		                    qry.comment_id = parentComment.id;
		                    qry.isDeleted = false;

							Comments.find(qry).populate('addedBy').then(function(childComments){
		                    
		                        parentComment['replies'] = []
		                        parentComment['replies'] = childComments;

		                        
		                        callback();
		                    })
		                    .fail(function(error){
		                        callback(error);
		                    })
		                    count++;
		                },function(error){
		                    if(error){ 
		                        
		                    } else {
		                        return res.jsonx({
		                            success: true,
		                            data   : {
		                            	news:newsInfo,
		                            	parentComments : parentComments
		                            }
		                        });
		                    }
		                });
		            }
		        })
		    }
		})
	},
	getCommentFromCode: function(req, res, next) {
		//API(NewsService.getCommentViaCode,req,res);
		//console.log("here1234")
		if((!req.param('id')) || typeof req.param('id') == undefined){ 
          return {"success": false, "error": {"code": 404,"message": constantObj.news.NEWS_ID_REQUIRED, key: 'NEWS_ID_REQUIRED'} };
        }
        var query = {};
        query.code = req.param('id');
        
        return Comments.findOne(query).populate('addedBy').populate('news_id').then(function (commentInfo) {
        	   if(commentInfo){
		            return res.jsonx({
		                success: true,
		                code:200,
		                data: commentInfo
		                
		            })
	        } else {
	        	return res.jsonx({
	                success: false,
	                error: {
	                	code: 404,
	                    message: constantObj.news.COMMENTS_NOT_FOUND,
	                }
            	})
            }
        })

        /*var query = {};
        //query.code = req.param('id');
        query.isDeleted = 'false';
        query.status = true;
        //query.comment_id = '';
        console.log("query",query)
        Comments.find(query).sort('createdAt:asc').exec(function(err, parentComments) {
            if (err) {
                return res.status(400).jsonx({
                    success: false,
                    error: err
                });
            } else {
 
        	console.log("parentComments",parentComments)
	        	News.find({id:parentComments[0].news_id}).exec(function(err, newsInfo) {
	        		console.log("newsInfo",newsInfo)

	                var qry={};
	                var count = 0;
	                
	                async.each(parentComments, function(parentComment, callback) {
	                    qry.comment_id = parentComment.id;
	                    qry.isDeleted = false;

						Comments.find(qry).then(function(childComments){
	                    
	                        parentComment['replies'] = []
	                        parentComment['replies'] = childComments;

	                        
	                        callback();
	                    })
	                    .fail(function(error){
	                        callback(error);
	                    })
	                    count++;
	                },function(error){
	                    if(error){ 
	                        
	                    } else {
	                        return res.jsonx({
	                            success: true,
	                            data   : {
	                            	news:newsInfo,
	                            	parentComments : parentComments
	                            }
	                        });
	                    }
	                });
	            })
            }
        })*/
	},

	saveComments: function(req, res) {
		API(NewsService.saveNewsComments,req,res);
	
	},

	saveReplies: function(req, res) {
		API(NewsService.saveCommentsReplies,req,res);
	
	},



	/*getComments: function(req, res) {
		API(NewsService.getNewsComments,req,res);
	
	},*/

	getComments: function(req, res, next) {
		
		var page        = req.param('page');
		var count       = req.param('count');
		var skipNo      = (page - 1) * count;
		var search      = req.param('search');
		var query       = {};

		var sortBy    	= req.param('sortBy');
		
		if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
		
		query.isDeleted = false;
		query.news_id = req.param('news_id');

		/*if (search) {
            query.$or = [{
                title: {
                        'like': '%' + search + '%'
                    }
                },{
                    description: {
                        'like': '%' + search + '%'
                    }
                }
            ]
        }*/
        
		Comments.count(query).exec(function(err, total) {
		    if (err) {
		       return res.status(400).jsonx({
		           success: false,
		           error: err
		       });
		    } else {
		       Comments.find(query).populate('addedBy').sort(sortBy).skip(skipNo).limit(count).exec(function(err,commentsData) {
		            if (err) {
		                return res.status(400).jsonx({
		                   success: false,
		                   error: err
		                });
		            } else {
		                return res.jsonx({
		                    success: true,
		                    data: {
		                        comments: commentsData,
		                        total: total
		                    },
		                });
		            }
		       })
		    }
		})
	},

	getAllNews: function(req, res, next) {
		
		var page        = req.param('page');
		var count       = req.param('count');
		var skipNo      = (page - 1) * count;
		var search      = req.param('search');
		var query       = {};

		var sortBy    	= req.param('sortBy');
		
		if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
		
		query.isDeleted = 'false';

		if (search) {
            query.$or = [{
                title: {
                        'like': '%' + search + '%'
                    }
                },{
                    description: {
                        'like': '%' + search + '%'
                    }
                }
            ]
        }
		News.count(query).exec(function(err, total) {
		    if (err) {
		       return res.status(400).jsonx({
		           success: false,
		           error: err
		       });
		    } else {
		       News.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err,newsData) {
		            if (err) {
		                return res.status(400).jsonx({
		                   success: false,
		                   error: err
		                });
		            } else {
		            			return res.jsonx({
			                    success: true,
			                    data: {
			                        newsData: newsData,
			                        total: total
			                    },
			                });
		            		
		            }
		       })
		    }
		})
	},
	mobgetAllNews: function(req, res, next) {
		
		var page        = req.param('page');
		var count       = req.param('count');
		var skipNo      = (page - 1) * count;
		var search      = req.param('search');
		var query       = {};

		var sortBy    	= req.param('sortBy');
		
		if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
		
		query.isDeleted = 'false';

		if (search) {
            query.$or = [{
                title: {
                        'like': '%' + search + '%'
                    }
                },{
                    description: {
                        'like': '%' + search + '%'
                    }
                }
            ]
        }
        var converter = require('html-to-markdown');
		News.count(query).exec(function(err, total) {
		    if (err) {
		       return res.status(400).jsonx({
		           success: false,
		           error: err
		       });
		    } else {
		       News.find(query).sort(sortBy).skip(skipNo).limit(count).exec(function(err,newsData) {
		            if (err) {
		                return res.status(400).jsonx({
		                   success: false,
		                   error: err
		                });
		            } else {
		            	var j=0;
		            	for (var i = newsData.length - 1; i >= 0; i--) {
		            		newsData[i].title=converter.convert(newsData[i].title);
		            		newsData[i].subtitle=converter.convert(newsData[i].subtitle);
		            		newsData[i].description=converter.convert(newsData[i].description);
		            		if(j+1 == newsData.length){
		            			return res.jsonx({
			                    success: true,
			                    data: {
			                        newsData: newsData,
			                        total: total
			                    },
			                });
		            		}else{
		            			j++;
		            		}
			                
		                }
		            }
		       })
		    }
		})
	}
	
};