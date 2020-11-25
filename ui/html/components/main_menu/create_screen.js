const global_create_screen = {
    selected_mode: null,
    selected_map: null
}

function init_screen_create() {
    global_input_debouncers['create_screen_filter_input'] = new InputDebouncer(function(){ onCreateScreenFilter(); });

    // All this effort just to get have image previews that keep their aspect ratio on different screen resolutions... because GameFace doesn't support height:auto on images (auto setting height while preserving aspect ratio)
    let _120vh = window.outerHeight / 100 * 120;
    let _90vw = window.outerWidth / 100 * 90;
    let smallerval = (_120vh < _90vw) ? _120vh : _90vw;
    let map_preview_height = ((smallerval - (window.outerHeight / 100 * 6)) / 3) * (9/16);
    _id("create_screen_list").style.setProperty("--customlist_height", map_preview_height+"px");

    const map_create_mode_filter = _id("map_create_mode_filter");
    _empty(map_create_mode_filter);
    create_game_mode_select(
        map_create_mode_filter,
        (opt, value) => {
            global_create_screen.selected_mode = opt.dataset.value;
        },
        (initValues) => {
            global_create_screen.selected_mode = initValues[0].mode;
        }
    );

    engine.on("saved_map", function() {
        update_custom_maps_list();
    });
}

function create_screen_new_map() {
    open_modal_screen("map_create_modal_screen", function () {
        _empty(_id("map_create_modal_error"));        
    });
}

function create_screen_open_map_folder() {
    engine.call("open_map_folder");
}

function confirm_create_new_map() {
    const MAX_NAME_LENGTH = 20;

    const mode = global_create_screen.selected_mode;
    const id = _id("map_create_id").value;
    const name = _id("map_create_name").value;

    /* Input validations */
    if(!mode || mode.length === 0) {
        _id("map_create_modal_error").innerHTML = localize("map_error_no_mode");    
        return;
    }
    if (id.match(/^[a-z0-9_]+$/) == null) {
        _id("map_create_modal_error").innerHTML = localize("map_error_id_invalid");    
        return;
    }
    if (name.length === 0) {
        _id("map_create_modal_error").innerHTML = localize("map_error_name_empty");    
        return;
    }
    if (name.length > MAX_NAME_LENGTH) {
        _id("map_create_modal_error").innerHTML = localize("map_error_name_too_large");    
        return;
    }

    RemoteResources.create_remote_map(id, name, mode, (ret) => {
        if(ret.success) {
            update_custom_maps_list();
            queue_dialog_msg({
                "title": localize("toast_create_map_title"),
                "msg": localize("toast_create_map_success"),
            });
        } else {
            _id("map_create_modal_error").innerHTML = localize("map_error_id_taken");
            if (ret.reason)
                queue_dialog_msg({
                    "title": localize("toast_map_error_title"),
                    "msg": localize(ret.reason),
                });
            else
                queue_dialog_msg({
                    "title": localize("toast_map_error_title"),
                    "msg": localize("toast_map_error_body"),
                });
        }
        close_modal_screen_by_selector('map_create_modal_screen')
    });
}

function onCreateScreenFilter() {
    console.log("filter the map list!");
}

function update_custom_maps_list() {
    engine.call("list_local_maps").then(data => {
        const local_maps = JSON.parse(data);

        RemoteResources.list_player_remote_maps_paginated(0, (data) => {
            render_create_screen_maps_list(
                data.map(map => {
                    const local_map = local_maps.find(m => m.filename === map.map_id + ".rbe");
                    return {
                        id: map.map_id,
                        mode: map.mode_name,
                        name: map.name,
                        random_name: map.random_name,
                        image: "mg_test.png",
                        author: map.author,
                        created_at: new Date(map.create_ts),
                        updated_at: new Date(map.update_ts),
                        local_edit_at: local_map ? new Date(local_map.updated_at * 1000) : null
                    };
                }));
        });
    });
}

