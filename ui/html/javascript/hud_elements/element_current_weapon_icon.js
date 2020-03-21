global_onload_callbacks.push(function(){

    const hud_elem = new HUD_element('current_weapon_icon', //Name
    "", //Edior Text
    {
        "width": "10",
        "height": "10",
        "weapon_fill": "1",
        "fill": "white",
        "shadow": "1",
    },      //Dfault values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "color", "type": "fill", "text": "Default Color"},
        {"inputType": "toggle", "type": "weapon_fill", "text": "Weapon Color"},
        {"inputType": "toggle", "type": "iconShadow", "text": "Shadow"},
    ]
    , "#hud_current_weapon_icon");  //Template Name

    hud_elements.push(hud_elem);

});
