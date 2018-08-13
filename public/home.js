
var postsSection = document.querySelector("#postsSection");
var countriesList = document.querySelector("#country");
var sortBy = document.querySelector("#sortBy");
var within = document.querySelector("#within");
var photoType = document.querySelector("#photoType");
var country = document.querySelector("#country");
var sortBtn = document.querySelector("#sortBtn");

axios.post("/api/sort", {
    sortBy: sortBy.value,
    within: within.value,
    photoType: photoType.value,
    country: country.value
})
    .then(function(res){
        setupPosts(res);
    })

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
            setupPosts(res);
        })
})

function setupPosts(res){
    var html = "";
    var html1 = "";
    var html2 = "";
    var html3 = "";
    var post = res.data;

    for(var p = 1; p <= res.data.length; p++){
        if(p == 1){
            html += '<div id="column-1" class="col-md-4" style="padding: 2px 2px 0 2px"></div>';
        } else if(p == 2){
            html += '<div id="column-2" class="col-md-4" style="padding: 0 5px 0 5px"></div>';
        } else if(p == 3){
            html += '<div id="column-3" class="col-md-4" style="padding: 0 5px 0 5px"></div>';
        }
        if(p == 1 || p % 3 == 1){
            html1 += '<a href="/home/' + post[p-1]._id + '" class="nostyle">';
            html1 += '<div>';
            html1 += '<div class="title">';
            html1 += '<h5>' + post[p-1].title + '</h5>';
            html1 += '</div>'
            html1 += '<div class="thumbnail">';
            html1 += '<img src="' + post[p-1].image + '">';
            html1 += '</div>';
            html1 += '</div>';
            html1 += '</a>';
        } else if(p == 2 || p % 3 == 2){
            html2 += '<a href="/home/' + post[p-1]._id + '" class="nostyle">';
            html2 += '<div>';
            html2 += '<div class="title">';
            html2 += '<h5>' + post[p-1].title + '</h5>';
            html2 += '</div>'
            html2 += '<div class="thumbnail">';
            html2 += '<img src="' + post[p-1].image + '">';
            html2 += '</div>';
            html2 += '</div>';
            html2 += '</a>';
        } else if(p % 3 == 0){
            html3 += '<a href="/home/' + post[p-1]._id + '" class="nostyle">';
            html3 += '<div>';
            html3 += '<div class="title">';
            html3 += '<h5>' + post[p-1].title + '</h5>';
            html3 += '</div>'
            html3 += '<div class="thumbnail">';
            html3 += '<img src="' + post[p-1].image + '">';
            html3 += '</div>';
            html3 += '</div>';
            html3 += '</a>';
        }
    };
    postsSection.innerHTML = html;

    var col1 = document.querySelector("#column-1");
    var col2 = document.querySelector("#column-2");
    var col3 = document.querySelector("#column-3");

    col1.innerHTML = html1;
    col2.innerHTML = html2;
    col3.innerHTML = html3;
}

