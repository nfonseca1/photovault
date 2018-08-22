var express               = require("express"),
    router                = express.Router(),
    Post                  = require("../models/post"),
    Comment               = require("../models/comment"),
    middleware            = require("../middleware/index");


//CREATE new comment
router.post("/", middleware.isLoggedIn, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
            res.redirect("/home/" + req.params.id);
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    post.comments.push(comment);
                    post.save();
                    res.redirect("/home/" + post._id);
                }
            });
        }
    });
});

//UPDATE comment
router.put("/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

//DELETE comment
router.delete("/:commentId", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndDelete(req.params.commentId, function(err){
        if(err){
            res.redirect("/home");
        } else {
            res.redirect("/home/" + req.params.id);
        }
    })
});

module.exports = router;