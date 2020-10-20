function init_element_minimap() {

    const element = new HUD_element('minimap', false,
    {
        "pivot": "center",
        "size": 30,
        "lc": "#32323c",
        "mc": "#4b4b4b",
        "hc": "#645a5a",
        "oc": "#00000040",
        "ot": 1,
        "tlo": 1,
        "ci": 1,
        "ico": "#FFFFFF80",
        "io": 1,
        "stll": 0.333,
        "opo": 0.5,
        "mo": 1,
        "spo": 1,
        "ao": 1,
        "is": 1,
        "sps": 1,
        "as": 1
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "float",  "type": "size", "text": "Size"},
        {"inputType": "color",  "type": "lc", "text": "Low Color"},
        {"inputType": "color",  "type": "mc", "text": "Mid Color"},
        {"inputType": "color",  "type": "hc", "text": "High Color"},
        {"inputType": "color",  "type": "oc", "text": "Outline Color"},
        {"inputType": "float",  "type": "ot", "text": "Outline Thickness"},
        {"inputType": "float",  "type": "tlo", "text": "Topology Lines Opacity"},
        {"inputType": "toggle", "type": "ci", "text": "Use item class colors"},
        {"inputType": "color",  "type": "ico", "text": "Item color override"},
        {"inputType": "float",  "type": "io", "text": "Item Opacity"},
        {"inputType": "float",  "type": "stll", "text": "Sub-level topology opacity"},
        {"inputType": "float",  "type": "opo", "text": "Sub-level icon opacity"},
        {"inputType": "float",  "type": "mo", "text": "Minimap opacity"},
        {"inputType": "float",  "type": "spo", "text": "Self-player opacity"},
        {"inputType": "float",  "type": "ao", "text": "Allies opacity"},
        {"inputType": "float",  "type": "is", "text": "Item scale"},
        {"inputType": "float",  "type": "sps", "text": "Self player scale"},
        {"inputType": "float",  "type": "as", "text": "Allies scale"},
    ]
    , "#hud_placeholder");

    hud_elements.push(element);

}