function render_create_screen_maps_list(maps) {
    let list = _id("create_screen_list");
    _empty(list);

    let fragment = new DocumentFragment();
    for (let map of maps) {
        let map_el = _createElement("div", "create_map_preview");
        map_el.dataset.map_name = map.name;
        map_el.dataset.map_id = map.id;

       // let img = _createElement("img");
        //img.src = "/html/map_thumbnails/" + map.image;
        //map_el.appendChild(img);
        let background = _createElement("div", ["map_preview_background"]);
        background.innerHTML = localize("map_community_preview");
        map_el.appendChild(background);

        let gt = _createElement("div", ["gamemode", "i18n"]);
        gt.dataset.i18n = global_game_mode_map[map.mode].i18n
        gt.innerHTML = global_game_mode_map[map.mode].name;
        map_el.appendChild(gt);

        let bottom = _createElement("div", "bottom");

        let div = _createElement("div", "details");
        let name = _createElement("div", "name");
        name.innerHTML = map.name;
        div.appendChild(name);

        if (map.random_name){
            let temp_name = _createElement("div", "temp_name");
            temp_name.innerHTML = "Temporarily named <i>" + map.random_name.replace('_', ' ').toUpperCase() + "</i> Pending name moderation";
            div.appendChild(temp_name);
        }

        let author = _createElement("div", "author");
        author.innerHTML = map.author;
        div.appendChild(author);
        bottom.appendChild(div);

        let edit_info = _createElement("div", "edit_info");
        if (map.updated_at.getTime() !== map.created_at.getTime()) {
            let last_publish_title = _createElement("div", "text_info");
            last_publish_title.innerHTML = localize("map_last_publish");
            edit_info.appendChild(last_publish_title);

            let last_publish_time = _createElement("div");
            last_publish_time.innerHTML = moment(map.updated_at).fromNow();
            edit_info.appendChild(last_publish_time);
        }
        if (map.local_edit_at) {
            let last_edit_title = _createElement("div", "text_info");
            last_edit_title.innerHTML = localize("map_last_edit");
            edit_info.appendChild(last_edit_title);

            let last_edit_text = _createElement("div");
            last_edit_text.innerHTML = moment(map.local_edit_at).fromNow();
            edit_info.appendChild(last_edit_text);
        }
        bottom.appendChild(edit_info);
        
        if (map.local_edit_at === null) {
            let pending_publish_warn = _createElement("div", "pending_publish");
            pending_publish_warn.innerHTML = localize("map_never_edited");
            map_el.appendChild(pending_publish_warn);
        } else if (map.local_edit_at > map.updated_at) {
            let pending_publish_warn = _createElement("div", "pending_publish");
            pending_publish_warn.innerHTML =  localize("map_pending_publication");
            map_el.appendChild(pending_publish_warn);
        }
        map_el.appendChild(bottom);

        fragment.appendChild(map_el);
        
        map_el.addEventListener('click', (event) => {
            const el = event.currentTarget;
            _for_each_in_class("create_map_preview", el => el.classList.remove("selected"))
            el.classList.add("selected");

            _for_each_in_class("map_preview_background", el => el.classList.remove("selected"))
            _for_each_with_class_in_parent(el, "map_preview_background", sub_el => sub_el.classList.add("selected"));

            if (_id("create_screen_selection_options").style.display !== 'flex')
                anim_show(_id("create_screen_selection_options"));

            global_create_screen.selected_map = el.dataset.map_id;
        });
    }

    list.appendChild(fragment);
}

function create_screen_edit_map() {
    setFullscreenSpinner(true);

    RemoteResources.load_remote_map(global_create_screen.selected_map,
        (success) => {
            setFullscreenSpinner(false);
            engine.call("edit_community_map", global_create_screen.selected_map);
        },
        () => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                "title": localize("toast_publish_map_title"),
                "msg": localize_ext("toast_publish_map_error", {"name": key})
            });
        });
}

function create_screen_confirm_delete_map() {
    close_modal_screen_by_selector('map_delete_modal_screen')
    setFullscreenSpinner(true);

    RemoteResources.delete_remote_map(global_create_screen.selected_map,
        () => {
            setFullscreenSpinner(false);
            update_custom_maps_list();
        });
}

function create_screen_confirm_publish_map() {
    close_modal_screen_by_selector('map_publish_modal_screen')
    setFullscreenSpinner(true);

    RemoteResources.upload_remote_map(
        global_create_screen.selected_map,
        () => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                "title": localize("toast_publish_map_title"),
                "msg": localize("toast_publish_map_success")
            });
            update_custom_maps_list();
        }, 
        (key) => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                "title": localize("toast_publish_map_title"),
                "msg": localize_ext("toast_publish_map_error", {"name": key})
            });
        });
}
