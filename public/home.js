
function setupPosts(posts, i, user, link) {
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
        html += '<figure class="newly-loaded" data-isAuthor="' + (posts[i].author.username == user.username) + '" data-country="' + posts[i].country + '"><i></i>';
        html += '<div class="post-hover-header">' + posts[i].title + '</div>';
        html += '<div class="post-hover-footer"><div class="hover-footer-left">';
        html += '<span class="hover-footer-author">' + posts[i].author.username + '</span></div>';
        html += '<div class="hover-footer-right"></div></div>';
        html += '<a ';
        if(link == "false"){
            html += 'data-id="' + posts[i]._id + '" class="nostyle">';
        } else {
            html += 'href="/home/' + posts[i]._id + '" data-id="' + posts[i]._id + '" class="nostyle">';
        }
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