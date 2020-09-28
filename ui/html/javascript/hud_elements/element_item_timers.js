function init_element_item_timers() {

    var hud_elem = new HUD_element('item_timers', true,
    {
        "font": "roboto-bold",
        "size": "4",
        "item_direction": "vertical reverse",
        "cell_direction": "horizontal",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontFamily,
        {"inputType": "float", "type": "size", "text": "Size"},
        {"inputType": "list",  "type": "item_direction", "text": "Item Direction", "listValues":
            [
                {"name": "Horizontal", "value": "horizontal"},
                {"name": "Horizontal (Flipped)", "value": "horizontal reverse"},
                {"name": "Vertical", "value": "vertical"},
                {"name": "Vertical (Flipped)", "value": "vertical reverse"},
            ]
        },
        {"inputType": "list",  "type": "cell_direction", "text": "Cell Direction", "listValues":
            [
            
                {"name": "Horizontal", "value": "horizontal"},
                {"name": "Horizontal (Flipped)", "value": "horizontal reverse"},
                {"name": "Vertical", "value": "vertical"},
                {"name": "Vertical (Flipped)", "value": "vertical reverse"},
            ]
        },
    ]
    , "");

    hud_elements.push(hud_elem);

}