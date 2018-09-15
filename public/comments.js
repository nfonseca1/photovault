var comments = document.querySelectorAll(".post-comment");

comments.forEach(function(comment){
    if(comment.getAttribute("data-comment-user") == details.getAttribute("data-user")){
        updateComment(comment);
    }
})

function updateComment(comment){
    var postId = details.getAttribute("data-postId");
    var commentId = comment.getAttribute("data-commentId");

    comment.querySelector(".post-comment-box").addEventListener("mouseenter", function(){
        comment.querySelector(".post-comment-box").title = "Click to edit";
    })
    comment.querySelector(".post-comment-box").addEventListener("click", function(){
        var currentComment = comment.querySelector(".post-comment-text").textContent;

        var html = '';
        html += '<form action="/home/' + postId + '/comment/' + commentId + '?_method=PUT" method="post" style="display: inline">';
        html += '<input type="text" id="updatedComment" name="comment" class="post-update-input" placeholder="Comment" value="' + currentComment + '">';
        html += '<button type="button" id="comment-cancel-btn" class="snappir-btn snappir-btn-white">Cancel</button>';
        html += '<button type="submit" class="snappir-btn snappir-btn-green">Update</button>';
        html += '</form>';
        html += '<form action="/home/' + postId + '/comment/' + commentId + '?_method=DELETE" method="post" style="display: inline-block">';
        html += '<button type="submit" class="snappir-btn snappir-btn-red">Delete</button>';
        html += '</form>';
        comment.innerHTML = html;

        var cancelBtn = document.querySelector("#comment-cancel-btn");
        cancelBtn.addEventListener("click", function(){
            comment.innerHTML = '<div class="post-comment-box">' +
                '<a href="/account/' + comment.getAttribute("data-comment-user") + '">' + comment.getAttribute("data-comment-user") + ': </a>' +
                '<span class="post-comment-text">' + currentComment + '</span>' +
                '</div>';
            updateComment(comment);
        })
    })
}