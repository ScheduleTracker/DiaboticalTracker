function init_element_frag_feed() {


    const hud_elem = new HUD_element('frag_feed', true,
    {
        "height": "20",
        "width": "30",
        "fontSize": "1.6",
        "font": "montserrat-bold",
        "v_align": "right-edge",
        "direction": "bottom",
    },      //Default values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        {"inputType": "list", "type": "v_align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "left-edge"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "right-edge"},
            ]
        },
        {"inputType": "list", "type": "direction", "text": "New Line", "listValues":
            [
                {"name": "Top", "value": "vertical reverse"},
                {"name": "Bottom", "value": "vertical"},
            ]
        },
    ]
    , "");
    hud_elements.push(hud_elem);
}