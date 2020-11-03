// user_id => user object, all friends in any states from any source
let global_friends = {};

// list of user_ids from epic for diff purposes between current and last update
let global_friends_from_epic = [];

let global_friends_list_enabled = false;
let global_friends_list_action_menu_open = false;
let global_active_friends_list_cont = undefined;
let global_friend_requests_count = 0;
let global_friend_invites_count = 0;
let global_friends_online_data_requested = false;

// user_id -> name map (epic friends)
let global_friends_list_map = {};

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
            friend_list_epic_update(json_data.friends);
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
    /*
    _for_each_with_selector_in_parent(friends_popup, ".friends_list_tabs .tab", function(tab) {
        tab.addEventListener("click", function() {
            if (tab.classList.contains("active")) return;

            let id = tab.dataset.id;
            change_friendlist_tab(id);

            close_friends_list_action_menu();
        });
    });
    */

    // Setup add friend handlers
    /*
    let cont = _id("friends_list_cont_invites");
    let input = cont.querySelector(".friend_request_cont input");
    input.addEventListener("keydown", function(e) {
        if (e.keyCode == 13) { //return
            send_friend_request();
        }
    });
    */
    
    // call : "friend_request": string user_id
    /*
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
    */
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

// Party list
let friends_list_party = _id("friends_list_party");
let friends_list_party_cont = _id("friends_list_party_cont");
let friends_list_party_fragment = new DocumentFragment();
// In Diabotical list
let friends_list_in_diabotical = _id("friends_list_in_diabotical");
let friends_list_in_diabotical_cont = _id("friends_list_in_diabotical_cont");
let friends_list_in_diabotical_fragment = new DocumentFragment();
// Online list
let friends_list_online = _id("friends_list_online");
let friends_list_online_cont = _id("friends_list_online_cont");
let friends_list_online_cont_fragment = new DocumentFragment();
// Offline list
let friends_list_offline = _id("friends_list_offline");
let friends_list_offline_cont = _id("friends_list_offline_cont");
let friends_list_offline_cont_fragment = new DocumentFragment();


// Friend requests list
let global_friend_requests = [];
let friends_list_requests = _id("friends_list_requests");
let friends_list_requests_cont = _id("friends_list_requests_cont");
let friends_list_requests_cont_fragment = new DocumentFragment();

// Lobby / Game / Match Invites
let global_friend_invites = [];
let friends_invites_game = _id("friends_invites_game");
let friends_invites_game_cont = _id("friends_invites_game_cont");
let friends_invites_game_cont_fragment = new DocumentFragment();

function friend_list_epic_update(epic_friends) {
    let user_ids = {};
    for (let f of epic_friends) {
        user_ids[f.user_id] = true;

        if (!global_friends.hasOwnProperty(f.user_id)) {
            create_friend_from_epic(f);
        } else {
            update_friend_from_epic(global_friends[f.user_id], f);
        }
    }

    // list of user_ids from epic for diff purposes between current and last update
    let global_friends_from_epic = [];
    for (let user_id of global_friends_from_epic) {
        // Check if the user_id is still an epic friend according to this update
        if (user_ids.hasOwnProperty(user_id)) continue; 

        // User appears to not be an epic friend anymore
        remove_friend_from_epic(user_id);
    }

    friend_list_update("party");
    friend_list_update("ingame");
    friend_list_update("online");
    friend_list_update("offline");

    if (global_friends_online_data_requested == false) {
        get_friends_in_diabotical_data();
    }

    refreshScrollbar(global_active_friends_list_cont);
}

function friend_requests_update() {
    global_friend_requests.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
    for (let f of global_friend_requests) {
        friends_list_requests_cont_fragment.appendChild(f.el);
    }

    // Add fragment to DOM
    _empty(friends_list_requests_cont);
    friends_list_requests_cont.appendChild(friends_list_requests_cont_fragment);

    // Update category count
    let count = friends_list_requests.querySelector(".head .count");
    count.textContent = global_friend_requests.length;
    global_friend_requests_count = global_friend_requests.length;

    if (global_friend_requests.length == 0) friends_list_requests.classList.add("hidden");
    else friends_list_requests.classList.remove("hidden");

    refreshScrollbar(global_active_friends_list_cont);
    update_friendlist_invite_count();
}

function friend_invites_update() {
    global_friend_invites.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
    for (let f of global_friend_invites) {
        friends_invites_game_cont_fragment.appendChild(f.el);
    }

    // Add fragment to DOM
    _empty(friends_invites_game_cont);
    friends_invites_game_cont.appendChild(friends_invites_game_cont_fragment);

    // Update category count
    let count = friends_invites_game.querySelector(".head .count");
    count.textContent = global_friend_invites.length;
    global_friend_invites_count = global_friend_invites.length;

    if (global_friend_invites.length == 0) friends_invites_game.classList.add("hidden");
    else friends_invites_game.classList.remove("hidden");

    refreshScrollbar(global_active_friends_list_cont);
    update_friendlist_invite_count();
}

