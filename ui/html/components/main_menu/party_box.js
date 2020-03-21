function set_party_box_visible(bool) {
    console.log("set_party_box_visible", bool);
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

    let fragment = new DocumentFragment();

    for (let m of data.data.members) {
        count++;
        global_party['members'][m['user_id']] = m;

        if (m.user_id == data['user-id']) {
            global_self.data = m;
            set_friend_list_avatar_self(m);
            set_customize_data(m);
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
        member_div.style.backgroundImage = "url("+_avatarUrl(m.data.avatar)+")";
        member_div.classList.add("tooltip");
        _addButtonSounds(member_div, 1);


        let name = document.createElement("div");
        name.classList.add("tip_inner");
        name.classList.add("top");
        name.textContent = m.name;
        if (m.match_connected > 0) {
            name.textContent = m.name +": in game";

            let ingame = document.createElement("div");
            ingame.classList.add("ingame");
            member_div.appendChild(ingame);
        }

        initialize_element_tooltip_hover(member_div);

        if (m.user_id == data.data['leader-id']) {
            member_div.classList.add("leader");
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
        
        fragment.appendChild(member_div);

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

            fragment.appendChild(member_div);
        }
    }

    party_box.appendChild(fragment);

    update_queue_modes_availability();
}