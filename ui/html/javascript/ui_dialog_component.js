

let global_dialog_time_visible = 5000;
let global_dialog_list_ref = undefined;
function queue_dialog_msg(data) {
    if (!global_dialog_list_ref) global_dialog_list_ref = _id("dialog_list");

    /*
    Example data structure:
    data: {
        "title": "text",
        "msg": "text"
        "options": [ // if exists, show options
            {
                "button": "button type" // possibly used for customization / presentation of the buttons
                "label": "text"
                "duration": 5000 // how long to show the dialog in ms
                "callback": function
            }, 
            ...
        ]
    }
    */

    show_dialog(data);
}

function show_dialog(data) {
    let dialog = _createElement("div", "dialog");
    dialog.appendChild(_createElement("div", "info"));

    let desc = _createElement("div", "desc");
    if (data.title) desc.appendChild(_createElement("div", "title", data.title));
    let message = _createElement("div", "message");
    if (data.msg.nodeType == undefined) {
        // Text
        message.textContent = data.msg;
    } else if (data.msg.nodeType == 1 || data.msg.nodeType == 11) {
        // Element Node
        message.appendChild(data.msg);
    }
    desc.appendChild(message);

    dialog.appendChild(desc);

    if (!data.hasOwnProperty("options")) { data.options = []; }
    if (!data.options.length) {
        data.options.push({
            "button": "dismiss",
            "label": localize("menu_button_dismiss"),
        });
    }
    let timeout_time = global_dialog_time_visible;
    if (data.duration) timeout_time = data.duration;

    let dialog_timeout = setTimeout(function() {
        anim_start({
            element: dialog,
            opacity: [1, 0],
            duration: 300,
            easing: easing_functions.easeInOutQuad,
            remove: true,
        });
    }, timeout_time);
    
    if ("options" in data && data.options.length) {
        let options = _createElement("div", "options");
        for (let o of data.options) {
            let option = _createElement("div", "option", o.label);
            if (o.hasOwnProperty("style")) option.classList.add(o.style);

            option.addEventListener("click", function() {
                if (typeof o.callback == "function") o.callback(dialog);

                if (dialog_timeout) clearTimeout(dialog_timeout);

                /*
                anim_start({
                    element: dialog,
                    opacity: [1, 0],
                    duration: 300,
                    easing: easing_functions.easeInOutQuad,
                    remove: true,
                });
                */
               _remove_node(dialog);
            });
            options.appendChild(option);
        }
        dialog.appendChild(options);
    }

    global_dialog_list_ref.appendChild(dialog);

    engine.call('ui_sound', 'ui_notification1'); 

    //anim_show(global_dialog_list_ref, 100);
}

let global_sticky_dialogs = {};
function show_sticky_dialog(msg_key, data) {
    if (msg_key) hide_sticky_dialog(msg_key);

    let cont = _id("dialog_sticky");

    let dialog = _createElement("div", "dialog");
    global_sticky_dialogs[msg_key] = dialog;

    dialog.appendChild(_createElement("div", "info"));

    let desc = _createElement("div", "desc");
    if (data.title) desc.appendChild(_createElement("div", "title", data.title));
    let message = _createElement("div", "message");
    if (data.msg.nodeType == undefined) {
        // Text
        message.textContent = data.msg;
    } else if (data.msg.nodeType == 1 || data.msg.nodeType == 11) {
        // Element Node
        message.appendChild(data.msg);
    }
    desc.appendChild(message);
    dialog.appendChild(desc);

    if ("options" in data && data.options.length) {
        let options = _createElement("div", "options");
        for (let o of data.options) {
            let option = _createElement("div", "option", o.label);
            option.addEventListener("click", function() {
                if (typeof o.callback == "function") o.callback();
                hide_sticky_dialog();
            });
            if (o.hasOwnProperty("style")) option.classList.add(o.style);
            options.appendChild(option);
        }
        dialog.appendChild(options);
    }

    cont.appendChild(dialog);

    engine.call('ui_sound', 'ui_notification1'); 
    anim_show(dialog, 100);
}

function hide_sticky_dialog(msg_key) {
    if (msg_key && global_sticky_dialogs.hasOwnProperty(msg_key)) {
        _remove_node(global_sticky_dialogs[msg_key]);
    } else if (global_sticky_dialogs.hasOwnProperty("other")) {
        _remove_node(global_sticky_dialogs["other"]);
    }
}
