function init_element_chat() {

    const hud_elem = new HUD_element('chat', false,
    {
        "height": "20",
        "width": "30",
        "fontSize": "1.75",
        "align": "left",
        "color": "#ffffff",
        "tcc": "#45EAFF",
        "showTimestamp":1,
    },      //Default values
    [       //Editor settings
        defaultPivot,
        defaultX,
        defaultY,
        defaultWidth,
        defaultHeight,
        defaultFontSize,
        defaultFontFamily,
        defaultAlign,
        defaultColor,
        {"inputType": "color", "type": "tcc", "text": "Team Chat Color"},
        {"inputType": "toggle", "type": "bottomUp", "text": "Bottom Up"},
        {"inputType": "toggle", "type": "showTimestamp", "text": "Show Timestamp"},
    ]
    , "#hud_chat");  //Template Name
    hud_elements.push(hud_elem);
    
    
    bind_event("chat_message", function (playerName, msg, self, team, game_time) {
        addChatMessage(playerName, msg, self, team, game_time);
    });

    bind_event('set_chat_visible', function (visible, team) {
        set_chat(visible, team);
    });
    
    //Need two max limits when max charaters and second max without a whitespace
}

// Catch any extra keypresses sent within 1ms of the chat keybind being pressed to avoid the bind char from ending up in the input field
var global_chat_double_key_fix_timeout = undefined;
var global_chat_double_key_fix_active = false;
var global_team_chat_active = false;

// Show the chat prompt and recent chat messages
function set_chat(visible, team) {

    if (global_chat_double_key_fix_timeout) {
        clearTimeout(global_chat_double_key_fix_timeout);
        global_chat_double_key_fix_timeout = undefined;
    }

    if (visible) {
        global_chat_double_key_fix_active = true;
        global_chat_double_key_fix_timeout = setTimeout(function() {
            global_chat_double_key_fix_active = false;
        },1);
        global_team_chat_active = team;
    }

    if (global_game_report_active) {
        global_hud_references.game_report_chat_input.value = '';
        if (visible) {
            engine.call('set_chat_enabled', true);
            
            global_hud_references.game_report_chat_input.focus();
        } else {
            global_hud_references.game_report_chat_input.blur();
        }

        if (global_team_chat_active) _id("game_report_chat_input_mode").textContent = localize("settings_controls_teamchat_short");
        else _id("game_report_chat_input_mode").textContent = localize("settings_controls_chat");
    } else {
        let chatPrompt = _id("ingame_chat_prompt");
        let chatInput = _id("ingame_chat_input");

        if (visible) {
            engine.call('set_chat_enabled', true);

            if (team) _id("ingame_chat_label").textContent = localize("settings_controls_teamchat");
            else _id("ingame_chat_label").textContent = localize("settings_controls_chat");

            chatPrompt.classList.add("active");
            chatInput.focus();
            
            for (let el of global_hud_references.chat_container) {
                el.children[0].style.visibility = "hidden";
                el.children[1].style.visibility = "visible";
            }

            for (let el of global_hud_references.chat_messages) {
                // Remove any previously attached hide animations
                anim_remove(el);
                el.style.opacity = 1;
            }

        } else {

            chatPrompt.classList.remove("active");
            chatInput.value = "";
            chatInput.blur();

            for (let el of global_hud_references.chat_container) {
                el.children[0].style.visibility = "visible";
                el.children[1].style.visibility = "hidden";
            }

        }
    }
}

const CHAT_MESSAGE_FADE_DELAY = 5000;
const CHAT_MESSAGE_FADE_DURATION = 500;
// Add a chat message
function chatMessage(msg, team) {

    // Add the message to every chat hud element
    for (let el of global_hud_references.chat_messages) {

        if (el.children.length >= 20) {
            el.removeChild(el.children[0]);
        }

        let chat_message = _createElement('div');
        chat_message.appendChild(msg.cloneNode(true));
        if (team) chat_message.classList.add("team");

        el.appendChild(chat_message);
    }

    for (let el of global_hud_references.chat_container) {
        let chat_temp = el.children[0].children[0];
        let temp_msg = _createElement("div");
        temp_msg.appendChild(msg.cloneNode(true));
        if (team) temp_msg.classList.add("team");
        chat_temp.appendChild(temp_msg);

        if (chat_temp.children.length > 10) {
            anim_remove(chat_temp.children[0]);
            chat_temp.removeChild(chat_temp.children[0]);
        }

        anim_start({
            element: temp_msg,
            opacity: [1, 0],
            delay: CHAT_MESSAGE_FADE_DELAY,
            duration: CHAT_MESSAGE_FADE_DURATION,
            remove: true,
        });
    }

    // Add the message to the match report chat
    if (global_hud_references.game_report_chat_messages && global_hud_references.game_report_chat_messages.children.length >= 10) {
        global_hud_references.game_report_chat_messages.removeChild(global_hud_references.game_report_chat_messages.children[0]);
    }

    let chat_message = document.createElement('div');
    chat_message.appendChild(msg);
    if (team) chat_message.classList.add("team");

    global_hud_references.game_report_chat_messages.appendChild(chat_message);
}

