
function setupPosts(res, currentIndex) {
    var html1 = "";
    var html2 = "";
    var html3 = "";
    var post = res;
    var max = 0;
    var end = false;
    if(currentIndex + 15 >= res.length){
        max = res.length;
        end = true;
    } else {
        max = currentIndex + 14;
    }
    console.log("----");
    console.log("begin");
    for (var p = currentIndex; p <= max; p++) {
        if (p == 1 || p % 3 == 1) {
            html1 += '<a href="/home/' + post[p - 1]._id + '" class="nostyle">';
            html1 += '<div>';
            html1 += '<div class="title">';
            html1 += '<h5>' + post[p - 1].title + '</h5>';
            html1 += '</div>';
            html1 += '<div class="thumbnail">';
            html1 += '<img src="' + post[p - 1].image + '">';
            html1 += '</div>';
            html1 += '</div>';
            html1 += '</a>';
        } else if (p == 2 || p % 3 == 2) {
            html2 += '<a href="/home/' + post[p - 1]._id + '" class="nostyle">';
            html2 += '<div>';
            html2 += '<div class="title">';
            html2 += '<h5>' + post[p - 1].title + '</h5>';
            html2 += '</div>';
            html2 += '<div class="thumbnail">';
            html2 += '<img src="' + post[p - 1].image + '">';
            html2 += '</div>';
            html2 += '</div>';
            html2 += '</a>';
        } else if (p % 3 == 0) {
            html3 += '<a href="/home/' + post[p - 1]._id + '" class="nostyle">';
            html3 += '<div>';
            html3 += '<div class="title">';
            html3 += '<h5>' + post[p - 1].title + '</h5>';
            html3 += '</div>';
            html3 += '<div class="thumbnail">';
            html3 += '<img src="' + post[p - 1].image + '">';
            html3 += '</div>';
            html3 += '</div>';
            html3 += '</a>';
        }
        console.log(p);
    }
    console.log("end");
    console.log("----");
    return {
        html1: html1,
        html2: html2,
        html3: html3,
        end: end
    }
}

module.exports = setupPosts;