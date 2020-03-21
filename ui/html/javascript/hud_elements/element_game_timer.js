function init_element_game_timer() {


    const hud_elem = new HUD_element('game_timer', //Name
    "",     //Editor Text
    {       //Default values
        "fontSize": "6",
        "shadow": "1",
        "color": "rgba(255,255,255,0.99)",
    },      
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float",  "type": "fontSize", "text": "Size"},
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "countdown", "text": "Countdown"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "analog", "text": "Analog"},
        {"inputType": "toggle", "type": "hideMin", "text": "Hide Minute Hand"},
        {"inputType": "advanced", "type": "advanced"},

    ]
    , "#hud_game_timer");  //Template Name
    hud_elements.push(hud_elem);

    //piggybacking a system clock on game timer code
    const hud_elem2 = new HUD_element('system_clock', //Name
    "",     //Editor Text
    {       //Default values
        "fontSize": "6",
        "shadow": "1",
        "color": "rgba(255,255,255,0.99)",
        "analog": "1",
    },      
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float",  "type": "fontSize", "text": "Size"},
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "analog", "text": "Analog"},
        {"inputType": "advanced", "type": "advanced"},

    ]
    , "#hud_system_clock");  //Template Name
    hud_elements.push(hud_elem2);
    
}
