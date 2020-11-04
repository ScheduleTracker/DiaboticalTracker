let global_main_chat_tracker = {};

let global_main_chat_open = false;
let global_main_chat_active_channel = null;
let global_main_chat_last_msg_sent = undefined;
let global_main_chat_opening = false;

let global_main_ref_chat = null;
let global_main_ref_chat_input = null;
let global_main_ref_chat_popup = null;
let global_main_ref_chat_buffer = null;
let global_main_ref_chat_buffer_inner = null;
let global_main_ref_chat_channels = null;
let global_main_ref_chat_channel_left = null;
let global_main_ref_chat_channel_right = null;
function main_chat_setup_references() {
    if (global_main_ref_chat != null) return;
    
    global_main_ref_chat = _id("main_chat");
    global_main_ref_chat_input = _id("chat_bar_input");
    global_main_ref_chat_popup = _id("main_chat_popup");
    global_main_ref_chat_buffer = _id("main_chat_buffer");
    global_main_ref_chat_buffer_inner = _id("main_chat_buffer_inner");
    global_main_ref_chat_channel_scroll = _id("chat_channel_scroll");
    global_main_ref_chat_channels = _id("chat_channels");
    global_main_ref_chat_channel_left = _id("chat_channel_left");
    global_main_ref_chat_channel_right = _id("chat_channel_right");
}

function init_main_chat() {
    main_chat_setup_references();
    
    // Bind click on chat bar to open chat
    global_main_ref_chat.addEventListener("click", main_chat_open);

    // Bind click on chat channel to change the channel
    _for_each_with_class_in_parent(global_main_ref_chat, "channel", function(el) {
        el.addEventListener("click", function() {
            if (el.classList.contains("active")) return;

            let active = global_main_ref_chat.querySelector(".channel.active");
            if (active) active.classList.remove("active");
            global_main_chat_active_channel = el.dataset.type;

            let active_chat = global_main_ref_chat_buffer.querySelector(".chat.active");
            if (active_chat) active_chat.classList.remove("active");
            if (global_main_chat_active_channel == "party") _id("chat_party").classList.add("active");
            if (global_main_chat_active_channel == "lobby") _id("chat_lobby").classList.add("active");
            
            el.classList.add("active");
            scrollbarScrollBottom(global_main_ref_chat_buffer);

            let tab = undefined;
            if (global_main_chat_active_channel == "party") tab = _id("chat_tab_party");
            if (global_main_chat_active_channel == "lobby") tab = _id("chat_tab_lobby");
            if (tab && tab.classList.contains("new")) tab.classList.remove("new");

            global_main_ref_chat_input.focus();

            updateChatHighlight();
        });
    });

    // Bind click on anywhere else to close the chat
    _id("main_menu").addEventListener("click", function() {
        if (!global_main_chat_opening) {
            main_chat_minimize();
        } else {
            global_main_chat_opening = false;
        }
    });

    global_main_ref_chat_channel_scroll.addEventListener("wheel", function(event) {
        if (event.deltaY < 0) {
            main_chat_channels_left();
        } else {
            main_chat_channels_right();
        }
        event.preventDefault();
    });
}


function main_chat_open(e) {
    if (e) e.stopPropagation();
    global_main_ref_chat_input.focus();
    if (global_main_chat_open) return;

    main_chat_setup_references();

    global_main_chat_opening = true;
    req_anim_frame(() => { global_main_chat_opening = false; }, 2);

    global_main_ref_chat_popup.style.display = "flex";
    global_main_ref_chat_input.classList.add("hl");
    global_main_ref_chat_input.parentElement.classList.add("hl");
    global_main_chat_open = true;

    // If no channel is active or a different channel than the active one has a new message then open that channel
    main_chat_open_first_avail();

    global_main_ref_chat_input.focus();

    updateChatHighlight();
}

function updateChatHighlight() {
    main_chat_setup_references();

    let count = 0;
    _for_each_with_class_in_parent(global_main_ref_chat_popup, "channel", function(el) {
        if (el.classList.contains("new")) count++;
    });

    let icon = global_main_ref_chat.querySelector(".chat_icon");
    if (count) {
        icon.classList.add("new");
        icon.firstElementChild.classList.add("new");
    } else {
        icon.classList.remove("new");
        icon.firstElementChild.classList.remove("new");
    }
}

