var express               = require("express"),
    router                = express.Router(),
    passport              = require("passport"),
    User                  = require("../models/user"),
    Post                  = require("../models/post"),
    Conversation          = require("../models/conversation"),
    Collection            = require("../models/collection"),
    setupPosts            = require("../public/home.js"),
    getFavorites          = require("../public/getFavorites"),
    middleware            = require("../middleware/index"),
    addUserPostPoints     = require("../public/addPostPoints");

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dfuxqmces',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.put("/users/follow", middleware.isLoggedIn, function(req, res){
    User.findById(req.body.accountUserId, function(err, accountUser){
        if(err) {
            console.log(err);
        } else {
            req.user.following.push(accountUser);
            req.user.save();
            accountUser.followers.push(req.user);
            accountUser.save();
            res.send({});
        }
    })
});

router.put("/users/unfollow", middleware.isLoggedIn, function(req, res){
    for (var i = 0; i < req.user.following.length; i++){
        if(JSON.stringify(req.user.following[i]) == JSON.stringify(req.body.accountUserId)){
            req.user.following.splice(i, 1);
            req.user.save();
            break;
        }
    }
    User.findById(req.body.accountUserId, function(err, accountUser){
        if(err){
            console.log(err);
        } else {
            for (var i = 0; i < accountUser.followers.length; i++) {
                if(JSON.stringify(accountUser.followers[i]) == JSON.stringify(req.user._id)){
                    accountUser.followers.splice(i, 1);
                    accountUser.save();
                    break;
                }
            }
            res.send({});
        }
    })
})

router.get("/users/checkConversations", middleware.isLoggedIn, function(req, res){
    Conversation.findOne({$or: [{'user1.id': req.query.accountUserId, 'user2.id': req.user._id},
            {'user2.id': req.query.accountUserId, 'user1.id': req.user._id}]}, function(err, conv){
        if(conv == null){
            res.send({existingConv: false});
        } else {
            res.send({existingConv: true, convId: conv._id});
        }
    })
});

router.get("/users/conversations", middleware.isLoggedIn, function(req, res){
    Conversation.find({$or: [{'user1.id': req.user._id}, {'user2.id': req.user._id}]}).sort('-lastMessage').exec(function(err, convs){
        if(err){
            console.log("convs err");
            console.log(err);
        } else {
            res.send({convs: convs, myUser: req.user});
        }
    })
});

router.post("/users/conversations", middleware.isLoggedIn, function(req, res){
    User.findById(req.body.accountUserId, function(err, accountUser){
        if(err){
            console.log(err);
        } else {
            var conv = {
                user1: {
                    id: req.user._id,
                    username: req.user.username,
                    view: true
                },
                user2: {
                    id: accountUser._id,
                    username: accountUser.username,
                    view: true
                },
                messages: []
            }
            Conversation.create(conv, function(err, newConv){
                if(err){
                    console.log("conv creation");
                    console.log(err);
                } else {
                    var date = new Date();
                    date = date.toLocaleString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
                    newConv.messages.push({
                        text: req.body.text,
                        author: req.user.username,
                        date: date
                    });
                    newConv.lastMessage = Date.now();
                    newConv.save();
                }
            })
        }
    })
});

