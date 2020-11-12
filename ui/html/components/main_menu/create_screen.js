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
}

function create_screen_new_map() {
    open_modal_screen("map_create_modal_screen", function() {
        let map_create_mode_filter = _id("map_create_mode_filter");

        _empty(map_create_mode_filter);
        create_game_mode_select(
            map_create_mode_filter,
            (opt, value) => { global_create_screen.selected_mode = opt.dataset.value; }
        );
    });
}

function confirm_create_new_map() {
    const mode = global_create_screen.selected_mode;
    const id = _id("map_create_id").value;
    const name = _id("map_create_name").value;

    RemoteResources.create_remote_map(id, name, mode, (ret) => {
        if(ret.success) {
            load_custom_maps_list();
            queue_dialog_msg({
                "title": localize("toast_create_map_title"),
                "msg": localize("toast_create_map_success"),
            });
        } else {
            queue_dialog_msg({
                "title": localize("toast_create_map_title"),
                "msg": localize("toast_create_map_error"),
            });
        }
        close_modal_screen_by_selector('map_create_modal_screen')
    });
}

function onCreateScreenFilter() {
    console.log("filter the map list!");
}

function load_custom_maps_list() {
    /// #if BUILD_ENV == 'honeycreeper'
    RemoteResources.list_player_remote_maps_paginated(0, (data) => {
        render_create_screen_maps_list(
            data.map(map => ({
                id: map.map_id,
                mode: map.mode_name,
                name: map.name,
                image: "mg_test.png",
                author: map.author,
                last_edit: new Date(map.update_ts)
            }))
        );
    }); 
    /// #endif
}

function render_create_screen_maps_list(maps) {
    let list = _id("create_screen_list");
    _empty(list);

    let fragment = new DocumentFragment();
    for (let map of maps) {
        let map_el = _createElement("div", "create_map_preview");
        map_el.dataset.map_name = map.name;
        map_el.dataset.map_id = map.id;

        let img = _createElement("img");
        img.src = "/html/map_thumbnails/" + map.image;
        map_el.appendChild(img);

        let gt = _createElement("div", ["gamemode", "i18n"]);
        gt.dataset.i18n = global_game_mode_map[map.mode].i18n
        gt.innerHTML = global_game_mode_map[map.mode].name;
        map_el.appendChild(gt);

        let bottom = _createElement("div", "bottom");

        let div = _createElement("div");
        let name = _createElement("div", "name");
        name.innerHTML = map.name;
        div.appendChild(name);
        let author = _createElement("div", "author");
        author.innerHTML = map.author;
        div.appendChild(author);
        bottom.appendChild(div);

        let edit_info = _createElement("div", "edit_info");
        let last_edit_title = _createElement("div", "last_edit");
        last_edit_title.innerHTML = "Last edit"; // TODO localize(...) string
        edit_info.appendChild(last_edit_title);
        let last_edit = _createElement("div");
        last_edit.innerHTML = map.last_edit.toLocaleDateString();
        edit_info.appendChild(last_edit);
        bottom.appendChild(edit_info);

        map_el.appendChild(bottom);

        fragment.appendChild(map_el);
        
        map_el.addEventListener('click', (event) => {
            const el = event.currentTarget;
            _for_each_in_class("create_map_preview", el => el.classList.remove("selected"))
            el.classList.add("selected");

            if (_id("create_screen_selection_options").style.display !== 'flex')
                anim_show(_id("create_screen_selection_options"));

            global_create_screen.selected_map = el.dataset.map_id;            
        });
    }

    list.appendChild(fragment);
}

function create_screen_edit_map() {
/// #if BUILD_ENV == 'honeycreeper'
    setFullscreenSpinner(true);

    RemoteResources.load_remote_map(global_create_screen.selected_map,
        (success) => {
            console.log(JSON.stringify(success));
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
/// #endif
}

function create_screen_confirm_delete_map() {
/// #if BUILD_ENV == 'honeycreeper'
    close_modal_screen_by_selector('map_delete_modal_screen')
    setFullscreenSpinner(true);

    RemoteResources.delete_remote_map(global_create_screen.selected_map,
        () => {
            setFullscreenSpinner(false);
            load_custom_maps_list();
        });
/// #endif
}

function create_screen_confirm_publish_map() {
/// #if BUILD_ENV == 'honeycreeper'
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
        }, 
        (key) => {
            setFullscreenSpinner(false);
            queue_dialog_msg({
                "title": localize("toast_publish_map_title"),
                "msg": localize_ext("toast_publish_map_error", {"name": key})
            });
        });
/// #endif
}
