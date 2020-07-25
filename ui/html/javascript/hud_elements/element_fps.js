function init_element_fps() {

    const element = new HUD_element('fps', true, 
    {
        "fontSize": "1.5",
        "font": "roboto-bold",
        "pivot": "top-left",
        "shadow": 1,
        "color": "#ffffff"
    }, 
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_fps");

    hud_elements.push(element);
    
}
