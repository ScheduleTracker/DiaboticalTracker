function init_element_teammates_alive() {


    const hud_elem = new HUD_element('teammates_alive', true,
    {
        "fontSize": "3",
        "color": "#2cd86b",
        "align": "center",
        "shadow": "1",
        "aliveText": "1",
//        "nextUp": "1",
    },      //Dfault values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultAlign,
        defaultColor,
        {"inputType": "toggle", "type": "aliveText", "text": "Show Alive Text"},
//        {"inputType": "toggle", "type": "nextUp", "text": "Show Next Respawn"},
        {"inputType": "toggle", "type": "teamColor", "text": "Use Team Color"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_teammates_alive");  //Template Name
    hud_elements.push(hud_elem);

    const hud_elem2 = new HUD_element('enemies_alive', true,
    {
        "fontSize": "3",
        "color": "#c80f0f",
        "align": "center",
        "shadow": "1",
        "aliveText": "1",
//        "nextUp": "1",
    },      //Dfault values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultAlign,
        defaultColor,
        {"inputType": "toggle", "type": "aliveText", "text": "Show Alive Text"},
//        {"inputType": "toggle", "type": "nextUp", "text": "Show Next Respawn"},
        {"inputType": "toggle", "type": "teamColor", "text": "Use Team Color"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_enemies_alive");  //Template Name
    hud_elements.push(hud_elem2);
}