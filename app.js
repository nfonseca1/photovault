var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/photoVault");
app.use(bodyParser.urlencoded({extended: true}));

var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String
});

var User = mongoose.model("user", userSchema);


app.get("/", function(req, res){
    res.render("index.ejs");
})

app.get("/home", function(req, res){
    res.render("home.ejs");
})

app.post("/home", function(req, res){
    var newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password1
    }
    User.create(newUser, function(err, user){
        if (err) {
            console.log(err)
        }
        else {
            console.log("new user " + user)
            res.redirect("/home");
        }
    })
})

app.get("*", function(req, res){
    res.send("Whoops, looks like this page doesn't exist!");
})

app.listen(3000, function(){
    console.log("Hello there!");
});