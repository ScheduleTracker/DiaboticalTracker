function init_element_voicechat() {

    const hud_elem = new HUD_element('voicechat', false,
    {
        "fontSize": "1.5",
        "font": "montserrat",
        "color": "#ffffff",
        "pivot": "top-left",
        "v_align": "flex-start",
        "iC": "#00ff00",
    },      
    [       
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "list", "type": "v_align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        defaultFontFamily,
        defaultFontSize,
        defaultColor,
        {"inputType": "color", "type": "iC", "text": "Icon Color"}
    ]
    ,"#hud_voicechat");  

    hud_elements.push(hud_elem);

}