var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
    image: String,
    imageId: String,
    title: String,
    description: String,
    country: String,
    photoType: String,
    isPublic: Boolean,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    date: Date,
    points: Number,
    favorites: Number,
    views: Number
});

module.exports = mongoose.model("Post", postSchema);