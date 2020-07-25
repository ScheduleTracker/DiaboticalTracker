function init_element_hint() {

    var hud_elem = new HUD_element('hint', true,
    {//Default values
        "pivot": "center",
        "fontSize": 2,
        "font": "montserrat-bold",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
    ]
    , "#hud_hint");  //Template Name

    hud_elements.push(hud_elem);

}