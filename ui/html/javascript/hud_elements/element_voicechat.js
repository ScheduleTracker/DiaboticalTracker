global_onload_callbacks.push(function(){

    const hud_elem = new HUD_element('voicechat', 
     "", 
    {
        "fontSize": "1.5",
        "font": "montserrat",
        "color": "white",
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

});