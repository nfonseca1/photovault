var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/photoVault");
app.use(bodyParser.urlencoded({extended: true}));

var userSchema = new mongoose.Schema({
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string
});

var User = mongoose.model("user", userSchema);
 

app.get("/", function(req, res){
    res.render("index.ejs");
})

app.get("*", function(req, res){
    res.send("Whoops, looks like this page doesn't exist!");
})

app.listen(3000, function(){
    console.log("Hello there!");
});