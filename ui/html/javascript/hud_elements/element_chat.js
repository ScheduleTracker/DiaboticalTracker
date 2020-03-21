function init_element_chat() {

    const hud_elem = new HUD_element('chat', //Name
    "",     //Editor Text
    {
        "height": "20",
        "width": "30",
        "fontSize": "1.75",
        "align": "left",
        "color": "white",
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
        {"inputType": "toggle", "type": "bottomUp", "text": "Bottom Up"},
        {"inputType": "toggle", "type": "showTimestamp", "text": "Show Timestamp"},
    ]
    , "#hud_chat");  //Template Name
    hud_elements.push(hud_elem);
    
    
    bind_event("chat_message", function (playerName, msg){
        addChatMessage(playerName, msg);
    });

    bind_event('set_chat_visible', function (visible) {
        set_chat(visible);
    });
    
    //Need two max limits when max charaters and second max without a whitespace
}

// Catch any extra keypresses sent within 50ms of the chat keybind being pressed to avoid the bind char from ending up in the input field
var global_chat_double_key_fix_timeout = undefined;
var global_chat_double_key_fix_active = false;

// Show the chat prompt and recent chat messages
function set_chat(visible) {
    if (global_chat_double_key_fix_timeout) {
        clearTimeout(global_chat_double_key_fix_timeout);
        global_chat_double_key_fix_timeout = undefined;
    }
    if (visible) {
        global_chat_double_key_fix_active = true;
        global_chat_double_key_fix_timeout = setTimeout(function() {
            global_chat_double_key_fix_active = false;
        },10);
    }
    let game_report_input = _id("game_report_cont").querySelector(".chat_input");
    if (global_game_report_active) {
        game_report_input.value = '';
        if (visible) {
            engine.call('set_chat_enabled', true);
            game_report_input.focus();
        }
    }
    if (!visible) game_report_input.blur();

    var container = document.querySelector("#game_hud_special");
    if (!global_game_report_active && visible) {
        _for_first_with_class_in_parent(_id("game_hud_special"), "ingame_chat_input", function(chatPrompt) {
            let chat_temp = chatPrompt.closest(".chat_container").querySelector(".chat_temp_cont");

            engine.call('set_chat_enabled', true);

            chat_temp.style.visibility="hidden";
            chatPrompt.value='';
            chatPrompt.parentElement.style.visibility='visible';
            chatPrompt.focus();

            _for_each_with_class_in_parent(container, "chat_messages", el => {
                // Remove any previously attached hide animations
                anim_remove(el);
                el.style.opacity = 1;
            });
        });
    } else {
        _for_each_with_class_in_parent(_id("game_hud_special"), "ingame_chat_input", function(chatPrompt) {
            let chat_temp = chatPrompt.closest(".chat_container").querySelector(".chat_temp_cont");
            chat_temp.style.visibility="visible";
            chatPrompt.value='';
            chatPrompt.parentElement.style.visibility='hidden';
            chatPrompt.blur();
        });
    }
}

const CHAT_MESSAGE_FADE_DELAY = 5000;
const CHAT_MESSAGE_FADE_DURATION = 500;
// Add a chat message
function chatMessage(msg) {

    // Add the message to every chat hud element
    _for_each_with_class_in_parent(_id("hud_load_during_loading"), "chat_messages", el => {

        if (el.children.length >= 20) {
            el.removeChild(el.children[0]);
        }

        let chat_message = _createElement('div');
        chat_message.appendChild(msg.cloneNode(true));

        el.appendChild(chat_message);

        let chat_temp = el.closest(".chat_container").querySelector(".chat_temp");
        let temp_msg = _createElement("div");
        temp_msg.appendChild(msg.cloneNode(true));
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

    });

    // Add the message to the match report chat
    var gameReportChat = _id("game_report_cont").querySelector(".chat_messages");
    if (gameReportChat.children.length >= 10) {
        gameReportChat.removeChild(gameReportChat.children[0]);
    }

    let chat_message = document.createElement('div');
    chat_message.appendChild(msg);

    gameReportChat.appendChild(chat_message);
}

function addServerChatMessage(msg){
    let div = _createElement("div");
    div.appendChild(_createElement("span", "", msg));
    chatMessage(div);
}

function addChatMessage(playerName, msg) {
    let fragment = new DocumentFragment();
    fragment.appendChild(_createElement("span","chat_timestamp", "[" + current_match.game_time_for_chat + "] ")); //super ugly shoehorning of timestamp, should be implemented engineside for final
    fragment.appendChild(_createElement("span","chat_playername", playerName));
    fragment.appendChild(_createElement("span","colon", ":"));
    fragment.appendChild(_createElement("span","msg", msg));
    chatMessage(fragment);    
}

function element_chat_setup() {

    if (IS_MENU_VIEW) return;
    
    var chatinput = _get_first_with_class_in_parent(_id("hud_load_during_loading"), "ingame_chat_input");
    
    if (chatinput) {
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
            _for_each_with_class_in_parent(_id("hud_load_during_loading"), "ingame_chat_input", chatPrompt => {
                let chat_temp = chatPrompt.closest(".chat_container").querySelector(".chat_temp_cont");
                if (event.keyCode == 27) { //Escape
                    event.preventDefault();

                    chat_temp.style.visibility="visible";
                    chatPrompt.value = "";
                    chatPrompt.parentElement.style.visibility='hidden';
                    chatPrompt.blur();

                    engine.call('set_chat_enabled', false);
                }

                if (event.keyCode == 13) { //return
                    if (/\S/.test(chatPrompt.value)) {
                        engine.call('game_chat_return', chatPrompt.value);
                    }
                    event.preventDefault();

                    // hacky way to run ui tests in hud view
                    if (chatPrompt.value.startsWith("runtest:")) {
                        runHudUITest(chatPrompt.value);
                    }

                    chat_temp.style.visibility="visible";
                    chatPrompt.value = "";
                    chatPrompt.parentElement.style.visibility = 'hidden';
                    chatPrompt.blur();

                    engine.call('set_chat_enabled', false);
                }
            });
        });
    }

    _for_each_with_class_in_parent(_id("hud_load_during_loading"), "ingame_chat_input", el => {
        el.addEventListener('blur', (event) => {
            _for_each_with_class_in_parent(_id("hud_load_during_loading"), "chat_messages", child => {
                
                anim_start({
                    element: child,
                    opacity: [1, 0],
                    delay: CHAT_MESSAGE_FADE_DELAY,
                    duration: CHAT_MESSAGE_FADE_DURATION,
                });

            });
                    
            engine.call('set_chat_enabled', false);
        });
    });

    var report_chatinput = _get_first_with_class_in_parent(_id("game_report_cont"), "chat_input");
    if (report_chatinput) {
        report_chatinput.addEventListener("keydown", function (event) {
            if (event.keyCode == 27) { //Escape
                report_chatinput.value = "";
                event.preventDefault();
                report_chatinput.blur();
            }
            if (event.keyCode == 13) { //return
                if (/\S/.test(report_chatinput.value)) {
                    engine.call('game_chat_return', report_chatinput.value);
                }
                event.preventDefault();
                report_chatinput.value = "";
            }
        });
    }

};