function main_chat_keydown(e) {
    let input = e.currentTarget;
    if (e.keyCode == 13) {
        let msg = input.value;
        if (msg.trim().length == 0) {
            input.value = "";
            return;
        }

        if (global_main_chat_last_msg_sent && Date.now() - global_main_chat_last_msg_sent < 300) {
            // Message sent too quickly
            return
        }

        input.value = "";

        if (global_main_chat_active_channel !== null) {
            global_main_chat_last_msg_sent = Date.now();
            
            if (global_main_chat_active_channel.type == "party") {
                send_string(CLIENT_COMMAND_MESSAGE_PARTY, msg);
            } else if (global_main_chat_active_channel.type == "lobby") {
                send_string(CLIENT_COMMAND_MESSAGE_LOBBY, msg);
            } else if (global_main_chat_active_channel.type == "user") {
                send_string(CLIENT_COMMAND_MESSAGE_USER, global_main_chat_active_channel.channel_id+" "+msg);
            }
        }
    }
}

function main_chat_add_incoming_msg(data) {
    main_chat_setup_references();

    let chat = null;
    if (data.type == "party" && global_main_chat_tracker.hasOwnProperty("party")) chat = global_main_chat_tracker["party"];
    if (data.type == "lobby" && global_main_chat_tracker.hasOwnProperty("lobby")) chat = global_main_chat_tracker["lobby"];
    if (data.type == "user") {
        // Only show messages from users in our friendslist
        if (!global_friends.hasOwnProperty(data.user_id) && data.user_id != global_self.user_id) return;

        if (!global_main_chat_tracker.hasOwnProperty(data.channel_id)) {
            global_main_chat_tracker[data.channel_id] = new MainChat("user", data.channel_id, data.name);
        }
        chat = global_main_chat_tracker[data.channel_id];
    }

    if (chat != null) {

        if (data.msg_type == "user") {
            var line = _createElement("p", "line");
            line.setAttribute("coh-inline", "");
            line.appendChild(_createElement("div", "ts", _current_hour_minute()));
            line.appendChild(_createElement("div", "name", data.name));
            line.appendChild(_createElement("div", "separator", ":"));
            line.appendChild(_createElement("div", "msg", data.msg));
            if (data.user_id == global_self.user_id) line.classList.add("self");
            chat.addMessage(line, true);

        } else if (data.msg_type == "user-offline") {

            var line = _createElement("p", "line");
            line.setAttribute("coh-inline", "");
            line.appendChild(_createElement("div", "ts", _current_hour_minute()));
            line.appendChild(_createElement("div", "server_msg", localize("chat_user_offline_msg")));
            chat.addMessage(line, true);

        } else if (data.msg_type == "spam-warn") {

            var line = _createElement("p", "line");
            line.setAttribute("coh-inline", "");
            line.appendChild(_createElement("div", "ts", _current_hour_minute()));
            line.appendChild(_createElement("div", "server_msg", localize("chat_spam_warning")));
            chat.addMessage(line, false);

        } else if (data.msg_type == "user-join") {

            let key = '';
            if (data.type == "lobby") key = 'chat_user_joined_lobby';
            if (data.type == "party") key = 'chat_user_joined_party';
            var line = _createElement("p", "line");
            line.setAttribute("coh-inline", "");
            line.appendChild(_createElement("div", "ts", _current_hour_minute()));
            line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":data.msg})));
            chat.addMessage(line, false);

        } else if (data.msg_type == "user-join-multiple") {

            let key = '';
            if (data.type == "lobby") key = 'chat_user_joined_lobby';
            if (data.type == "party") key = 'chat_user_joined_party';
            if (typeof data.msg == "object" && Array.isArray(data.msg)) {
                for (let user of data.msg) {
                    var line = _createElement("p", "line");
                    line.setAttribute("coh-inline", "");
                    line.appendChild(_createElement("div", "ts", _current_hour_minute()));
                    line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":user.name})));
                    chat.addMessage(line, false);
                }
            }

        } else if (data.msg_type == "user-leave") {

            let key = '';
            if (data.type == "lobby") key = 'chat_user_left_lobby';
            if (data.type == "party") key = 'chat_user_left_party';
            var line = _createElement("p", "line");
            line.setAttribute("coh-inline", "");
            line.appendChild(_createElement("div", "ts", _current_hour_minute()));
            line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":data.msg})));
            chat.addMessage(line, false);
        
        } else if (data.msg_type == "user-leave-multiple") {

            let key = '';
            if (data.type == "lobby") key = 'chat_user_left_lobby';
            if (data.type == "party") key = 'chat_user_left_party';
            if (typeof data.msg == "object" && Array.isArray(data.msg)) {
                for (let user of data.msg) {
                    var line = _createElement("p", "line");
                    line.setAttribute("coh-inline", "");
                    line.appendChild(_createElement("div", "ts", _current_hour_minute()));
                    line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":user.name})));
                    chat.addMessage(line, false);
                }
            }

        }
    
        updateChatHighlight();

        if (chat === global_main_chat_active_channel && global_main_chat_open) {
            scrollbarScrollBottom(global_main_ref_chat_buffer);
        }
    }
}

