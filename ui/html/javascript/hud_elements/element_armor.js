function init_element_armor() {
    const hud_armor = new HUD_element('armor', true, 
    {     
        "fontSize": "5",
        "font": "roboto-bold",
        "align": "center",
        "scaleOnPickup": "1",
        "color": "#ffffff",
        "threshold": "100",
        "thresholdColor": "#ffffff",
        "hideIf0": "1",
        "shadow": "1",
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
    ]
    , "#hud_armor");

    hud_elements.push(hud_armor);
}



bind_event('flash_armor', function (value) {
    _for_each_with_class_in_parent(real_hud_container, "elem_armor", el => {
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