function friend_list_update(category, skip_dom) {

    if (category == "party") {
        category_cont = friends_list_party;
        friends_cont = friends_list_party_cont;
        fragment = friends_list_party_fragment;
    } else if (category == "ingame") {
        category_cont = friends_list_in_diabotical;
        friends_cont = friends_list_in_diabotical_cont;
        fragment = friends_list_in_diabotical_fragment;
    } else if (category == "online") {
        category_cont = friends_list_online;
        friends_cont = friends_list_online_cont;
        fragment = friends_list_online_cont_fragment;
    } else if (category == "offline") {
        category_cont = friends_list_offline;
        friends_cont = friends_list_offline_cont;
        fragment = friends_list_offline_cont_fragment;
    }

    let users = [];
    for (let user_id in global_friends) {
        if (global_friends[user_id].category == category) users.push(global_friends[user_id]);
    }

    // Sort the array
    if (!skip_dom) {
        users.sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
        for (let f of users) {
            fragment.appendChild(f.el);
        }

        // Add fragment to DOM
        _empty(friends_cont);
        friends_cont.appendChild(fragment);
    }

    // Update category count
    let count = category_cont.querySelector(".head .count");
    count.textContent = users.length;

    if (users.length == 0) category_cont.classList.add("hidden");
    else category_cont.classList.remove("hidden");
}

function assign_friend_to_category(friend) {
    let category = "";

    if (friend.inparty) {
        category = "party";
    } else if (friend.ingame) {
        category = "ingame";
    } else {
        if (friend.online) {
            category = "online";
        } else {
            category = "offline";
        }
    }

    return category;
}

function create_friend_from_epic(data) {

    if (data.account_status !== "friends") return;

    global_friends[data.user_id] = {
        "user_id": data.user_id,
        "name": data.name,
        "avatar": "",
        "epicfriend": true,                                            // Epic friend relationship
        "masterfriend": false,                                         // MS friend relationship
        "online": (data.presence_status == "offline") ? false : true,  // Whether the user is online or offline in the epic client
        "ingame": (data.in_this_application) ? true : false,           // Whether the user is in diabotical or not, this gets overrwritten by master updates if friends in both
        "epic_ingame": (data.in_this_application) ? true : false,      // Store the epic state too
        "inparty": (friends_in_party_user_ids.includes(data.user_id)) ? true : false,
        "gamestate": "",
        "party_privacy": true,                                         // true = party is private, false = party is public
        "friendship_id": null,                                         // MS friendship id
        "friendship_state": 0,                                         // MS friendship state, 0 = friends, 1 = incoming request pending approval
        // DOM Element ref:
        "el": null,
        "category": "",
    };
    global_friends[data.user_id].el = create_friend_el(global_friends[data.user_id]);
    global_friends[data.user_id].category = assign_friend_to_category(global_friends[data.user_id]);
}

function update_friend_from_epic(friend, data) {
    if (data.account_status !== "friends") {
        remove_friend_from_epic(friend.user_id);
        return;
    }

    friend.name = data.name;
    friend.epicfriend = true;
    friend.online = (data.presence_status == "offline") ? false : true;
    friend.ingame = (data.in_this_application) ? true : false;
    friend.epic_ingame = (data.in_this_application) ? true : false;
    friend.el = create_friend_el(friend);
    friend.category = assign_friend_to_category(friend);
}

function remove_friend_from_epic(user_id) {
    if (!global_friends.hasOwnProperty(user_id)) return;

    if (global_friends[user_id].masterfriend || global_friends[user_id].inparty) {
        global_friends[user_id].epicfriend = false;
        global_friends[user_id].online = false;
        global_friends[user_id].el = create_friend_el(global_friends[user_id]);
        global_friends[user_id].category = assign_friend_to_category(global_friends[user_id]);
    } else {
        delete global_friends[user_id];
    }
}

function friend_list_master_update(diabotical_friends) {
    /*
    diabotical_friends = [[
     0   user_id,
     1   name,
     2   avatar,
     3   online,
     4   gamestate,
     5   party_privacy,
     6   friendship_id,
     7   friendship_state,
    ],...];
    */

    global_friend_requests.length = 0;

    for (let friend of diabotical_friends) {
        if (friend[7] == 1) {         
            global_friend_requests.push(create_friend_request(friend));
        } else {
            if (!global_friends.hasOwnProperty(friend[0])) {
                create_friend_from_master(friend);
            } else {
                update_friend_from_master(global_friends[friend[0]], friend);
            }
        }   
    }

    friend_list_update("party");
    friend_list_update("ingame");
    friend_list_update("online");
    friend_list_update("offline");

    friend_requests_update();

    refreshScrollbar(global_active_friends_list_cont);
}

