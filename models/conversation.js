var mongoose = require("mongoose");

var conversationSchema = new mongoose.Schema({
    user1: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        view: Boolean
    },
    user2: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        view: Boolean
    },
    messages: [
        {
            text: String,
            author: String
        }
    ]
});

module.exports = mongoose.model("Conversation", conversationSchema);