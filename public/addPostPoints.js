function addUserPostPoints(feedback, button){
    var addPoints = 0;
    var like = false;
    var hate = false;
    if(button == "like"){
        if(feedback.like){
            feedback.like = false;
            like = false;
            addPoints = -1;
        } else {
            feedback.like = true;
            like = true;
            if(feedback.hate == true){
                addPoints = 2;
            } else {
                addPoints = 1;
            }
            feedback.hate = false;
            hate = false;
        }
    } else {
        if(feedback.hate){
            feedback.hate = false;
            hate = false;
            addPoints = 1;
        } else {
            feedback.hate = true;
            hate = true;
            if(feedback.like == true){
                addPoints = -2;
            } else {
                addPoints = -1;
            }
            feedback.like = false;
            like = false;
        }
    }
    return {
        addPoints: addPoints,
        like: like,
        hate: hate
    };
}

module.exports = addUserPostPoints;