function init_element_low_ammo_warning() {


    const hud_hp = new HUD_element('low_ammo_warning', true,
    {
        "fontSize": "3",
        "color": "#ff0000",
        "font": "montserrat-bold",
        "threshold": 0.16,
        "shadow": 1,
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "float", "type": "threshold", "text": "Low Ammo Multiplier"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "uc", "text": "Uppercase"},
    ]
    , "#hud_low_ammo_warning");
    hud_elements.push(hud_hp);    

    
}

 