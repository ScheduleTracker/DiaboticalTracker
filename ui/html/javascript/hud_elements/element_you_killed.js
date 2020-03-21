function init_element_you_fragged() {

    const hud_elem = new HUD_element('you_fragged', 
     "", 
    {
        "fontSize": "3",
        "font": "veneer-italic",
        "color": "white",
        "pivot": "bottom-edge",
    },      
    [       
        defaultPivot,
        defaultX,
        defaultY,
        defaultAlign,
        defaultFontFamily,
        defaultFontSize,
        defaultColor,
    ]
    ,"#hud_you_fragged");  
    hud_elements.push(hud_elem);
    
    bind_event('you_fragged', function (username, color) {

        _for_each_with_class_in_parent(real_hud_element, "elem_you_fragged", function(el) {
            let line = document.createElement("div");
            line.innerHTML = '<span data-i18n="ingame_you_fragged">Fragged</span><span style="color:'+color+'"> ' + username + '</span>';
            
            if (el.children[0].children.length) {
                el.children[0].insertBefore(line, el.children[0].children[0]);
            } else {
                el.children[0].appendChild(line);
            }
            
            anim_start({
                element: line,
                duration: 0,
                delay: 3000,
                completion: function() {
                    if (line.classList.contains('remove_me')) {
                        return;
                    }

                    line.classList.add("remove_me");

                    anim_start({
                        element: line,
                        duration: 300,
                        delay: 0,
                        opacity: [1, 0],
                        remove: true,
                    });
                }
            });

            if (el.children[0].children.length > 3) {
                for (var i=el.children[0].children.length - 1; i >= 0; i--) {
                    let child = el.children[0].children[i];
                
                    if (el.children[0].children[i].classList.contains('remove_me')) {
                        continue;
                    }

                    el.children[0].children[i].classList.add("remove_me");

                    anim_start({
                        element: el.children[0].children[i],
                        duration: 300,
                        delay: 0,
                        opacity: [1, 0],
                        remove: true,
                    });
                    break;
                }
            }

/*
            setTimeout(function() {
                if (line.classList.contains('fade_out')) {
                    return;
                }
                line.classList.add("fade_out");
                line.addEventListener("animationend", function() {
                    if (line.parentNode == el.children[0]) {
                        el.children[0].removeChild(line);
                    }
                });
            },3000);
            
            if (el.children[0].children.length > 3) {
                for (var i=el.children[0].children.length - 1; i >= 0; i--) {
                    let child = el.children[0].children[i];
                
                    if (child.classList.contains('fade_out')) {
                        continue;
                    }
                    child.classList.add("fade_out");
                    child.addEventListener("animationend", function() {
                        if (child.parentNode == el.children[0]) {
                            el.children[0].removeChild(child);
                        }
                    });
                    break;
                }
            }
            */
        });

    });
}