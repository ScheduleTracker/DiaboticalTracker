function init_element_voicechat() {

    const hud_elem = new HUD_element('voicechat', true,
    {
        "fontSize": "1.5",
        "font": "montserrat-bold",
        "color": "#ffffff",
        "pivot": "top-left",
        "iC": "#00ff00",
    },      
    [       
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontFamily,
        defaultFontSize,
        defaultColor,
        {"inputType": "color", "type": "iC", "text": "Icon Color"}
    ]
    ,"#hud_voicechat");  

    hud_elements.push(hud_elem);

}