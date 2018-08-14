var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    Post                  = require("./models/post"),
    Comment               = require("./models/comment"),
    Conversation          = require("./models/conversation"),
    countries             = require("./public/countries"),
    setupPosts            = require("./public/home.js"),
    middleware            = require("./middleware/middleware"),
    LocalStrategy         = require("passport-local"),
    methodOverride        = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/photoVault");
var app = express();

app.use(express.static(__dirname +'/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require("express-session")({
    secret: "If you only knew the power of the dark side.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dfuxqmces',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

//============
// ROUTES
//============

app.get("/", function(req, res){
    res.render("index.ejs");
});

app.get("/login", function(req, res){
    res.redirect("/");
});

app.get("/home", middleware.isLoggedIn, function(req, res){
    if(req.query.searchBy == undefined){
        Post.find({}, function(err, posts){
            if (err) {
                console.log(err);
            }
            else {
                postResults = {
                    data: posts
                }
                htmlPosts = setupPosts(postResults);
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else if(req.query.searchBy == "title"){
        var search = req.query.search;
        Post.find({title: new RegExp('\\b' + search + '\\b', 'i')}, function(err, posts){
            if (err) {console.log(err)}
            else {
                postResults = {
                    data: posts
                }
                htmlPosts = setupPosts(postResults);
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else if(req.query.searchBy == "description"){
        var search = req.query.search;
        Post.find({description: new RegExp('\\b' + search + '\\b', 'i')}, function(err, posts){
            if (err) {console.log(err)}
            else {
                postResults = {
                    data: posts
                }
                htmlPosts = setupPosts(postResults);
                res.render("home.ejs", {htmlPosts: htmlPosts, user: undefined});
            }
        })
    } else if(req.query.searchBy == "author"){
        var search = req.query.search;
        Post.find({'author.username': search}, function(err, posts){
            if (err) {console.log(err)}
            else {
                User.findOne({username: search}, function(err, user){
                    if(err){console.log(err)}
                    else {
                        postResults = {
                            data: posts
                        }
                        htmlPosts = setupPosts(postResults);
                        res.render("home.ejs", {htmlPosts: htmlPosts, user: user});
                    }
                })
            }
        })
    }
});

app.get("/home/:id", middleware.isLoggedIn, function(req, res){
    Post.findById(req.params.id).populate("comments").exec(function(err, post){
        if (err) {
            console.log(err);
        } else {
            res.render("post.ejs", {post: post});
        }
    })
});

//Go to account page to ADD post
app.get("/account", middleware.isLoggedIn, function(req, res){
    Post.find({'author.id': req.user._id}, function(err, foundPosts){
        if (err) {
            console.log(err);
        }
        postResults = {
            data: foundPosts
        }
        htmlPosts = setupPosts(postResults);
        res.render("account.ejs", {htmlPosts: htmlPosts});
    })
});

app.get("/account/following", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id).populate("following").exec(function(err, myUser){
        if(err){
            console.log(err);
        } else {
            res.render("following.ejs", {myUser: myUser});
        }
    })
});

app.get("/account/followers", middleware.isLoggedIn, function(req, res){
    User.findById(req.user._id).populate("followers").exec(function(err, myUser){
        if(err){
            console.log(err);
        } else {
            res.render("followers.ejs", {myUser: myUser});
        }
    })
});

app.get("/account/messages", middleware.isLoggedIn, function(req, res){
    Conversation.find({$or: [{'user1.id': req.user._id}, {'user2.id': req.user._id}]}).sort('-lastMessage').exec(function(err, convs){
        if(err){
            console.log(err);
        } else {
            res.render("messages.ejs", {convs: convs});
        }
    })
});

app.get("/account/settings", middleware.isLoggedIn, function(req, res){
        res.render("settings.ejs");
});

app.get("/account/:username", middleware.isLoggedIn, function(req, res){
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
            postResults = {
                data: foundPosts
            }
            htmlPosts = setupPosts(postResults);
            res.render("userAccount.ejs", {htmlPosts: htmlPosts, user: user, following: amFollowing});
        });
    });
});

app.get("/account/:username/followers", middleware.isLoggedIn, function(req, res){
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

app.get("/account/:username/following", middleware.isLoggedIn, function(req, res){
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

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

//Go to EDIT page
app.get("/home/:id/edit", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, foundPost){
        res.render("edit.ejs", {post: foundPost, countries: countries});
    });
});

app.post("/", function(req, res){
    User.register(new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email
    }), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('index.ejs');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/home");
        });
    });
});