function friend_list_master_update_partial(data) {
    /*
    let data = [
        user_id,
        name,
        avatar,
        online,
        gamestate,
        party_privacy
    ];
    */
   if (!global_friends.hasOwnProperty(data[0])) return;

   global_friends[data[0]].name = data[1];
   global_friends[data[0]].avatar = data[2];
   global_friends[data[0]].ingame = data[3];
   global_friends[data[0]].gamestate = data[4];
   global_friends[data[0]].party_privacy = data[5];

   let prev_category = global_friends[data[0]].category;
   global_friends[data[0]].category = assign_friend_to_category(global_friends[data[0]]);

   let new_el = create_friend_el(global_friends[data[0]]); 
   if (global_friends[data[0]].category == prev_category) {
       _replaceNode(global_friends[data[0]].el, new_el);
       global_friends[data[0]].el = new_el;
   } else {
       _remove_node(global_friends[data[0]].el);
       global_friends[data[0]].el = new_el;
       friend_list_update(global_friends[data[0]].category);
       friend_list_update(prev_category, true);
   }
}

function create_friend_request(data) {
    let req = {
        "user_id": data[0],
        "name": data[1],
        "avatar": data[2],
        // DOM Element ref:
        "el": null,
    };
    req.el = create_friend_request_el(req);

    return req;
}

function create_friend_invite(data) {
    let req = {
        "user_id": data["from-user-id"],
        "name": data["from-name"],
        "type": data["type"],
        "type-id": data["type-id"],
        // DOM Element ref:
        "el": null,
    };
    req.el = create_friend_invite_el(req);

    return req;
}

function create_friend_from_master(data) {
    global_friends[data[0]] = {
        "user_id": data[0],
        "name": data[1],
        "avatar": data[2],
        "epicfriend": false,                    // Epic friend relationship
        "masterfriend": true,                   // MS friend relationship
        "online": false,                        // Whether the user is online or offline in the epic client
        "ingame": data[3],                      // Whether the user is in diabotical or not
        "epic_ingame": false,
        "inparty": (friends_in_party_user_ids.includes(data[0])) ? true : false,
        "gamestate": data[4],
        "party_privacy": data[5],               // true = party is private, false = party is public
        "friendship_id": data[6],               // MS friendship id
        "friendship_state": data[7],            // MS friendship state, 0 = friends, 1 = incoming request pending approval, -1 = no friendship of any kind (e.g. a party member friend from someone else)
        // DOM Element ref:
        "el": null,
        "category": "",
    };
    global_friends[data[0]].el = create_friend_el(global_friends[data[0]]);
    global_friends[data[0]].category = assign_friend_to_category(global_friends[data[0]]);

    return global_friends[data[0]];
}

function update_friend_from_master(friend, data) {
    friend.masterfriend = true;
    friend.name = data[1];
    friend.ingame = data[3];
    friend.gamestate = data[4];
    friend.party_privacy = data[5];
    friend.friendship_state = data[7];

    let prev_category = friend.category;
    friend.category = assign_friend_to_category(friend);

    let new_el = create_friend_el(friend); 
    if (friend.category == prev_category) {
        _replaceNode(friend.el, new_el);
        friend.el = new_el;
    } else {
        _remove_node(friend.el);
        friend.el = new_el;
        friend_list_update(friend.category);
    }
}

function remove_friend_from_master(user_id) {
    if (!global_friends.hasOwnProperty(user_id)) return;

    if (global_friends[user_id].epicfriend || global_friends[user_id].inparty) {
        global_friends[user_id].masterfriend = false;
        global_friends[user_id].friendship_id = null;
        global_friends[user_id].friendship_state = -1;
        global_friends[user_id].ingame = global_friends[user_id].epic_ingame;

        let prev_category = global_friends[user_id].category;
        global_friends[user_id].category = assign_friend_to_category(global_friends[user_id]);

        let new_el = create_friend_el(global_friends[user_id]);
        if (global_friends[user_id].category == prev_category) {
            _replaceNode(global_friends[user_id].el, new_el);
            global_friends[user_id].el = new_el;
        } else {
            _remove_node(global_friends[user_id].el);
            global_friends[user_id].el = new_el;
            friend_list_update(global_friends[user_id].category);
            friend_list_update(prev_category, true);
        }
    } else {
        _remove_node(global_friends[user_id].el);
        friend_list_update(global_friends[user_id].category, true);
        delete global_friends[user_id];
    }
}

function remove_friend_request(user_id) {
    for (let i=0; i<global_friend_requests.length; i++) {
        if (global_friend_requests[i].user_id == user_id) {
            if (global_friend_requests[i].el !== null) _remove_node(global_friend_requests[i].el);
            global_friend_requests.splice(i, 1);
            break;
        }
    }

    friend_requests_update();
}

