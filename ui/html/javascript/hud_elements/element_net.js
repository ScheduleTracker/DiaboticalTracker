function init_element_net() {

    const element = new HUD_element('net', true,
    {
        "pivot": "center",
        "iS": "4",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float", "type": "iS", "text": "Icon Size"},
    ]
    , "");

    hud_elements.push(element);

}