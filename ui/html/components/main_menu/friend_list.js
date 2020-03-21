let global_friends_list_enabled = false;
let global_friends_list_action_menu_open = false;
let global_active_friends_list_cont = undefined;
let global_friend_request_count = 0;
let global_friend_invites_count = 0;
let global_friends_online_data = undefined;
let global_friends_online_data_requested = false;

function init_friends_list() {
    let friends_popup = _id("friends_list_popup");
    global_active_friends_list_cont = friends_popup.querySelector(".friends_list_cont.active");

    _id("friends_list_cont_friends").querySelector(".scroll-inner").addEventListener("scroll", function() {
        close_friends_list_action_menu();
    });

    bind_event("set_friends_data", function(data) {
        let json_data = {};
        try {
            json_data = JSON.parse(data);
        } catch (e) {
            console.log("set_friends_data: Error parsing JSON. err=" + e);
        }

        if ("friends" in json_data) {
            handle_friend_list_update(json_data["friends"]);
        } else {
            handle_friend_list_update([]);
        }

        if ("self" in json_data) {
            handle_friend_list_update_self(json_data["self"]);
        }
    });
    
    // Prevent the window from closing when clicking anywhere in the friends list
    friends_popup.addEventListener("click", function(ev) {
        ev.stopPropagation();
    });

    // Setup friend list settings handlers
    let self = friends_popup.querySelector(".friends_list_self");
    _addButtonSounds(self, 1);
    self.addEventListener("mouseenter", function() {
        self.querySelector(".settings").classList.add("hover");
    });
    self.addEventListener("mouseleave", function() {
        self.querySelector(".settings").classList.remove("hover");
    });
    self.addEventListener("click", function() {
        if (self.classList.contains("open")) {
            // Close friends settings menu
            self.classList.remove("open");
                    
            close_friends_list_action_menu();
        } else {
            if (global_friends_list_action_menu_open) {
                close_friends_list_action_menu();
            }
            // Open friends settings menu
            self.classList.add("open");
            create_friends_settings_menu();
        }
    });

    // Setup friend list tab handlers
    _for_each_with_selector_in_parent(friends_popup, ".friends_list_tabs .tab", function(tab) {
        tab.addEventListener("click", function() {
            if (tab.classList.contains("active")) return;

            let id = tab.dataset.id;
            change_friendlist_tab(id);

            close_friends_list_action_menu();
        });
    });

    // Setup add friend handlers
    let cont = _id("friends_list_cont_invites");
    let input = cont.querySelector(".friend_request_cont input");
    input.addEventListener("keydown", function(e) {
        if (e.keyCode == 13) { //return
            send_friend_request();
        }
    })
    
    // call : "friend_request": string user_id
    bind_event("friend_request_result", function(success) {
        console.log("friend request by user_id: "+success);

        let title = localize("title_info");
        let msg = localize("friends_list_text_add_friend_success");
        if (!success) {
            title = localize("title_error");
            msg = localize("friends_list_text_add_friend_error");
        }

        queue_dialog_msg({
            "title": title,
            "msg": msg,
        });
    });

    // call : "friend_request_by_name": string name_or_email
    bind_event("friend_request_by_name_result", function(success) {
        console.log("friend request by name success: "+success);

        let title = localize("title_info");
        let msg = localize("friends_list_text_add_friend_success");
        if (!success) {
            title = localize("title_error");
            msg = localize("friends_list_text_add_friend_not_found");
        }

        queue_dialog_msg({
            "title": title,
            "msg": msg,
        });
    });
}

function send_friend_request() {
    let cont = _id("friends_list_cont_invites");
    let input = cont.querySelector(".friend_request_cont input");

    let name = input.value;
    input.value = '';
    if (name.trim().length == 0) return;

    send_string("get-userid-from-name "+name, "userid-from-name", function(data) {
        if (data.user_id === false || data.user_id === "false") {
            queue_dialog_msg({
                "title": localize("title_error"),
                "msg": localize("error_username_not_found"),
            });
        } else {
            if (data.user_id == global_self.user_id) return;

            engine.call("friend_request", data.user_id);
        }
    });
}