app.post("/login", passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/"
    }) ,function(req, res){
});

//CREATE new post
app.post("/home", middleware.isLoggedIn, upload.single('image'), function(req, res){
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
                res.redirect("/home");
            }
        })
    });
});

//CREATE new comment
app.post("/home/:id", middleware.isLoggedIn, function(req, res){
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

app.put("/account/settings", function(req, res){
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

//UPDATE post
app.put("/home/:id", middleware.checkPostOwnership, upload.single('image'), function(req, res){
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

//UPDATE comment
app.put("/home/:id/comment/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

//DELETE post
app.delete("/home/:id", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
        }
        cloudinary.v2.uploader.destroy(post.imageId);
        post.remove();
        res.redirect("/home");
    });
});

//DELETE comment
app.delete("/home/:id/comment/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndDelete(req.params.commentId, function(err){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

//API

app.put("/api/users/follow", function(req, res){
    User.findById(req.body.accountUserId, function(err, accountUser){
        if(err) {
            console.log(err);
        } else {
            req.user.following.push(accountUser);
            req.user.save();
            accountUser.followers.push(req.user);
            accountUser.save();
        }
    })
});

app.put("/api/users/unfollow", function(req, res){
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
        }
    })
})

app.get("/api/users/checkConversations", function(req, res){
    Conversation.findOne({$or: [{'user1.id': req.query.accountUserId, 'user2.id': req.user._id},
            {'user2.id': req.query.accountUserId, 'user1.id': req.user._id}]}, function(err, conv){
        if(conv == null){
            res.send({existingConv: false});
        } else {
            res.send({existingConv: true, convId: conv._id});
        }
    })
});

app.post("/api/users/conversations", function(req, res){
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
                message: []
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

app.put("/api/users/conversations", function(req, res){
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

app.get("/api/users/conversations", function(req, res){
    Conversation.find({$or: [{'user1.id': req.user._id}, {'user2.id': req.user._id}]}).sort('-lastMessage').exec(function(err, convs){
        if(err){
            console.log("convs err");
            console.log(err);
        } else {
            res.send({convs: convs, myUser: req.user});
        }
    })
});

app.get("/api/users/messages", function(req, res){
    Conversation.findById(req.query.convId, function(err, conv){
        res.send(conv);
    })
});

app.post("/api/settings/validate", function(req, res){
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

app.post("/api/sort", function(req, res){
    var sort;
    if(req.body.sortBy == "newest"){
        sort = "-date";
    } else if (req.body.sortBy == "highest rated"){
        sort = "-points";
    } else if (req.body.sortBy == "most favorited"){
        sort = "-favorites";
    } else {
        sort = "-views";
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
    if(req.body.user == undefined){
        user = new RegExp('');
    } else {
        user = req.body.user;
    }

    if(req.body.country == "all"){
        Post.find({$or: [{photoType: photoType}, {photoType: photoType2}], date: {$lt: new Date(), $gte: pastDate}, 'author.username': user})
            .sort(sort).exec(function(err, posts){
                if(err){
                    console.log(err);
                } else {
                    postResults = {
                        data: posts
                    }
                    htmlPosts = setupPosts(postResults);
                    res.send(htmlPosts);
                }
        })
    } else {
        var country = req.body.country;
        Post.find({$or: [{photoType: photoType}, {photoType: photoType2}], date: {$lt: new Date(), $gte: pastDate}, country: country, 'author.username': user})
            .sort(sort).exec(function(err, posts){
            if(err){
                console.log(err);
            } else {
                postResults = {
                    data: posts
                }
                htmlPosts = setupPosts(postResults);
                res.send(htmlPosts);
            }
        })
    }
});

app.listen(3000, function(){
    console.log("server started.......");
});