router.put("/users/conversations", middleware.isLoggedIn, function(req, res){
    Conversation.findById(req.body.convId, function(err, conv){
        if(err){
            console.log(err);
        } else {
            var convTemp = {
                user1: {
                    id: conv.user1.id,
                    username: conv.user1.username,
                    view: true
                },
                user2: {
                    id: conv.user2.id,
                    username: conv.user2.username,
                    view: true
                },
                messages: conv.messages
            }
            var date = new Date();
            date = date.toLocaleString("en-US", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
            convTemp.messages.push({
                text: req.body.text,
                author: req.user.username,
                date: date
            });
            convTemp.lastMessage = Date.now();
            Conversation.findByIdAndUpdate(req.body.convId, convTemp, function(err, newConv){
                if(err){
                    console.log(err);
                } else {
                    res.send(newConv);
                }
            })
        }
    })
});

router.get("/users/messages", middleware.isLoggedIn, function(req, res){
    Conversation.findById(req.query.convId, function(err, conv){
        res.send(conv);
    })
});

router.post("/settings/validate", middleware.isLoggedIn, function(req, res){
    passport.authenticate("local", function(err, user){
        if(err){
            console.log(err);
            res.send({validated: false});
        } else {
            if(user){
                res.send({validated: true});
            } else {
                res.send({validated: false});
            }
        }
    })(req, res);
});

router.post("/sort", middleware.isLoggedIn, function(req, res){
    if(req.body.loadMore){
        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user, req.body.linkPhotos);
        req.session.currentIndex = htmlPosts.currentIndex;
        res.send(htmlPosts);
    } else {
        var sortBy;
        if(req.body.sortBy == "newest"){
            sortBy = "-date";
        } else if (req.body.sortBy == "mostLiked"){
            sortBy = "-points";
        } else if (req.body.sortBy == "mostFavorited"){
            sortBy = "-favorites";
        } else if (req.body.sortBy == "myFavorites"){
            sortBy = "my favorites";
        } else {
            sortBy = "-date";
        }

        var pastDate;
        if(req.body.within == "day"){
            pastDate = new Date(new Date().setDate(new Date().getDate()-1));
        } else if(req.body.within == "week"){
            pastDate = new Date(new Date().setDate(new Date().getDate()-7));
        } else if(req.body.within == "month"){
            pastDate = new Date(new Date().setMonth(new Date().getMonth()-1));
        } else if(req.body.within == "year"){
            pastDate = new Date(new Date().setFullYear(new Date().getFullYear()-1));
        } else {
            pastDate = "0";
        }

        var photoType;
        var photoType2;
        if(req.body.photoType == "landscapes"){
            photoType = "landscape";
            photoType2 = "landscape";
        } else if(req.body.photoType == "cityscapes"){
            photoType = "cityscape";
            photoType2 = "cityscape";
        } else {
            photoType = "landscape";
            photoType2 = "cityscape";
        }

        var user;
        var postsObj;
        if(req.body.user == undefined){
            user = new RegExp('');
        } else {
            user = req.body.user;
        }
        if(req.body.country == "all"){
            postsObj = {
                $or: [{photoType: photoType}, {photoType: photoType2}],
                //date: {$lt: new Date(), $gte: pastDate},
                'author.username': user
            };
        } else {
            var country = req.body.country;
            postsObj = {
                $or: [{photoType: photoType}, {photoType: photoType2}],
                date: {$lt: new Date(), $gte: pastDate},
                country: country,
                'author.username': user
            };
        }
        if(sortBy == 'my favorites'){
            var foundPosts = {found: []};
            var result = getFavorites(req.body, req.user, postsObj, foundPosts);
            var interval = setInterval(function(){
                if(result == false){
                    res.send({html: '', currentIndex: 0, end: false});
                    clearInterval(interval);
                } else if(foundPosts.found.length == result || result == false){
                    req.session.allPosts = foundPosts.found;
                    req.session.currentIndex = 0;
                    var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user);
                    req.session.currentIndex = htmlPosts.currentIndex;
                    res.send(htmlPosts);
                    clearInterval(interval);
                }
            }, 100)
        } else {
            Post.find(postsObj)
                .sort(sortBy).limit(1000).exec(function(err, posts){
                    if(err){
                        console.log(err);
                        res.redirect("/home");
                    } else {
                        req.session.allPosts = posts;
                        req.session.currentIndex = 0;
                        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user);
                        req.session.currentIndex = htmlPosts.currentIndex;
                        res.send(htmlPosts);
                    }
            })
        }
    }
});

router.post("/like", middleware.isLoggedIn, function(req, res){
    console.log("server side");
    User.findById(req.user._id, function(err, myUser){
        if(err){console.log(err)}
        else {
            var feedback = myUser.feedback;
            var postId = req.body.postId;
            var button = req.body.button;
            var foundFeedback = false;

            for(var i = 0; i < feedback.length; i++) {
                if (feedback[i].id == postId) {
                    foundFeedback = true;
                    var results = addUserPostPoints(feedback[i], button);
                    myUser.save();

                    Post.findById(postId, function(err, post){
                        if(err){console.log(err)}
                        else {
                            post.points = post.points + results.addPoints;
                            post.save();
                            res.send({like: results.like, hate: results.hate, points: post.points});
                        }
                    })
                    break;
                }
            }

            if(!foundFeedback){
                var newFeedback = {
                    id: postId,
                    like: false,
                    hate: false,
                    favorite: false,
                    list: ''
                };
                feedback.push(newFeedback);
                var results = addUserPostPoints(feedback[feedback.length-1], button);
                myUser.save();

                Post.findById(postId, function(err, post){
                    if(err){console.log(err)}
                    else {
                        post.points = post.points + results.addPoints;
                        post.save();
                        res.send({like: results.like, hate: results.hate, points: post.points});
                    }
                })
            }

        }
    })
})

