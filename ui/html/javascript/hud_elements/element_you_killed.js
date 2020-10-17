function init_element_you_fragged() {

    const hud_elem = new HUD_element('you_fragged', true,
    {
        "fontSize": "3",
        "font": "veneer-italic",
        "color": "#ffffff",
        "pivot": "top-edge",
        "align": "center",
        "ha": "0",
    },      
    [       
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "list", "type": "align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "left-edge"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "right-edge"},
            ]
        },
        defaultFontFamily,
        defaultFontSize,
        defaultColor,
        {"inputType": "toggle", "type": "ha", "text": "Hide Assists"},
    ]
    ,"");  
    hud_elements.push(hud_elem);
}