let friends_list_self = undefined;
let friends_list_self_status = "";
function handle_friend_list_update_self(data) {
    if (!friends_list_self) friends_list_self = _id("friends_list_popup").querySelector(".friends_list_self");

    friends_list_self.querySelector(".desc .name").textContent = data.name;
    friends_list_self.querySelector(".desc .state").textContent = create_friend_state_string(data);
    friends_list_self_status = data.presence_status;
}

function set_friend_list_avatar_self(data) {
    if (!friends_list_self) friends_list_self = _id("friends_list_popup").querySelector(".friends_list_self");
    friends_list_self.querySelector(".avatar").style.backgroundImage = "url("+_avatarUrl(data.data.avatar)+")";
}

let friends_list_cache = {
    "party": [],
    "in_diabotical": [],
    "online": [],
    "offline": [],
    "invites_game":[],
    "invites_epic_in": [],
    "invites_epic_out": [],
};

let global_friends_user_ids = [];
let friends_in_diabotical_user_ids = [];
let friends_in_party_user_ids = [];

let friends_list_party = _id("friends_list_party");
let friends_list_party_cont = _id("friends_list_party_cont");
let friends_list_party_fragment = new DocumentFragment();
let friends_list_in_diabotical = _id("friends_list_in_diabotical");
let friends_list_in_diabotical_cont = _id("friends_list_in_diabotical_cont");
let friends_list_in_diabotical_fragment = new DocumentFragment();
let friends_list_online = _id("friends_list_online");
let friends_list_online_cont = _id("friends_list_online_cont");
let friends_list_online_cont_fragment = new DocumentFragment();
let friends_list_offline = _id("friends_list_offline");
let friends_list_offline_cont = _id("friends_list_offline_cont");
let friends_list_offline_cont_fragment = new DocumentFragment();

let friends_invites_game = _id("friends_invites_game");
let friends_invites_game_cont = _id("friends_invites_game_cont");
let friends_invites_game_cont_fragment = new DocumentFragment();
/*
let friends_invites_epic_in = _id("friends_invites_epic_in");
let friends_invites_epic_in_cont = _id("friends_invites_epic_in_cont");
let friends_invites_epic_in_cont_fragment = new DocumentFragment();
let friends_invites_epic_out = _id("friends_invites_epic_out");
let friends_invites_epic_out_cont = _id("friends_invites_epic_out_cont");
let friends_invites_epic_out_cont_fragment = new DocumentFragment();
*/
function handle_friend_list_update(friends) {
    /*
    "account_status" : not_friends, invite_sent, invite_received, friends or unknown 
    "presence_status": online, offline, away, do_not_disturb, extended_away and unknown 
    "in_this_application" : true 
    "application": "a3d939efc70848baaf996f6040d9cb19" for Diabotical, "launcher" when in launcher and online, 
    */

    /*
    presence_status -> offline
        -> "Offline" / (presence_status)
    else 
        -> check "application" == "launcher"
            -> true:
                "Online" (presence_status)
            -> false:
                -> check "in_this_application"
                    -> true: "In Diabotical" -> check MS for more infos on what the user is currently DOMStringList
                    -> false: "In other game"
    */
    
    /*
        Categories:
            Friends:
                "In Diabotical"
                    -> "In Menu"
                    -> "Playing"
                "Online"
                    -> "In Launcher"
                    -> "In Other Game"
                    -> "Away - In Launcher"
                "Offline"
            Invites
                "Diabotical" (Party / Lobby / Game invites)
                "Friend Requests" (Incoming, don't show outgoing)
                
    */

    let start = performance.now();

    handle_friends_user_ids_tracker(friends);

    var friends_in_diabotical = friends.filter(function(f) {
        if (f.account_status != "friends") return false;
        if (f.presence_status == "offline") return false;        
        if (f.in_this_application) {
            if (friends_in_party_user_ids.includes(f.user_id)) f.in_my_party = true;
            return true;
        }
        return false;
    });
    handle_friends_list_update_category(friends_list_in_diabotical, friends_list_in_diabotical_cont, friends_list_in_diabotical_fragment, friends_list_cache.in_diabotical, friends_in_diabotical, false);

    if (global_friends_online_data_requested == false) {
        get_friends_in_diabotical_data(friends_in_diabotical);
    }

    var friends_online = friends.filter(function(f) {
        if (f.account_status != "friends") return false;
        if (f.presence_status == "offline") return false;
        if (!f.in_this_application) return true;
        return false;
    });
    handle_friends_list_update_category(friends_list_online, friends_list_online_cont, friends_list_online_cont_fragment, friends_list_cache.online, friends_online, false);

    var friends_offline = friends.filter(function(f) {
        if (f.account_status != "friends") return false;
        if (f.presence_status == "offline") return true;
        return false;
    });
    handle_friends_list_update_category(friends_list_offline, friends_list_offline_cont, friends_list_offline_cont_fragment, friends_list_cache.offline, friends_offline, false);

    /*
    var invites_epic_in = friends.filter(function(f) {
        if (f.account_status == "invite_received") return true;
        return false;
    });
    global_friend_request_count = invites_epic_in.length;
    handle_friends_list_update_category(friends_invites_epic_in, friends_invites_epic_in_cont, friends_invites_epic_in_cont_fragment, friends_list_cache.invites_epic_in, invites_epic_in, true);

    var invites_epic_out = friends.filter(function(f) {
        if (f.account_status == "invite_sent") return true;
        return false;
    });
    handle_friends_list_update_category(friends_invites_epic_out, friends_invites_epic_out_cont, friends_invites_epic_out_cont_fragment, friends_list_cache.invites_epic_out, invites_epic_out, false);
    */

    let end = performance.now();
    //console.log("friendlist update in: "+(end-start)+"ms");

    update_friendlist_invite_count();
}

