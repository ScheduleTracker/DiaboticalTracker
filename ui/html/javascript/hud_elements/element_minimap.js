function init_element_minimap() {

    const element = new HUD_element('minimap', false,
    {
        "pivot": "center",
        "size": 30,
        "lc": "#32323c",
        "mc": "#4b4b4b",
        "hc": "#645a5a",
        "oc": "#FFFFFF",
        "ot": 0.1,
        "tlo": 1,
        "ci": 1,
        "stll": 1,
        "opo": 0.5,
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float",  "type": "size", "text": "Size"},
        /*
        {"inputType": "color",  "type": "lc", "text": "Low Color"},
        {"inputType": "color",  "type": "mc", "text": "Mid Color"},
        {"inputType": "color",  "type": "hc", "text": "High Color"},
        {"inputType": "color",  "type": "oc", "text": "Outline Color"},
        {"inputType": "float",  "type": "ot", "text": "Outline Thickness"},
        {"inputType": "float",  "type": "tlo", "text": "Topology Lines Opacity"},
        {"inputType": "toggle", "type": "ci", "text": "Colored Items"},
        {"inputType": "toggle", "type": "stll", "text": "See-through Lower Levels"},
        {"inputType": "float",  "type": "opo", "text": "Occluded Player Opacity"},
        */
    ]
    , "#hud_minimap");

    hud_elements.push(element);

}
