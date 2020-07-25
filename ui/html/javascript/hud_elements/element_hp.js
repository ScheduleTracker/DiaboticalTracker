function init_element_hp() {

    const hud_elem = new HUD_element('hp', true,
    {
        "fontSize": "5",
        "color": "#2CD86B",
        "align": "center",
        "threshold": "30",
        "thresholdColor": "#ff0000",
        "scaleOnPickup": "1",
        "font": "roboto-bold",
        "shadow": "1",
    },      //Dfault values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "float", "type": "threshold", "text": "Low HP Threshold"},
        {"inputType": "color", "type": "thresholdColor", "text": "Low HP Color"},        
        {"inputType": "toggle", "type": "scaleOnPickup", "text": "Scale on Pickup"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_hp");  //Template Name
    hud_elements.push(hud_elem);
    
}


bind_event('flash_hp', function (value) {
    
    _for_each_with_class_in_parent(real_hud_container, "elem_hp", el => {

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

