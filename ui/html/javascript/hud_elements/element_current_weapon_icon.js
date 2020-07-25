function init_element_current_weapon_icon() {

    const hud_elem = new HUD_element('current_weapon_icon', true,
    {
        "size": "10",
        "weapon_fill": "1",
        "fill": "#ffffff",
        "shadow": "1",
    },      //Dfault values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "size", "text": "Size"},
        {"inputType": "color", "type": "fill", "text": "Default Color"},
        {"inputType": "toggle", "type": "weapon_fill", "text": "Weapon Color"},
        {"inputType": "toggle", "type": "iconShadow", "text": "Shadow"},
    ]
    , "#hud_current_weapon_icon");  //Template Name

    hud_elements.push(hud_elem);

}
