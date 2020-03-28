function init_element_group() {
    hud_group = new HUD_element('group', "", 
    {
        "groupName": "",
        "width": "30",
        "height": "20",
        "pivot":"center",
        "advanced": "",
    },
    [
        {"inputType": "text", "type": "groupName", "text": "Group Name", "maxLength": "18"},
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "advanced", "type": "advanced"},
    ]
    , "#hud_group");
};

 