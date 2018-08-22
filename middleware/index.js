var Post = require("../models/post.js");
var Comment = require("../models/comment.js");

var middlewareObj = {};

middlewareObj.checkPostOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Post.findById(req.params.id, function(err, foundPost){
            if (err){
                res.redirect("back");
            } else {
                if (foundPost.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if (req.isAuthenticated()){
        Comment.findById(req.params.commentId, function(err, foundComment){
            if (err){
                res.redirect("back");
            } else {
                if (foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/");
    }
};

module.exports = middlewareObj;