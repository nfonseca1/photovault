var favLists = document.querySelector("#lists");
var toggleEditBtn = document.querySelector("#toggleEditBtn");
var editListForm = document.querySelector("#editListForm");
var listNameInput = document.querySelector("#listName");
var addBtn = document.querySelector("#addBtn");
var editBtn = document.querySelector("#editBtn");
var removeBtn = document.querySelector("#removeBtn");
var listPrivacy = document.querySelector("#listPrivacy");

var userLists = [];
var editFormOn = false;

sessionStorage.clear();

axios.get("/api/favorites")
    .then(function(res){
        userLists = res.data.userLists;
        console.log("--favorites--");
        console.log(userLists);
    })

toggleEditBtn.addEventListener("click", function(){
    if (editFormOn){
        editListForm.style.display = "none";
        editFormOn = false;
    } else {
        editListForm.style.display = "block";
        editFormOn = true;
    }
});

addBtn.addEventListener("click", function(){
    axios.post("/api/favorites/addList", {
        newList: listNameInput.value
    })
        .then(function(res){
            if(res.data.success){
                userLists = res.data.lists;
                var html = '';
                html += '<option value="all" selected="selected">All Lists</option>';
                html += '<option value="">Unlisted</option>';
                res.data.lists.forEach(function(list){
                    html += '<option value="' + list.name + '">' + list.name + '</option>';
                })
                favLists.innerHTML = html;
            }
        })
});

editBtn.addEventListener("click", function(){
    axios.post("/api/favorites/editList", {
        list: favLists.value,
        newName: listNameInput.value
    })
        .then(function(res){
            if(res.data.success){
                userLists = res.data.lists;
                var html = '';
                html += '<option value="all" selected="selected">All Lists</option>';
                html += '<option value="">Unlisted</option>';
                res.data.lists.forEach(function(list){
                    html += '<option value="' + list.name + '">' + list.name + '</option>';
                })
                favLists.innerHTML = html;
            }
        })
});

removeBtn.addEventListener("click", function(){
    axios.post("/api/favorites/removeList", {
        list: listNameInput.value
    })
        .then(function(res){
            if(res.data.success){
                userLists = res.data.lists;
                var html = '';
                html += '<option value="all" selected="selected">All Lists</option>';
                html += '<option value="">Unlisted</option>';
                res.data.lists.forEach(function(list){
                    html += '<option value="' + list.name + '">' + list.name + '</option>';
                })
                favLists.innerHTML = html;
            }
        })
});

function updateChange(){
    console.log(favLists.value);
    if(favLists.value != 'all' && favLists.value != 'none'){
        listNameInput.value = favLists.value;
        console.log(userLists);
        for(var i = 0; i < userLists.length; i++){
            console.log(userLists[i].name);
            console.log("askldfja");
            if(favLists.value == userLists[i].name){
                console.log("value");
                listPrivacy.value = userLists[i].privacy;
                console.log(listPrivacy.value);
            }
        }
    }
}

function updatePrivacy(){
    axios.post("/api/favorites/privacy", {
        list: listNameInput.value,
        privacy: listPrivacy.value
    })
        .then(function(res){
            userlists = res.data.lists;
            console.log(res.data.lists);
        })
}

