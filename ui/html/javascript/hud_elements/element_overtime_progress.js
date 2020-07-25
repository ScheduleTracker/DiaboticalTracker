function init_element_overtime_progress() {

    var hud_elem = new HUD_element('overtime_progress', true,
    {//Default values
        "height": "2.4",
        "width": "30",
        "txt": "1",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        {"inputType": "toggle", "type": "txt", "text": "Show Overtime Text"},
    ]
    , "#hud_overtime_progress");  //Template Name

    hud_elements.push(hud_elem);

}