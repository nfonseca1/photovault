var express               = require("express"),
    router                = express.Router(),
    passport              = require("passport"),
    User                  = require("../models/user");


router.get("/", function(req, res){
    console.log("index arrived");
    res.render("index.ejs");
});

router.post("/", function(req, res){
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

router.get("/login", function(req, res){
    console.log("arrive");
    User.find({}, function(err, results){
        if(err){console.log(err)}
        else{
            console.log(results);
        }
    })
    res.redirect("/");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/"
}) ,function(req, res){
});

router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

module.exports = router;
