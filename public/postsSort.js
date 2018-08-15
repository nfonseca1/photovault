
var countriesList = document.querySelector("#country");
var sortBy = document.querySelector("#sortBy");
var within = document.querySelector("#within");
var photoType = document.querySelector("#photoType");
var country = document.querySelector("#country");
var sortBtn = document.querySelector("#sortBtn");
var end = false;

var html = '';
countries.forEach(function(country){
    html += '<option value="' + country.name + '">' + country.name + '</option>';
})
countriesList.innerHTML += html;

sortBtn.addEventListener("click", makeAJAXRequest);

function makeAJAXRequest(e, loadMore) {
    axios.post("/api/sort", {
        sortBy: sortBy.value,
        within: within.value,
        photoType: photoType.value,
        country: country.value,
        loadMore: loadMore
    })
        .then(function(res){
            if(res.data.end){end = res.data.end;}
            console.log(res.data);
            applyPosts(res.data, true, loadMore)
        })
}

applyPosts({}, false);

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
}