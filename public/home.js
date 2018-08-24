
function setupPosts(posts, i) {
    var html = '';
    var max = 0;
    var end = false;
    if(i + 30 >= posts.length){
        max = posts.length;
        end = true;
    } else {
        max = i + 30;
    }
    for (i; i < max; i++) {
        if(posts[i] == null){continue;}
        html += '<figure><i></i>';
        html += '<a href="/home/' + posts[i]._id + '" class="nostyle">';
        html += '<img src="' + posts[i].image + '"></a>';
        html += '</figure>';
    }
    return {
        html: html,
        currentIndex: i,
        end: end
    }
}

module.exports = setupPosts;