var list = document.querySelector("#list");
var filterBtn = document.querySelector("#filterBtn");
var toggleEditBtn = document.querySelector("#toggleEditBtn");
var editListForm = document.querySelector(".editListForm");
var listNameInput = document.querySelector("#listName");
var addBtn = document.querySelector(".addBtn");
var editBtn = document.querySelector(".editBtn");
var removeBtn = document.querySelector(".removeBtn");

var editFormOn = false;

toggleEditBtn.addEventListener("click", function(){
    if (editFormOn){
        editListForm.style.display = "none";
        editFormOn = false;
    } else {
        editListForm.style.display = "block";
        editFormOn = true;
    }
})