function get_friends_in_diabotical_data(friends) {
    let user_ids = [];
    for (let f of friends) {
        if (!friends_in_diabotical_user_ids.includes(f.user_id)) {
            friends_in_diabotical_user_ids.push(f.user_id);
            user_ids.push(f.user_id);
        }
    }
    for (let i=friends_in_diabotical_user_ids.length-1; i>=0; i--) {
        let found = false;
        for (let f of friends) {
            if (f.user_id == friends_in_diabotical_user_ids[i]) {
                found = true;
                break;
            }
        }
        if (!found) {
            friends_in_diabotical_user_ids.splice(i, 1);
        }
    }

    if (user_ids.length) {
        global_friends_online_data_requested = true;
        send_string("get-online-friends-data "+user_ids.join(":"));
    }

}

function handle_friends_in_diabotical_data(data) {
    if (global_friends_online_data_requested) global_friends_online_data_requested = false;

    for (let f of data) {
        for (let c of friends_list_cache.in_diabotical) {
            if (f.user_id == c.user_id) {
                c.el.dataset.party_privacy = f.party_privacy;
                c.el.querySelector(".avatar").style.backgroundImage = "url("+_avatarUrl(f.avatar)+")";
                break;
            }
        }
    }
}

function handle_friends_list_update_category(category, cont, fragment, cache, update, highlight) {
    let changed = false;

    let category_count = 0;
    for (let f of update) {
        let found = false;
        for (let c of cache) {
            if (f.account_status && f.account_status.startsWith("ms-invite-")) {
                if (f.user_id == c.user_id && f.type == c.type && f['type-id'] == c['type-id']) {
                    found = c;
                    break;
                }
            } else {
                if (f.user_id == c.user_id) {
                    found = c;
                    break;
                }
            }
        }
        if (found) {

            // Update the info if needed
            let name = found.el.querySelector(".name");
            if (name && name.textContent != f.name) {
                found.name = f.name;
                name.textContent = f.name;
            }

            if (f.account_status == "in_my_party") {
                let crown = found.el.querySelector(".party_crown");
                let desc = found.el.querySelector(".desc");
                if (f.party_leader) {
                    if (!crown && desc) _insertAfter(_createElement("div", "party_crown"), desc);
                } else {
                    if (crown) {
                        _empty_node(crown);
                    }
                }
            } else {
                let state = found.el.querySelector(".state");
                if (state) state.textContent = create_friend_state_string(f);
            }

            if (f.in_my_party) {
                found.el.classList.add("hidden");
            } else {
                found.el.classList.remove("hidden");
                category_count++;
            }

        } else {
            category_count++;
            // Create new entry
            let el = create_friend_entry(f);
            cache.push({
                "user_id": f.user_id,
                "type": f.type,
                "type-id": f['type-id'],
                "name": f.name,
                "el": el
            });
            changed = true;

        }
    }

    // Check for friends/invites that aren't here anymore
    let remove_idx = [];
    for (let i=0; i<cache.length; i++) {
        let found = false;
        for (let f of update) {
            if (f.account_status && f.account_status.startsWith("ms-invite-")) {
                if (f.user_id == cache[i].user_id && f.type == cache[i].type && f['type-id'] == cache[i]['type-id']) found = true;
            } else {
                if (f.user_id == cache[i].user_id) found = true;
            }
        }
        if (!found) {
            remove_idx.push(i);
            changed = true;
        }
    }

    // Remove entries from DOM and cache
    remove_idx.sort().reverse();
    for (let i of remove_idx) {
        cache.splice(i, 1);
    }

    // Sort the array
    cache.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
    for (let f of cache) {
        fragment.appendChild(f.el);
    }

    // Add fragment to DOM
    _empty(cont);
    cont.appendChild(fragment);

    
    // Update category count
    let count = category.querySelector(".head .count");
    _html(count, category_count);

    if (highlight && category_count > 0) {
        count.classList.add("hl");
    } else {
        count.classList.remove("hl");
    }

    if (changed) {
        refreshScrollbar(global_active_friends_list_cont);
    }
}

