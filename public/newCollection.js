var collection = document.querySelector(".collection");
var sections = document.querySelectorAll(".section");
var photosList = document.querySelector(".photos-list");
var photosListBox = document.querySelector("#photos-list-box");

var displayPhotos = false;
var sectionIndex = 0;

sections[0].querySelector(".add-photos-btn").addEventListener("click", function(){
    showUserPhotos(0);
});
sections[0].querySelector(".done-photos-btn").addEventListener("click", function(){
    hideUserPhotos(0);
});
sections[0].querySelector(".add-section-btn").addEventListener("click", function(){
    createNewSection(0);
});

function showUserPhotos(section){
    if(!displayPhotos) {
        photosListBox.classList.add("col-md-6");
        photosListBox.style.display = "inline";
        photosList.style.position = "fixed";
        collection.classList.remove("col-md-12");
        collection.classList.add("col-md-6");
        displayPhotos = true;
    }
    sectionIndex = section;
    for(let i = 0; i < sections.length; i++){
        sections[i].querySelector(".add-photos-btn").style.display = 'inline';
        sections[i].querySelector(".done-photos-btn").style.display = 'none';
    }
    sections[section].querySelector(".add-photos-btn").style.display = 'none';
    sections[section].querySelector(".done-photos-btn").style.display = 'inline';
}

function hideUserPhotos(section){
    if(displayPhotos) {
        photosListBox.classList.remove("col-md-6");
        photosListBox.style.display = "none";
        photosList.style.position = "static";
        collection.classList.add("col-md-12");
        collection.classList.remove("col-md-6");
        displayPhotos = false;
    }
    if(section != undefined){
        sections[section].querySelector(".add-photos-btn").style.display = 'inline';
        sections[section].querySelector(".done-photos-btn").style.display = 'none';
    }
}

function createNewSection(section){
    for(let i = 0; i < sections.length; i++){
        sections[i].querySelector(".add-section-btn").style.display = "none";
        sections[i].querySelector(".remove-section-btn").style.display = "none";
    }
    sections[section].querySelector(".remove-section-btn").style.display = "inline";

    html = '';
    html += '<div class="section">\n' +
        '            <input type="text" class="title no-box-input form-control" placeholder="Title">\n' +
        '            <input type="text" class="heading no-box-input form-control" placeholder="Heading (Optional)">\n' +
        '            <input type="text" class="description no-box-input form-control" placeholder="Description (Optional)">\n' +
        '\n' +
        '            <button type="button" class="add-photos-btn btn btn-xs btn-primary">Add Photos</button>\n' +
        '            <button type="button" class="done-photos-btn btn btn-xs" style="display: none">Finished</button>\n' +
        '            <div class="photos-area">\n' +
        '                <div class="section-grid grid">\n' +
        '\n' +
        '                </div>\n' +
        '            </div>\n' +
        '            <button type="button" class="add-section-btn btn btn-xs btn-success">Add Section</button>\n' +
        '            <button type="button" class="remove-section-btn btn btn-xs btn-danger" style="display: none">Remove Section</button>\n' +
        '        </div>     ';
    collection.innerHTML += html;

    sections = document.querySelectorAll(".section");
    addPhotoBtnEvents();

    for(var s = 0; s < sections.length; s++){
        setupSections(s);
    }
}

function setupSections(s){
    sections[s].querySelector(".add-photos-btn").addEventListener("click", function(){
        showUserPhotos(s);
    });
    sections[s].querySelector(".done-photos-btn").addEventListener("click", function(){
        hideUserPhotos(s);
    });
    sections[s].querySelector(".add-section-btn").addEventListener("click", function(){
        createNewSection(s);
    });
    sections[s].querySelector(".remove-section-btn").addEventListener("click", function(){
        removeNewSection(s);
    });
}

function removeNewSection(section){
    sections[section + 1].querySelector(".section-grid").querySelectorAll("figure").forEach(function(fig){
        var img = fig.querySelector("a").querySelector("img");
        var src = img.getAttribute("src");
        fig.outerHTML = '';
        photosList.querySelectorAll("figure").forEach(function(photo){
            if(photo.querySelector("a").querySelector("img").getAttribute("src") == src){
                photo.style.display = 'block';
            }
        })
    })

    if(sectionIndex == (sections.length - 1)){
        hideUserPhotos();
    }
    sections[sections.length - 1].outerHTML = '';
    sections = document.querySelectorAll(".section");
    sections[section].querySelector(".remove-section-btn").style.display = "none";
    sections[section].querySelector(".add-section-btn").style.display = "inline";
    if(section - 1 >= 0){
        sections[section - 1].querySelector(".remove-section-btn").style.display = "inline";
        sections[section - 1].querySelector(".add-section-btn").style.display = "none";
    }
}

addPhotoBtnEvents();

function addPhotoBtnEvents(){
    sections.forEach(function(section){
        section.querySelector(".add-photos-btn").addEventListener("click", addImageEvents);
    })
}

function addImageEvents(){
    var listImages = photosList.querySelectorAll("figure");

    for(let i = 0; i < listImages.length; i++){
        listImages[i].addEventListener("click", function(f){
            var grid = sections[sectionIndex].querySelector(".section-grid");
            grid.innerHTML += this.outerHTML;
            this.style.display = "none";
            for(let x = 0; x < grid.querySelectorAll("figure").length; x++){
                grid.querySelectorAll("figure")[x].addEventListener("click", function(){
                    this.outerHTML = '';
                    f.target.parentElement.parentElement.style.display = 'block';
                })
            }
        })
    }
}
