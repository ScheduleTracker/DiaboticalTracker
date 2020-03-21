global_onload_callbacks.push(function(){

    const element = new HUD_element('fps', '420', 
    {
        "x": "0",
        "y": "0",
        "fontSize": "1.5",
        "font": "roboto",
        "pivot": "top-left",
        "shadow": 1,
    }, 
    [
        defaultPivot,
        defaultX,
        defaultY,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "toggle", "type": "shadow", "text": "Text Shadow"},
    ]
    , "#hud_simple_text");

    hud_elements.push(element);
    // would it be beneficial to replace this with data-binding, or is it not worth the extra clutter of adding another template?
    bind_event('set_hud_fps', function (value) {
        _for_each_with_class_in_parent(real_hud_element, "elem_fps", function (element) {
            element.textContent = value;
        })
    });
    
});
