
global_onload_callbacks_other.push(function() {

    global_input_debouncers['create_screen_filter_input'] = new InputDebouncer(function(){ onCreateScreenFilter(); });

    // All this effort just to get have image previews that keep their aspect ratio on different screen resolutions... because GameFace doesn't support height:auto on images (auto setting height while preserving aspect ratio)
    let _120vh = window.outerHeight / 100 * 120;
    let _90vw = window.outerWidth / 100 * 90;
    let smallerval = (_120vh < _90vw) ? _120vh : _90vw;
    let map_preview_height = ((smallerval - (window.outerHeight / 100 * 6)) / 3) * (9/16);
    _id("create_screen_list").style.setProperty("--customlist_height", map_preview_height+"px");
    
    updateCreateScreenMapList();

    // Add all the modes to the filter select list
    let mode_filter = _id("create_screen_filter_gamemode");
    let modes = Object.keys(global_game_mode_map);
    let fragment = new DocumentFragment();
    for (let mode of modes) {
        if (!global_game_mode_map[mode].enabled) continue;
        
        let opt = _createElement("div", "i18n");
        opt.dataset.i18n = global_game_mode_map[mode].i18n;
        opt.dataset.value = mode;
        opt.innerHTML = global_game_mode_map[mode].name;
        fragment.appendChild(opt);
    }
    mode_filter.appendChild(fragment);
    ui_setup_select(mode_filter);
});

function create_screen_new_map() {
    engine.call("edit_new_map");
}

function onCreateScreenFilter() {
    console.log("filter the map list!");
}

function updateCreateScreenMapList() {
    // TODO 
    //  - get map list from engine
    //  - add pageination or scrollbar?
    let maps = [
        /*
        {
            "mode": "tdm",
            "name": "tdm_alchemy",
            "image": "tdm_alchemy.png",
            "author": "promEUs",
            "last_edit": "2 days ago",
        },
        {
            "mode": "duel",
            "name": "duel_outpost_dunia",
            "image": "duel_outpost_dunia.png",
            "author": "promEUs",
            "last_edit": "2 days ago",
        },
        {
            "mode": "duel",
            "name": "duel_frontier",
            "image": "duel_frontier.png",
            "author": "promEUs",
            "last_edit": "2 days ago",
        },
        {
            "mode": "brawl",
            "name": "b_wellspring",
            "image": "b_wellspring.png",
            "author": "promEUs",
            "last_edit": "2 days ago",
        },
        {
            "mode": "ctf",
            "name": "ctf_waterworks_wip",
            "image": "ctf_waterworks_wip.png",
            "author": "promEUs",
            "last_edit": "2 days ago",
        },
        {
            "mode": "wipeout",
            "name": "wo_furnace",
            "image": "wo_furnace.png",
            "author": "promEUs",
            "last_edit": "2 days ago",
        }
        */
    ];

    renderCreatescreenMapList(maps);
}

function renderCreatescreenMapList(maps) {
    let list = _id("create_screen_list");
    _empty(list);

    let fragment = new DocumentFragment();
    for (let map of maps) {
        let map_el = _createElement("div", "create_map_preview");
        map_el.dataset.map_name = map.name;

        let img = _createElement("img");
        img.src = "/html/map_thumbnails/"+map.image;
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
        last_edit.innerHTML = map.last_edit;
        edit_info.appendChild(last_edit);
        bottom.appendChild(edit_info);

        map_el.appendChild(bottom);

        fragment.appendChild(map_el);
    }

    list.appendChild(fragment);
}