var express               = require("express"),
    router                = express.Router(),
    User                  = require("../models/user"),
    Post                  = require("../models/post"),
    Conversation          = require("../models/conversation"),
    Collection            = require("../models/collection"),
    setupPosts            = require("../public/home.js"),
    getFavorites          = require("../public/getFavorites"),
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

router.get("/collections", middleware.isLoggedIn, function(req, res){
    Collection.find({'author.id': req.user._id}, function(err, found){
        if(err) {console.log(err)}
        else {
            var cols = [];

            for(let i = 0; i < found.length; i++){
                var displayCol = {};
                displayCol.title = found[i].title;
                displayCol.id = found[i]._id;
                for(let x = 0; x < found[i].sections.length; x++){
                    if(found[i].sections[x].posts.length >= 1){
                        var imageId = found[i].sections[x].posts[0];
                        displayCol.image = imageId;
                        cols.push(displayCol);
                        break;
                    } else {
                        continue;
                    }
                }
            }
            res.render("collections.ejs", {collections: cols});
        }
    })
})

router.post("/collections", middleware.isLoggedIn, function(req, res){
    var newCollection = {};
    console.log(req.body);
    newCollection.title = req.body.title;
    newCollection.author = {
        id: req.user._id,
        username: req.user.username
    };
    newCollection.sections = [];

    for(let i = 0; i < req.body.sections; i++){
        var newSection = {};
        newSection.heading = req.body.headings[i];
        newSection.description = req.body.descriptions[i];
        newSection.posts = req.body.photos[i];
        newCollection.sections.push(newSection);
    }
    if(req.body.isPublic == 'on'){
        newCollection.isPublic = true;
    } else {
        newCollection.isPublic = false;
    }
    Collection.create(newCollection, function(err, newlyCreated){
        if(err) {console.log(err)}
        else{
            console.log("database");
            console.log(newlyCreated);
            res.redirect("/account/collections");
        }
    })
})

router.get("/collections/new", middleware.isLoggedIn, function(req, res){
    Post.find({'author.id': req.user._id}, function(err, foundPosts) {
        if (err) {
            console.log(err);
        }
        req.session.allPosts = foundPosts;
        req.session.currentIndex = 0;
        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, 'false');
        req.session.currentIndex = htmlPosts.currentIndex;
        req.session.dataSave = false;
        res.render("createCollection.ejs", {
            htmlPosts: htmlPosts,
            user: req.user
        });
    });
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
    var foundPosts = {found: []};
    var result = getFavorites(req.query, req.user, {}, foundPosts);
    var interval = setInterval(function(){
        if(result == false){
            res.render("favorites.ejs", {htmlPosts: [], lists: req.user.favoriteLists});
            clearInterval(interval);
        } else if(foundPosts.found.length == result || result == false){
            req.session.allPosts = foundPosts.found;
            req.session.currentIndex = 0;
            var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
            req.session.currentIndex = htmlPosts.currentIndex;
            res.render("favorites.ejs", {htmlPosts: htmlPosts, lists: req.user.favoriteLists});
            clearInterval(interval);
        }
    }, 100)
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