function create_friend_entry(f) {
    let friend = _createElement("div", "friend");

    friend.dataset.user_id = f.user_id;
    friend.dataset.account_status = f.account_status;
    friend.dataset.party_privacy = true; // Default to "private" until we get the info from the MS

    if (f.in_my_party) {
        friend.classList.add("hidden");
    }

    if (f.account_status && f.account_status.startsWith("ms-invite-")) {
        friend.dataset.type = f.type;
        friend.dataset.typeId = f['type-id'];
    } else if (f.in_this_application) {
        friend.dataset.in_this_application = f.in_this_application;
    }

    if (f.account_status == "friends") {
        if (f.presence_status == "offline") {
            friend.classList.add("offline");
        } else if (f.in_this_application) {
            friend.classList.add("ingame");
        }
        if (f.in_this_application) {
            friend.appendChild(_createElement("div", "avatar"));
        } else {
            friend.appendChild(_createElement("div", "accent"));    
        }
    } else if (f.account_status == "in_my_party") {
        friend.classList.add("inparty");

        let avatar = _createElement("div", "avatar")
        avatar.style.backgroundImage = "url("+_avatarUrl(f.data.avatar)+")";
        friend.appendChild(avatar);
    } else {
        friend.appendChild(_createElement("div", "accent"));
    }

    let desc = _createElement("div", "desc");
    desc.appendChild(_createElement("div", "name", f.name));

    if (f.account_status == "invite_received" || f.account_status.startsWith("ms-invite-")) {
        desc.appendChild(_createElement("div", "info", create_friend_info_string(f)));
    } else {
        if (f.presence_status && f.presence_status != "offline") {
            desc.appendChild(_createElement("div", "state", create_friend_state_string(f)));
        }
    }

    if (f.account_status == "in_my_party") {
        if (f.match_connected == 2) {
            desc.appendChild(_createElement("div", "state", localize("friends_list_state_playing")));
        } else {
            desc.appendChild(_createElement("div", "state", localize("friends_list_state_in_menu")));
        }
    }

    friend.appendChild(desc);

    if (f.account_status == "in_my_party" && f.party_leader) {
        friend.appendChild(_createElement("div", "party_crown"));
    }

    if (f.account_status == "invite_received" || f.account_status.startsWith("ms-invite-")) {
        friend.appendChild(_createElement("div", "exclamation"));
    }
    friend.appendChild(_createElement("div", "arrow"));

    setup_friends_list_friend_listeners(friend);

    return friend;
}

