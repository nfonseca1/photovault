var commentArea = document.querySelector("#commentArea");
var commentButton = document.querySelector("#addComment");
var commentSections = document.querySelectorAll(".comment");
var addFormOn = false;

commentButton.addEventListener("click", openCommentForm);
commentSections.forEach(function(commentSection) {
    commentSection.children[1].addEventListener("click", function(e){
        var html = "";
        html += '<form action="/home/<%=post._id%>/comment/'+ commentSection.getAttribute('data-comment-id') +'?_method=PUT" method="POST">';
        html += '<input type="text" name="comment[text]" value="'+ commentSection.getAttribute('data-comment-text') +'">';
        html += '</form>';
        commentSection.innerHTML = html;
    })
});

function openCommentForm(){
    var html = "";
    if(addFormOn) {
        commentArea.innerHTML = "";
        addFormOn = false;
    } else {
        html = '<form action="/home/<%= post._id %>" method="POST">';
        html += '<input type="text" class="form-control" name="comment[text]">';
        html += '<button type="submit" class="btn btn-xs btn-success">Post</button></form>';
        commentArea.innerHTML = html;
        addFormOn = true;
    }
}