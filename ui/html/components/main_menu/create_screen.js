//const COMMUNITY_MAP_MODES = ["ffa", "brawl", "tdm", "ft", "duel", "extinction"];
const COMMUNITY_MAP_MODES = Object.keys(global_game_mode_map).filter(m => global_game_mode_map[m].enabled);

const content_creation_page = {
    state: {
        new_map: {
            selected_modes: null,
            selected_map: null
        },
        update_map: {
            selected_modes: null,
            selected_map: null
        },
        selected_map: null,
        available_maps: []
    },

    $el: _id("create_screen"),

    init: function () {
        // All this effort just to get have image previews that keep their aspect ratio on different screen resolutions... because GameFace doesn't support height:auto on images (auto setting height while preserving aspect ratio)
        let _120vh = window.outerHeight / 100 * 120;
        let _90vw = window.outerWidth / 100 * 90;
        let smallerval = (_120vh < _90vw) ? _120vh : _90vw;
        let map_preview_height = ((smallerval - (window.outerHeight / 100 * 6)) / 3) * (9 / 16);
        _id("create_screen_list").style.setProperty("--customlist_height", map_preview_height + "px");

        this._create_mode_checkboxes(_id("map_create_modes"));        
        this._create_mode_checkboxes(_id("map_update_modes"));

        engine.on("saved_map", () => {
            this.update_maps_list();
        });
    },

    open_map_folder: function () {
        engine.call("open_map_folder");
    },

    _on_map_select: function (event) {
        const $el = event.currentTarget;

        _for_each_in_class("create_map_preview", $el => $el.classList.remove("selected"))
        $el.classList.add("selected");

        _for_each_in_class("map_preview_background", $el => $el.classList.remove("selected"))
        _for_each_with_class_in_parent($el, "map_preview_background", $el => $el.classList.add("selected"));

        if (_id("create_screen_selection_options").style.display !== 'flex')
            anim_show(_id("create_screen_selection_options"));

        this.state.selected_map = this.state.available_maps.find(m => m.id === $el.dataset.map_id);
    },

    _unselect_map: function() {
        this.state.selected_map = null;
        Array.from(this.$el.querySelectorAll(".create_map_preview")).forEach(p => p.classList.remove("selected"));
        anim_hide(this.$el.querySelector("#create_screen_selection_options"));
    },
    
    _create_mode_checkboxes: function($el) {
        _empty($el);
        COMMUNITY_MAP_MODES.forEach(mode => {
            const $mode = _createElement("div", ["grid-col-6", "padding-bottom-xl"]);
            
            const $leftCol = _createElement("div", ["grid-col-5","grid-offset-2"]);
            $leftCol.innerHTML = localize(global_game_mode_map[mode].i18n);
            
            const $checkbox = _createElement("div", ["checkbox", "checkbox_component"]);
            $checkbox.appendChild(_createElement("div"));
            $checkbox.dataset.value = mode;
            $checkbox.addEventListener("click", event => {
                const $target = event.target;
                if ($target.classList.contains("checkbox_enabled")) {
                    $target.classList.remove("checkbox_enabled");
                    $target.firstChild.classList.remove("inner_checkbox_enabled");
                } else {
                    $target.classList.add("checkbox_enabled");
                    $target.firstChild.classList.add("inner_checkbox_enabled");
                }
            });
            const $rightCol = _createElement("div", ["grid-col-5", "grid-end"]);
            $rightCol.appendChild($checkbox);

            $mode.appendChild($leftCol);
            $mode.appendChild($rightCol);
            $el.appendChild($mode);
        });
    },

    _reset_mode_chekboxes: function($el) {
        const $checkboxes = Array.from($el.querySelectorAll("#map_create_modes .checkbox_enabled"));
        $checkboxes.forEach($checkbox => {
            $checkbox.classList.remove('checkbox_enabled');
            $checkbox.firstChild.classList.remove("inner_checkbox_enabled");
        });
    },

    _check_input_validations: function (id, modes, name, $errorNode) {
        const MAX_NAME_LENGTH = 20;
        
        _empty($errorNode);

        if (!modes || modes.length === 0) {
            $errorNode.innerHTML = localize("map_error_no_mode");
            return false;
        }
        if (id.match(/^[a-z0-9_]+$/) == null) {
            $errorNode.innerHTML = localize("map_error_id_invalid");
            return false;
        }
        if (name.length === 0) {
            $errorNode.innerHTML = localize("map_error_name_empty");
            return false;
        }
        if (name.length > MAX_NAME_LENGTH) {
            $errorNode.innerHTML = localize("map_error_name_too_large");
            return false;
        }

        return true;
    },

    confirm_create_map: function () {
        const id = _id("map_create_id").value;
        const name = _id("map_create_name").value;
        const modes = Array.from(document.querySelectorAll("#map_create_modes .checkbox_enabled")).map(f => f.dataset.value);

        if (!this._check_input_validations(id, modes, name, _id("map_create_modal_error"))) {
            return;
        }

        RemoteResources.create_remote_map(id, name, modes, (ret) => {
            if (ret && ret.success) {
                this.update_maps_list();
                queue_dialog_msg({
                    "title": localize("toast_create_map_title"),
                    "msg": localize("toast_create_map_success"),
                });
            } else {
                _id("map_create_modal_error").innerHTML = localize("map_error_id_taken");
                if (ret && ret.reason)
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
    },


    confirm_update_map: function () {
        const new_name = _id("map_update_name").value;
        const new_modes = Array.from(
            document.querySelectorAll("#map_update_modes .checkbox_enabled")
        ).map(f => f.dataset.value);

        if (!this._check_input_validations(this.state.selected_map.id, new_modes, new_name, _id("map_update_modal_error"))) {
            return;
        }

        close_modal_screen_by_selector('map_update_modal_screen')
        setFullscreenSpinner(true);

        RemoteResources.update_remote_map(this.state.selected_map.id, new_name, new_modes, () => {
            setFullscreenSpinner(false);
            this.update_maps_list();
        });
    },
    
    confirm_delete_map: function () {
        close_modal_screen_by_selector('map_delete_modal_screen')
        setFullscreenSpinner(true);

        RemoteResources.delete_remote_map(this.state.selected_map.id,
            () => {
                setFullscreenSpinner(false);
                this.update_maps_list();
            });
    },

    confirm_publish_map: function () {
        close_modal_screen_by_selector('map_publish_modal_screen')
        setFullscreenSpinner(true);

        RemoteResources.upload_remote_map(
            this.state.selected_map.id,
            () => {
                setFullscreenSpinner(false);
                queue_dialog_msg({
                    "title": localize("toast_publish_map_title"),
                    "msg": localize("toast_publish_map_success")
                });
                this.update_maps_list();
            },
            (key) => {
                setFullscreenSpinner(false);
                queue_dialog_msg({
                    "title": localize("toast_publish_map_title"),
                    "msg": localize_ext("toast_publish_map_error", { "name": key })
                });
            });
    },

    update_maps_list: function () {
        setFullscreenSpinner(true);

        engine.call("list_local_maps").then(data => {
            const local_maps = JSON.parse(data);

            setFullscreenSpinner(false);

            RemoteResources.list_player_remote_maps_paginated(0, (data) => {
                this._unselect_map();
                this.state.available_maps = data.map(map => {
                    const local_map = local_maps.find(m => m.filename === map.map_id + ".rbe");
                    return {
                        id: map.map_id,
                        name: map.name,
                        random_name: map.random_name,
                        modes: map.modes,
                        image: "mg_test.png",
                        author: map.author,
                        rate: map.rate,
                        votes: map.votes,
                        revision: map.revision,
                        created_at: new Date(map.create_ts),
                        updated_at: new Date(map.update_ts),
                        local_edit_at: local_map ? new Date(local_map.updated_at * 1000) : null
                    };
                });
                this._render_maps_list(this.state.available_maps);
            });
        });
    },

    _render_maps_list: function () {
        const maps = this.state.available_maps;

        let list = _id("create_screen_list");
        _empty(list);

        let fragment = new DocumentFragment();
        for (let map of maps) {
            let map_el = _createElement("div", "create_map_preview");
            map_el.dataset.map_name = map.name;
            map_el.dataset.map_id = map.id;
            
            let background = _createElement("div", ["map_preview_background"]);
            background.innerHTML = localize("map_community_preview");
            let background_image = _createElement("div", ["map_preview_background_image"]);
            background_image.style.backgroundImage =  `url("appdata://Maps/${map.id}-t.png")`;
            background.appendChild(background_image);
            map_el.appendChild(background);

            // Render modes
            const MAX_MODE_LINES = 4;
            const $modes = _createElement("div", ["gamemodes"]);
            if (map.modes) {
                for (let [idx, mode] of map.modes) {
                    if (idx > MAX_MODE_LINES) break;
                }
                map.modes.some((mode, idx) => {
                    if ((idx + 1) > MAX_MODE_LINES) return false;

                    let $mode = _createElement("div", ["gamemode", "i18n"]);
                    $mode.dataset.i18n = global_game_mode_map[mode].i18n;
                    $mode.innerHTML = global_game_mode_map[mode].name;
                    $modes.appendChild($mode);
                });
                if (map.modes.length > MAX_MODE_LINES) {
                    const last_mode = global_game_mode_map[map.modes[MAX_MODE_LINES]].i18n;
                    $modes.appendChild(_createElement("div", "", `${localize(last_mode).slice(0, 3)}...`));
                }
                map_el.appendChild($modes);
            } else {
                console.warn("Ignoring map modes because you are using an old API version")
            }
            
            // Render map details at the bottom
            let bottom = _createElement("div", "bottom");
            let div = _createElement("div", "details");
            let name = _createElement("div", "name");
            name.innerHTML = map.name;
            div.appendChild(name);

            if (map.random_name) {
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
                last_publish_title.textContent = localize("map_last_publish");
                edit_info.appendChild(last_publish_title);

                let last_publish_time = _createElement("div");
                last_publish_time.textContent = moment(map.updated_at).fromNow();
                edit_info.appendChild(last_publish_time);
            }
            if (map.local_edit_at) {
                let last_edit_title = _createElement("div", "text_info");
                last_edit_title.textContent = localize("map_last_edit");
                edit_info.appendChild(last_edit_title);

                let last_edit_text = _createElement("div");
                last_edit_text.textContent = moment(map.local_edit_at).fromNow();
                edit_info.appendChild(last_edit_text);
            }
            
            if (map.rate) {
                let rating = _createElement("div", "map_rating_creation");
                for (let s = 0; s < map.rate; s++) {
                    rating.appendChild(_createElement("div", "star"));
                }
                edit_info.appendChild(rating);
            }
            bottom.appendChild(edit_info);

            if (map.local_edit_at === null) {
                let pending_publish_warn = _createElement("div", "pending_publish");
                pending_publish_warn.innerHTML = localize("map_never_edited");
                map_el.appendChild(pending_publish_warn);
            } else if (map.local_edit_at > map.updated_at) {
                let pending_publish_warn = _createElement("div", "pending_publish");
                pending_publish_warn.innerHTML = localize("map_pending_publication");
                map_el.appendChild(pending_publish_warn);
            }
            map_el.appendChild(bottom);

            fragment.appendChild(map_el);

            map_el.addEventListener('click', this._on_map_select.bind(this));
        }

        list.appendChild(fragment);
    },

    show_new: function () {
        this._reset_mode_chekboxes(_id("map_create_modal_screen"));
        open_modal_screen("map_create_modal_screen", function () {
            _empty(_id("map_create_modal_error"));
        });
    },

    show_edit: function () {
        setFullscreenSpinner(true);

        RemoteResources.load_remote_map(this.state.selected_map.id,
            (success) => {
                setFullscreenSpinner(false);
                engine.call("edit_community_map", this.state.selected_map.id);
            },
            () => {
                setFullscreenSpinner(false);
                queue_dialog_msg({
                    "title": localize("toast_publish_map_title"),
                    "msg": localize_ext("toast_publish_map_error", { "name": key })
                });
            });
    },

    show_update: function () {
        const $modal = _id("map_update_modal_screen");
        const $name = _id("map_update_name");

        $name.value = this.state.selected_map.name
        this._reset_mode_chekboxes($modal);
        this.state.selected_map.modes.forEach(mode => {
            const $checkbox = $modal.querySelector(`.checkbox[data-value=${mode}]`);
            $checkbox.classList.add("checkbox_enabled");
            $checkbox.firstChild.classList.add("inner_checkbox_enabled");
        });
        
        open_modal_screen('map_update_modal_screen', function() {
            _empty(_id("map_update_modal_error"));
        });
    }
};
