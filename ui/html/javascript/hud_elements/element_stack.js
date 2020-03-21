global_onload_callbacks.push(function(){

    const hud_stack = new HUD_element('stack',
    "",
    {
        "fontSize": 3,
        "color": "white",
        "font": "furore",
        "shadow": 1,
        "showDormant": 1,
        "gradientColor": 1,
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultAlign,
        defaultColor,
        {"inputType": "toggle", "type": "gradientColor", "text": "Color by value"},
        {"inputType": "toggle", "type": "showDormant", "text": "Show dormant stack"},
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_stack");

    hud_elements.push(hud_stack);

    const hud_stack_bar = new HUD_element('stack_bra',
    "",
    {
        "width": 18.52,
        "height": 4.63,
        "hpColour": "rgb(44, 216, 107)",
        "armorColour": "teal",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "color", "type": "hpColour", "text": "HP Color"},
        {"inputType": "color", "type": "armorColour", "text": "Armor Color"},
        {"inputType": "toggle", "type": "armorOnTop", "text": "Armor on top"},
        {"inputType": "toggle", "type": "rightToLeft", "text": "Fill Leftwards"},
    ]
    , "#hud_stack_bar");

    hud_elements.push(hud_stack_bar);

});
