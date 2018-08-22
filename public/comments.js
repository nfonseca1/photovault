var commentArea = document.querySelector("#commentArea");
var commentButton = document.querySelector("#addComment");
var commentSections = document.querySelectorAll(".comment");
var addFormOn = false;

commentButton.addEventListener("click", openCommentForm);
commentSections.forEach(function(commentSection) {
    commentSection.children[1].addEventListener("click", function(){
        var html = "";
        html += '<form action="/home/<%=post._id%>/comment/'+ commentSection.getAttribute('data-comment-id') +'?_method=PUT" method="POST" style="display: inline;">';
        html += '<input type="text" name="comment[text]" value="'+ commentSection.getAttribute('data-comment-text') +'">';
        html += '<button type="button" name="cancel" id="cancelComment" class="btn btn-xs">Cancel</button> ';
        html += '<button type="submit" class="btn btn-xs btn-warning" style="display: inline;">Update</button>';
        html += '</form> ';
        html += '<form action="/home/<%=post._id%>/comment/'+ commentSection.getAttribute('data-comment-id') + '?_method=DELETE" method="POST" style="display: inline;">';
        html += '<button type=submit class="btn btn-xs btn-danger">Delete</button>';
        html += '</form>';
        commentSection.children[0].style.display = "none";
        commentSection.children[1].style.display = "none";
        commentSection.children[2].innerHTML = html;
        var cancelComment = document.querySelector("#cancelComment");
        cancelComment.addEventListener("click", function(){
            commentSection.children[2].innerHTML = '';
            commentSection.children[0].style.display = "inline";
            commentSection.children[1].style.display = "block";
        })
    })
});

function openCommentForm(){
    var html = "";
    if(addFormOn) {
        commentArea.innerHTML = "";
        addFormOn = false;
    } else {
        html = '<form action="/home/<%= post._id %>/comment" method="POST">';
        html += '<input type="text" class="form-control" name="comment[text]">';
        html += '<button type="submit" class="btn btn-xs btn-success">Post</button></form>';
        commentArea.innerHTML = html;
        addFormOn = true;
    }
}