var postId = document.querySelector(".data");
var likeBtn = document.querySelector(".likeBtn");
var hateBtn = document.querySelector(".hateBtn");
var points = document.querySelector(".points");

likeBtn.addEventListener("click", ajaxLikeCall);
hateBtn.addEventListener("click", ajaxLikeCall);

function ajaxLikeCall(e){
    axios.post("/api/like", {
        postId: postId.getAttribute("data-postId"),
        button: e.target.textContent
    })
        .then(function(res){
            console.log(res.data);
            points.textContent = res.data.points;
            if(res.data.like){
                likeBtn.style.color = '#0066ff';
            } else {
                likeBtn.style.color = "black";
            }
            if(res.data.hate){
                hateBtn.style.color = '#0066ff';
            } else {
                hateBtn.style.color = "black";
            }
        })
}