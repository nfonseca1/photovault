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
            if(usingPhotosList == false){
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
        var count = 0;
        do {
            height[t] = parseInt(images[t].naturalHeight);
            width[t] = parseInt(images[t].naturalWidth);
            count++;
        } while((height[t] == 0 || width[t] == 0) && count < 100)
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

    configureHoverEffects();
    //grid.classList.remove('grid-default');
    if(usingPhotosList == false){
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

function configureHoverEffects(){
    var newlyLoaded = document.querySelectorAll(".newly-loaded");

    newlyLoaded.forEach(function(post){
        var container = post.querySelector(".post-hover-container");
        var header = post.querySelector(".post-hover-header");
        var footer = post.querySelector(".post-hover-footer");
        var footerLeft = footer.querySelector(".hover-footer-left");
        var footerRight = footer.querySelector(".hover-footer-right");

        post.addEventListener("mouseenter", function(){
            container.style.opacity = "1";
            container.style.transition = "opacity .35s linear";
            header.style.opacity = "1";
            header.style.transition = "opacity .35s linear";
            footer.style.opacity = "1";
            footer.style.transition = "opacity .35s linear";
            footerLeft.querySelector(".hover-footer-author").style.display = "inline-block";

            if(post.getAttribute("data-isAuthor")){
                var html = '';
                html += '<span class="hover-delete-confirm">Are you sure?</span>';
                html += '<span class="hover-delete">Delete</span>';
                html += '<span class="hover-delete-yes">Yes</span><span class="hover-delete-no">No</span>';
                footerRight.innerHTML = html;

                var footerDelete = footerRight.querySelector(".hover-delete");
                footerDelete.addEventListener("click", function(){
                    footerLeft.style.width = "0";
                    footerRight.style.width = "100%";
                    footerRight.style.display = "inline-flex";
                    footerRight.style.justifyContent = "space-evenly";
                    var footerYes = footerRight.querySelector(".hover-delete-yes");
                    var footerNo = footerRight.querySelector(".hover-delete-no");
                    var footerAuthor = footerLeft.querySelector(".hover-footer-author");
                    var footerConfirm = footerRight.querySelector(".hover-delete-confirm");
                    footerDelete.style.display = "none";
                    footerYes.style.display = "inline-block";
                    footerNo.style.display = "inline-block";
                    footerAuthor.style.display = "none";
                    footerConfirm.style.display = "inline-block";

                    footerNo.addEventListener("click", function(){
                        footerLeft.style.width = "49%";
                        footerRight.style.width = "49%";
                        footerRight.style.display = "inline-block";
                        footerDelete.style.display = "inline-block";
                        footerYes.style.display = "none";
                        footerNo.style.display = "none";
                        footerAuthor.style.display = "inline-block";
                        footerConfirm.style.display = "none";
                    })
                    footerYes.addEventListener("click", function(){
                        console.log(post.querySelector("a").getAttribute("data-id"));
                        axios.delete("/api/home/" + post.querySelector("a").getAttribute("data-id"));
                        post.outerHTML = '';
                    })
                })
            } else {
                footerRight.textContent = post.getAttribute("data-country");
            }
        })
        post.addEventListener("mouseleave", function(){
            footerLeft.style.width = "49%";
            footerRight.style.width = "49%";
            footerRight.style.display = "inline-block";
            header.style.opacity = "0";
            header.style.transition = "0s";
            footer.style.opacity = "0";
            footer.style.transition = "0s";
        })
    })
}