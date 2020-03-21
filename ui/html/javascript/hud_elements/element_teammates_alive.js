global_onload_callbacks.push(function(){


    const hud_elem = new HUD_element('teammates_alive', //Name
    "", //Edior Text
    {
        "fontSize": "3",
        "color": "rgb(44, 216, 107)",
        "align": "center",
        "shadow": "1",
        "aliveText": "1",
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
        {"inputType": "toggle", "type": "teamColor", "text": "Use Team Color"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_teammates_alive");  //Template Name
    hud_elements.push(hud_elem);

    const hud_elem2 = new HUD_element('enemies_alive', //Name
    "", //Edior Text
    {
        "fontSize": "3",
        "color": "rgb(200, 15, 15)",
        "align": "center",
        "shadow": "1",
        "aliveText": "1",
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
        {"inputType": "toggle", "type": "teamColor", "text": "Use Team Color"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_enemies_alive");  //Template Name
    hud_elements.push(hud_elem2);
});