function create_friend_state_string(f) {
    let state = '';
    if (!f.in_this_application) {
        if (f.presence_status == "away" || f.presence_status == "extended_away") state += localize("friends_list_state_away") + " - ";
        if (f.presence_status == "do_not_disturb") state += localize("friends_list_state_dnd") + " - ";

        if (f.application == "launcher") {
            state += localize("friends_list_state_in_launcher");
        } else {
            if (f.rich_text && f.rich_text.trim().length) {
                state += f.rich_text;
            } else {
                state += localize("friends_list_state_in_other_game");
            }
        }
    } else {
        if (f.rich_text && f.rich_text.trim().length) {
            state += f.rich_text;
        } else {
            if (f.presence_status == "away" || f.presence_status == "extended_away") {
                state = localize("friends_list_state_away");
            } else {
                state = localize("friends_list_state_online");
            }
        }
    }
    return state;
}
function create_friend_info_string(f) {
    let info = '';
    if (f.account_status == "invite_received") {
        info = localize("friends_list_state_friend_invite_in");
    } else if (f.account_status == "ms-invite-party") {
        info = localize("friends_list_state_party_invite_in");
    } else if (f.account_status == "ms-invite-lobby") {
        info = localize("friends_list_state_lobby_invite_in");
    } else if (f.account_status == "ms-invite-match") {
        info = localize("friends_list_state_match_invite_in");
    }
    return info;
}

function setup_friends_list_friend_listeners(el) {
    let arrow = el.querySelector(".arrow");
    el.addEventListener("mouseenter", function() {
        arrow.classList.add("hover");
        engine.call("ui_sound", "ui_mouseover4");
    });

    el.addEventListener("mouseleave", function() {
        arrow.classList.remove("hover");
    });
    
    // Click on a friend handler
    el.addEventListener("click", function() {
        engine.call("ui_sound", "ui_click1");

        if (el.classList.contains("open")) {
            toggle_friend_open(el);
            return;
        }

        let open_friend = _id("friends_list_popup").querySelector(".friend.open");
        if (open_friend) {
            toggle_friend_open(open_friend);
        }
        toggle_friend_open(el);
    });
}

function toggle_friend_open(el) {
    if (el.classList.contains("open")) {
        // Close friend action menu
        el.classList.remove("open");
        el.querySelector(".arrow").classList.remove("open");
                
        close_friends_list_action_menu();
    } else {
        if (global_friends_list_action_menu_open) {
            close_friends_list_action_menu();
        }
        // Open friend action menu
        el.classList.add("open");
        el.querySelector(".arrow").classList.add("open");

        let rect_1 = el.getBoundingClientRect();
        let rect_2 = _id("friends_list_popup").getBoundingClientRect();
        let diff = rect_1.y - rect_2.y;

        create_action_menu(el, diff);
    }
}

