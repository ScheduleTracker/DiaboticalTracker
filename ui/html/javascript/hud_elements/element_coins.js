function init_element_coins() {

    const hud_elem = new HUD_element('coins', true, 
    {
        "font": "montserrat-bold",
        "fontSize": "4",
        "color": "#ffffff",
    },      //Dfault values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
    ]
    , "#hud_coins");  //Template Name
    hud_elements.push(hud_elem);

}
