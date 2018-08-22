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
        allPosts = foundPosts;
        currentIndex = 1;
        htmlPosts = setupPosts(allPosts, currentIndex);
        if(currentIndex + 15 > allPosts.length){
            currentIndex = allPosts.length;
        } else {
            currentIndex = currentIndex + 16;
        }
        htmlPosts.index = currentIndex;
        res.render("account.ejs", {htmlPosts: htmlPosts});
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
        console.log("-fav list undefined");
        listFilter = 'all';
    } else {
        console.log("-fav list defined");
        listFilter = req.query.list;
    }
    var foundPosts = [];
    if(req.user.feedback.length == 0){
        res.render("favorites.ejs", {htmlPosts: [], lists: req.user.favoriteLists});
    }
    req.user.feedback.forEach(function(feed){
        if(feed.favorite){
            console.log("match");
            console.log(feed);
            if(listFilter == 'all'){
                Post.findById(feed.id, function(err, post){
                    console.log(post);
                    foundPosts.push(post);
                    allPosts = foundPosts;
                    currentIndex = 1;
                    htmlPosts = setupPosts(allPosts, currentIndex);
                    if(currentIndex + 15 > allPosts.length){
                        currentIndex = allPosts.length;
                    } else {
                        currentIndex = currentIndex + 16;
                    }
                    htmlPosts.index = currentIndex;
                    res.render("favorites.ejs", {htmlPosts: htmlPosts, lists: req.user.favoriteLists});
                })
                console.log("foundPost");
            } else {
                if(feed.list == listFilter){
                    console.log("-list Filter");
                    Post.findById(feed.id, function(err, post){
                        foundPosts.push(post);
                        console.log("pushed");
                        allPosts = foundPosts;
                        currentIndex = 1;
                        htmlPosts = setupPosts(allPosts, currentIndex);
                        if(currentIndex + 15 > allPosts.length){
                            currentIndex = allPosts.length;
                        } else {
                            currentIndex = currentIndex + 16;
                        }
                        htmlPosts.index = currentIndex;
                        res.render("favorites.ejs", {htmlPosts: htmlPosts, lists: req.user.favoriteLists});
                    })
                } else {
                    res.render("favorites.ejs", {htmlPosts: [], lists: req.user.favoriteLists});
                }
            }
        }
    })
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

module.exports = router;