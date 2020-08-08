function init_element_editing_info() {

    var hud_elem = new HUD_element('editing_info', false,
    {//Default values
        "fontSize": "1.5",
    },      
        
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontFamily,
        defaultFontSize,
    ]
    , "#hud_editing_info");  //Template Name

    hud_elements.push(hud_elem);

    bind_event('set_editing_info', function(string) {
        for (let el of global_hud_references.editing_info) {
            _empty(el);
            
            if (string.trim().length == 0) return;

            let lines = string.split("\n");
            for (let line of lines) {
                el.appendChild(_createElement("div", "line", line));
            }
        }
    });
}