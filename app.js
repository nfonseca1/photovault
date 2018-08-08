var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    Post                  = require("./models/post"),
    Comment               = require("./models/comment"),
    countries             = require("./public/countries"),
    middleware            = require("./middleware/middleware"),
    LocalStrategy         = require("passport-local"),
    methodOverride        = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/photoVault");
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
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
    Post.find({}, function(err, posts){
        if (err) {
            console.log(err);
        }
        else {
            res.render("home.ejs", {posts: posts});
        }
    })
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
        res.render("account.ejs", {countries: countries, posts: foundPosts});
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
app.post("/home", middleware.isLoggedIn, function(req, res){
    var image = req.body.image;
    var title = req.body.title;
    var description = req.body.description;
    var country = req.body.country;
    var photoType = req.body.photoType;
    var isPublic = req.body.isPublic;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPost = {image: image, title: title, description: description, country: country, photoType: photoType, isPublic: isPublic, author: author}
    Post.create(newPost, function(err, newlyCreated){
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/home");
        }
    })
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

//UPDATE post
app.put("/home/:id", middleware.checkPostOwnership, function(req, res){
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
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
    Post.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home");
        }
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

app.listen(3000, function(){
    console.log("server started.......");
});