var postsSection = document.querySelector("#postsSection");
var countriesList = document.querySelector("#country");
var sortBy = document.querySelector("#sortBy");
var within = document.querySelector("#within");
var photoType = document.querySelector("#photoType");
var country = document.querySelector("#country");
var sortBtn = document.querySelector("#sortBtn");
var wait = false;
var end = false;
var index = parseInt(postsSection.getAttribute("data-index"));
console.log(index);
console.log("--initial index--");


var html = '';
countries.forEach(function(country){
    html += '<option value="' + country.name + '">' + country.name + '</option>';
})
countriesList.innerHTML += html;

sortBtn.addEventListener("click", function(){
    sessionStorage.clear();
    makeAJAXRequest();
});

function makeAJAXRequest(e, loadMore) {
    console.log(index);
    console.log("^^index client in^^");
    axios.post("/api/sort", {
        sortBy: sortBy.value,
        within: within.value,
        photoType: photoType.value,
        country: country.value,
        loadMore: loadMore,
        index: index
    })
        .then(function(res){
            if(res.data.end){end = res.data.end;}
            sessionStorage.index = res.data.index;
            index = res.data.index;
            console.log(index);
            console.log("^^index client out^^")
            applyPosts(res.data, true, loadMore)
        })
}

if(sessionStorage.pageSaved == undefined){
    sessionStorage.col1 = "";
    sessionStorage.col2 = "";
    sessionStorage.col3 = "";
    sessionStorage.index = index;
    applyPosts({}, false);
    sessionStorage.pageSaved = true;
} else {
    var col1 = document.querySelector("#column-1");
    var col2 = document.querySelector("#column-2");
    var col3 = document.querySelector("#column-3");
    console.log("----");
    console.log(sessionStorage.pageSaved);
    console.log(sessionStorage.pagePosition);
    col1.innerHTML = sessionStorage.col1;
    col2.innerHTML = sessionStorage.col2;
    col3.innerHTML = sessionStorage.col3;
    window.scrollBy(sessionStorage.pagePosition, 0);
    index = sessionStorage.index;
    console.log(index);
}

function applyPosts(res, ajax, loadMore){
    var col1 = document.querySelector("#column-1");
    var col2 = document.querySelector("#column-2");
    var col3 = document.querySelector("#column-3");

    if(ajax){
        if(loadMore){
            col1.innerHTML += res.html1;
            col2.innerHTML += res.html2;
            col3.innerHTML += res.html3;
        } else {
            end = false;
            col1.innerHTML = res.html1;
            col2.innerHTML = res.html2;
            col3.innerHTML = res.html3;
        }
    } else {
        col1.innerHTML = col1.getAttribute("data-col1");
        col2.innerHTML = col2.getAttribute("data-col2");
        col3.innerHTML = col3.getAttribute("data-col3");
    }
    sessionStorage.col1 = col1.innerHTML;
    sessionStorage.col2 = col2.innerHTML;
    sessionStorage.col3 = col3.innerHTML;
    console.log(sessionStorage.pagePosition);
    wait = false;
}