function main_chat_reset(type, remove_only) {
    main_chat_setup_references();

    if (type == "party") {
        if (global_main_chat_tracker.hasOwnProperty("party")) {
            global_main_chat_tracker["party"].cleanup();
            delete global_main_chat_tracker["party"];
        }
        if (!remove_only) {
            global_main_chat_tracker["party"] = new MainChat("party", "party");
        }
    }
    if (type == "lobby") {
        if (global_main_chat_tracker.hasOwnProperty("lobby")) {
            global_main_chat_tracker["lobby"].cleanup();
            delete global_main_chat_tracker["lobby"];
        }
        if (!remove_only) {
            global_main_chat_tracker["lobby"] = new MainChat("lobby", "lobby");
        }
    }

    refreshScrollbar(global_main_ref_chat_buffer);
}

function main_chat_minimize(ev) {
    main_chat_setup_references();

    if (ev) ev.stopPropagation();

    if (global_main_chat_open) {
        global_main_ref_chat_popup.style.display = "none";
        global_main_ref_chat_input.classList.remove("hl");
        global_main_ref_chat_input.parentElement.classList.remove("hl");
        global_main_chat_open = false;
    }
}


function main_chat_message_user(channel_id, name) {
    main_chat_setup_references();

    // Close the friends list if its open
    close_friends_list();

    // Open the chat window
    main_chat_open();

    // Create the chat channel if it doesnt exist already
    if (!global_main_chat_tracker.hasOwnProperty(channel_id)) {
        global_main_chat_tracker[channel_id] = new MainChat("user", channel_id, name);
    }

    // Open the channel
    global_main_chat_tracker[channel_id].openChannel();
}

function main_chat_channels_left(e) {
    if (e) e.stopPropagation();

    let s_rect = global_main_ref_chat_channel_scroll.getBoundingClientRect();
    let c_rect = global_main_ref_chat_channels.getBoundingClientRect();

    if (c_rect.width > s_rect.width) {
        let cur_left = c_rect.x - s_rect.x;
        let new_left = cur_left + (7 * onevh_float);
        if (new_left > 0) new_left = 0;
        global_main_ref_chat_channels.style.left = new_left+"px";
    } else {
        global_main_ref_chat_channels.style.left = "0px";
    }

    main_chat_channel_update_scroll();
}
function main_chat_channels_right(e) {
    if (e) e.stopPropagation();

    let s_rect = global_main_ref_chat_channel_scroll.getBoundingClientRect();
    let c_rect = global_main_ref_chat_channels.getBoundingClientRect();

    if (c_rect.width > s_rect.width) {
        let max_left = s_rect.width - c_rect.width;
        let cur_left = c_rect.x - s_rect.x;
        let new_left = cur_left - (7 * onevh_float);
        if (new_left < max_left) new_left = max_left;
        global_main_ref_chat_channels.style.left = new_left+"px";
    } else {
        global_main_ref_chat_channels.style.left = "0px";
    }

    main_chat_channel_update_scroll();
}

