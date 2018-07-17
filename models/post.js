var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    title: String,
    description: String,
    keywords: String,
    isPublic: bool
})

module.exports(mongoose.model("Post", postSchema));