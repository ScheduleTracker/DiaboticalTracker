global_onload_callbacks.push(function(){
    const elment = new HUD_element('armor_bar', "",
    {
        "width": "25",
        "height": "2",
        "color": "white",
        "threshold": "100",
        "thresholdColor": "white",
        "segments": "8",
        "boxShadow": "1",
        "bRadius": "0.2",
        "cCode": "15",
        "skewX": "0",
        "skewY": "0",
        "advanced": "",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "float", "type": "segments", "text": "Num of Segments"},
        {"inputType": "float", "type": "threshold", "text": "Low Armor Threshold"},
        {"inputType": "color", "type": "thresholdColor", "text": "Low Armor Color"},
        defaultColor,
        {"inputType": "toggle", "type": "rightToLeft", "text": "Fill Leftwards"},
        {"inputType": "toggle", "type": "boxShadow", "text": "Segment Shadow"},
        {"inputType": "float", "type": "bRadius", "text": "Segment Corner Radius"},
        {"inputType": "float", "type": "cCode", "text": "Segment Corner Bitmask"},
        {"inputType": "float", "type": "skewX", "text": "SkewX"},
        {"inputType": "float", "type": "skewY", "text": "SkewY"},
        {"inputType": "advanced", "type": "advanced"},
    ]
    , "#hud_armor_bar");

    hud_elements.push(elment);
});
