var express               = require("express"),
    router                = express.Router(),
    User                  = require("../models/user"),
    Post                  = require("../models/post"),
    setupPosts            = require("../public/home.js"),
    middleware            = require("../middleware/index");

//cloudinary
require('dotenv').config();
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dfuxqmces',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/", middleware.isLoggedIn, function(req, res){
    if(req.query.searchBy == undefined){
        Post.find({}).limit(4000).exec(function(err, posts){
            if (err) {
                console.log(err);
            }
            else {
                req.session.allPosts = posts;
                req.session.currentIndex = 0;
                var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
                req.session.currentIndex = htmlPosts.currentIndex;
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else if(req.query.searchBy == "title"){
        var search = req.query.search;
        Post.find({title: new RegExp('\\b' + search + '\\b', 'i')}).limit(4000).exec(function(err, posts){
            if (err) {console.log(err)}
            else {
                req.session.allPosts = posts;
                req.session.currentIndex = 0;
                var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
                req.session.currentIndex = htmlPosts.currentIndex;
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else if(req.query.searchBy == "description"){
        var search = req.query.search;
        Post.find({description: new RegExp('\\b' + search + '\\b', 'i')}).limit(4000).exec(function(err, posts){
            if (err) {console.log(err)}
            else {
                req.session.allPosts = posts;
                req.session.currentIndex = 0;
                var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
                req.session.currentIndex = htmlPosts.currentIndex;
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else if(req.query.searchBy == "author"){
        var search = req.query.search;
        Post.find({'author.username': search}).limit(4000).exec(function(err, posts){
            if (err) {console.log(err)}
            else {
                User.findOne({username: search}, function(err, user){
                    if(err){console.log(err)}
                    else {
                        req.session.allPosts = posts;
                        req.session.currentIndex = 0;
                        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex);
                        req.session.currentIndex = htmlPosts.currentIndex;
                        res.render("home.ejs", {htmlPosts: htmlPosts, user: user});
                    }
                })
            }
        })
    }
});

//CREATE new post
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        var newPost = {
            image: result.secure_url,
            imageId: result.public_id,
            title: req.body.title,
            description: req.body.description,
            country: req.body.country,
            photoType: req.body.photoType,
            isPublic: req.body.isPublic,
            author: {
                id: req.user._id,
                username: req.user.username
            },
            date: new Date(),
            points: 0,
            favorites: 0,
            views: 0
        }
        Post.create(newPost, function(err, newlyCreated){
            if (err) {
                console.log(err);
            }
            else {
                res.redirect("/account");
            }
        })
    });
});

router.get("/:id", middleware.isLoggedIn, function(req, res){
    Post.findById(req.params.id).populate("comments").exec(function(err, post){
        if (err) {
            console.log(err);
        } else {
            User.findById(req.user._id, function(err, myUser){
                if(err){console.log(err)}
                else {
                    var postVars = {
                        likeColor: "black",
                        hateColor: "black",
                        favoriteLists: req.user.favoriteLists,
                        favListDisplay: 'none',
                        favBtnColor: 'black'
                    };
                    var feedback = myUser.feedback;
                    console.log("--Check on load--");
                    console.log(feedback);
                    console.log(post._id);
                    for(var i = 0; i < feedback.length; i++){
                        console.log(feedback[i].id);
                        console.log(post._id);
                        if(feedback[i].id == req.params.id){
                            console.log("match");
                            if(feedback[i].like){
                                postVars.likeColor = "#0066ff";
                            }
                            if(feedback[i].hate){
                                postVars.likeColor = "#0066ff";
                            }
                            if(feedback[i].favorite){
                                console.log("favorited");
                                postVars.favListDisplay = 'inline';
                                postVars.favBtnColor = '#0066ff';
                            } else {
                                console.log("not favorited");
                                postVars.favListDisplay = 'none';
                                postVars.favBtnColor = 'black';
                            }
                            break;
                        }
                    }
                    console.log(postVars);
                    res.render("post.ejs", {postVars: postVars, post: post});
                }
            })
        }
    })
});

//Go to EDIT page
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, foundPost){
        res.render("edit.ejs", {post: foundPost});
    });
});

//UPDATE post
router.put("/:id", middleware.checkPostOwnership, upload.single('image'), function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
        } else {
            if(req.file){
                cloudinary.v2.uploader.destroy(req.file.path, function(err){
                    if(err) {
                        console.log(err);
                    }
                    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
                        if(err){
                            console.log(err);
                        }
                        post.imageId = result.public_id;
                        post.image = result.secure_url;
                        post.title = req.body.post.title;
                        post.description = req.body.post.description;
                        post.save();
                        res.redirect("/home/" + req.params.id);
                    })
                })
            } else {
                post.title = req.body.post.title;
                post.description = req.body.post.description;
                post.save();
                res.redirect("/home/" + req.params.id);
            }
        }
    });
});

//DELETE post
router.delete("/:id", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
        }
        cloudinary.v2.uploader.destroy(post.imageId);
        post.remove();
        res.redirect("/home");
    });
});

module.exports = router;
