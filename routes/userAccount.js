var express               = require("express"),
    router                = express.Router(),
    User                  = require("../models/user"),
    Post                  = require("../models/post"),
    setupPosts            = require("../public/home.js"),
    middleware            = require("../middleware/index");


router.get("/", middleware.isLoggedIn, function(req, res){
    User.findOne({username: req.params.username}, function(err, user){
        if(err || user == null) {
            console.log(err);
            res.redirect("/home");
        }
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
            allPosts = foundPosts;
            currentIndex = 1;
            htmlPosts = setupPosts(allPosts, currentIndex);
            if(currentIndex + 15 > allPosts.length){
                currentIndex = allPosts.length;
            } else {
                currentIndex = currentIndex + 16;
            }
            htmlPosts.index = currentIndex;
            res.render("userAccount.ejs", {htmlPosts: htmlPosts, user: user, following: amFollowing});
        });
    });
});

router.get("/followers", middleware.isLoggedIn, function(req, res){
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

router.get("/following", middleware.isLoggedIn, function(req, res){
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
