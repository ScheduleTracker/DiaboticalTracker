
let global_main_chat_open = false;
let global_main_chat_active_channel = "party";
let global_main_chat_last_msg_sent = undefined;
let global_main_chat_opening = false;
function init_main_chat() {
    let main_chat = _id("main_chat");
    let main_chat_buffer = _id("main_chat_buffer");
    main_chat.addEventListener("click", function(e) {
        global_main_chat_opening = true;

        _id("main_chat_popup").style.display = "flex";
        global_main_chat_open = true;

        let tab = undefined;
        if (global_main_chat_active_channel == "party") tab = _id("chat_tab_party");
        if (global_main_chat_active_channel == "lobby") tab = _id("chat_tab_lobby");
        if (tab && tab.classList.contains("new")) tab.classList.remove("new");

        updateChatHighlight();
    });

    _for_each_with_class_in_parent(main_chat, "channel", function(el) {
        el.addEventListener("click", function() {
            if (el.classList.contains("active")) return;

            let active = main_chat.querySelector(".channel.active");
            if (active) active.classList.remove("active");
            global_main_chat_active_channel = el.dataset.type;

            let active_chat = main_chat_buffer.querySelector(".chat.active");
            if (active_chat) active_chat.classList.remove("active");
            if (global_main_chat_active_channel == "party") _id("chat_party").classList.add("active");
            if (global_main_chat_active_channel == "lobby") _id("chat_lobby").classList.add("active");
            
            el.classList.add("active");
            scrollbarScrollBottom(main_chat_buffer);

            let tab = undefined;
            if (global_main_chat_active_channel == "party") tab = _id("chat_tab_party");
            if (global_main_chat_active_channel == "lobby") tab = _id("chat_tab_lobby");
            if (tab && tab.classList.contains("new")) tab.classList.remove("new");

            _id("chat_bar_input").focus();

            updateChatHighlight();
        });
    });

    _id("main_menu").addEventListener("click", function() {
        if (!global_main_chat_opening) {
            main_chat_minimize();
        } else {
            global_main_chat_opening = false;
        }
    });
}

function updateChatHighlight() {
    let count = 0;
    _for_each_with_class_in_parent(_id("main_chat_popup"), "channel", function(el) {
        if (el.classList.contains("new")) count++;
    });

    let icon = _id("main_chat").querySelector(".chat_icon");
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

        global_main_chat_last_msg_sent = Date.now();
        if (global_main_chat_active_channel == "party") {
            send_string(CLIENT_COMMAND_MESSAGE_PARTY, msg);
        } else if (global_main_chat_active_channel == "lobby") {
            send_string(CLIENT_COMMAND_MESSAGE_LOBBY, msg);
        }
    }
}

function main_chat_add_incoming_msg(data) {
    //console.log("incoming chat msg",_dump(data));

    let fragment = new DocumentFragment();

    if (data.msg_type == "user") {

        var line = _createElement("div", "line");
        line.appendChild(_createElement("div", "ts", _current_hour_minute()));
        line.appendChild(_createElement("div", "name", data.name));
        line.appendChild(_createElement("div", "separator", ":"));
        line.appendChild(_createElement("div", "msg", data.msg));

        if (data.user_id == global_self.user_id) {
            line.classList.add("self");
        } else {
            if (!global_main_chat_open || global_main_chat_active_channel != data.type) {
                if (data.type == "party") _id("chat_tab_party").classList.add("new");
                if (data.type == "lobby") _id("chat_tab_lobby").classList.add("new");
                updateChatHighlight();
            }
        }
        fragment.appendChild(line);
        
    } else if (data.msg_type == "spam-warn") {

        var line = _createElement("div", "line");
        line.appendChild(_createElement("div", "ts", _current_hour_minute()));
        line.appendChild(_createElement("div", "server_msg", localize("chat_spam_warning")));
        fragment.appendChild(line);

    } else if (data.msg_type == "user-join") {

        let key = '';
        if (data.type == "lobby") key = 'chat_user_joined_lobby';
        if (data.type == "party") key = 'chat_user_joined_party';
        var line = _createElement("div", "line");
        line.appendChild(_createElement("div", "ts", _current_hour_minute()));
        line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":data.msg})));
        fragment.appendChild(line);

    } else if (data.msg_type == "user-join-multiple") {

        let key = '';
        if (data.type == "lobby") key = 'chat_user_joined_lobby';
        if (data.type == "party") key = 'chat_user_joined_party';
        if (typeof data.msg == "object" && Array.isArray(data.msg)) {
            for (let user of data.msg) {
                var line = _createElement("div", "line");
                line.appendChild(_createElement("div", "ts", _current_hour_minute()));
                line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":user.name})));
                fragment.appendChild(line);
            }
        }

    } else if (data.msg_type == "user-leave") {

        let key = '';
        if (data.type == "lobby") key = 'chat_user_left_lobby';
        if (data.type == "party") key = 'chat_user_left_party';
        var line = _createElement("div", "line");
        line.appendChild(_createElement("div", "ts", _current_hour_minute()));
        line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":data.msg})));
        fragment.appendChild(line);
    
    } else if (data.msg_type == "user-leave-multiple") {

        let key = '';
        if (data.type == "lobby") key = 'chat_user_left_lobby';
        if (data.type == "party") key = 'chat_user_left_party';
        if (typeof data.msg == "object" && Array.isArray(data.msg)) {
            for (let user of data.msg) {
                var line = _createElement("div", "line");
                line.appendChild(_createElement("div", "ts", _current_hour_minute()));
                line.appendChild(_createElement("div", "server_msg", localize_ext(key, {"name":user.name})));
                fragment.appendChild(line);
            }
        }

    }
    
    let cont = undefined;
    if (data.type == "party") cont = _id("chat_party");
    if (data.type == "lobby") cont = _id("chat_lobby");

    if (cont) {
        let main_buffer = _id("main_chat_buffer");
        cont.appendChild(fragment);
        while (cont.childElementCount > 50) {
            cont.removeChild(cont.firstElementChild);
        }
        setTimeout(function() {
            scrollbarScrollBottom(main_buffer);
        });
    }
}

function main_chat_reset(type) {
    let cont = undefined;
    if (type == "party") cont = _id("chat_party");
    if (type == "lobby") cont = _id("chat_lobby");

    if (cont) _empty(cont);
    refreshScrollbar(_id("main_chat_buffer"));
}

function main_chat_lobby_visibility(visible) {
    
    let party_cont = _id("chat_party");
    let party_btn  = _id("chat_tab_party");
    
    let lobby_cont = _id("chat_lobby");
    let lobby_btn  = _id("chat_tab_lobby");
    
    if (visible) {
        anim_show(lobby_btn);
    } else {
        if (global_main_chat_active_channel == "lobby") {
            lobby_cont.classList.remove("active");
            lobby_btn.classList.remove("active");
            party_cont.classList.add("active");
            party_btn.classList.add("active");
            global_main_chat_active_channel = "party";
        }

        anim_hide(lobby_btn);
        _empty(lobby_cont);
    }

    refreshScrollbar(_id("main_chat_buffer"));
}

function main_chat_minimize(ev) {
    if (ev) ev.stopPropagation();

    if (global_main_chat_open) {
        _id("main_chat_popup").style.display = "none";
        global_main_chat_open = false;
    }
}