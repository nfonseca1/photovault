var collection = document.querySelector(".new-collection-container");
var title = document.querySelector(".new-collection-title");
var publicInput = document.querySelector("#collection-public");
var uploadBtn = document.querySelector("#collection-upload");
var form = document.querySelector("#collection-form");
var formInfo = document.querySelector("#collection-form-info");
var photosList = document.querySelector(".photos-list");

var sections = document.querySelectorAll(".new-collection-section");
var removeSectionBtns = document.querySelectorAll(".remove-section-btn");
var headings = document.querySelectorAll(".new-collection-heading");
var descriptions = document.querySelectorAll(".new-collection-description");
var addPhotosBtns = document.querySelectorAll(".add-photos-btn");
var sectionGrids = document.querySelectorAll(".section-grid");
var addSectionBtns = document.querySelectorAll(".add-section-btn");

var currentGrid;
var photosOn = false;

uploadBtn.addEventListener("click", uploadCollection);

updateSections(true);

function updateSections(updateButtons){
    sections = document.querySelectorAll(".new-collection-section");
    removeSectionBtns = document.querySelectorAll(".remove-section-btn");
    headings = document.querySelectorAll(".new-collection-heading");
    descriptions = document.querySelectorAll(".new-collection-description");
    addPhotosBtns = document.querySelectorAll(".add-photos-btn");
    sectionGrids = document.querySelectorAll(".section-grid");
    addSectionBtns = document.querySelectorAll(".add-section-btn");
    for(let i = 0; i < sections.length; i++){
        if(i == (sections.length - 1) && i != 0){
            removeSectionBtns[i].style.display = "inline-block";
        } else {
            removeSectionBtns[i].style.display = "none";
        }
        if(i == (sections.length - 1)){
            addSectionBtns[i].style.display = "inline-block";
        } else {
            addSectionBtns[i].style.display = "none";
        }

        getSectionImages(i);

        if(updateButtons){
            addPhotosBtns[i].addEventListener("click", function(){
                addPhotosManage(i);
            });
            removeSectionBtns[i].addEventListener("click", removeSection);
            addSectionBtns[i].addEventListener("click", addSection);
        }
    }
}

function addPhotosManage(i){
    if(photosOn){
        photosList.style.display = "none";
        collection.style.width = "100%";
        photosOn = false;
    } else {
        currentGrid = i;
        photosList.style.display = "inline-block";
        collection.style.width = "48%";
        photosOn = true;

        var figures = photosList.querySelectorAll("figure");
        figures.forEach(function(figure){
            figure.addEventListener("click", function(){
                sectionGrids[currentGrid].innerHTML += this.outerHTML;
                this.style.display = "none";
                getSectionImages(currentGrid);
            })
        })
    }
}

function getSectionImages(i){
    sectionGrids[i].querySelectorAll("figure").forEach(function(figure){
        figure.addEventListener("click", function(){
            var src = this.querySelector("a").querySelector("img").getAttribute("src");
            var figures = photosList.querySelectorAll("figure");
            for(let i = 0; i < figures.length; i++){
                if(figures[i].querySelector("a").querySelector("img").getAttribute("src") == src){
                    figures[i].style.display = "inline-block";
                    this.outerHTML = "";
                    break;
                }
            }
        })
    })
}

function removeSection(){
    sections[sections.length - 1].outerHTML = '';
    sectionGrids[sections.length - 1].querySelectorAll("figure").forEach(function(figure){
        var src = figure.querySelector("a").querySelector("img").getAttribute("src");
        var figures = photosList.querySelectorAll("figure");
        for(let i = 0; i < figures.length; i++){
            if(figures[i].querySelector("a").querySelector("img").getAttribute("src") == src){
                figures[i].style.display = "inline-block";
                this.outerHTML = "";
                break;
            }
        }
    })
    updateSections(false);
}

function addSection(){
    var html = '<div class="new-collection-section">\n' +
        '            <button type="button" class="remove-section-btn snappir-btn snappir-btn-red" style="display: none">Remove Section</button>\n' +
        '            <input type="text" class="new-collection-heading new-collection-input" placeholder="Heading (Optional)">\n' +
        '            <textarea class="new-collection-description new-collection-textarea" placeholder="Description (Optional)"></textarea>\n' +
        '\n' +
        '            <button type="button" class="add-photos-btn snappir-btn">Add Photos</button>\n' +
        '            <div class="section-grid grid">\n' +
        '\n' +
        '            </div>\n' +
        '            <button type="button" class="add-section-btn snappir-btn">Add Section</button>\n' +
        '        </div>';
    collection.innerHTML += html;
    updateSections(true);
}

function uploadCollection(){
    var titleVal = title.value;
    var privacy = publicInput.value;
    var headingsVal = [];
    var descriptionsVal = [];
    var photosVal = [];
    var secs = sections.length;

    for(let i = 0; i < secs; i++){
        headingsVal.push(headings[i].value);
        descriptionsVal.push(descriptions[i].value);

        var secPhotos = [];
        sectionGrids[i].querySelectorAll("figure").forEach(function(figure){
            secPhotos.push(figure.querySelector("a").getAttribute("data-id"));
        })
        photosVal.push(secPhotos)
    }

    var newCol = {
        sections: secs,
        title: titleVal,
        headings: headingsVal,
        descriptions: descriptionsVal,
        photos: photosVal,
        isPublic: privacy
    }
    formInfo.value = newCol;
    form.submit();

}
