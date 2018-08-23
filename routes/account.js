var express               = require("express"),
    router                = express.Router(),
    User                  = require("../models/user"),
    Post                  = require("../models/post"),
    Conversation          = require("../models/conversation"),
    setupPosts            = require("../public/home.js"),
    middleware            = require("../middleware/index");


//Go to account page to ADD post
router.get("/", middleware.isLoggedIn, function(req, res){
    Post.find({'author.id': req.user._id}, function(err, foundPosts){
        if (err) {
            console.log(err);
        }
        req.session.allPosts = foundPosts;
        req.session.currentIndex = 0;
        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
        req.session.currentIndex = htmlPosts.currentIndex;
        req.session.dataSave = false;
        res.render("account.ejs", {htmlPosts: htmlPosts, user: req.user});
    })
});

router.get("/following", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id).populate("following").exec(function(err, myUser){
        if(err){
            console.log(err);
        } else {
            res.render("following.ejs", {myUser: myUser});
        }
    })
});

router.get("/followers", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id).populate("followers").exec(function(err, myUser){
        if(err){
            console.log(err);
        } else {
            res.render("followers.ejs", {myUser: myUser});
        }
    })
});

router.get("/messages", middleware.isLoggedIn, function(req, res){
    Conversation.find({$or: [{'user1.id': req.user._id}, {'user2.id': req.user._id}]}).sort('-lastMessage').exec(function(err, convs){
        if(err){
            console.log(err);
        } else {
            res.render("messages.ejs", {convs: convs});
        }
    })
});

router.get("/favorites", middleware.isLoggedIn, function(req, res){
    var listFilter;
    if(req.query.list == undefined){
        listFilter = 'all';
    } else {
        listFilter = req.query.list;
    }
    console.log(listFilter);
    var foundPosts = [];
    if(req.user.feedback.length == 0){
        res.render("favorites.ejs", {htmlPosts: [], lists: req.user.favoriteLists});
    } else {
        var feed = req.user.feedback;
        for(var f = 0; f < feed.length; f++){
            if(feed[f].favorite){
                if(listFilter == 'all'){
                    console.log("listFilter all");
                    Post.findById(feed[f].id, function(err, post){
                        foundPosts.push(post);
                    })
                } else if(feed[f].list == listFilter){
                    Post.findById(feed[f].id, function(err, post){
                        foundPosts.push(post);
                    })
                }
            }
        }
        setTimeout(function(){
            req.session.allPosts = foundPosts;
            req.session.currentIndex = 0;
            var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
            req.session.currentIndex = htmlPosts.currentIndex;
            req.session.dataSave = false;
            res.render("favorites.ejs", {htmlPosts: htmlPosts, lists: req.user.favoriteLists});
        }, 200);
    }
})

router.get("/settings", middleware.isLoggedIn, function(req, res){
    res.render("settings.ejs");
});

router.put("/settings", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id, function(err, user){
        if(err){
            console.log(err);
        } else {
            if(req.body.email != ""){
                user.email = "req.body.email";
                user.save();
                console.log(user);
            }
            if(req.body.password != ""){
                user.setPassword(req.body.password, function(){
                    user.save();
                    res.redirect("/account/settings");
                })
            } else {
                res.redirect("/account/settings");
            }
        }
    })
});

router.get("/:username", middleware.isLoggedIn, function(req, res){
    console.log(req.params);
    User.findOne({username: req.params.username}, function(err, user){
        if(err || user == null) {
            console.log(err);
            res.redirect("/home");
        } else {
            var amFollowing = false;
            for(var i = 0; i < req.user.following.length; i++){
                if(JSON.stringify(req.user.following[i]) == JSON.stringify(user._id)){
                    amFollowing = true;
                    break;
                }
            }
            Post.find({'author.username': user.username}, function(err, foundPosts){
                if(err) {
                    console.log(err);
                }
                req.session.allPosts = foundPosts;
                req.session.currentIndex = 0;
                var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
                req.session.currentIndex = htmlPosts.currentIndex;
                req.session.dataSave = false;
                res.render("userAccount.ejs", {htmlPosts: htmlPosts, user: user, following: amFollowing});
            });
        }
    });
});

router.get("/:username/followers", middleware.isLoggedIn, function(req, res){
    User.findOne({username: req.params.username}).populate("followers").exec(function(err, user){
        var amFollowing = false;
        for(var i = 0; i < req.user.following.length; i++){
            if(JSON.stringify(req.user.following[i]) == JSON.stringify(user._id)){
                amFollowing = true;
                break;
            }
        }
        if(err){
            console.log(err);
        } else {
            res.render("userFollowers.ejs", {user: user, following: amFollowing});
        }
    })
});

router.get("/:username/following", middleware.isLoggedIn, function(req, res){
    User.findOne({username: req.params.username}).populate("following").exec(function(err, user){
        var amFollowing = false;
        for(var i = 0; i < req.user.following.length; i++){
            if(JSON.stringify(req.user.following[i]) == JSON.stringify(user._id)){
                amFollowing = true;
                break;
            }
        }
        if(err){
            console.log(err);
        } else {
            res.render("userFollowing.ejs", {user: user, following: amFollowing});
        }
    })
});

module.exports = router;