function addServerChatMessage(msg){
    let div = _createElement("div");
    div.appendChild(_createElement("span", "", msg));
    chatMessage(div, false);
}

function addChatMessage(playerName, msg, self, team, game_time) {
    let fragment = new DocumentFragment();
    if (game_time !== undefined) {
        fragment.appendChild(_createElement("span","chat_timestamp", "[" + _seconds_to_digital(game_time) + "] "));
    }
    if (team) fragment.appendChild(_createElement("span","team_indicator", " [T] "));
    fragment.appendChild(_createElement("span",["chat_playername", (self) ? "self" : ""], playerName));
    fragment.appendChild(_createElement("span","colon", ":"));
    fragment.appendChild(_createElement("span","msg", msg));
    chatMessage(fragment, team);    
}

function element_chat_setup() {

    if (GAMEFACE_VIEW === 'menu') return;
    
    let chatinput = _id("ingame_chat_input");
    chatinput.addEventListener("keypress", function(event) {
        if (global_chat_double_key_fix_active) {
            event.preventDefault();
            return false;
        }
    });
    chatinput.addEventListener("keydown", function (event) {
        if (global_chat_double_key_fix_active) {
            event.preventDefault();
            return false;
        }

        // Escape
        if (event.keyCode == 27) { 
            event.preventDefault();

            for (let el of global_hud_references.chat_container) {
                el.children[0].style.visibility = "visible";
                el.children[1].style.visibility = "hidden";
            }

            chatinput.value = "";
            chatinput.blur();

            engine.call('set_chat_enabled', false);
        }

        // Return
        if (event.keyCode == 13) { 
            if (/\S/.test(chatinput.value)) {
                engine.call('game_chat_return', chatinput.value, global_team_chat_active);
            }
            event.preventDefault();

            for (let el of global_hud_references.chat_container) {
                el.children[0].style.visibility = "visible";
                el.children[1].style.visibility = "hidden";
            }

            chatinput.value = "";
            chatinput.blur();

            engine.call('set_chat_enabled', false);
        }

        // Tab
        if (event.keyCode == 9) {
            event.preventDefault();
            if (global_team_chat_active) {
                global_team_chat_active = false;
                _id("ingame_chat_label").textContent = localize("settings_controls_chat");
            } else { 
                global_team_chat_active = true;
                _id("ingame_chat_label").textContent = localize("settings_controls_teamchat");
            }
        }
    });

    chatinput.addEventListener("blur", function (event) {
        for (let el of global_hud_references.chat_messages) {
            
            anim_start({
                element: el,
                opacity: [1, 0],
                delay: CHAT_MESSAGE_FADE_DELAY,
                duration: CHAT_MESSAGE_FADE_DURATION,
            });

        }
                
        engine.call('set_chat_enabled', false);
    });

    var report_chatinput = _get_first_with_class_in_parent(_id("game_report_cont"), "chat_input");
    var report_chatmode = _id("game_report_chat_input_mode");
    if (report_chatinput) {
        report_chatinput.addEventListener("focus", function(event) {
            engine.call('set_chat_enabled', true);
        });
        report_chatinput.addEventListener("keydown", function (event) {

            // Escape
            if (event.keyCode == 27) { 
                report_chatinput.value = "";
                event.preventDefault();
                report_chatinput.blur();

                engine.call('set_chat_enabled', false);
            }

            // Return
            if (event.keyCode == 13) { 
                if (/\S/.test(report_chatinput.value)) {
                    engine.call('game_chat_return', report_chatinput.value, global_team_chat_active);
                }
                event.preventDefault();
                report_chatinput.value = "";
            }

            // Tab
            if (event.keyCode == 9) {
                event.preventDefault();
                if (global_team_chat_active) {
                    global_team_chat_active = false;
                    report_chatmode.textContent = localize("settings_controls_chat");
                } else { 
                    global_team_chat_active = true;
                    report_chatmode.textContent = localize("settings_controls_teamchat_short");
                }
            }
            
        });
    }

    report_chatmode.addEventListener("click", function(event) {
        if (global_team_chat_active) {
            global_team_chat_active = false;
            report_chatmode.textContent = localize("settings_controls_chat");
        } else { 
            global_team_chat_active = true;
            report_chatmode.textContent = localize("settings_controls_teamchat_short");
        }
        _play_click1();
    });

};