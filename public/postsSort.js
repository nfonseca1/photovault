var postsSection = document.querySelector("#postsSection");
var countriesList = document.querySelector("#country");
var sortBy = document.querySelector("#sortBy");
var within = document.querySelector("#within");
var photoType = document.querySelector("#photoType");
var country = document.querySelector("#country");
var sortBtn = document.querySelector("#sortBtn");

var html = '';
countries.forEach(function(country){
    html += '<option value="' + country.name + '">' + country.name + '</option>';
})
countriesList.innerHTML += html;

sortBtn.addEventListener("click", function(){
    axios.post("/api/sort", {
        sortBy: sortBy.value,
        within: within.value,
        photoType: photoType.value,
        country: country.value
    })
        .then(function(res){
            console.log(res);
            applyPosts(res.data, true)
        })
})

applyPosts({}, false);

function applyPosts(res, ajax){

    var col1 = document.querySelector("#column-1");
    var col2 = document.querySelector("#column-2");
    var col3 = document.querySelector("#column-3");

    if(ajax){
        col1.innerHTML = res.html1;
        col2.innerHTML = res.html2;
        col3.innerHTML = res.html3;
    } else {
        col1.innerHTML = col1.getAttribute("data-col1");
        col2.innerHTML = col2.getAttribute("data-col2");
        col3.innerHTML = col3.getAttribute("data-col3");
    }
}