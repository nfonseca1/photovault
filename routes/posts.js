var express               = require("express"),
    router                = express.Router(),
    User                  = require("../models/user"),
    Post                  = require("../models/post"),
    Comment               = require("../models/comment"),
    Collection            = require("../models/collection"),
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
    if(req.query.search == undefined){
        Post.find({}).limit(1000).exec(function(err, posts){
            if (err) {
                console.log(err);
            }
            else {
                req.session.allPosts = posts;
                req.session.currentIndex = 0;
                var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user);
                req.session.currentIndex = htmlPosts.currentIndex;
                req.session.dataSave = false;
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else {
        var search = req.query.search;
        Post.find({'author.username': search}).limit(1000).exec(function(err, posts){
            if (err) {console.log(err)}
            else if(posts.length >= 1){
                User.findOne({username: search}, function(err, user){
                    if(err){console.log(err)}
                    else {
                        req.session.allPosts = posts;
                        req.session.currentIndex = 0;
                        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user);
                        req.session.currentIndex = htmlPosts.currentIndex;
                        req.session.dataSave = false;
                        res.render("home.ejs", {htmlPosts: htmlPosts, user: user});
                    }
                })
            } else {
                Post.find({title: new RegExp('\\b' + search + '\\b', 'i')}).limit(1000).exec(function(err, posts){
                    if (err) {console.log(err)}
                    else if (posts.length >= 1){
                        req.session.allPosts = posts;
                        req.session.currentIndex = 0;
                        var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user);
                        req.session.currentIndex = htmlPosts.currentIndex;
                        req.session.dataSave = false;
                        res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
                    }
                    else {
                        Post.find({description: new RegExp('\\b' + search + '\\b', 'i')}).limit(1000).exec(function(err, posts){
                            if (err) {console.log(err)}
                            else {
                                req.session.allPosts = posts;
                                req.session.currentIndex = 0;
                                var htmlPosts = setupPosts(req.session.allPosts, req.session.currentIndex, req.user);
                                req.session.currentIndex = htmlPosts.currentIndex;
                                req.session.dataSave = false;
                                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
                            }
                        })
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
            isPublic: (req.body.isPublic == true),
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
                res.redirect("/home");
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
                        liked: false,
                        hated: false,
                        favoriteLists: req.user.favoriteLists,
                        favListDisplay: 'none',
                        favBtnColor: 'black',
                        favorited: false
                    };
                    var feedback = myUser.feedback;
                    for(var i = 0; i < feedback.length; i++){
                        if(feedback[i].id == req.params.id){
                            if(feedback[i].like){
                                postVars.likeColor = "#0066ff";
                                postVars.liked = true;
                            }
                            if(feedback[i].hate){
                                postVars.hateColor = "#0066ff";
                                postVars.hated = true;
                            }
                            if(feedback[i].favorite){
                                postVars.favListDisplay = 'inline';
                                postVars.favBtnColor = '#0066ff';
                                postVars.favorited = true;
                            }
                            break;
                        }
                    }
                    var isAuthor;
                    if (post.author.username == myUser.username){
                        isAuthor = true;
                    } else {
                        isAuthor = false;
                    }
                    res.render("post.ejs", {postVars: postVars, post: post, isAuthor: isAuthor});
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

            post.title = req.body.title;
            post.description = req.body.description;
            post.save();
            res.redirect("/home/" + req.params.id);
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

router.get("/collection/:id", middleware.isLoggedIn, function(req, res){
    res.redirect("/");
    return;
    Collection.findById(req.params.id).forEach().populate("posts").exec(function(err, col){
        if(err){console.log(err)}
        else {
            console.log(col);
            //res.render("viewCollection.ejs", {col: col});
        }
    })
})


//CREATE new comment
router.post("/:id/comment", middleware.isLoggedIn, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
            res.redirect("/home/" + req.params.id);
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/home/" + post._id);
                }
            });
        }
    });
});

//UPDATE comment
router.put("/:id/comment/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, {$set: {text: req.body.comment}}, function(err, comment){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

//DELETE comment
router.delete("/:id/comment/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndDelete(req.params.commentId, function(err){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

module.exports = router;
