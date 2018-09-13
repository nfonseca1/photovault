var mongoose = require("mongoose");

var CollectionSchema = new mongoose.Schema({
    title: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    sections: [
        {
            heading: String,
            description: String,
            posts: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Post"
                }
            ]
        }
    ],
    isPublic: Boolean
});

module.exports = mongoose.model("Collection", CollectionSchema);