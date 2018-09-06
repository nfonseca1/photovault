var grid = document.querySelector("#grid");
var userData = document.querySelector("#userData");

var wait = false;
var end = false;
var pagePosition = 0;
var getFavorites = false;
var linkPhotos = false;
var user;
if(userData.getAttribute("data-username") != undefined){
    user = userData.getAttribute("data-username");
}
if(userData.getAttribute("data-getFavorites") == 'true'){
    getFavorites = true;
}
if(userData.getAttribute("data-linkPhotos") != undefined){
    linkPhotos = userData.getAttribute("data-linkPhotos");
}


function makeAJAXRequest(e, loadMore) {
    axios.post("/api/sort", {
        loadMore: loadMore,
        user: user,
        getFavorites: getFavorites,
        linkPhotos: linkPhotos
    })
        .then(function(res){
            if(usingPhotosList == undefined){
                pagePosition = window.pageYOffset;
            } else {
                pagePosition = photosList.scrollTop;
            }
            //sessionStorage.index = res.data.currentIndex;
            if(res.data.end){end = res.data.end;}
            applyPosts(res.data, true, loadMore)
        })
}

if(sessionStorage.dataSave == undefined || sessionStorage.dataSave == false){
    //sessionStorage.dataSave = false;
    //sessionStorage.posts = "";
    applyPosts({}, false);
} else {
    grid.innerHTML = sessionStorage.posts;
    window.scrollTo(0, sessionStorage.pagePosition);
}

function applyPosts(res, ajax, loadMore){
    if(ajax){
        if(!loadMore) {
            end = false;
            grid.style.display = 'flex';
            grid.innerHTML = '';
        }
        //grid.classList.add('grid-default');
        //grid.classList.remove('grid');
        grid.innerHTML += res.html;
        //sessionStorage.posts = grid.innerHTML;
        setTimeout(function(){
            setupLayout(res.currentIndex);
        }, 100);
    } else {
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
        height[t] = parseInt(images[t].naturalHeight);
        width[t] = parseInt(images[t].naturalWidth);
        console.log(width[t]);
    }
    //grid.classList.add('grid');
    for(x; x < images.length; x++){
        var h = height[x];
        var w = width[x];
        var flexGrow = (w * 100) / h;
        var size = 240;
        if(userData.getAttribute("data-rowSize") != undefined){
            size = parseInt(userData.getAttribute("data-rowSize"));
        }
        var flexBasis = (w * size) / h;
        var paddingBottom = (h / w) * 100;
        var src = images[x].getAttribute("src");

        images[x].style.opacity = 0;

        figures[x].style.flexGrow = flexGrow;
        figures[x].style.flexBasis = flexBasis + "px";
        figures[x].style.backgroundImage = 'url('+src+')';
        iTags[x].style.paddingBottom = paddingBottom + '%';
    }
    //grid.classList.remove('grid-default');
    if(usingPhotosList == undefined){
        window.scrollTo(window.pageXOffset, pagePosition);
    } else {
        photosList.scrollTo(0, pagePosition);
        addImageEvents();
    }
    unpauseRequests(false);
}

function unpauseRequests(extendWait){
    if(extendWait){
        wait = true;
        setTimeout(function(){
            wait = false;
        }, 500)
    } else {
        wait = false;
    }
}