function main_chat_channel_update_scroll() {
    main_chat_setup_references();

    req_anim_frame(() => {
        let s_rect = global_main_ref_chat_channel_scroll.getBoundingClientRect();
        let c_rect = global_main_ref_chat_channels.getBoundingClientRect();

        if (c_rect.width > s_rect.width) {

            let max_left = Math.floor(s_rect.width - c_rect.width);
            let cur_left = Math.floor(c_rect.x - s_rect.x);
            if (cur_left == max_left) {
                global_main_ref_chat_channel_right.style.display = "none";
            } else {
                global_main_ref_chat_channel_right.style.display = "block";
            }

            if (Math.floor(s_rect.left) == Math.floor(c_rect.left)) {
                global_main_ref_chat_channel_left.style.display = "none";
            } else {
                global_main_ref_chat_channel_left.style.display = "block";
            }

            if ((c_rect.x + c_rect.width) < (s_rect.x + s_rect.width)) {
                global_main_ref_chat_channels.style.left = (s_rect.width - c_rect.width)+"px";
                global_main_ref_chat_channel_right.style.display = "none";
            }

            if (s_rect.x < c_rect.x) {
                global_main_ref_chat_channels.style.left = "0px";
                global_main_ref_chat_channel_left.style.display = "none";
            }

        } else {
            global_main_ref_chat_channels.style.left = "0px";
            global_main_ref_chat_channel_left.style.display = "none";
            global_main_ref_chat_channel_right.style.display = "none";
        }
    },2);
}

function main_chat_scroll_to_channel(tab) {
    main_chat_setup_references();

    req_anim_frame(() => {
        let s_rect = global_main_ref_chat_channel_scroll.getBoundingClientRect();
        let t_rect = tab.getBoundingClientRect();
        let c_rect = global_main_ref_chat_channels.getBoundingClientRect();

        let len = t_rect.x - c_rect.x + t_rect.width;

        if (c_rect.width > s_rect.width) {
            // If the tab isnt fully in view to the right side - scroll to it
            if ((t_rect.x + t_rect.width) > (s_rect.x + s_rect.width)) {
                global_main_ref_chat_channels.style.left = (s_rect.width - len)+"px";
            }

            // If the tab isnt fully in view to the left side - scroll to it
            if (t_rect.x < s_rect.x) {
                global_main_ref_chat_channels.style.left = (0 - (t_rect.x - c_rect.x))+"px";
            }


        } else {
            global_main_ref_chat_channels.style.left = "0px";
            global_main_ref_chat_channel_left.style.display = "none";
            global_main_ref_chat_channel_right.style.display = "none";
        }

        main_chat_channel_update_scroll();
    },2);
}

function main_chat_open_first_avail(on_close_fallback) {
    // If no channel is active or a different channel than the active one has a new message then open that channel
    if (global_main_chat_active_channel === null) {
        let opened = false;
        for (let idx in global_main_chat_tracker) {
            if (global_main_chat_tracker[idx].new) {
                opened = true;
                global_main_chat_tracker[idx].openChannel();
                break;
            }
        }
        if (!opened) {
            if (on_close_fallback && global_main_chat_tracker.hasOwnProperty(on_close_fallback)) {
                global_main_chat_tracker[on_close_fallback].openChannel();
            } else {
                if (global_main_chat_tracker.hasOwnProperty("party")) global_main_chat_tracker["party"].openChannel();
            }
        }
    } else {
        if (global_main_chat_active_channel.new) {
            global_main_chat_active_channel.openChannel();
        } else {
            for (let idx in global_main_chat_tracker) {
                if (global_main_chat_tracker[idx].new) {
                    opened = true;
                    global_main_chat_tracker[idx].openChannel();
                    break;
                }
            }
        }
    }
}

