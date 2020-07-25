function init_element_time_limit() {


    const hud_elem = new HUD_element('time_limit', true,
    {       //Default values
        "fontSize": "1.5",
        "font": "roboto-bold",
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
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_time_limit");  //Template Name
    hud_elements.push(hud_elem);
    
    
}