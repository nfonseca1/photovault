var favLists = document.querySelector("#lists");
var toggleEditBtn = document.querySelector("#toggleEditBtn");
var editListForm = document.querySelector("#editListForm");
var listNameInput = document.querySelector("#listName");
var newList = document.querySelector("#newList");
var currentList = document.querySelector("#currentList");
var newListName = document.querySelector("#newListName");
var uploadBtn = document.querySelector("#uploadBtn");
var updateBtn = document.querySelector("#updateBtn");
var deleteBtn = document.querySelector("#deleteBtn");
var listPrivacy = document.querySelector("#listPrivacy");

var userLists = [];

axios.get("/api/favorites")
    .then(function(res){
        userLists = res.data.userLists;
    })

uploadBtn.addEventListener("click", function(){
    axios.post("/api/favorites/addList", {
        newList: newList.value
    })
        .then(function(res){
            if(res.data.success){
                updateList(res.data.lists);
            }
        })
});

updateBtn.addEventListener("click", function(){
    axios.post("/api/favorites/editList", {
        list: currentList.value,
        newName: newListName.value
    })
        .then(function(res){
            if(res.data.success){
                updateList(res.data.lists);
            }
        })
});

deleteBtn.addEventListener("click", function(){
    axios.post("/api/favorites/removeList", {
        list: currentList.value
    })
        .then(function(res){
            if(res.data.success){
                updateList(res.data.lists);
            }
        })
});

function updateList(lists){
    newList.value = '';
    currentList.value = '';
    newListName.value = '';
    userLists = lists;
    var html = '';
    html += '<option value="all" selected="selected">All Lists</option>';
    html += '<option value="">Unlisted</option>';
    lists.forEach(function(list){
        html += '<option value="' + list.name + '">' + list.name + '</option>';
    })
    favLists.innerHTML = html;
}
