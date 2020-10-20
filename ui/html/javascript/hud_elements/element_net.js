function init_element_net() {

    const element = new HUD_element('net', false,
    {
        "pivot": "center",
        "iS": "8",
        "ol": 0,
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "iS", "text": "Icon Size"},
        {"inputType": "toggle", "type": "ol", "text": "Only show when lagging"},
    ]
    , "#hud_placeholder");

    hud_elements.push(element);

}