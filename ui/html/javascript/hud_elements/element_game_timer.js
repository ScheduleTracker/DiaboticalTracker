function init_element_game_timer() {


    const hud_elem = new HUD_element('game_timer', true,
    {       //Default values
        "fontSize": "6",
        "shadow": "1",
        "color": "#ffffff"
    },      
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "countdown", "text": "Countdown"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        //{"inputType": "toggle", "type": "analog", "text": "Analog"},
        //{"inputType": "toggle", "type": "hideMin", "text": "Hide Minute Hand"},

    ]
    , "#hud_game_timer");  //Template Name
    hud_elements.push(hud_elem);

    /*
    //piggybacking a system clock on game timer code
    const hud_elem2 = new HUD_element('system_clock', false,
    {       //Default values
        "fontSize": "6",
        "shadow": "1",
        "color": "#ffffff",
        "analog": "1",
    },      
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
        {"inputType": "toggle", "type": "analog", "text": "Analog"},

    ]
    , "#hud_system_clock");  //Template Name
    hud_elements.push(hud_elem2);
    */
    
}
