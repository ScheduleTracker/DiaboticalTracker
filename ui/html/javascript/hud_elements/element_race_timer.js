function init_element_race_timer() {

    const element = new HUD_element('race_timer', true,
    {
        "font": "notosans",
        "fontSize": "4",
        "pivot": "right-edge",
        "color": "#ffffff",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
    ]
    , "");

    hud_elements.push(element);

}
