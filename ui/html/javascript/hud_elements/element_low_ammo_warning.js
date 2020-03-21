global_onload_callbacks.push(function(){


    const hud_hp = new HUD_element('low_ammo_warning', "Low Ammo Warning", 
    {
        "width": "30",
        "height": "5",
        "fontSize": "3",
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultFontSize,
        defaultFontFamily,
        defaultAlign,
        defaultColor
    ]
    , "#hud_simple_text");
    hud_elements.push(hud_hp);    

    
});

 