router.post("/favorite", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id, function(err, myUser){
        if(err){console.log(err)}
        else {
            var feedback = myUser.feedback;
            var postId = req.body.postId;
            var foundFeedback = false;
            var favorited = false;

            for(var i = 0; i < feedback.length; i++) {
                if (feedback[i].id == postId) {
                    foundFeedback = true;
                    if(req.body.changeList){
                        feedback[i].list = req.body.list;
                        myUser.save();
                    } else {
                        if(feedback[i].favorite){
                            feedback[i].favorite = false;
                            favorited = false;
                        } else {
                            feedback[i].favorite = true;
                            favorited = true;
                            feedback[i].list = req.body.list;
                        }
                        feedback[i].list = req.body.list;
                        myUser.save();

                        Post.findById(postId, function(err, post){
                            if(err){console.log(err)}
                            else {
                                if(favorited){
                                    post.favorites = post.favorites + 1;
                                } else {
                                    post.favorites = post.favorites - 1;
                                }
                                post.save();
                                res.send({favorited: favorited});
                            }
                        })
                    }
                    break;
                }
            }

            if(!foundFeedback){
                var newFeedback = {
                    id: postId,
                    like: false,
                    hate: false,
                    favorite: false,
                    list: ''
                };
                feedback.push(newFeedback);
                if(feedback[i].favorite){
                    feedback[i].favorite == false;
                    favorited = false;
                } else {
                    feedback[i].favorite == true;
                    favorited = true;
                    feedback[i].list == req.body.list;
                }
                feedback[i].list = req.body.list;
                myUser.save();

                Post.findById(postId, function(err, post){
                    if(err){console.log(err)}
                    else {
                        if(favorited){
                            post.favorites = post.favorites + 1;
                        } else {
                            post.favorites = post.favorites - 1;
                        }
                        post.save();
                        res.send({favorited: favorited});
                    }
                })
            }

        }
    })
})

router.get("/favorites", middleware.isLoggedIn, function(req, res){
    res.send({userLists: req.user.favoriteLists});
})

router.post("/favorites/addList", middleware.isLoggedIn, function(req, res){
    var lists = req.user.favoriteLists;
    for(var i = 0; i < lists.length; i++){
        if(lists[i].name == req.body.newList){
            res.send({success: false});
            return;
        }
    }
    lists.push({name: req.body.newList, privacy: req.body.privacy});
    req.user.save();
    res.send({success: true, lists: req.user.favoriteLists});
})

router.post("/favorites/editList", middleware.isLoggedIn, function(req, res){
    var lists = req.user.favoriteLists;
    for(var i = 0; i < lists.length; i++){
        if(lists[i].name == req.body.newName){
            res.send({success: false});
            return;
        } else if(i == lists.length - 1){
            break;
        }
    }
    for(var x = 0; x < lists.length; x++){
        if(lists[x].name == req.body.list){
            lists.splice(x, 1, {name: req.body.newName, privacy: req.body.privacy});
            req.user.feedback.forEach(function(feed){
                if(feed.list == req.body.list){
                    feed.list = req.body.newName;
                }
            })
            req.user.save();
            res.send({success: true, lists: req.user.favoriteLists});
            return;
        }
    }
    res.send({success: false});
})

router.post("/favorites/removeList", middleware.isLoggedIn, function(req, res){
    var lists = req.user.favoriteLists;
    for(var i = 0; i < lists.length; i++){
        if(lists[i].name == req.body.list){
            lists.splice(i, 1);
            req.user.feedback.forEach(function(feed){
                if(feed.list == req.body.list){
                    feed.list = '';
                }
            })
            req.user.save();
            res.send({success: true, lists: req.user.favoriteLists});
            return;
        }
    }
    res.send({success: false});
})

router.post("/favorites/privacy", middleware.isLoggedIn, function(req, res){
    var lists = req.user.favoriteLists;
    for(var i = 0; i < lists.length; i++){
        if(lists[i].name == req.body.list){
            lists[i].privacy = req.body.privacy;
            req.user.save();
            res.send({success: true, lists: req.user.favoriteLists});
            return;
        }
    }
    res.send({success: false});
})

router.get("/collections", middleware.isLoggedIn, function(req, res){
    console.log(req.query);
    Post.findById(req.query.id, function(err, found){
        if(err){console.log(err)}
        else{
            res.send({src: found.image})
        }
    })
})

router.delete("/home/:id", middleware.isLoggedIn, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err || post == null){
            console.log(err);
        } else if(post.author.username == req.user.username){
            cloudinary.v2.uploader.destroy(post.imageId);
            post.remove();
            post.save();
        }
    });
})

module.exports = router;