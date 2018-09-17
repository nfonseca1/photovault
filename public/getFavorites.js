Post = require("../models/post");

function getFavorites(params, user, postObj, found){
    var foundPosts = found.found;
    var favoritesAmount = 0;
    var listFilter;
    if(params.list == undefined){
        listFilter = 'all';
    } else {
        listFilter = params.list;
        if(listFilter == 'unlisted'){
            listFilter = '';
        }
    }
    if(user.feedback.length == 0){
        return false;
    } else {
        var feed = user.feedback;
        for (var f = 0; f < feed.length; f++) {
            if (feed[f].favorite) {
                if (listFilter == 'all') {
                    favoritesAmount++;
                    postObj._id = feed[f].id;
                    Post.findOne(postObj, function (err, post) {
                        foundPosts.push(post);
                    })
                } else if (feed[f].list == listFilter) {
                    favoritesAmount++;
                    postObj._id = feed[f].id;
                    Post.findOne(postObj, function (err, post) {
                        foundPosts.push(post);
                    })
                }
            }
        }
        return favoritesAmount;
    }
}

module.exports = getFavorites;
