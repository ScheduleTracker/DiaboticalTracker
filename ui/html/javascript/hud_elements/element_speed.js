function init_element_speed() {

    const element = new HUD_element('speed', true,
    {
        "font": "roboto-bold",
        "fontSize": "2",
        "pivot": "right-edge",
        "color": "#ffffff",
        "hideUnit": "0",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "hideUnit", "text": "Hide unit"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_speed");

    hud_elements.push(element);

}
