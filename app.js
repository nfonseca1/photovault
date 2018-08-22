var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    methodOverride        = require("method-override");

var postRoutes = require("./routes/posts"),
    commentRoutes = require("./routes/comments"),
    accountRoutes = require("./routes/account"),
    userAccountRoutes = require("./routes/userAccount"),
    apiRoutes = require("./routes/api"),
    indexRoutes = require("./routes/index");

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

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use("/", indexRoutes);
app.use("/home", postRoutes);
app.use("/home/:id/comment", commentRoutes);
app.use("/account", accountRoutes);
app.use("/account/:username", userAccountRoutes);
app.use("/api", apiRoutes);

app.listen(3000, function(){
    console.log("server started.......");
});


function addUserPostPoints(feedback, button){
    console.log(feedback);
    var addPoints = 0;
    var like = false;
    var hate = false;
    if(button == "Like"){
        if(feedback.like){
            console.log("like already");
            feedback.like = false;
            like = false;
            addPoints = -1;
        } else {
            console.log("no like");
            feedback.like = true;
            like = true;
            if(feedback.hate == true){
                addPoints = 2;
            } else {
                addPoints = 1;
            }
            feedback.hate = false;
            hate = false;
        }
    } else {
        if(feedback.hate){
            console.log("hate already");
            feedback.hate = false;
            hate = false;
            addPoints = 1;
        } else {
            console.log("no hate");
            feedback.hate = true;
            hate = true;
            if(feedback.like == true){
                addPoints = -2;
            } else {
                addPoints = -1;
            }
            feedback.like = false;
            like = false;
        }
    }
    return {
        addPoints: addPoints,
        like: like,
        hate: hate
    };
}

