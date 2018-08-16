var postId = document.querySelector(".data");
var likeBtn = document.querySelector(".likeBtn");
var hateBtn = document.querySelector(".hateBtn");
var points = document.querySelector(".points");
var favoriteBtn = document.querySelector(".favoriteBtn");
var favList = document.querySelector("#favList");

likeBtn.addEventListener("click", ajaxLikeCall);
hateBtn.addEventListener("click", ajaxLikeCall);
favoriteBtn.addEventListener("click", ajaxFavoriteCall);

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

function ajaxFavoriteCall() {
    console.log("fav ajax call");
    axios.post("/api/favorite", {
        postId: postId.getAttribute("data-postId"),
        button: 'favorite',
        list: favList.value
    })
        .then(function(res){
            if(res.data.favorited){
                favoriteBtn.style.color = '#0066ff';
                favList.style.display = 'inline';
            } else {
                favoriteBtn.style.color = "black";
                favList.style.display = 'none';
            }
        })
}