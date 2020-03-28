function init_element_weapon_list() {

    class newArray extends HUD_element{

        getRenderCode(element, isPreview, isSpectating){
        
            var mode =  element.dataset.mode;
//            var reverse = element.dataset.reverse;
//            var flip = element.dataset.flip;
            var direction = element.dataset.direction;
            var wDirection = element.dataset.wDirection;
            var color = element.dataset.color;

            var do_normal_weapons = !mode || mode == "all" || mode == "only_normal";
            var do_super_weapons = !mode || mode == "all_special" || mode == "all" || mode == "only_super";

//            if (reverse == 1) {
//                direction += " reverse";
//            }
//            if (flip == 1) {
//                wDirection += " reverse";
//            }

            var data = {
                "direction": direction,
                "wDirection": wDirection,
                "keybindShow":  element.dataset.keybindShow,
                "aKeybindShow": element.dataset.aKeybindShow,
                "color": color,
                "accShow": element.dataset.accShow,
                "accFontSize": element.dataset.accFontSize,
                "cBitWidth": element.dataset.cBitWidth,
                "aBarShow": element.dataset.aBarShow,
                "aBarWC": element.dataset.aBarWC,
                "direction": direction,
                "iShadow": element.dataset.iShadow,
                "iC": element.dataset.iC,
                "iCCustom": element.dataset.iCCustom,
                "iCActive": element.dataset.iCActive,
                "iCActiveCustom": element.dataset.iCActiveCustom,
                "iBGC": element.dataset.iBGC,
                "iBGCCustom": element.dataset.iBGCCustom,
                "iBGCActive": element.dataset.iBGCActive,
                "iBGCActiveCustom": element.dataset.iBGCActiveCustom,
                "aC": element.dataset.aC,
                "aCCustom": element.dataset.aCCustom,
                "aCActive": element.dataset.aCActive,
                "aCActiveCustom": element.dataset.aCActiveCustom,
                "aBGC": element.dataset.aBGC,
                "aBGCCustom": element.dataset.aBGCCustom,
                "aBGCActive": element.dataset.aBGCActive,
                "aBGCActiveCustom": element.dataset.aBGCActiveCustom,
            }

            if (isPreview)         data['hudPreview'] = true;
            if (isSpectating)      data['hudSpectating'] = true;
            if (mode == "all")     data["render_separator"] = true;
            if (do_normal_weapons) data["render_normal"] = true;
            if (do_super_weapons)  data["render_super"] = true;

            var template = window.jsrender.templates(_id("hud_weapons_list").textContent);

            var htmlOutput = template.render(data);

           return htmlOutput;
        }
    }

    const element = new newArray('weapons_list', "",
    { // Default values
        "pivot": "bottom-right",
        "mode": "all",
        "direction": "vertical reverse",
//        "direction": "vertical",
//        "reverse": "1",
        "wDirection": "horizontal",
        "font": "furore",
        "fontSize": "1.6",
        "aWidth": "4",
        "aPadding": "1",
        "aAlign": "flex-start",
        "accShow": "0",
        "accFontSize": "1",
        "iHeight": "50",
        "iWidth": "60",
        "wSepWidth": "0.4",
        "sepWidth": "16",
        "cBitWidth": "0",
        "keybindShow": "1",
        "aKeybindShow": "0",
        "aBarShow": "0",
        "aBarWidth": "0.4",
        "aBarWC": "0",
        "iOpacityInactive": "1",
        "aOpacityInactive": "1",
        "iShadow": "0",
        "iC": "weapon",
        "iCCustom": "#ffffff",
        "iCActive": "weapon",
        "iCActiveCustom": "#ffffff",
        "iBGC": "custom",
        "iBGCCustom": "#00000073",
        "iBGCActive": "custom",
        "iBGCActiveCustom": "#000000B7",
        "aC": "custom",
        "aCCustom": "#FFFFFFB3",
        "aCActive": "custom",
        "aCActiveCustom": "#FFFFFF",
        "aBGC": "custom",
        "aBGCCustom": "#0000002C",
        "aBGCActive": "weapon",
        "aBGCActiveCustom": "#000000",
        "advanced": ""
    },
    [
        defaultPivot,
        defaultX,
        defaultY,
        {"inputType": "toggle", "type": "keybindShow", "text": "Keybind Icons"},
        {"inputType": "list",   "type": "mode", "text": "Show Subset", "listValues":
            [
                {"name": "All weapons", "value": "all"},
                {"name": "Standard weapons", "value": "only_normal"},
                {"name": "Super weapons", "value": "only_super"},
            ]
        },
        {"inputType": "list",   "type": "direction", "text": "Slot Direction", "listValues":
            [
                {"name": "Horizontal", "value": "horizontal"},
                {"name": "Horizontal (Flipped)", "value": "horizontal reverse"},
                {"name": "Vertical", "value": "vertical"},
                {"name": "Vertical (Flipped)", "value": "vertical reverse"},
            ]
        },
        {"inputType": "list",   "type": "wDirection", "text": "Label Direction", "listValues":
            [
            
                {"name": "Horizontal", "value": "horizontal"},
                {"name": "Horizontal (Flipped)", "value": "horizontal reverse"},
                {"name": "Vertical", "value": "vertical"},
                {"name": "Vertical (Flipped)", "value": "vertical reverse"},
            ]
        },
        defaultFontFamily,
        {"inputType": "list",   "type": "aKeybindShow", "text": "Label Text", "listValues":
            [
                {"name": "Ammo", "value": "0"},
                {"name": "Keybind", "value": "1"},
            ]
        },
        {"inputType": "list",   "type": "aAlign", "text": "Label Text Align", "listValues":
            [
                {"name": "Left", "value": "flex-start"},
                {"name": "Center", "value": "center"},
                {"name": "Right", "value": "flex-end"},
            ]
        },
        {"inputType": "float",  "type": "fontSize", "text": "Label Text Size"},
        {"inputType": "float",  "type": "aPadding", "text": "Label Text Padding"},
        {"inputType": "float",  "type": "aWidth", "text": "Label Container Size"},

        
        {"inputType": "float",  "type": "iWidth", "text": "Icon Width"},
        {"inputType": "float",  "type": "iHeight", "text": "Icon Height"},

        
        {"inputType": "float",  "type": "wSepWidth", "text": "Slot Spacing"},
        {"inputType": "float",  "type": "sepWidth", "text": "Subset Spacing"},

        
        {"inputType": "toggle", "type": "accShow", "text": "Accuracy Stats"},
        {"inputType": "float",  "type": "accFontSize", "text": "Accuracy Size"},
        
        
        {"inputType": "toggle", "type": "aBarShow", "text": "Ammo Tank"},
        {"inputType": "float",  "type": "aBarWidth", "text": "Ammo Tank Thickness"},
        {"inputType": "toggle", "type": "aBarWC", "text": "Coloured Ammo Tank"},
        {"inputType": "float",  "type": "cBitWidth", "text": "Accent Thickness"},
        
        
        
        
        {"inputType": "float",  "type": "iOpacityInactive", "text": "Inactive Icon Opacity"},
        {"inputType": "float",  "type": "aOpacityInactive", "text": "Inactive Text Opacity"},
        {"inputType": "toggle", "type": "iShadow", "text": "Icon Shadow"},

        // I'm going crazy and just add all the color options:
        {"inputType": "list",   "type": "iC", "text": "Icon Color", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "iCCustom", "text": "Icon Color Custom"},
        {"inputType": "list",   "type": "iCActive", "text": "Icon Color Selected", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "iCActiveCustom", "text": "Icon Color Selected Custom"},
        {"inputType": "list",   "type": "iBGC", "text": "Icon Background", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "iBGCCustom", "text": "Icon Background Custom"},
        {"inputType": "list",   "type": "iBGCActive", "text": "Icon Background Selected", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "iBGCActiveCustom", "text": "Icon Background Selected Custom"},
        {"inputType": "list",   "type": "aC", "text": "Ammo Color", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "aCCustom", "text": "Ammo Color Custom"},
        {"inputType": "list",   "type": "aCActive", "text": "Ammo Color Selected", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "aCActiveCustom", "text": "Ammo Color Selected Custom"},
        {"inputType": "list",   "type": "aBGC", "text": "Ammo Background", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "aBGCCustom", "text": "Ammo Background Custom"},
        {"inputType": "list",   "type": "aBGCActive", "text": "Ammo Background Selected", "listValues":
            [
                {"name": "Custom", "value": "custom"},
                {"name": "Weapon Color", "value": "weapon"},
            ]
        },
        {"inputType": "color",  "type": "aBGCActiveCustom", "text": "Ammo Background Selected Custom"},
        {"inputType": "advanced", "type": "advanced"},

    ]
    , "#hud_weapons_list");

    hud_elements.push(element);
}
