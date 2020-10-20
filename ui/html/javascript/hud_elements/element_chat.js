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

    //Need two max limits when max charaters and second max without a whitespace
}

var global_team_chat_active = false;

// Show the chat prompt and recent chat messages
let global_main_chat_active = false;
function set_chat(visible, team) {
    global_main_chat_active = visible;

    if (visible) global_team_chat_active = team;

    if (GAMEFACE_VIEW == "menu") {
        let chatPrompt = _id("ingame_chat_prompt");
        let chatInput = _id("ingame_chat_input");

        if (visible) {
            engine.call('set_chat_enabled', true);

            if (team) _id("ingame_chat_label").textContent = localize("settings_controls_teamchat");
            else _id("ingame_chat_label").textContent = localize("settings_controls_chat");

            chatPrompt.classList.add("active");
            chatInput.focus();

        } else {

            chatPrompt.classList.remove("active");
            chatInput.value = "";
            chatInput.blur();

        }   
    }

    if (GAMEFACE_VIEW == "hud") {
        if (!global_game_report_active) {
            if (visible) {
                for (let el of global_hud_references.chat_messages) {
                    el.style.display = "flex";
                }
                for (let el of global_hud_references.chat_container) {
                    el.children[0].style.visibility = "hidden";
                    el.children[1].style.visibility = "visible";
                }
            } else {
                for (let el of global_hud_references.chat_container) {
                    el.children[0].style.visibility = "visible";
                    el.children[1].style.visibility = "hidden";
                }
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
    let div = _createElement("div", "chat_msg");
    if (game_time !== undefined) {
        div.appendChild(_createElement("span","chat_timestamp", "[" + _seconds_to_digital(game_time) + "] "));
    }
    if (team) div.appendChild(_createElement("span","team_indicator", " [T] "));
    div.appendChild(_createElement("span",["chat_playername", (self) ? "self" : ""], playerName));
    div.appendChild(_createElement("span","colon", ":"));
    div.appendChild(_createElement("span","msg", msg));
    chatMessage(div, team);    
}

function main_chat_setup() {

    bind_event('set_chat_visible', function (visible, team) {
        set_chat(visible, team);
    });

    if (GAMEFACE_VIEW == "menu") {
        let chatinput = _id("ingame_chat_input");
        chatinput.addEventListener("keydown", function (event) {
            // Escape
            if (event.keyCode == 27) { 
                event.preventDefault();

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
    }
}