global_onload_callbacks.push(function(){

    const element = new HUD_element('current_ammo', //Editor name
    "", //Default content
    {
        "fontSize": "5",
        "align": "center",
        "color": "white",
        "font": "furore",
        "shadow": "1",
        "weapon_fill": "0",
        "advanced": "",
    },
    [   //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "weapon_fill", "text": "Weapon Color"},
        {"inputType": "advanced", "type": "advanced"},
    ]
    , "#hud_current_ammo"); //Template name

    hud_elements.push(element);
});