function friend_list_add_request(data) {
    // data format same as full friend list update

    for (let req of global_friend_requests) {
        if (data[0] == req.user_id) return;
    }

    global_friend_requests.push(create_friend_request(data));
    friend_requests_update();

    queue_dialog_msg({
        "title": localize("friends_list_title_friend_request"),
        "msg": localize_ext("friends_list_state_friend_request_in", {"name": data[1]}),
        "duration": 20000,
        "options": [
            {
                "button": "accept",
                "label": localize("friends_list_action_accept"),
                "callback": function() {
                    send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, data[0]+":a");
                    remove_friend_request(data[0]);
                }
            }, 
            {
                "button": "decline",
                "label": localize("friends_list_action_decline"),
                "callback": function() {
                    send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, data[0]+":d");
                    remove_friend_request(data[0]);
                }
            }, 
        ]
    });
}

function friend_list_request_accepted(friend) {
    // data format same as full friend list update
    remove_friend_request(friend[0]);

    if (!global_friends.hasOwnProperty(friend[0])) {
        create_friend_from_master(friend);
    } else {
        update_friend_from_master(global_friends[friend[0]], friend);
    }

    friend_list_update(global_friends[friend[0]].category);
}

function friend_list_invites_update(invites) {
    global_friend_invites.length = 0;
    for (let i of invites) {
        // Only show invites from friends
        if (!global_friends.hasOwnProperty(i['from-user-id'])) return;
        
        global_friend_invites.push(create_friend_invite(i));
    }
    
    friend_invites_update();
}

