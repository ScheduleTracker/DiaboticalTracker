global_onload_callbacks.push(function(){


    const hud_elem = new HUD_element('frag_feed', //Name
    "",     //Editor Text
    {
        "height": "20",
        "width": "30",
        "fontSize": "2",
        "v_align": "flex-end",
        "bottomUp": "0",
        "direction": "bottom",
    },      //Default values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        defaultFontSize,
        defaultFontFamily,
        defaultColor,
        {"inputType": "list", "type": "v_align", "text": "Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        {"inputType": "toggle", "type": "bottomUp", "text": "Bottom Up"},
        {"inputType": "list", "type": "direction", "text": "New Line", "listValues":
            [
                {"name": "Top", "value": "top"},
                {"name": "Bottom", "value": "bottom"},
            ]
        },
    ]
    , "#hud_frag_feed");  //Template Name
    hud_elements.push(hud_elem);

    bind_event('fraglog_add', function (str) {
        str = str.slice(5, str.length-6);

        _for_each_with_class_in_parent(real_hud_element, "fraglog", el => {
            var new_line = document.createElement("div");
            new_line.innerHTML = str.trim();

            let translateY = el.parentElement.parentElement.dataset.fontSize;

            if (el.parentElement.parentElement.dataset.direction == "bottom") {
                el.appendChild(new_line);
                translateY = translateY * -1;
            } else {
                if (el.children.length) {
                    el.insertBefore(new_line, el.children[0]);
                } else {
                    el.appendChild(new_line);
                }
            }

            setTimeout(function() {
                if (new_line.classList.contains('remove_me')) {
                    return;
                }

                new_line.classList.add("remove_me");

                anim_start({
                    element: new_line,
                    duration: 250,
                    delay: 0,
                    opacity: [1, 0],
                    translateY: [0, translateY, "vh"],
                    remove: true,
                });
            },5000);

            if (el.children.length > 5) {
                //for (let child of el.children) {
                if (el.parentElement.parentElement.dataset.direction == "bottom") {
                    for (let i=0; i<el.children.length; i++) {
                        if (el.children[i].classList.contains('remove_me')) {
                            continue;
                        }
                        hideFragLogLine(el.children[i], translateY)
                        break;
                    }
                } else {
                    for (let i=el.children.length-1; i>=0; i--) {
                        if (el.children[i].classList.contains('remove_me')) {
                            continue;
                        }
                        hideFragLogLine(el.children[i], translateY)
                        break;
                    }
                }
            }
        });
    });

    function hideFragLogLine(el, translateY) {
        el.classList.add("remove_me");
        anim_start({
            element: el,
            duration: 250,
            delay: 0,
            opacity: [1, 0],
            translateY: [0, translateY, "vh"],
            remove: true,
        });
    }
});