class MainChat {
    constructor(type, channel_id, name) {
        this.type = type;
        this.name = name;
        this.channel_id = channel_id;
        this.new = false;

        let channel_title = '';
        if (this.type == "party") {
            channel_title = localize("party");
        } else if (this.type == "lobby") {
            channel_title = localize("lobby");
        } else if (this.type == "user") {
            channel_title = name;
        }

        this.channel_tab = _createElement("div", "channel");
        this.channel_tab.dataset.channelId = channel_id;
        this.channel_label = _createElement("div", "label", channel_title);
        this.channel_tab.appendChild(this.channel_label);
        if (this.type == "user") {
            this.channel_tab.classList.add("user");

            let close_button = _createElement("div", "close_button");
            this.channel_tab.appendChild(close_button);

            close_button.addEventListener("click", () => {
                // Determine what channel to open after closing this one
                let close_fallback = null;
                if (this.channel_tab.previousSibling) close_fallback = this.channel_tab.previousSibling.dataset.channelId;

                this.cleanup();
                delete global_main_chat_tracker[this.channel_id];

                if (global_main_chat_active_channel !== this) {
                    main_chat_channel_update_scroll();
                }

                main_chat_open_first_avail(close_fallback);
            });
        }
        _addButtonSounds(this.channel_tab, 1);
        this.channel_tab.addEventListener("click", this.openChannel.bind(this));
        if (this.type == "user") {
            this.channel_tab.addEventListener("mousedown", this.openContextMenu.bind(this));
        }

        if (this.type == "party") {
            // Insert the party channel always as the first one
            global_main_ref_chat_channels.insertBefore(this.channel_tab, global_main_ref_chat_channels.firstChild);
        } else if (this.type == "lobby") {
            // Insert the lobby channel as the second one (or first if there is no party for some reason)
            if (global_main_chat_tracker.hasOwnProperty("party")) {
                _insertAfter(this.channel_tab, global_main_chat_tracker["party"].channel_tab);
            } else {
                global_main_ref_chat_channels.insertBefore(this.channel_tab, global_main_ref_chat_channels.firstChild);
            }
        } else {
            // Insert other chats at the end
            global_main_ref_chat_channels.appendChild(this.channel_tab);
        }

        this.buffer = _createElement("div", "chat");

        if (global_main_chat_open && global_main_chat_active_channel === null) {
            this.openChannel();
        }
    }

    openContextMenu(e) {
        if (this.type != "user") return;
        if (e.button != 2) return;
        e.preventDefault();

        let contextOptions = [];

        if (global_friends.hasOwnProperty(this.channel_id) && global_friends[this.channel_id].friendship_state == 0) {
            // Join Party
            if (global_friends[this.channel_id].ingame && global_friends[this.channel_id].party_privacy == false && !(this.channel_id in global_party.members)) {
                contextOptions.push({
                    "text": localize("friends_list_action_party_join"),
                    "callback": () => { send_string(CLIENT_COMMAND_JOIN_USERID_PARTY, this.channel_id); },
                });
            }

            // Invite to Lobby
            if (global_lobby_id != -1) {
                contextOptions.push({
                    "text": localize("friends_list_action_invite_lobby"),
                    "callback": () => { send_json_data({"action": "invite-add", "type": "lobby", "user-id": this.channel_id }); },
                });
            }
            
            // Invite to Party
            if (!(this.channel_id in global_party.members)) {
                contextOptions.push({
                    "text": localize("friends_list_action_invite_party"),
                    "callback": () => { send_json_data({"action": "invite-add", "type": "party", "user-id": this.channel_id }); },
                });
            }
        }

        context_menu(e, contextOptions);
    }

    cleanup() {
        _remove_node(this.channel_tab);
        if (global_main_chat_active_channel === this) {
            _remove_node(this.buffer);
            global_main_chat_active_channel = null;
        }
    }

    closeChannel() {
        this.channel_tab.classList.remove("active");
        if (global_main_chat_active_channel === this && this.buffer.parentNode) this.buffer.parentNode.removeChild(this.buffer);
    }

    openChannel() {
        if (global_main_chat_active_channel !== null) global_main_chat_active_channel.closeChannel();
        global_main_chat_active_channel = this;

        this.channel_tab.classList.add("active");

        global_main_ref_chat_buffer_inner.appendChild(this.buffer);

        if (this.new) {
            this.channel_tab.classList.remove("new");
            let new_el = this.channel_tab.querySelector(".new");
            if (new_el) _remove_node(new_el);
            this.new = false;
        }

        updateChatHighlight();

        main_chat_scroll_to_channel(this.channel_tab);

        if (global_main_chat_open) {
            refreshScrollbar(global_main_ref_chat_buffer);
            scrollbarScrollBottom(global_main_ref_chat_buffer);
        }

        global_main_ref_chat_input.focus();
    }

    addMessage(line, user_message) {
        this.buffer.appendChild(line);

        // Add new message indicator for new user messages in the channel tab if this isnt the currently active channel or if the chat is closed
        if (user_message && !this.new && (!global_main_chat_open || global_main_chat_active_channel !== this)) {
            this.channel_tab.classList.add("new");
            _insertAfter(_createElement("div", "new"), this.channel_label);
            this.new = true;
        }

        while (this.buffer.childElementCount > 100) {
            this.buffer.removeChild(this.buffer.firstElementChild);
        }
    }
}