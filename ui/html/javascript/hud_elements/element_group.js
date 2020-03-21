function init_element_group() {
    hud_group = new HUD_element('group', "", 
    {
        "width": "30",
        "height": "20",
        "pivot":"center",
        "advanced": "",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "advanced", "type": "advanced"},
    ]
    , "#hud_group");
};

 