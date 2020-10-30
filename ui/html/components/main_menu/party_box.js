function set_party_box_visible(bool) {
    let party_box = _id("party_box");
    anim_remove(party_box);
    if (bool) {
        anim_show(party_box);
    } else {
        anim_hide(party_box);
    }
}

function update_party(data) {

    // I think this was meant to show the multiple eggbots on the home screen but was never implemented or at least not updated in the engine
    engine.call("set_party_info", data['user-id'], data.data['leader-id'], data.data.members);

    global_party['modes-quickplay'] = data.data['modes-quickplay'];
    global_party['modes-ranked'] = data.data['modes-ranked'];
    global_party['valid-modes'] = data['valid-modes'];

    let party_box = _id("party_box");
    _empty(party_box);

    global_party['members'] = {};
    let count = 0;

    for (let m of data.data.members) {
        count++;
        global_party['members'][m['user_id']] = m;

        // Update own info
        if (m.user_id == data['user-id']) {
            let set_initial_customizations = false;
            if (global_self.data == undefined) set_initial_customizations = true;

            // Update all self data including set customizations, should probably be replaced in part with the data coming from the "set_client_info" event in customizations
            global_self.data = m;
            set_customize_data(m, set_initial_customizations);
        }

        _for_each_with_class_in_parent(friends_list_in_diabotical_cont, "friend", function(friend) {
            if (friends_in_party_user_ids.includes(friend.dataset.user_id)) {
                friend.classList.add("hidden");
            } else {
                friend.classList.remove("hidden");
            }
        });


        let member_div = _createElement("div", "party_member");
        if (count == 1) member_div.classList.add("first");
        if (m.user_id == data['user-id']) member_div.classList.add("self");
        member_div.style.backgroundImage = "url("+_avatarUrl(m.customizations.avatar)+")";
        member_div.classList.add("tooltip");
        _addButtonSounds(member_div, 1);


        let name = document.createElement("div");
        name.classList.add("tip_inner");
        name.classList.add("top");
        name.textContent = m.name;
        if (m.match_connected == true) {
            name.textContent = m.name +": in game";

            let ingame = document.createElement("div");
            ingame.classList.add("ingame");
            member_div.appendChild(ingame);
        }

        initialize_element_tooltip_hover(member_div);

        if (data.data.members.length > 1 && m.user_id == data.data['leader-id']) {
            member_div.classList.add("leader");
            member_div.appendChild(_createElement("div", "leader_crown"));
        }

        if (m.user_id == global_self.user_id) {
            member_div.classList.add("self");
            member_div.appendChild(_createElement("div", "self_arrow"));
        }

        member_div.appendChild(name);

        let ctx_options = [];

        if (bool_am_i_leader && data['user-id'] != m.user_id) {
            ctx_options.push({
                "text": "Make Party Leader",
                "callback": function(e) {
                    party_context_select("promote", m.user_id);
                }
            });
            ctx_options.push({
                "text": "Remove Player",
                "callback": function(e) {
                    party_context_select("remove", m.user_id);
                }
            });
        }

        if (m.user_id == data['user-id'] && data.data.members.length > 1) {
            ctx_options.push({
                "text": "Leave Party",
                "callback": function(e) {
                    party_context_select("leave");
                }
            });
        }

        member_div.addEventListener("mousedown", function(e) {
            if (e.button == 2) {
                if (ctx_options.length > 0) {
                    e.preventDefault();
                    context_menu(e, ctx_options);
                }
            }
            if (e.button == 0) {
                open_player_profile(m['user_id']);
            }
        });
        
        party_box.appendChild(member_div);

    }
    let limit = 5;
    if (count <= limit) {
        for (let i=count; i<limit; i++) {
            let member_div = _createElement("div", ["party_member", "empty", "tooltip"]);
            _addButtonSounds(member_div, 1);

            let text = document.createElement("div");
            text.classList.add("tip_inner");
            text.classList.add("top");
            text.textContent = localize("party_invite_friend");
            member_div.appendChild(text);
    
            initialize_element_tooltip_hover(member_div);

            member_div.addEventListener("click", function(e) {
                e.stopPropagation();
                invite_friends();
            });

            party_box.appendChild(member_div);
        }
    }

    update_queue_modes_availability();
}