function send_friend_request() {
    let cont = _id("friends_list_cont_invites");
    let input = cont.querySelector(".friend_request_cont input");

    let name = input.value;
    input.value = '';
    if (name.trim().length == 0) return;

    send_string(CLIENT_COMMAND_GET_USERID_FROM_NAME, name, "userid-from-name", function(data) {
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
function update_friend_list_self(leader, data) {
    if (!friends_list_self) friends_list_self = _id("friends_list_popup").querySelector(".friends_list_self");

    friends_list_self.querySelector(".desc .name").textContent = data.name;
    if (data.match_connected) {
        friends_list_self.querySelector(".desc .state").textContent = localize("friends_list_state_playing");
    } else {
        friends_list_self.querySelector(".desc .state").textContent = localize("friends_list_state_in_menu");
    }

    let crown = friends_list_self.querySelector(".party_crown");
    let desc = friends_list_self.querySelector(".desc");
    if (leader && global_party.size > 1) {
        if (!crown && desc) {
            _insertAfter(_createElement("div", "party_crown"), desc);
        }
    } else {
        if (crown) _remove_node(crown);
    }

    friends_list_self.querySelector(".avatar").style.backgroundImage = "url("+_avatarUrl(data.customizations.avatar)+")";
}

function update_friendlist_party(party) {

    friends_in_party_user_ids.length = 0;
    let update_categories = { "party": true };
    for (let m of party.data.members) {

        // Self
        if (m.user_id == party['user-id']) {
            update_friend_list_self(party.leader, m);
            continue;
        }

        if (global_friends.hasOwnProperty(m.user_id)) {
            // We have an existing friendlist entry for this user_id, update it
            global_friends[m.user_id].inparty = true;
            global_friends[m.user_id].party_leader = (m.user_id == party.data['leader-id']);
            global_friends[m.user_id].gamestate = (m.match_connected) ? "p" : "m",

            update_categories[global_friends[m.user_id].category] = true;
            global_friends[m.user_id].category = "party";
            update_categories["party"] = true;

            global_friends[m.user_id].el = create_friend_el(global_friends[m.user_id]);
        } else {
            // We don't have a friendlist entry for this user_id, create it
            global_friends[m.user_id] = {
                "user_id": m.user_id,
                "name": m.name,
                "avatar": m.customizations.avatar,
                "epicfriend": false,                    // Epic friend relationship
                "masterfriend": false,                  // MS friend relationship
                "online": false,                        // Whether the user is online or offline in the epic client
                "ingame": true,                         // Whether the user is in diabotical or not
                "inparty": true,
                "gamestate": (m.match_connected) ? "p" : "m",
                "friendship_id": "",               // MS friendship id
                "friendship_state": -1,            // MS friendship state, 0 = friends, 1 = incoming request pending approval
                // DOM Element ref:
                "el": null,
                "category": "party",
            };
            global_friends[m.user_id].el = create_friend_el(global_friends[m.user_id]);

        }
        friends_in_party_user_ids.push(m.user_id);
    }

    // Check for people not in the party anymore
    for (let user_id in global_friends) {
        if (global_friends[user_id].category == "party") {
            if (!friends_in_party_user_ids.includes(user_id)) {
                // Move the user thats not in the party anymore to the correct category, or delete it if its not actually a friend
                if (global_friends[user_id].epicfriend || global_friends[user_id].masterfriend) {
                    global_friends[user_id].inparty = false;
                    global_friends[user_id].category = assign_friend_to_category(global_friends[user_id]);
                    global_friends[user_id].el = create_friend_el(global_friends[user_id]);
                    update_categories[global_friends[user_id].category] = true;
                } else {
                    delete (global_friends[user_id]);
                }
            }
        }
    }

    // Rerender all affected categories
    for (let category in update_categories) {
        friend_list_update(category);
    }
}

function handle_friend_list_update(friends) {
    return;
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

    //console.log(_dump(friends));

    let start = performance.now();

    for (let f of friends) {
        global_friends_list_map[f.user_id] = f.name;
    }

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

    let end = performance.now();
    //console.log("friendlist update in: "+(end-start)+"ms");

    update_friendlist_invite_count();
}

// Request data for EPIC only friends
function get_friends_in_diabotical_data() {
    let user_ids = [];
    /*
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
    */

    for (let user_id in global_friends) {
        if (global_friends[user_id].epicfriend && !global_friends[user_id].masterfriend && global_friends[user_id].ingame) {
            user_ids.push(user_id);
        }
    }

    if (user_ids.length) {
        global_friends_online_data_requested = true;
        send_string(CLIENT_COMMAND_GET_ONLINE_FRIENDS_DATA, user_ids.join(":"));
    }

}

function handle_friends_in_diabotical_data(data) {
    if (global_friends_online_data_requested) global_friends_online_data_requested = false;

    for (let f of data) {
        // f[0] = user_id
        // f[1] = privacy
        // f[2] = avatar

        if (global_friends.hasOwnProperty(f[0])) {
            global_friends[f[0]].party_privacy = f[1];
            global_friends[f[0]].avatar = f[2];

            let new_el = create_friend_el(global_friends[f[0]]);
            _replaceNode(global_friends[f[0]].el, new_el);
            global_friends[f[0]].el = new_el;
        }
    }
}

/*
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
                        _remove_node(crown);
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
*/

function create_friend_el(f) {
    let friend = _createElement("div", "friend");
    friend.dataset.type = "friend";
    friend.dataset.user_id = f.user_id;
    friend.dataset.party_privacy = true; // Default to "private" until we get the info from the MS

    /*
        "user_id": data.user_id,
        "name": data.name,
        "avatar": "",
        "epicfriend": true,                                            // Epic friend relationship
        "masterfriend": false,                                         // MS friend relationship
        "online": (data.presence_status == "offline") ? false : true,  // Whether the user is online or offline in the epic client
        "ingame": (data.in_this_application) ? true: false,            // Whether the user is in diabotical or not
        "inparty": true/false,
        "gamestate": "",
        "party_privacy": true,                                         // true = party is private, false = party is public
        "friendship_id": null,                                         // MS friendship id
        "friendship_state": 0,                                         // MS friendship state, 0 = friends, 1 = incoming request pending approval
    */

    if (f.inparty) {
        friend.classList.add("inparty");

        let avatar = _createElement("div", "avatar")
        avatar.style.backgroundImage = "url("+_avatarUrl(f.avatar)+")";
        friend.appendChild(avatar);

    } else if (f.ingame) {
        friend.classList.add("ingame");

        let avatar = _createElement("div", "avatar")
        avatar.style.backgroundImage = "url("+_avatarUrl(f.avatar)+")";
        friend.appendChild(avatar);

    } else {
        if (f.online) {
            friend.classList.add("online");
            friend.appendChild(_createElement("div", "accent"));
        } else {
            friend.classList.add("offline");
            friend.appendChild(_createElement("div", "accent"));
        }
    }

    let desc = _createElement("div", "desc");
    desc.appendChild(_createElement("div", "name", f.name));

    // gamestate changes are currently only being sent with party updates
    //if (f.inparty || (f.ingame && f.gamestate.length)) {
    if (f.inparty) {
        if (f.gamestate == "m") {
            desc.appendChild(_createElement("div", "state", localize("friends_list_state_in_menu")));
        } else if (f.gamestate == "p") {
            desc.appendChild(_createElement("div", "state", localize("friends_list_state_playing")));
        }
    }

    friend.appendChild(desc);

    // Party crown if leader
    if (f.inparty && f.user_id == global_party.leader_id) {
        friend.appendChild(_createElement("div", "party_crown"));
    }

    let icon_cont = _createElement("div", "icons");
    if (f.epicfriend)   icon_cont.appendChild(_createElement("div", ["icon", "epic"]));
    if (f.masterfriend) icon_cont.appendChild(_createElement("div", ["icon", "master"]));
    friend.appendChild(icon_cont);

    friend.appendChild(_createElement("div", "arrow"));

    setup_friends_list_friend_listeners(friend);

    return friend;
}

function create_friend_request_el(f) {
    let friend = _createElement("div", "friend");
    friend.dataset.user_id = f.user_id;
    friend.dataset.type = "request";

    let avatar = _createElement("div", "avatar")
    avatar.style.backgroundImage = "url("+_avatarUrl(f.avatar)+")";
    friend.appendChild(avatar);

    let desc = _createElement("div", "desc");
    desc.appendChild(_createElement("div", "name", f.name));

    // Incoming friend invite info
    desc.appendChild(_createElement("div", "info", localize("friends_list_title_friend_request")));
    friend.appendChild(desc);

    // Add an exclamation mark if this is a notification 
    friend.appendChild(_createElement("div", "exclamation"));
    friend.appendChild(_createElement("div", "arrow"));

    setup_friends_list_friend_listeners(friend);

    return friend;
}

function create_friend_invite_el(f) {
    let friend = _createElement("div", "friend");
    friend.dataset.user_id = f.user_id;
    friend.dataset.type = "invite";
    friend.dataset.inviteType = f["type"];
    friend.dataset.typeId = f["type-id"];

    friend.appendChild(_createElement("div", "accent"));

    let desc = _createElement("div", "desc");
    desc.appendChild(_createElement("div", "name", f.name));

    // Incoming friend invite info
    let info = "";
    if (f.type == "party") {
        info = localize("friends_list_title_party_invite");
    } else if (f.type == "lobby") {
        info = localize("friends_list_title_lobby_invite");
    } else if (f.type == "match") {
        info = localize("friends_list_title_match_invite");
    }
    desc.appendChild(_createElement("div", "info", info));

    friend.appendChild(desc);

    // Add an exclamation mark if this is a notification 
    friend.appendChild(_createElement("div", "exclamation"));
    friend.appendChild(_createElement("div", "arrow"));

    setup_friends_list_friend_listeners(friend);

    return friend;
}

/*
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
        avatar.style.backgroundImage = "url("+_avatarUrl(f.customizations.avatar)+")";
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
        if (f.match_connected == false) {
            desc.appendChild(_createElement("div", "state", localize("friends_list_state_in_menu")));
        } else {
            desc.appendChild(_createElement("div", "state", localize("friends_list_state_playing")));
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
*/

function create_friend_state_string(f) {
    let state = '';
    if (!f.in_this_application) {
        if (f.presence_status == "away" || f.presence_status == "extended_away") state += localize("friends_list_state_away") + " - ";
        if (f.presence_status == "do_not_disturb") state += localize("friends_list_state_dnd") + " - ";

        if (f.application == "launcher" || f.application == "") {
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

function setup_friends_list_friend_listeners(el) {
    let arrow = el.querySelector(".arrow");
    el.addEventListener("mouseenter", function() {
        arrow.classList.add("hover");
        _play_mouseover4();
    });

    el.addEventListener("mouseleave", function() {
        arrow.classList.remove("hover");
    });
    
    // Click on a friend handler
    el.addEventListener("click", function() {
        _play_click1();

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
    let user_id = el.dataset.user_id;
    let type = el.dataset.type;

    // View Profile
    if (type == "friend" || type == "request") {
        let option = _createElement("div", "option");
        option.appendChild(_createElement("div", ["accent", "positive"]));
        option.appendChild(_createElement("div", "label", localize("friends_list_action_view_profile")));
        option.addEventListener("click", function() {
            open_player_profile(user_id);
            close_friends_list();
        });
        menu.appendChild(option);
        options.push(option);
    }

    // Any Friend related actions (also non friends within parties)
    if (type == "friend") {
        if (global_friends.hasOwnProperty(user_id)) {
            // Send Message
            if (global_friends[user_id].friendship_state == 0) {
                let option_join = _createElement("div", "option");
                option_join.appendChild(_createElement("div", ["accent", "positive"]));
                option_join.appendChild(_createElement("div", "label", localize("friends_list_action_message")));
                option_join.addEventListener("click", function() {
                    main_chat_message_user(user_id, global_friends[user_id].name);
                    close_friends_list_action_menu();
                });
                menu.appendChild(option_join);
                options.push(option_join);
            }

            // Send Friend Request
            if (!global_friends[user_id].masterfriend) {
                let option = _createElement("div", "option");
                option.appendChild(_createElement("div", ["accent", "positive"]));
                option.appendChild(_createElement("div", "label", localize("friends_list_action_friend_request")));
                option.addEventListener("click", function() {
                    send_string(CLIENT_COMMAND_SEND_FRIEND_REQUEST, user_id);
                    close_friends_list_action_menu();
                });
                menu.appendChild(option);
                options.push(option);
            }
            
            // Join Party
            if (global_friends[user_id].friendship_state == 0 && global_friends[user_id].ingame) {
                if (global_friends[user_id].party_privacy == false && !(user_id in global_party.members)) {
                    let option_join = _createElement("div", "option");
                    option_join.appendChild(_createElement("div", ["accent", "positive"]));
                    option_join.appendChild(_createElement("div", "label", localize("friends_list_action_party_join")));
                    option_join.addEventListener("click", function() {
                        send_string(CLIENT_COMMAND_JOIN_USERID_PARTY, user_id);
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

            // Invite to Lobby
            if (global_friends[user_id].friendship_state == 0 && global_lobby_id != -1) {
                let option = _createElement("div", "option");
                option.appendChild(_createElement("div", ["accent", "positive"]));
                option.appendChild(_createElement("div", "label", localize("friends_list_action_invite_lobby")));
                option.addEventListener("click", function() {
                    send_json_data({"action": "invite-add", "type": "lobby", "user-id": user_id });
                    close_friends_list_action_menu();
                });
                menu.appendChild(option);
                options.push(option);
            }

            // Invite to Party
            if (global_friends[user_id].friendship_state == 0 && !(user_id in global_party.members)) {
                let option = _createElement("div", "option");
                option.appendChild(_createElement("div", ["accent", "positive"]));
                option.appendChild(_createElement("div", "label", localize("friends_list_action_invite_party")));
                option.addEventListener("click", function() {
                    send_json_data({"action": "invite-add", "type": "party", "user-id": user_id });
                    close_friends_list_action_menu();
                });
                menu.appendChild(option);
                options.push(option);
            }
    
        }

        // Promote to Party Leader
        if ((user_id in global_party.members) && bool_am_i_leader) {
            let option = _createElement("div", "option");
            option.appendChild(_createElement("div", ["accent", "positive"]));
            option.appendChild(_createElement("div", "label", localize("friends_list_action_party_promote")));
            option.addEventListener("click", function() {
                send_json_data({"action": "party-promote", "user-id": user_id });
                close_friends_list_action_menu();
            });
            menu.appendChild(option);
            options.push(option);
        }

        // Remove from Party
        if ((user_id in global_party.members) && bool_am_i_leader) {
            let option = _createElement("div", "option");
            option.appendChild(_createElement("div", ["accent", "negative"]));
            option.appendChild(_createElement("div", "label", localize("friends_list_action_party_remove")));
            option.addEventListener("click", function() {
                send_json_data({"action": "party-remove", "user-id": user_id });
                close_friends_list_action_menu();
            });
            menu.appendChild(option);
            options.push(option);
        }

        // Remove Master Friend
        if (global_friends.hasOwnProperty(user_id) && global_friends[user_id].friendship_state == 0 && global_friends[user_id].masterfriend) {
            menu.appendChild(_createElement("div", "separator"));

            let confirm = undefined;
            let option = _createElement("div", "option");
            option.appendChild(_createElement("div", ["accent", "negative"]));
            option.appendChild(_createElement("div", "label", localize("friends_list_action_remove_friend")));
            option.addEventListener("click", function() {
                if (!confirm) {
                    confirm = _createElement("div", "confirm");
                    let yes = _createElement("div", ["btn","first"], localize("menu_button_confirm"));
                    _addButtonSounds(yes, 1);
                    yes.addEventListener("click", function() {
                        send_string(CLIENT_COMMAND_REMOVE_FRIEND, user_id);
                        remove_friend_from_master(user_id);
                        close_friends_list_action_menu();
                    });
                    confirm.appendChild(yes);

                    let no = _createElement("div", ["btn","last"], localize("menu_button_cancel"));
                    _addButtonSounds(no, 1);
                    no.addEventListener("click", function() {
                        _remove_node(confirm);
                        confirm = undefined;
                    });
                    confirm.appendChild(no);
                    _insertAfter(confirm, option);
                }
            });
            menu.appendChild(option);
            options.push(option);
        }
    }

    // Invite Accept / Deny
    if (type == "invite") {
        let option_a = _createElement("div", "option");
        option_a.appendChild(_createElement("div", ["accent", "positive"]));
        option_a.appendChild(_createElement("div", "label", localize("friends_list_action_accept")));
        option_a.addEventListener("click", function() {
            send_invite_accept(el.dataset.inviteType, el.dataset.typeId);
            close_friends_list_action_menu();
        });
        menu.appendChild(option_a);
        options.push(option_a);

        menu.appendChild(_createElement("div", "separator"));

        let option_d = _createElement("div", "option");
        option_d.appendChild(_createElement("div", ["accent", "negative"]));
        option_d.appendChild(_createElement("div", "label", localize("friends_list_action_decline")));
        option_d.addEventListener("click", function() {
            send_invite_decline(el.dataset.inviteType, el.dataset.typeId);
            close_friends_list_action_menu();
        });
        menu.appendChild(option_d);
        options.push(option_d);
    }

    // Friend Request Accept / Deny
    if (type == "request") {
        let option_a = _createElement("div", "option");
        option_a.appendChild(_createElement("div", ["accent", "positive"]));
        option_a.appendChild(_createElement("div", "label", localize("friends_list_action_accept")));
        option_a.addEventListener("click", function() {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, user_id+":a");
            remove_friend_request(user_id);
            close_friends_list_action_menu();
        });
        menu.appendChild(option_a);
        options.push(option_a);

        menu.appendChild(_createElement("div", "separator"));

        let option_d = _createElement("div", "option");
        option_d.appendChild(_createElement("div", ["accent", "negative"]));
        option_d.appendChild(_createElement("div", "label", localize("friends_list_action_decline")));
        option_d.addEventListener("click", function() {
            send_string(CLIENT_COMMAND_HANDLE_FRIEND_REQUEST, user_id+":d");
            remove_friend_request(user_id);
            close_friends_list_action_menu();
        });
        menu.appendChild(option_d);
        options.push(option_d);
    }

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

    req_anim_frame(() => {
        let rect = menu.getBoundingClientRect();
        if ((rect.height + top) > friends_list_rect.height) {
            menu.style.top = (friends_list_rect.height - rect.height) + "px";
        }
        menu.style.visibility = "visible";
    },2);
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

    let settings = [];
    if (bool_am_i_leader) settings.push("privacy");
    if (global_self.friend_requests != null) settings.push("friend_requests");

    for (let setting of settings) {
        let category = _createElement("div", "category");
        let head = _createElement("div", "head");
        head.appendChild(_createElement("div", "label", localize("friends_list_label_setting_"+setting)));
        category.appendChild(head);

        let cont = _createElement("div", "cont");
        let options = [];
        if (setting == "privacy") options = ["public", "private"];
        if (setting == "friend_requests") options = ["enabled", "disabled"];

        for (let o of options) {
            let option = _createElement("div", ["option","small"]);
            let accent = _createElement("div", "accent")
            option.appendChild(accent);
            option.appendChild(_createElement("div", "label", localize("friends_list_label_setting_"+setting+"_"+o)));

            let check = _createElement("div", "check");
            option.appendChild(check);

            if (setting == "privacy") {
                if (o == "private" && global_party.privacy == true) check.classList.add("active"); 
                if (o == "public"  && global_party.privacy == false) check.classList.add("active"); 
            }
            if (setting == "friend_requests") {
                if (o == "enabled"  && global_self.friend_requests == true) check.classList.add("active");
                if (o == "disabled" && global_self.friend_requests == false) check.classList.add("active");
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
                    send_string(CLIENT_COMMAND_SET_PARTY_PRIVACY, ""+bool);
                    global_party.privacy = bool;
                }
                if (setting == "friend_requests") {
                    let bool = (o == "enabled") ? true : false;
                    send_string(CLIENT_COMMAND_SET_ALLOW_FRIEND_REQUESTS, ""+bool);
                    global_self.friend_requests = bool;
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
    let total = global_friend_requests_count + global_friend_invites_count;
    let count_cont = _id("friends_list_notice");
    if (total == 0) {
        count_cont.style.display = "none";
    } else {
        count_cont.textContent = total;
        count_cont.style.display = "block";
    }
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

        anim_start({
            element: _id("friends_list_popup"),
            translateX: [-40, 0, "vh"],
            duration: 250,
            easing: easing_functions.easeOutQuad,
            show: true,
        });

        global_friends_list_enabled = true;
        _id("friends_icon").classList.add("toggled");
        req_anim_frame(() => {
            // in settimeout otherwise it would fire instantly with the current "click" event
            _id("main_menu").addEventListener("click", friends_list_outside_click);
            refreshScrollbar(global_active_friends_list_cont);
        });
    } else {
        if (open_only) return;
        close_friends_list();
    }
}

function close_friends_list() {
    anim_start({
        element: _id("friends_list_popup"),
        translateX: [0, -40, "vh"],
        duration: 250,
        easing: easing_functions.easeOutQuad,
        hide: true,
    });

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
    anim_start({
        element: _id("friends_list_popup"),
        translateX: [0, -40, "vh"],
        duration: 250,
        easing: easing_functions.easeOutQuad,
        hide: true,
    });
    global_friends_list_enabled = false;
    _id("friends_icon").classList.remove("toggled");
    _id("main_menu").removeEventListener("click", friends_list_outside_click);
}

function party_invite_friends() {
    popup_friends_list(true);
}

function invite_friends() {
    popup_friends_list(true);
}

/*
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
*/

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
