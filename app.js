var express = require("express");
var app = express();

app.get("/", function(req, res){
    res.send("Hello there!");
})

app.get("/bye", function(req, res){
    res.send("Goodbye!");
})

app.get("*", function(req, res){
    res.send("Whoops, looks like this page doesn't exist!");
})

app.listen(3000, function(){
    console.log("Hello there!");
});