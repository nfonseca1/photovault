var countriesList = document.querySelector("#country");
var sortBy = document.querySelector("#sortBy");
var within = document.querySelector("#within");
var photoType = document.querySelector("#photoType");
var country = document.querySelector("#country");
var newestBtn = document.querySelector("#newest");
var mostLikedBtn = document.querySelector("#mostLiked");
var mostFavoritedBtn = document.querySelector("#mostFavorited");
var myFavoritesBtn = document.querySelector("#myFavorites");

newestBtn.addEventListener("click", function(){
    sortBy.value = "newest";
    makeAJAXSortRequest(null, false);
})

mostLikedBtn.addEventListener("click", function(){
    sortBy.value = "mostLiked";
    makeAJAXSortRequest(null, false);
})

mostFavoritedBtn.addEventListener("click", function(){
    sortBy.value = "mostFavorited";
    makeAJAXSortRequest(null, false);
})

myFavoritesBtn.addEventListener("click", function(){
    sortBy.value = "myFavorites";
    makeAJAXSortRequest(null, false);
})

var html = '';
countries.forEach(function(country){
    html += '<option value="' + country.name + '">' + country.name + '</option>';
})
countriesList.innerHTML += html;

function makeAJAXSortRequest(e, loadMore) {
    unpauseRequests(true);
    grid.style.display = 'none';
    axios.post("/api/sort", {
        sortBy: sortBy.value,
        within: within.value,
        photoType: photoType.value,
        country: country.value,
        loadMore: loadMore,
        user: user,
        getFavorites: getFavorites
    })
        .then(function(res){
            pagePosition = window.pageYOffset;
            //sessionStorage.index = res.data.currentIndex;
            if(res.data.end){end = res.data.end;}
            applyPosts(res.data, true, loadMore)
        })
}