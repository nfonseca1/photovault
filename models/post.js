var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    image: String,
    title: String,
    description: String,
    country: String,
    photoType: String,
    isPublic: bool
})

module.exports(mongoose.model("Post", postSchema));