function create_action_menu(el, top) {

    let menu = _createElement("div", "action_menu");
    menu.style.top = top+"px";

    let options = [];

    {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_view_profile")));
        option.addEventListener("click", function() {
            open_player_profile(el.dataset.user_id);
            close_friends_list();
        });
        menu.appendChild(option);
        options.push(option);
    }
    if (el.dataset.in_this_application == "true" && el.dataset.account_status == "friends") {

        if (el.dataset.party_privacy == "false" && !(el.dataset.user_id in global_party.members)) {
            let option_join = _createElement("div", "option");
            option_join.appendChild(_createElement("div", ["accent", "positive"]));
            option_join.appendChild(_createElement("div", "label", "Join Party"));
            option_join.addEventListener("click", function() {
                send_string("party-join-userid "+el.dataset.user_id);
                close_friends_list_action_menu();
            });
            menu.appendChild(option_join);
            options.push(option_join);
        }

        /*
        let option_msg = _createElement("div", "option");
        option_msg.appendChild(_createElement("div", ["accent", "positive"]));
        option_msg.appendChild(_createElement("div", "label", "Whisper"));
        menu.appendChild(option_msg);
        options.push(option_msg);
        */
    }

    if (el.dataset.account_status == "friends" && global_lobby_id != -1) {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_invite_lobby")));
        option.addEventListener("click", function() {
            send_json_data({"action": "invite-add", "type": "lobby", "user-id": el.dataset.user_id });
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }

    if (el.dataset.account_status == "friends") {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_invite_party")));
        option.addEventListener("click", function() {
            send_json_data({"action": "invite-add", "type": "party", "user-id": el.dataset.user_id });
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }

    if (el.dataset.account_status == "in_my_party" && bool_am_i_leader) {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_party_promote")));
        option.addEventListener("click", function() {
            send_json_data({"action": "party-promote", "user-id": el.dataset.user_id });
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }

    if (el.dataset.account_status == "in_my_party" && bool_am_i_leader) {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "negative"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_party_remove")));
        option.addEventListener("click", function() {
            send_json_data({"action": "party-remove", "user-id": el.dataset.user_id });
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }


    /*
    // NOT SUPPORTED BY EGS SDK
    if (el.dataset.account_status == "invite_received") {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_accept")));
        option.addEventListener("click", function() {
            engine.call("friend_accept", el.dataset.user_id);
            // remove the friend entry from DOM
            el.parentNode.removeChild(el);
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }
    */

    if (el.dataset.account_status.startsWith("ms-invite-")) {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_accept")));
        option.addEventListener("click", function() {
            send_invite_accept(el.dataset.type, el.dataset.typeId);
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }

    
    /*
    // NOT SUPPORTED BY EGS SDK
    if (el.dataset.account_status == "invite_received") {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "negative"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_decline")));
        option.addEventListener("click", function() {
            engine.call("friend_decline", el.dataset.user_id);
            // remove the friend entry from DOM
            el.parentNode.removeChild(el);
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }
    */

    if (el.dataset.account_status.startsWith("ms-invite-")) {
        menu.appendChild(_createElement("div", "separator"));

        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "negative"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_decline")));
        option.addEventListener("click", function() {
            send_invite_decline(el.dataset.type, el.dataset.typeId);
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }

    /*
    // NOT SUPPORTED BY EGS SDK
    if (el.dataset.account_status == "invite_sent") {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "negative"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_cancel")));
        option.addEventListener("click", function() {
            engine.call("friend_remove", el.dataset.user_id);
            // remove the friend entry from DOM
            el.parentNode.removeChild(el);
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
        options.push(option);
    }
    */

    /*
    // NOT SUPPORTED BY EGS SDK
    if (el.dataset.account_status == "friends") {
        let confirm = undefined;
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "negative"]));
        option.appendChild(_createElement("div", "label", "Remove EPIC Friend"));
        option.addEventListener("click", function() {
            if (!confirm) {
                confirm = _createElement("div", "confirm");
                let yes = _createElement("div", ["btn","first"], localize("menu_button_confirm"));
                _addButtonSounds(yes, 1);
                yes.addEventListener("click", function() {
                    engine.call("friend_remove", el.dataset.user_id);
                    // remove the friend entry from DOM
                    el.parentNode.removeChild(el);
                    close_friends_list_action_menu();
                });
                confirm.appendChild(yes);

                let no = _createElement("div", ["btn","last"], localize("menu_button_cancel"));
                _addButtonSounds(no, 1);
                no.addEventListener("click", function() {
                    _empty_node(confirm);
                    confirm = undefined;
                });
                confirm.appendChild(no);
                _insertAfter(confirm, option);
            }
        });
        menu.appendChild(option);
        options.push(option);
    }
    */

    for (let option of options) {
        _addButtonSounds(option, 1);

        option.addEventListener("mouseenter", function() {
            if (option) option.querySelector('.accent').classList.add("hover");
        });
        option.addEventListener("mouseleave", function() {
            if (option) {
                let accent = option.querySelector('.accent');
                if (accent) accent.classList.remove("hover");
            }
        });
    }

    menu.style.visibility = "hidden";
    _id("friends_list_action_menus").appendChild(menu);
    global_friends_list_action_menu_open = true;

    let friends_list_rect = _id("friends_list_popup").getBoundingClientRect();

    setTimeout(function() {
        let rect = menu.getBoundingClientRect();
        if ((rect.height + top) > friends_list_rect.height) {
            menu.style.top = (friends_list_rect.height - rect.height) + "px";
        }
        menu.style.visibility = "visible";
    });
}


function create_friends_settings_menu() {
    let menu = _createElement("div", ["action_menu","settings"]);
    menu.style.top = "0px";
    if (global_party.size > 1) {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "negative"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_party_leave")));
        option.addEventListener("click", function() {
            send_json_data({"action": "party-leave" });
            close_friends_list_action_menu();
        });
        menu.appendChild(option);
    }

    let settings = ["status"];
    if (bool_am_i_leader) settings.push("privacy");

    for (let setting of settings) {
        let category = _createElement("div", "category");
        let head = _createElement("div", "head");
        head.appendChild(_createElement("div", "label", localize("friends_list_label_setting_"+setting)));
        category.appendChild(head);

        let cont = _createElement("div", "cont");
        let options = [];
        if (setting == "status") options = ["online", "away"];
        if (setting == "privacy") options = ["public", "private"];

        for (let o of options) {
            let option = _createElement("div", ["option","small"]);
            let accent = _createElement("div", "accent")
            option.appendChild(accent);
            option.appendChild(_createElement("div", "label", localize("friends_list_label_setting_"+setting+"_"+o)));

            let check = _createElement("div", "check");
            option.appendChild(check);

            if (setting == "status" && friends_list_self_status == o) { check.classList.add("active"); }
            if (setting == "privacy") {
                if (o == "private" && global_party.privacy == true) check.classList.add("active"); 
                if (o == "public"  && global_party.privacy == false) check.classList.add("active"); 
            }

            _addButtonSounds(option, 1);

            option.addEventListener("mouseenter", function() {
                accent.classList.add("hover");
            });
            option.addEventListener("mouseleave", function() {
                accent.classList.remove("hover");
            });

            option.addEventListener("click", function() {
                let prev = cont.querySelector(".option .check.active");
                if (prev) prev.classList.remove("active");
                check.classList.add("active");

                if (setting == "privacy") {
                    let bool = (o == "private") ? true : false;
                    send_string("party-privacy "+bool);
                    global_party.privacy = bool;
                }
            });

            cont.appendChild(option);
            
        }
        category.appendChild(cont);
        menu.appendChild(category);
    }
    

    _id("friends_list_action_menus").appendChild(menu);
    global_friends_list_action_menu_open = true;
}

function update_friendlist_invite_count() {
    //let total = global_friend_request_count + global_friend_invites_count;
    let total = global_friend_invites_count;

    let count_cont = _id("friends_list_popup").querySelector(".friends_list_tabs .tab_invites .count");
    let count_cont2 = _id("friends_list_notice");
    if (total == 0) {
        count_cont.classList.remove("visible");
        count_cont2.style.display = "none";
    } else {
        count_cont.textContent = total;
        count_cont2.textContent = total;
        count_cont.classList.add("visible");
        count_cont2.style.display = "block";
    }
}



function update_friendlist_invites(invites) {

    let formatted_invites = [];
    for (let i of invites) {
        formatted_invites.push({
            "account_status": "ms-invite-"+i.type,
            "user_id": i["from-user-id"],
            "name": i["from-name"],
            "type-id": i["type-id"],
            "type":i.type,
        });
    }
    formatted_invites.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
    handle_friends_list_update_category(friends_invites_game, friends_invites_game_cont, friends_invites_game_cont_fragment, friends_list_cache.invites_game, formatted_invites, true);

    global_friend_invites_count = formatted_invites.length;
    update_friendlist_invite_count()
}

function update_friendlist_party(party) {

    let crown = friends_list_self.querySelector(".party_crown");
    let desc = friends_list_self.querySelector(".desc");
    if (party.leader && global_party.size > 1) {
        if (!crown && desc) {
            _insertAfter(_createElement("div", "party_crown"), desc);
        }
    } else {
        if (crown) _empty_node(crown);
    }

    let members = [];
    friends_in_party_user_ids = [];
    for (let m of party.data.members) {
        // Skip self
        if (m.user_id == party['user-id']) continue;
            
        m.account_status = "in_my_party";
        if (m.user_id == party.data['leader-id']) {
            m.party_leader = true;
        } else {
            m.party_leader = false;
        }
        members.push(m);
        friends_in_party_user_ids.push(m.user_id);
    }
    handle_friends_list_update_category(friends_list_party, friends_list_party_cont, friends_list_party_fragment, friends_list_cache.party, members, false);

    update_in_diabotical_party_visibility();
}

function update_in_diabotical_party_visibility() {
    let category_count = 0;
    _for_each_with_class_in_parent(friends_list_in_diabotical_cont, "friend", function(friend) {
        if (friends_in_party_user_ids.includes(friend.dataset.user_id)) {
            friend.classList.add("hidden");
        } else {
            friend.classList.remove("hidden");
            category_count++;
        }
    });

    let count = friends_list_in_diabotical.querySelector(".head .count");
    _html(count, category_count);
}

function friends_list_toggle_category(head) {
    let el = head.parentElement;
    if (el.classList.contains("open")) {
        el.classList.remove("open");
        el.querySelector(".head .arrow").classList.remove("open");
        el.querySelector(".cont").classList.remove("open");
    } else {
        el.classList.add("open");
        el.querySelector(".head .arrow").classList.add("open");
        el.querySelector(".cont").classList.add("open");
    }

    refreshScrollbar(global_active_friends_list_cont);
}



function popup_friends_list(open_only) {
    if (!global_friends_list_enabled) {
        anim_show(_id("friends_list_popup"), window.fade_time);
        global_friends_list_enabled = true;
        _id("friends_icon").classList.add("toggled");
        setTimeout(function() {
            // in settimeout otherwise it would fire instantly with the current "click" event
            _id("main_menu").addEventListener("click", friends_list_outside_click);
        },0);
    } else {
        if (open_only) return;
        close_friends_list();
    }
}

function close_friends_list() {
    anim_hide(_id("friends_list_popup"), window.fade_time);
    global_friends_list_enabled = false;
    _id("friends_icon").classList.remove("toggled");
    _id("main_menu").removeEventListener("click", friends_list_outside_click);
    close_friends_list_action_menu();
}

function close_friends_list_action_menu() {
    let friends_popup = _id("friends_list_popup");
    _empty(_id("friends_list_action_menus"));
    _for_each_with_selector_in_parent(friends_popup, ".friend.open", function(el) {
        el.classList.remove("open");
        el.querySelector(".arrow").classList.remove("open");
    });
    friends_popup.querySelector(".friends_list_self").classList.remove("open");
    global_friends_list_action_menu_open = false;
}

// Hide friends list when clicking outside of it
function friends_list_outside_click() {
    // Close any open menus first
    if (global_friends_list_action_menu_open) {
        close_friends_list_action_menu();
        return;
    }
    anim_hide(_id("friends_list_popup"), window.fade_time);
    global_friends_list_enabled = false;
    _id("friends_icon").classList.remove("toggled");
    _id("main_menu").removeEventListener("click", friends_list_outside_click);
}

function party_invite_friends() {
    change_friendlist_tab("friends");
    popup_friends_list(true);
}

function invite_friends() {
    change_friendlist_tab("friends");
    popup_friends_list(true);
}
    
function change_friendlist_tab(target) {
    let popup = _id("friends_list_popup");

    _for_each_with_selector_in_parent(popup, '.friends_list_tabs .tab', function(el) {
        if (el.dataset.id == target) {
            el.classList.add("active");
        } else {
            el.classList.remove("active");
        }
    });

    if (target == "invites") {
        _id("friends_list_cont_friends").classList.remove("active");
        _id("friends_list_cont_invites").classList.add("active");
    } else if (target == "friends") {
        _id("friends_list_cont_friends").classList.add("active");
        _id("friends_list_cont_invites").classList.remove("active");
    }
}

function handle_friends_user_ids_tracker(friends) {
    for (let f of friends) {
        if (!f.account_status == "friends") continue;

        if (!global_friends_user_ids.includes(f.user_id)) {
            global_friends_user_ids.push(f.user_id);
        }
    }

    for (let i=(global_friends_user_ids.length-1); i>=0; i--) {
        let found = false;
        for (let f of friends) {
            if (f.user_id == global_friends_user_ids[i]) {
                found = true;
                break;
            }
        }

        if (!found) {
            global_friends_user_ids.slice(i, 1);
        }
    }
}
