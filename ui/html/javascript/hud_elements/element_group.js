function init_element_group() {
    hud_group = new HUD_element('group', false, 
    {
        "groupName": "",
        "width": "30",
        "height": "20",
        "pivot":"center",
    },
    [
        {"inputType": "text", "type": "groupName", "text": "Group Name", "maxLength": "18"},
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
    ]
    , "#hud_group");
};

 