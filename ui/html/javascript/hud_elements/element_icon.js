function init_element_icon() {

    const hud_elem = new HUD_element('icon', true,
    {
        "width": "10",
        "height": "10",
        "stroke": "#ffffff",
        "stroke_width": "6",
        "fill": "#ffffff",
        "icon": "hp",
        "shadow": "1",
        "hide_dead": "1",
    },      //Dfault values
    [       //Editor settings
    	defaultPivot,
        {"inputType": "list", "type": "icon", "text": "Icon", "listValues":
            [
                {"name": "Health", "value": "hp"},
                {"name": "Armor", "value": "armor"},
                {"name": "Sword", "value": "sword"},
                {"name": "Speed", "value": "speed"},
                {"name": "Wrench", "value": "wrench"},
            ]
        },    
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "float", "type": "stroke_width", "text": "Stroke Width"},
        {"inputType": "color", "type": "stroke", "text": "Stroke"},
        {"inputType": "color", "type": "fill", "text": "Fill"},
        {"inputType": "toggle", "type": "iconShadow", "text": "Shadow"},
        {"inputType": "toggle", "type": "hide_dead", "text": "Hide on death"},
    ]
    , "#hud_icon");  //Template Name

    hud_elements.push(hud_elem);
}
