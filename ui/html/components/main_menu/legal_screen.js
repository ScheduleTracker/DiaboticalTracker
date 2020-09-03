function init_legal(){

    let eula = _id("eula_content");
    let eulaButton = _id("eula_button");

    //default to eula
    eula.style.display = "flex";
    eulaButton.classList.add("active");
}

function change_legal_tab(button, contentId){
    _for_each_with_class_in_parent(_id("legal_information_container"), "legal_information_content_container", function(el){
        el.style.display = "none";
    })
    _for_each_with_class_in_parent(_id("legal_information_tab_row"), "legal_tab", function(el){
        el.classList.remove("active");
    })
    
    _id(contentId).style.display = "flex";
    button.classList.add("active");

    refreshScrollbar(_id("legal_information_scroll"));
}