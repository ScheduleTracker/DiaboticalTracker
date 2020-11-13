function create_game_mode_select(parent_node, on_change, on_init) {
    let modes = [];

    for (let mode in global_game_mode_map) modes.push(global_game_mode_map[mode]);
    modes.sort(function(a,b) {
        return a.name.localeCompare(b.name);
    });

    if(on_init) on_init(modes);

    for (let mode of modes) {
        if (!mode.enabled) continue;
        if (!global_lobby_init_mode.length) global_lobby_init_mode = mode.mode;
        
        let opt = _createElement("div", "i18n");
        opt.dataset.i18n = mode.i18n;
        opt.dataset.value = mode.mode;
        opt.textContent = localize(mode.i18n);
        parent_node.appendChild(opt);
    }

    ui_setup_select(parent_node, on_change);
}
