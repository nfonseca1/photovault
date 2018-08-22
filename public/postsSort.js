var grid = document.querySelector("#grid");
var searchBtn = document.querySelector("#searchBtn");
var countriesList = document.querySelector("#country");
var sortBy = document.querySelector("#sortBy");
var within = document.querySelector("#within");
var photoType = document.querySelector("#photoType");
var country = document.querySelector("#country");
var sortBtn = document.querySelector("#sortBtn");

var wait = false;
var end = false;

var html = '';
countries.forEach(function(country){
    html += '<option value="' + country.name + '">' + country.name + '</option>';
})
countriesList.innerHTML += html;

searchBtn.addEventListener("click", function(){
    sessionStorage.clear();
})

sortBtn.addEventListener("click", function(){
    sessionStorage.clear();
    grid.style.display = 'none';
    makeAJAXRequest();
});

function makeAJAXRequest(e, loadMore) {
    axios.post("/api/sort", {
        sortBy: sortBy.value,
        within: within.value,
        photoType: photoType.value,
        country: country.value,
        loadMore: loadMore,
    })
        .then(function(res){
            if(res.data.end){end = res.data.end;}
            console.log(res.data);
            applyPosts(res.data, true, loadMore)
        })
}

if(sessionStorage.pageSaved == undefined){
    //sessionStorage.posts = "";
    applyPosts({}, false);
    //sessionStorage.pageSaved = true;
} else {
    console.log("saved");
    grid.innerHTML = sessionStorage.posts;
    window.scrollBy(sessionStorage.pagePosition, 0);
}

function applyPosts(res, ajax, loadMore){
    console.log("----");
    if(ajax){
        if(!loadMore) {
            end = false;
            grid.style.display = 'flex';
            grid.innerHTML = '';
        }
        grid.classList.add('grid-default');
        grid.classList.remove('grid');
        grid.innerHTML += res.html;
        //sessionStorage.posts = grid.innerHTML;
        setTimeout(function(){
            setupLayout(res.currentIndex);
        }, 100);
    } else {
        console.log("loading search");
        grid.innerHTML = grid.getAttribute("data-posts");
        //sessionStorage.posts = grid.innerHTML;
        setTimeout(function(){
            setupLayout(grid.getAttribute("data-index"));
        }, 100);
    }
}

function setupLayout(i){
    var images = document.querySelectorAll("img");
    var figures = document.querySelectorAll("figure");
    var iTags = document.querySelectorAll("i");

    var t = i - 30;
    var x = i - 30;
    if((i - 30) < 0 ){
        t = 0;
        x = 0;
    } else {
        t = i - 30;
        x = i - 30;
    }

    var height = [];
    var width = [];

    for(t; t < images.length; t++){
        height[t] = parseInt(images[t].clientHeight);
        width[t] = parseInt(images[t].clientWidth);
    }
    grid.classList.add('grid');
    for(x; x < images.length; x++){
        var h = height[x];
        var w = width[x];
        var flexGrow = (w * 100) / h;
        var flexBasis = (w * 200) / h;
        var paddingBottom = (h / w) * 100;
        var src = images[x].getAttribute("src");

        images[x].style.opacity = 0;

        figures[x].style.flexGrow = flexGrow;
        figures[x].style.flexBasis = flexBasis + "px";
        figures[x].style.backgroundImage = 'url('+src+')';
        iTags[x].style.paddingBottom = paddingBottom + '%';
    }
    grid.classList.remove('grid-default');

    wait = false;
}