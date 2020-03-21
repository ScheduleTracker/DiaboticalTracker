global_onload_callbacks.push(function(){
    const hud_armor = new HUD_element('armor', 
    "", 
    {     
        "fontSize": "5",
        "align": "center",
        "scaleOnPickup": "1",
        "color": "white",
        "threshold": "100",
        "thresholdColor": "white",
        "hideIf0": "1",
        "shadow": "1",
        "advanced": "",
    }, 
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "float", "type": "threshold", "text": "Low Armor Threshold"},
        {"inputType": "color", "type": "thresholdColor", "text": "Low Armor Color"},     
        {"inputType": "toggle", "type": "scaleOnPickup", "text": "Scale on Pickup"},
        {"inputType": "toggle", "type": "hideIf0", "text": "Hide if zero"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "advanced", "type": "advanced"},
    ]
    , "#hud_armor");

    hud_elements.push(hud_armor);
});



bind_event('flash_armor', function (value) {
    _for_each_with_class_in_parent(real_hud_element, "elem_armor", el => {
        if(el.dataset.scaleOnPickup == 1){
            anim_start({
                element: el.children[0],
                scale: [1.3, 1],
                duration: 200,
                easing: easing_functions.easeOutQuad
            });
        }
   });
});
