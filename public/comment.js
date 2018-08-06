var commentArea = document.querySelector("#commentArea");
var commentButton = document.querySelector("#addComment");

commentButton.addEventListener("click", openCommentForm);

function openCommentForm(){
    var html = '<form action="/home/<%=post[0]._id%>" method="POST">';
    html += '<input type="text" name="text">';
    html += '</form>';
    commentArea.innerHTML = html;
}