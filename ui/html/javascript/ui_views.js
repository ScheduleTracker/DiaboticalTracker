
window.fade_time = 70;

function set_logged_out_screen(visible, reason, code) {
    if (reason) {
        if (reason == "ghosted")      _id("logout_reason").textContent = localize("message_multi_user_logged_out");
        if (reason == "version")      _id("logout_reason").textContent = localize("message_version_user_logged_out");
        if (reason == "unverified")   _id("logout_reason").textContent = localize("message_verification_failed");
        if (reason == "service_down") _id("logout_reason").textContent = localize("message_service_down");
        if (reason == "disabled")     _id("logout_reason").textContent = localize("message_disabled");
        if (reason == "anticheat")    _id("logout_reason").textContent = localize_ext("message_anticheat", {"code": code});
    }

    if (visible) {
        
        _id("main_menu").style.visibility = "hidden";
        anim_show(_id("main_logged_out"));

        // Turn off the console for disabled accounts
        if (reason && reason == "disabled" || reason == "anticheat") engine.call("set_console_enabled", false);

    } else {
        /*
        _id("main_menu").style.visibility = "visible";
        anim_hide(_id("main_logged_out"));
        // set_console_enabled true isn't implemented in the engine, will be added if we ever actually need it
        engine.call("set_console_enabled", true);
        */
    }
}

function processSliderUpdate(el) {
    let id_str = "" + el.id;
    if (id_str.startsWith("setting_mouse")) {
        //update_accel_chart();
    }
}

function update_selectmenu(element, from_engine){
    console.log("update selectmenu");
    var id_str = element.id;
    if (id_str == "setting_imperial") {
        update_physical_sens(id_str,from_engine);
    }
    if (id_str.startsWith("film_fov")) {
        update_fov_conversion_options(id_str);
    }
    if (id_str == "setting_mouse_accel_type") {
        update_accel_options(element);
    }
    if (id_str == "setting_kovaak_yaw_pitch_preset") {
        on_yaw_pitch_preset_select();
    }
}

function addCrosshairSelectHandler(crosshair_option) {
    crosshair_option.addEventListener("click", function() {
        crosshair_option.parentElement.dataset.value = crosshair_option.dataset.cross;

        _for_each_with_class_in_parent(crosshair_option.parentElement, "selected", function(sel) {
            sel.classList.remove("selected");
        })
        crosshair_option.classList.add("selected");

        engine.call("set_string_variable", crosshair_option.parentElement.dataset.variable, crosshair_option.parentElement.dataset.value);
    });
}

function settings_combat_general() {
    let weapon_sheet = _id("weapon_sheet");
    let general_sheet = _id("weapon_sheet_general");

    weapon_sheet.style.display = "none";
    general_sheet.style.display = "block";

    let weapon_title = _id("combat_panel_header_title");
    weapon_title.style.display = "none";

    let combat_header = _id("combat_panel_header");
    _for_each_with_class_in_parent(combat_header, 'button-weapon-selected', function(el) { el.classList.remove("button-weapon-selected"); });
    _for_each_with_class_in_parent(combat_header, 'img-weapon-selected', function(el) { el.classList.remove("img-weapon-selected"); });
    _for_each_with_class_in_parent(combat_header, 'tip_inner', function(el) { el.classList.remove("hidden"); });

    let button = _id("combat_panel_general");
    button.classList.add("button-weapon-selected");

}

function settings_combat_update(weapon) {
    let weapon_sheet = _id("weapon_sheet");
    let general_sheet = _id("weapon_sheet_general");

    weapon_sheet.style.display = "block";
    general_sheet.style.display = "none";

    let weapon_title = _id("combat_panel_header_title");
    weapon_title.style.display = "block";

    let weapon_settings = _id("custom_weapon_settings");
    let weapon_settings_checkboxes = _id("weapon_sheet").querySelectorAll('.settings_block_header .checkbox_component');
    if (weapon == 0) {
        if (weapon_settings.style.display == "none") {
            weapon_settings.style.display = "flex";
            weapon_settings.style.opacity = 1;
        }

        for (let i=0; i<weapon_settings_checkboxes.length; i++) {
            weapon_settings_checkboxes[i].classList.add("hidden");
        }

        weapon_title.textContent = localize("settings_default_weapon_settings");
    } else {
        for (let i=0; i<weapon_settings_checkboxes.length; i++) {
            weapon_settings_checkboxes[i].classList.remove("hidden");
        }
        weapon_title.textContent = localize("settings_customize")+" "+localize(global_item_name_map[global_weapon_idx_name_map[weapon]][1]);
    }
    
    let combat_header = _id("combat_panel_header");
    _for_each_with_class_in_parent(combat_header, 'button-weapon-selected', function(el) { el.classList.remove("button-weapon-selected"); });
    _for_each_with_class_in_parent(combat_header, 'img-weapon-selected', function(el) { el.classList.remove("img-weapon-selected"); });
    _for_each_with_class_in_parent(combat_header, 'tip_inner', function(el) { el.classList.remove("hidden"); });

    let button = _id("combat_panel_weapon_"+weapon);
    button.classList.add("button-weapon-selected");
    _for_each_with_tag_in_parent(button, 'img', function(el) { el.classList.add("img-weapon-selected"); });
    _for_each_with_class_in_parent(button, 'tip_inner', function(el) { el.classList.add("hidden"); });


    //Override default values checkboxes    
    _id("setting_weapon_use_sensitivity").dataset.variable = "game_custom_weapon_sensitivity:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_sensitivity:" + weapon);
    _id("setting_weapon_use_accel").dataset.variable = "game_custom_weapon_accel:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_accel:" + weapon);
    _id("setting_weapon_use_fov").dataset.variable = "game_custom_weapon_fov:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_fov:" + weapon);
    _id("setting_weapon_use_crosshair").dataset.variable = "game_custom_weapon_crosshair:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_crosshair:" + weapon);
    _id("setting_weapon_use_zoom_crosshair").dataset.variable = "game_custom_weapon_zoom_crosshair:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_zoom_crosshair:" + weapon);
    _id("setting_weapon_use_visuals").dataset.variable = "game_custom_weapon_visuals:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_visuals:" + weapon);
    _id("setting_weapon_use_sounds").dataset.variable = "game_custom_weapon_sounds:" + weapon;
    engine.call("initialize_checkbox_value", "game_custom_weapon_sounds:" + weapon);
    

    //sensitivity
    _id("setting_sensitivity").dataset.variable = ("mouse_sensitivity:" + weapon);
    global_range_slider_map["mouse_sensitivity:" + weapon] = new rangeSlider(_id("setting_sensitivity"), true, function(value) { update_zoom_sensitivity_tick(0) });
    engine.call("initialize_range_value", "mouse_sensitivity:" + weapon);
    //zoomed sensitivity
    _id("setting_zoom_sensitivity").dataset.variable = ("mouse_zoom_sensitivity:" + weapon);
    global_range_slider_map["mouse_zoom_sensitivity:" + weapon] = new rangeSlider(_id("setting_zoom_sensitivity"), true);
    engine.call("initialize_range_value", "mouse_zoom_sensitivity:" + weapon);

    //mouse accel stuff
    _id("setting_mouse_accel_type").dataset.variable = ("mouse_accel_type:" + weapon);
    engine.call("initialize_select_value", "mouse_accel_type:" + weapon);

    _id("setting_mouse_accel_stigma_x").dataset.variable = ("mouse_accel_stigma_x:" + weapon);
    global_range_slider_map["mouse_accel_stigma_x:" + weapon] = new rangeSlider(_id("setting_mouse_accel_stigma_x"), true);
    engine.call("initialize_range_value", "mouse_accel_stigma_x:" + weapon);

    _id("setting_mouse_accel_stigma_y").dataset.variable = ("mouse_accel_stigma_y:" + weapon);
    global_range_slider_map["mouse_accel_stigma_y:" + weapon] = new rangeSlider(_id("setting_mouse_accel_stigma_y"), true);
    engine.call("initialize_range_value", "mouse_accel_stigma_y:" + weapon);

    _id("setting_mouse_accel_norm").dataset.variable = ("mouse_accel_norm:" + weapon);
    global_range_slider_map["mouse_accel_norm:" + weapon] = new rangeSlider(_id("setting_mouse_accel_norm"), true);
    engine.call("initialize_range_value", "mouse_accel_norm:" + weapon);

    _id("setting_mouse_accel_offset").dataset.variable = ("mouse_accel_offset:" + weapon);
    global_range_slider_map["mouse_accel_offset:" + weapon] = new rangeSlider(_id("setting_mouse_accel_offset"), true);
    engine.call("initialize_range_value", "mouse_accel_offset:" + weapon);

    _id("setting_mouse_accel_cap").dataset.variable = ("mouse_accel_cap:" + weapon);
    global_range_slider_map["mouse_accel_cap:" + weapon] = new rangeSlider(_id("setting_mouse_accel_cap"), true);
    engine.call("initialize_range_value", "mouse_accel_cap:" + weapon);

    _id("setting_mouse_accel_toe").dataset.variable = ("mouse_accel_toe:" + weapon);
    global_range_slider_map["mouse_accel_toe:" + weapon] = new rangeSlider(_id("setting_mouse_accel_toe"), true);
    engine.call("initialize_range_value", "mouse_accel_toe:" + weapon);

    _id("setting_mouse_accel_ramp").dataset.variable = ("mouse_accel_ramp:" + weapon);
    global_range_slider_map["mouse_accel_ramp:" + weapon] = new rangeSlider(_id("setting_mouse_accel_ramp"), true);
    engine.call("initialize_range_value", "mouse_accel_ramp:" + weapon);

    _id("setting_mouse_accel_gamma").dataset.variable = ("mouse_accel_gamma:" + weapon);
    global_range_slider_map["mouse_accel_gamma:" + weapon] = new rangeSlider(_id("setting_mouse_accel_gamma"), true);
    engine.call("initialize_range_value", "mouse_accel_gamma:" + weapon);

    _id("setting_mouse_accel_domain").dataset.variable = ("mouse_accel_domain:" + weapon);
    global_range_slider_map["mouse_accel_domain:" + weapon] = new rangeSlider(_id("setting_mouse_accel_domain"), true);
    engine.call("initialize_range_value", "mouse_accel_domain:" + weapon);

    _id("setting_mouse_accel_bias_x").dataset.variable = ("mouse_accel_bias_x:" + weapon);
    global_range_slider_map["mouse_accel_bias_x:" + weapon] = new rangeSlider(_id("setting_mouse_accel_bias_x"), true);
    engine.call("initialize_range_value", "mouse_accel_bias_x:" + weapon);

    _id("setting_mouse_accel_bias_y").dataset.variable = ("mouse_accel_bias_y:" + weapon);
    global_range_slider_map["mouse_accel_bias_y:" + weapon] = new rangeSlider(_id("setting_mouse_accel_bias_y"), true);
    engine.call("initialize_range_value", "mouse_accel_bias_y:" + weapon);

    _id("setting_mouse_accel_post_scale_x").dataset.variable = ("mouse_accel_post_scale_x:" + weapon);
    global_range_slider_map["mouse_accel_post_scale_x:" + weapon] = new rangeSlider(_id("setting_mouse_accel_post_scale_x"), true, function(value) { update_physical_sens('setting_mouse_accel_post_scale_x',false) });
    engine.call("initialize_range_value", "mouse_accel_post_scale_x:" + weapon);

    _id("setting_mouse_accel_post_scale_y").dataset.variable = ("mouse_accel_post_scale_y:" + weapon);
    global_range_slider_map["mouse_accel_post_scale_y:" + weapon] = new rangeSlider(_id("setting_mouse_accel_post_scale_y"), true, function(value) { update_physical_sens('setting_mouse_accel_post_scale_y',false) });
    engine.call("initialize_range_value", "mouse_accel_post_scale_y:" + weapon);

    _id("setting_mouse_cpi").dataset.variable = ("mouse_dpi");
    global_range_slider_map["mouse_dpi"] = new rangeSlider(_id("setting_mouse_cpi"), true, function(value) { update_physical_sens('setting_mouse_cpi',false) });
    engine.call("initialize_range_value", "mouse_dpi");

    _id("setting_imperial").dataset.variable = ("mouse_imperial");
    engine.call("initialize_select_value", "mouse_imperial");

    //physical sens
    global_range_slider_map["incre_field"] = new rangeSlider(_id("incre_field"), false, function(value) { update_physical_sens('incre_field',false) });
    global_range_slider_map["curvat_field"] = new rangeSlider(_id("curvat_field"), false, function(value) { update_physical_sens('curvat_field',false) });
    global_range_slider_map["circum_field"] = new rangeSlider(_id("circum_field"), false, function(value) { update_physical_sens('circum_field',false) });
    global_range_slider_map["incre_zoom_field"] = new rangeSlider(_id("incre_zoom_field"), false, function(value) { update_physical_sens('incre_zoom_field',false) });
    global_range_slider_map["curvat_zoom_field"] = new rangeSlider(_id("curvat_zoom_field"), false, function(value) { update_physical_sens('curvat_zoom_field',false) });
    global_range_slider_map["circum_zoom_field"] = new rangeSlider(_id("circum_zoom_field"), false, function(value) { update_physical_sens('circum_zoom_field',false) });
    global_range_slider_map["setting_kovaak_yaw_num"] = new rangeSlider(_id("setting_kovaak_yaw_num"), false);
    global_range_slider_map["setting_kovaak_pitch_num"] = new rangeSlider(_id("setting_kovaak_pitch_num"), false);


    //fov
    _id("setting_fov").dataset.variable = ("game_fov:" + weapon);
    global_range_slider_map["game_fov:" + weapon] = new rangeSlider(_id("setting_fov"), true, function(value) { update_fov_preview(); });
    engine.call("initialize_range_value", "game_fov:" + weapon);
    //zoomed fov
    _id("setting_zoom_fov").dataset.variable = ("game_zoom_fov:" + weapon);
    global_range_slider_map["game_zoom_fov:" + weapon] = new rangeSlider(_id("setting_zoom_fov"), true, function(value) { update_fov_preview(); });
    engine.call("initialize_range_value", "game_zoom_fov:" + weapon);
    //zoom toggle
    _id("setting_zoom_mode").dataset.variable = ("game_zoom_mode:" + weapon);
    engine.call("initialize_checkbox_value", "game_zoom_mode:" + weapon);

    global_range_slider_map["film_fov_notation_prefix"] = new rangeSlider(_id("film_fov_notation_prefix"), false, function(value) { update_fov_conversion_options('film_fov_notation_prefix'); });
    global_range_slider_map["film_fov_notation_suffix"] = new rangeSlider(_id("film_fov_notation_suffix"), false, function(value) { update_fov_conversion_options('film_fov_notation_suffix'); });
    global_range_slider_map["film_fov_converted"] = new rangeSlider(_id("film_fov_converted"), false, function(value) { update_fov_conversion_options('film_fov_converted'); });
    global_range_slider_map["film_fov_zoom_converted"] = new rangeSlider(_id("film_fov_zoom_converted"), false, function(value) { update_fov_conversion_options('film_fov_zoom_converted'); });

    // CANVAS CROSSHAIR DEFINITIONS
    engine.call("initialize_custom_component_value", "hud_crosshair_definition:" + weapon);
    engine.call("initialize_custom_component_value", "hud_zoom_crosshair_definition:" + weapon);


    // PER-WEAPON & ZOOM FULLSCREEN MASK
    _id("setting_hud_crosshair_sizemask").dataset.variable = ("hud_crosshair_mask_diameter:" + weapon);
    global_range_slider_map["hud_crosshair_mask_diameter:" + weapon] = new rangeSlider(_id("setting_hud_crosshair_sizemask"), true);
    engine.call("initialize_range_value", "hud_crosshair_mask_diameter:" + weapon);
    
    _id("crosshair_color_mask").dataset.variable = ("hud_crosshair_mask_color:" + weapon);
    engine.call("initialize_color_value", "hud_crosshair_mask_color:" + weapon);
    
    _id("setting_hud_crosshair_typemask").dataset.variable = ("hud_crosshair_mask_aperture:" + weapon);
    engine.call("initialize_select_value", "hud_crosshair_mask_aperture:" + weapon);
    
    _id("setting_hud_zoom_crosshair_sizemask").dataset.variable = ("hud_zoom_crosshair_mask_diameter:" + weapon);
    global_range_slider_map["hud_zoom_crosshair_mask_diameter:" + weapon] = new rangeSlider(_id("setting_hud_zoom_crosshair_sizemask"), true);
    engine.call("initialize_range_value", "hud_zoom_crosshair_mask_diameter:" + weapon);
    
    _id("zoom_crosshair_color_mask").dataset.variable = ("hud_zoom_crosshair_mask_color:" + weapon);
    engine.call("initialize_color_value", "hud_zoom_crosshair_mask_color:" + weapon);
    
    _id("setting_hud_zoom_crosshair_typemask").dataset.variable = ("hud_zoom_crosshair_mask_aperture:" + weapon);
    engine.call("initialize_select_value", "hud_zoom_crosshair_mask_aperture:" + weapon);

    // VISUALS
    _id("setting_weapon_position").dataset.variable = ("game_weapon_position:" + weapon);
    engine.call("initialize_select_value", "game_weapon_position:" + weapon);

    // SOUNDS
    _id("setting_hit_sounds").dataset.variable = ("game_hit_sounds:" + weapon);
    engine.call("initialize_checkbox_value", "game_hit_sounds:" + weapon);

    /*
    /// HIT SOUNDS
    _id("setting_game_hit_sound").dataset.variable = ("game_hit_sound:" + weapon);
    engine.call("initialize_select_value", "game_hit_sound:" + weapon);
    _id("setting_game_critical_hit_sound").dataset.variable = ("game_critical_hit_sound:" + weapon);
    engine.call("initialize_select_value", "game_critical_hit_sound:" + weapon);
    */


    //notify engine of page change
    engine.call("weapon_settings_tab_changed", weapon);
    //change name in substitle
    if (weapon > 0) {
        window.current_selected_setting_weapon_number = weapon;
    } else {
        window.current_selected_setting_weapon_number = 0;
    }
}

function on_updated_mask_type_selection() {

    let cont = _id("mask_editor_screen");
    let mask = _id("setting_hud_crosshair_typemask");
    if (mask.dataset.value == "none" || mask.dataset.value == "custom") {
        _for_each_with_class_in_parent(cont, "crosshairmask_properties", function(el) { el.style.display = "none"; });
    } else {
        _for_each_with_class_in_parent(cont, "crosshairmask_properties", function(el) { el.style.display = "flex"; });
    }
    _for_each_with_class_in_parent(cont, 'crosshair_scroll', function(el) {
        refreshScrollbar(el);
    });
    
    let cont_zoom = _id("zoom_mask_editor_screen");
    let mask_zoom = _id("setting_hud_zoom_crosshair_typemask");
    if (mask_zoom.dataset.value == "none" || mask_zoom.dataset.value == "custom") {
        _for_each_with_class_in_parent(cont_zoom, "zoom_crosshairmask_properties", function(el) { el.style.display = "none"; });
    } else {
        _for_each_with_class_in_parent(cont_zoom, "zoom_crosshairmask_properties", function(el) { el.style.display = "flex"; });
    }
    _for_each_with_class_in_parent(cont_zoom, 'crosshair_scroll', function(el) {
        refreshScrollbar(el);
    });
}

function sound_enter() {
    engine.call('ui_sound', 'ui_mouseover1');
}

function sound_click() {
    engine.call('ui_sound', 'ui_click1');
}

function open_home(silent) {
    hl_button("mm_home");
    set_blur(false);
    historyPushState({"page": "home_screen"});
    switch_screens(_id("home_screen"), silent);
    set_party_box_visible(true);
    engine.call("set_avatar_camera_main");
}

function reset_animation_trick(element_id) {
    var elm = document.getElementById(element_id);
    var newone = elm.cloneNode(true);
    elm.parentNode.replaceChild(newone, elm);
}

function reset_animation_trick_by_class(clas) {
    var objs = document.getElementsByClassName(clas);
    for(var i = 0; i < objs.length; i++)
    {
     
        console.log(objs.item(i));
        var elm = objs.item(i);
        var newone = elm.cloneNode(true);
        elm.parentNode.replaceChild(newone, elm);
    }

 
}

function reset_animation_trick_by_element(elm) {
    var newone = elm.cloneNode(true);
    elm.parentNode.replaceChild(newone, elm);
    return newone;
}

function button_game_over_play_again() {
    engine.call("game_over_play_again");
}

let global_fullscreen_spinner_state = false;
function setFullscreenSpinner(bool) {
    let spinner = _id("fullscreen_spinner");
    if (global_fullscreen_spinner_state == false) {
        if (bool) {
            spinner.querySelector(".spinner-icon").classList.add("running");
            anim_show(spinner);
            global_fullscreen_spinner_state = true;
        }
    } else {
        if (!bool) {
            anim_hide(spinner, 200, () => {
                spinner.querySelector(".spinner-icon").classList.add("running");
            });
            global_fullscreen_spinner_state = false;
        }
    }
}

function play_transition_if_hidden(elem, sound_type) {
    if (getComputedStyle(elem).display == "none") {
        engine.call('ui_sound', sound_type);
    }
}

function _fade_out_if_not(selector, exception) {
    anim_remove(selector);

    let display_computed = getComputedStyle(selector).display;
    let display_set = selector.style.display;

    if (selector != exception) {
        if ((display_set != undefined && display_set != "none") || display_computed != "none") {
            anim_hide(selector);

            if (selector.id == "shop_screen") {shop_set_animation_state(false)}
            else if(selector.id == "aim_screen") {aim_scenario_set_video_play(false)}
        }
    } else {
        if (selector.id == "shop_screen") {shop_set_animation_state(true)}
        else if(selector.id == "aim_screen") {aim_scenario_set_video_play(true)}
        
        if (display_set == undefined || display_set == "none" || display_computed == "none") {
            anim_show(selector);
        }
    }
}


let flat_bg_scene_screens = [
    "coin_shop_screen",
    "notification_screen",
    "battlepass_screen",
    "shop_screen",
    "shop_item_screen",
    "player_profile_screen",
];

let fullscreen_screens = [
    "notification_screen",
    "battlepass_upgrade_screen",
]
function switch_screens(dst, silent) {
    engine.call("show_draft", false);

    // Check if the screen actually needs changing
    if (global_menu_page == dst.id) return false;

    setFullscreenSpinner(false);
    if (!silent) {
        play_transition_if_hidden(dst, 'ui_transition1');
    }

    if (!['home_screen','play_panel'].includes(dst.id)) {
        set_party_box_visible(false);
    }

    let menu = _id("lobby_container");
    let menu_display_computed = getComputedStyle(menu).display;
    let menu_display_set = menu.style.display;
    if (fullscreen_screens.includes(dst.id)) {
        if ((menu_display_set != undefined && menu_display_set != "none") || menu_display_computed != "none") {
            anim_hide(menu, 100);
        }
    } else {
        if (menu_display_set == undefined && menu_display_set == "none" || menu_display_computed == "none") {
            anim_show(menu, 100);
        }
    }

    // Contained screens
    _fade_out_if_not(_id('ingame_menu_screen'), dst);
    _fade_out_if_not(_id('settings_screen'), dst);
    _fade_out_if_not(_id('play_panel'), dst);
    _fade_out_if_not(_id('home_screen'), dst);
    _fade_out_if_not(_id('customize_screen'), dst);
    _fade_out_if_not(_id('battlepass_screen'), dst);
    _fade_out_if_not(_id('battlepass_list_screen'), dst);
    _fade_out_if_not(_id('battlepass_upgrade_screen'), dst);
    //_fade_out_if_not(_id('replays_screen'), dst);
    _fade_out_if_not(_id('learn_screen'), dst);
    _fade_out_if_not(_id('watch_screen'), dst);
    _fade_out_if_not(_id('shop_screen'), dst);
    _fade_out_if_not(_id('shop_item_screen'), dst);
    _fade_out_if_not(_id('coin_shop_screen'), dst);
    _fade_out_if_not(_id('create_screen'), dst);
    _fade_out_if_not(_id('leaderboards_screen'), dst);
    _fade_out_if_not(_id('player_profile_screen'), dst);
    _fade_out_if_not(_id('practice_screen'), dst);
    _fade_out_if_not(_id('license_center_screen'), dst);
    _fade_out_if_not(_id('match_screen'), dst);
    _fade_out_if_not(_id('aim_screen'), dst);

    // Full screens
    _fade_out_if_not(_id('notification_screen'), dst);

    // Customization screen view
    if (dst.id == "customize_screen") {
        engine.call("on_show_customization_screen", true);
        engine.call("set_player_decals_override", false, "");
        engine.call("set_player_color_override", false, "");
    } else if (dst.id == "player_profile_screen") {
        engine.call("on_show_customization_screen", true);
    } else if (flat_bg_scene_screens.includes(dst.id)) {
        engine.call("on_show_customization_screen", true);
        engine.call("set_stage_map_camera", ITEM_PREVIEW_CAMERAS.empty);
        engine.call("set_player_decals_override", true, "");
        engine.call("set_player_color_override", false, "");
    } else {
        engine.call("on_show_customization_screen", false);
        engine.call("set_player_decals_override", false, "");
        engine.call("set_player_color_override", false, "");
        if (global_menu_page == "customize_screen") {
            reset_customization_previews();
        }
    }

    // Pause any preview music thats currently playing
    _pause_music_preview();

    if (dst.id == "battlepass_screen") {
        let menu_bottom_bp = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass_open");

        if (menu_bottom_bp) {
            menu_bottom_bp.classList.add("active");
            let menu_bottom_label = menu_bottom_bp.querySelector(".menu_bottom_battlepass_label");
            if (menu_bottom_label) menu_bottom_label.classList.add("active");
            let menu_bottom_level_icon = menu_bottom_bp.querySelector(".bp_level_icon");
            if (menu_bottom_level_icon) menu_bottom_level_icon.classList.add("active");
        }
    } else if (global_menu_page == "battlepass_screen" && dst.id != "battlepass_screen") {
        let menu_bottom_bp = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass_open");

        if (menu_bottom_bp) {
            menu_bottom_bp.classList.remove("active");
            let menu_bottom_label = menu_bottom_bp.querySelector(".menu_bottom_battlepass_label");
            if (menu_bottom_label) menu_bottom_label.classList.remove("active");
            let menu_bottom_level_icon = menu_bottom_bp.querySelector(".bp_level_icon");
            if (menu_bottom_level_icon) menu_bottom_level_icon.classList.remove("active");
        }
    }


    if (dst.id == "settings_screen" && global_current_settings_section == "hud") {
        hud_editor_visible(true);
    } else {
        hud_editor_visible(false);
    }
    
    cleanup_floating_containers();

    global_menu_page = dst.id;

    return true;
}

function play_menu_change_tab(tab, newPage) {
    if (tab.classList.contains("locked")) {
        return;
    }

    highlight_play_menu(tab);

    if (global_play_menu_page != newPage.id) {
        if (newPage.id == "play_screen_quickplay") play_screen_reset_cards("quickplay");
        if (newPage.id == "play_screen_ranked") play_screen_reset_cards("ranked");
    }

    if(newPage == _id("play_screen_customlist") || newPage == _id("play_screen_custom")) {
        if (global_lobby_id == -1) {
            if (global_play_menu_page != "play_screen_customlist") {
                play_transition_if_hidden(_id('play_screen_customlist'), 'ui_transition1');
                _fade_out_if_not(_id('play_screen_custom'), _id('play_screen_customlist'));
                _fade_out_if_not(_id('play_screen_customlist'), _id('play_screen_customlist'));

                global_play_menu_page = "play_screen_customlist";
                updateCustomMatchList();
            }
        } else {
            if (global_play_menu_page != "play_screen_custom") {
                play_transition_if_hidden(_id('play_screen_custom'), 'ui_transition1');
                _fade_out_if_not(_id('play_screen_customlist'), _id('play_screen_custom'));
                _fade_out_if_not(_id('play_screen_custom'), _id('play_screen_custom'));

                global_play_menu_page = "play_screen_custom";
            }
        }
    } else {
        play_transition_if_hidden(newPage, 'ui_transition1');
        _fade_out_if_not(_id('play_screen_customlist'), newPage);
        _fade_out_if_not(_id('play_screen_custom'), newPage);

        global_play_menu_page = newPage.id;
    }

    historyPushState({
        "page": "play_screen",
        "subpage": global_play_menu_page,
    });
    
    _fade_out_if_not(_id('play_screen_quickplay'), newPage);
    _fade_out_if_not(_id('play_screen_ranked'), newPage);
    //_fade_out_if_not(_id('play_screen_esports'), newPage);

    if (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom") {
        set_party_box_visible(false);
    } else {
        set_party_box_visible(true);
    }
}

let global_background_blur = false;
function set_blur(blur) {
    global_background_blur = blur;
    engine.call('set_blur', blur);
}

function highlight_play_menu(selector) {

    var items = document.querySelectorAll(".play_screen_button.active");

    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('active')
    }

    selector.classList.add("active");
}

function open_play(screen, silent) {
    hl_button("mm_play");
    set_blur(true);
    engine.call("set_avatar_camera_main");

    if (screen && (screen == 'play_screen_custom' || screen == 'play_screen_customlist')) {
        play_screen_open_custom(true, screen);
    } else if (screen && screen == 'play_screen_ranked') {
        play_screen_open_competitive_play();
    } else if (screen && screen == 'play_screen_quickplay') {
        play_screen_open_quick_play();
    } else {
        play_screen_open_default(silent);

        if (global_play_menu_page == "play_screen_customlist" || global_play_menu_page == "play_screen_custom") {
            set_party_box_visible(false);
        } else {
            set_party_box_visible(true);
        }
    }

    if (global_play_menu_page == "play_screen_quickplay") play_screen_reset_cards("quickplay");
    if (global_play_menu_page == "play_screen_ranked") play_screen_reset_cards("ranked");
}

function play_screen_open_custom(switch_screen, screen) {
    play_menu_change_tab(_id("play_menu_tab_custom"), _id(screen));
    if (switch_screen) {
        switch_screens(_id('play_panel'));
    }
}
function play_screen_open_quick_play() {
    play_menu_change_tab(_id("play_menu_tab_quickplay"), _id('play_screen_quickplay'));
    let changed = switch_screens(_id("play_panel"));
    if (changed) play_screen_reset_cards("quickplay");
}
function play_screen_open_competitive_play() {
    play_menu_change_tab(_id("play_menu_tab_ranked"), _id('play_screen_ranked'));
    let changed = switch_screens(_id("play_panel"));
    if (changed) play_screen_reset_cards("ranked");
}
function play_screen_open_default(silent) {
    historyPushState({
        "page": "play_screen",
        "subpage": global_play_menu_page,
    });
    switch_screens(_id("play_panel"), silent);
}

function open_ingame_menu(silent) {
    set_blur(true);
    hl_button("mm_ingame");
    switch_screens(_id("ingame_menu_screen"), silent);
}

function open_create() {
    set_blur(true);
    hl_button("mm_create");
    historyPushState({"page": "create_screen"});
    switch_screens(_id("create_screen"));
}

function open_practice() {
    set_blur(true);
    hl_button("mm_practice");
    let changed = switch_screens(_id("practice_screen"));
    if (changed) {
        historyPushState({"page": "practice_screen"});
        practice_screen_reset_cards();
    }
}

function open_aim() {
    set_blur(true);
    hl_button("mm_practice");
    switch_screens(_id("aim_screen"));
    historyPushState({"page": "aim_screen"});
}

function open_license_center() {
    switch_screens(_id("license_center_screen"));
}

function open_shop() {
    set_blur(false);
    hl_button("mm_shop");
    historyPushState({"page": "shop_screen"});
    switch_screens(_id("shop_screen"));

    load_shop();
}

function open_shop_item(item_group_data, item_index) {
    set_blur(true);
    hl_button("mm_shop");
    historyPushState({
        "page": "shop_item_screen",
        "item_group_data": item_group_data,
        "item_index": item_index
    });
    switch_screens(_id("shop_item_screen"));

    render_shop_item(item_group_data, item_index);
}

function open_coin_shop() {
    set_blur(true);
    hl_button("mm_shop");
    if (global_menu_page != 'coin_shop_screen') {
        historyPushState({"page": "coin_shop_screen"});
    }
    switch_screens(_id("coin_shop_screen"));

    load_coin_shop();
}

function open_gift() {
    load_gift();
}

function open_learn() {
    set_blur(true);
    hl_button(".learn_menu_button");
    historyPushState({"page": "learn_screen"});
    switch_screens(_id("learn_screen"));
}

function open_watch() {
    set_blur(true);
    hl_button("mm_watch");
    historyPushState({"page": "watch_screen"});
    switch_screens(_id("watch_screen"));

    load_watch_screen();
}

function open_leaderboards(mode) {
    set_blur(true);
    hl_button("mm_leaderboards");
    historyPushState({"page": "leaderboards_screen"});
    switch_screens(_id("leaderboards_screen"));
    
    load_leaderboard(mode);
}

function open_replays() {
    set_blur(true);
    hl_button("mm_replays");
    switch_screens(_id("replays_screen"));
}

function open_player_profile(id, subpage) {
    let origin = global_menu_page;

    set_blur(false);
    hl_button("mm_profile");
    switch_screens(_id("player_profile_screen"));

    let load_subpage = "profile";
    if (subpage) load_subpage = subpage;

    let load_id = id;
    if (id == "own") load_id = global_self.user_id;

    load_player_profile(origin, load_subpage, load_id);
}

function open_match(match_id) {
    if (match_id == undefined) return;

    set_blur(true);
    hl_button("mm_profile");
    switch_screens(_id("match_screen"));

    historyPushState({
        "page": "match_screen",
        "id": match_id
    });

    load_match(match_id);
}

function open_battlepass() {
    if (_id("battlepass_screen").style.display == "none" || _id("battlepass_screen").style.display == undefined) {
        // unset any previous button highlights
        hl_button();

        if (!global_user_battlepass.battlepass_id) {
            load_battlepass_data(function() {
                if (global_user_battlepass.battlepass_id) {
                    set_blur(true);
                    historyPushState({"page": "battlepass_screen"});
                    switch_screens(_id("battlepass_screen"));
                    load_battlepass();
                }
            });
        } else {
            set_blur(true);
            historyPushState({"page": "battlepass_screen"});
            switch_screens(_id("battlepass_screen"));
            load_battlepass();
        }

    } else {
        //open_home();
    }
}

/* outdated
function open_battlepass_list() {
    set_blur(true);
    historyPushState({"page": "battlepass_list_screen"});
    switch_screens(_id("battlepass_list_screen"));

    if (!global_battlepass_list.length) {
        send_string(CLIENT_COMMAND_GET_BATTLEPASS_LIST, "", "battlepass-list", function(data) {
            global_battlepass_list = data.data;
            load_battlepass_list();
        });
    } else {
        load_battlepass_list();
    }
}
*/

function open_battlepass_upgrade() {
    if ("battlepass" in global_user_battlepass && global_user_battlepass.battlepass.owned == true) {
        open_battlepass();
        return;
    }
    set_blur(true);
    historyPushState({"page": "battlepass_upgrade_screen"});
    switch_screens(_id("battlepass_upgrade_screen"));
    load_battlepass_upgrade();
}

function open_notifications() {
    set_blur(true);
    switch_screens(_id("notification_screen"));
}

function updateMenuBottomBattlepass(bp) {
    let cont = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass");
    
    let bp_cont = cont.querySelector(".menu_bottom_battlepass_open");
    _empty(bp_cont);
    
    let label = _createElement("div", "menu_bottom_battlepass_label");
    label.innerHTML = localize("battlepass");
    bp_cont.appendChild(label);

    if (!bp || !bp.battlepass) {
        anim_remove(cont);
        label.classList.add("no_bp");
        cont.style.display = "none";
        return;
    }
    
    if (global_user_battlepass.battlepass) {
        let level_icon = _createElement("div", "bp_level_icon");
        level_icon.textContent = global_user_battlepass.battlepass.level;
        if (global_user_battlepass.battlepass.owned) {
            level_icon.classList.add("paid");
        }
        bp_cont.appendChild(level_icon);
    } else {
        anim_remove(cont);
        label.classList.add("no_bp");
        cont.style.display = "none";
    }
}

function updateMenuBottomBattlepassLevel() {
    if (global_user_battlepass.battlepass) {
        let cont = _id("menu_background_bottom").querySelector(".bp_level_icon");
        cont.textContent = global_user_battlepass.battlepass.level;
    }
}

function showMenuBottomBattlepass() {
    if (global_user_battlepass && global_user_battlepass.battlepass) {
        let cont = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass");
        if (cont) anim_show(cont, 350);
    }
}

function replaceChallenge(challenge_id, new_challenge) {
    for (let i=0; i<global_user_battlepass.challenges.length; i++) {
        if (global_user_battlepass.challenges[i].challenge_id == challenge_id) {
            global_user_battlepass.challenges[i] = new_challenge;
            break;
        }
    }
}

function updateChallenges() {
    // Home menu challenge list
    render_home_challenges();

    // Bottom menu challenge indicators
    let cont = _id("menu_background_bottom").querySelector(".menu_bottom_battlepass_daily");
    if (global_user_battlepass.challenges && global_user_battlepass.challenges.length) {
        let state_cont = cont.querySelector(".daily_challenges_state");
        _empty(state_cont);
        for (let c of global_user_battlepass.challenges) {
            let circle = _createElement("div", "simple_circle");
            if (c.achieved) circle.classList.add("circle_filled");
            state_cont.appendChild(circle);
        }
        cont.style.display = "flex";
    } else {
        cont.style.display = "none";
    }
}





function accept_invitation(lobby_id) {
    // obsolete?
    /*
    engine.call('accept_invitation', lobby_id);    
    hide_dialog();
    */
}





function hl_button(selector) {
    
    let items = document.querySelectorAll(".hl_button");

    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('hl_button')
    }

    if (selector) {
        if (selector.charAt(0) == ".") {
            items = _id("lobby_container").querySelectorAll(selector);
            for (var i = 0; i < items.length; i++) {
                items[i].classList.add('hl_button')
            }
        } else {
            let el = _id(selector);
            if (el) {
                el.classList.add("hl_button");
            }
        }
    }
}

function open_settings() {
    hud_editor_fullscreen(false);

    if (global_arguments.includes("-showmods")) {
        _id("settings_section_title_mods").style.display = "block";
    }

    historyPushState({"page": "settings_screen"});

    // wait for hud_editor_fullscreen false to finish
    req_anim_frame(() => {
        hl_button("mm_options");
        set_blur(true);

        switch_screens(_id("settings_screen"));        
        update_fov_preview();
        req_anim_frame(() => {
            ultra_advanced_accel_visible(false);
            update_accel_chart();
        });
    }, 2);
}

function set_settings_section_visible(section, current_section) {
    {
        let el = _id("settings_screen_" + section);
        if (el){
            if (section == current_section){
                anim_show(el);
                
                if (section == "options") {
                    refreshScrollbar(_id("settings_screen_more_settings"));
                }
            } else {
                if (getComputedStyle(el).display != "none") {
                    anim_hide(el, 250, function() {
                        if (section == "options") {
                            resetScrollbar(_id("settings_screen_more_settings"));
                        }
                    });
                }
            }
        }
    }
    {
        let el = _id("settings_section_title_" + section);
        if (el){
            if (section == current_section){
                el.classList.add("settings_highlighted_section_title");
            } else {
                el.classList.remove("settings_highlighted_section_title");
            }
        }
    }
}

var global_current_settings_section = "weapons";
function settings_section(section) {
    set_settings_section_visible("weapons", section);
    set_settings_section_visible("controls", section);
    set_settings_section_visible("options", section);
    set_settings_section_visible("video", section);
    set_settings_section_visible("audio", section);
    set_settings_section_visible("hud", section);
    set_settings_section_visible("mods", section);
    global_current_settings_section = section;

    if (section == "hud") {
        hud_editor_visible(true);
    } else {
        hud_editor_visible(false);
    }
    
    cleanup_floating_containers();
}

function set_skin_section_visible(section, current_section) {
    if (_id("skin_screen_" + section).display == "none") {
        if (section == current_section) {
            anim_show(_id("skin_screen_" + section));
        } else {
            anim_show(_id("skin_screen_" + section));
        }
    }

    if (_id("skin_section_title_" + section).display == "none") {
        if (section == current_section) {
            _id("skin_section_title_" + section).classList.add("skin_highlighted_section_title");
        } else {
            _id("skin_section_title_" + section).classList.remove("skin_highlighted_section_title");
        }
    }
}

function settings_reset(section) {
    if (section == "controls") {
        genericModal(localize("settings_reset_controls"), "", localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), function() {
            console.log("resetting controls");
            queue_dialog_msg({"msg": "Not implemented"});
        });
    }
    if (section == "weapons") {
        genericModal(localize("settings_reset_weapons"), "", localize("menu_button_cancel"), undefined, localize("menu_button_confirm"), function() {
            console.log("resetting weapons");
            queue_dialog_msg({"msg": "Not implemented"});
        });
    }
}

/*
function request_character_browser_update(section) {
    engine.call("request_character_browser_update", section);
}

function skin_section(section) {
    //set_skin_section_visible("skins", section);
    //set_skin_section_visible("decals", section);
    //set_skin_section_visible("shop", section);
    engine.call("on_customize_section_loaded", section);
    if (section == "decals") {
        request_character_browser_update(section);
    }
}
*/
let initial_customization_opened = false;
function open_customization(category, type) {
    set_blur(global_customization_blur_active);

    if (category && type) {
        customization_load_category(null, category, type);
        initial_customization_opened = true;   
    } else if (!initial_customization_opened) {
        if (global_ms_connected) {
            customization_load_category(null, "sticker", "");
            initial_customization_opened = true;
        }
    } else {
        if (global_customization_active_category) {
            customization_show_category(global_customization_active_category, global_customization_active_ctype);
        }
    }
    historyPushState({"page": "customize_screen" });
    switch_screens(_id("customize_screen"));
    hl_button("mm_customize");
}

function delete_bindings(command, mode) {
    engine.call("delete_bindings", command, mode);
}

function update_checkbox(checkbox) {
    var value = false;
    var data_value = checkbox.dataset.enabled;
    if (data_value && (data_value === "true" || data_value === true)) {
        value = true;
    }
    //echo("VAL="+value + " : " + data_value);
    if (value) {
        checkbox.classList.add("checkbox_enabled");
        checkbox.firstElementChild.classList.add("inner_checkbox_enabled");
    } else {
        checkbox.classList.remove("checkbox_enabled");
        checkbox.firstElementChild.classList.remove("inner_checkbox_enabled");
    }

    // Weapon setting blocks
    var variable = checkbox.dataset.variable;
    let cont = null;
    let visible = false;
    if (checkbox.id == "setting_weapon_use_sensitivity") {
        cont = _id("settings_block_sensitivity");
        if (value || variable == "game_custom_weapon_sensitivity:0") visible = true;
    } else if (checkbox.id == "setting_weapon_use_accel") {
        cont = _id("settings_block_accel");
        if (value || variable == "game_custom_weapon_accel:0") visible = true;
    } else if (checkbox.id == "setting_weapon_use_fov") {
        cont = _id("settings_block_fov");
        if (value || variable == "game_custom_weapon_fov:0") visible = true;
    } else if (checkbox.id == "setting_weapon_use_crosshair") {
        cont = _id("settings_block_crosshair");
        if (value || variable == "game_custom_weapon_crosshair:0") visible = true;
    } else if (checkbox.id == "setting_weapon_use_zoom_crosshair") {
        cont = _id("settings_block_zoom_crosshair");
        if (value || variable == "game_custom_weapon_zoom_crosshair:0") visible = true;
    } else if (checkbox.id == "setting_weapon_use_visuals") {
        cont = _id("settings_block_visuals");
        if (value || variable == "game_custom_weapon_visuals:0") visible = true;
    } else if (checkbox.id == "setting_weapon_use_sounds") {
        cont = _id("settings_block_sounds");
        if (value || variable == "game_custom_weapon_sounds:0") visible = true;
    }

    if (cont !== null) {
        if (visible) cont.classList.remove("locked");
        else cont.classList.add("locked");
    }
}

function load_crosshair_editor() {
    open_modal_screen("mask_editor_screen", function() {
        refreshScrollbar(_id("mask_editor_screen").querySelector(".crosshair_scroll"));
    });
    //on_updated_crosshair_type_selection();
    on_updated_mask_type_selection();
}

function load_zoom_crosshair_editor() {
    open_modal_screen("zoom_mask_editor_screen",  function() {
        refreshScrollbar(_id("zoom_mask_editor_screen").querySelector(".crosshair_scroll"));
    });
    //on_updated_crosshair_type_selection();
    on_updated_mask_type_selection();
}

function load_canvas_crosshair_editor() {
    open_modal_screen("crosshair_canvas_editor_screen", function() {
        refreshScrollbar(_id("crosshair_canvas_editor_screen").querySelector(".crosshair_scroll"));
    });
}

function load_canvas_crosshair_zoom_editor() {
    open_modal_screen("crosshair_canvas_zoom_editor_screen", function() {
        refreshScrollbar(_id("crosshair_canvas_zoom_editor_screen").querySelector(".crosshair_scroll"));
    });
}

/*
function close_skill_selection() {
    if (!$("#accept_skills_button").hasClass("button_disabled")) {
        $("#skill_selection").hide();
        //$("#score").hide();
        window.draft_visible = false;
        engine.call("skill_selection_closed");
        //$("#game_hud").fadeIn(window.fade_time);
        anim_show(_id("game_hud"), window.fade_time);
    }
}
*/

function party_context_select(cmd, user_id) {
    if (cmd == "remove") {
        send_json_data({"action": "party-remove", "user-id": user_id });
    }
    if (cmd == "leave") {
        send_json_data({"action": "party-leave" });
    }
    if (cmd == "promote") {
        send_json_data({"action": "party-promote", "user-id": user_id });
    }
}


function queue_timer_update() {
    if (!global_mm_searching_ranked && !global_mm_searching_quickplay) return;

    let now = Date.now();

    if (global_mm_searching_ranked) {
        let time = Math.floor((now - global_mm_start_ranked_ts) / 1000);
        if (time != global_mm_time_ranked) {
            global_mm_time_ranked = time;
            let queueTimerDOM = _get_first_with_class_in_parent(_id("queue_mm_box"), 'queue_queue_time');
            let minutes = Math.floor(time / 60);
            let seconds = time % 60;
            let formattedMinutes = ("0" + minutes).slice(-2);
            let formattedSeconds = ("0" + seconds).slice(-2);

            queueTimerDOM.textContent = formattedMinutes + ":" + formattedSeconds;
        }
    }
    if (global_mm_searching_quickplay) {
        let time = Math.floor((now - global_mm_start_quickplay_ts) / 1000);
        if (time != global_mm_time_quickplay) {
            global_mm_time_quickplay = time;
            let queueTimerDOM = _get_first_with_class_in_parent(_id("queue_quickplay_box"), 'queue_queue_time');
            let minutes = Math.floor(time / 60);
            let seconds = Math.floor(time % 60);
            let formattedMinutes = ("0" + minutes).slice(-2);
            let formattedSeconds = ("0" + seconds).slice(-2);

            queueTimerDOM.textContent = formattedMinutes + ":" + formattedSeconds;
        }
    }

}

function process_queue_msg(type, msg) {
    console.log("process_queue_msg", type, msg);

    var elem;
    if (type == "all") {
        process_queue_msg("ranked", msg);
        process_queue_msg("quickplay", msg);
        return;
    }

    if (type == "ranked")    { elem = _id("queue_mm_box"); }
    if (type == "quickplay") { elem = _id("queue_quickplay_box"); }

    if (msg == "start") {

        elem.style.display = "flex";
        elem.style.opacity = 1;

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_info');
        queueInfoDOM.style.display = "flex";

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_cancel_box');
        queueInfoDOM.style.display = "";

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_match_found');
        queueInfoDOM.style.display = "none";

        anim_remove(elem);
        anim_start({
            element: elem,
            translateX: [-50, 0, "vh"],
            duration: 500,
            easing: easing_functions.easeOutQuad,
        });      

        if (type == 'ranked') {
            global_mm_searching_ranked = true;
            global_mm_start_ranked_ts = Date.now();
        }
        if (type == 'quickplay') {
            global_mm_searching_quickplay = true;
            global_mm_start_quickplay_ts = Date.now();
        }

        queue_timer_update();

    } else if (msg == "stop") {

        if (type == "ranked")    global_mm_searching_ranked = false;
        if (type == "quickplay") global_mm_searching_quickplay = false;

        anim_remove(elem);
        anim_start({
            element: elem,
            translateX: [0, -50, "vh"],
            duration: 500,
            hide: true,
            easing: easing_functions.easeOutQuad,
        });

    } else if (msg == "resume") {

        elem.style.display = "flex";
        elem.style.opacity = 1;

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_info');
        queueInfoDOM.style.display = "flex";

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_cancel_box');
        queueInfoDOM.style.display = "";

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_match_found');
        queueInfoDOM.style.display = "none";

        anim_remove(elem);
        anim_start({
            element: elem,
            translateX: [-50, 0, "vh"],
            duration: 500,
            easing: easing_functions.easeOutQuad,
        });

        if (type == "ranked")    global_mm_searching_ranked = true;
        if (type == "quickplay") global_mm_searching_quickplay = true;

    } else if (msg == "found") {

        // Reset the inactivity timer if we are about to join a match
        engine.call("reset_inactivity_timer");

        if (type == "ranked")    global_mm_searching_ranked = false;
        if (type == "quickplay") global_mm_searching_quickplay = false;

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_info');
        queueInfoDOM.style.display = "none";

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_cancel_box');
        queueInfoDOM.style.display = "none";

        var queueInfoDOM = _get_first_with_class_in_parent(elem, 'queue_match_found');
        queueInfoDOM.style.display = "flex";
        
        anim_remove(elem);
        anim_start({
            element: elem,
            translateX: [0, -50, "vh"],
            delay: 0,
            duration: 500,
            hide: true,
            easing: easing_functions.easeOutQuad,
            completion: function() {
                elem.style.display = "none";
            }
        });

    }

    update_queue_mode_selection();
}

function cancel_search(type) {
    if (type == "ranked")    global_mm_searching_ranked = false;
    if (type == "quickplay") global_mm_searching_quickplay = false;

    var elem;
    if (type == "ranked")    elem = _id('queue_mm_box');
    if (type == "quickplay") elem = _id('queue_quickplay_box');

    if (elem == undefined) return;

    send_json_data({"action": "party-cancel-queue", "type": type });

    update_queue_mode_selection();

    //elem.style.display = "none";
}

/*
function update_clock() {
    var today = new Date();

    var options = { weekday: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' };

    //Coherent doesn't suppor tthe option parameters in Date.toLocaleDateString or Date.toLocaleTimeString so we
    //need to trim some things manually.

    //Trim the timezone from the date string
    var time_str = today.toLocaleTimeString("en-US");
    var time_str_toks = time_str.split(" ");
    var trimmed_time_str = "";
    if (time_str_toks.length >= 2) {
        //Trim the seconds from the time string
        var time_str = time_str_toks[0];
        var time_arr = time_str.split(":");
        if (time_arr.length >= 2) {
            time_str = time_arr[0] + ":" + time_arr[1];
        }
        trimmed_time_str = time_str + " " + time_str_toks[1];
    }
    _id("clock_time").innerHTML = ("<p>" + trimmed_time_str + "</p><p>" + today.toLocaleDateString("en-US", options)+"</p>");// + " : " + s);
    setTimeout(function () { update_clock() }, 500);
}
*/

window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

window.randomScalingFactor = function () {
    return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
};

function controls_section(element) {
    _for_each_with_class_in_parent(_id("settings_screen_controls_bar"), "active_controls_section", function(el) {
        el.classList.remove("active_controls_section");
    });
    element.classList.add("active_controls_section");

    if (element.id == "settings_controls_section_spectating") {
        anim_show(_id("settings_screen_controls_subsection_spectating"), window.fade_time, "flex", function() {
            refreshScrollbar(_id("settings_screen_controls_subsection_spectating"));
        });
    } else {
        anim_hide(_id("settings_screen_controls_subsection_spectating"), window.fade_time, function() {
            resetScrollbar(_id("settings_screen_controls_subsection_spectating"));
        });
    }
    if (element.id == "settings_controls_section_editing") {
        anim_show(_id("settings_screen_controls_subsection_editing"), window.fade_time, "flex", function() {
            refreshScrollbar(_id("settings_screen_controls_subsection_editing"));
        });
    } else {
        anim_hide(_id("settings_screen_controls_subsection_editing"), window.fade_time, function() {
            resetScrollbar(_id("settings_screen_controls_subsection_editing"));
        });
    }
    if (element.id == "settings_controls_section_shop") {
        anim_show(_id("settings_screen_controls_subsection_shop"), window.fade_time, "flex", function() {
            refreshScrollbar(_id("settings_screen_controls_subsection_shop"));
        });
    } else {
        anim_hide(_id("settings_screen_controls_subsection_shop"), window.fade_time, function() {
            resetScrollbar(_id("settings_screen_controls_subsection_shop"));
        });
    }
    if (element.id == "settings_controls_section_communication") {
        anim_show(_id("settings_screen_controls_subsection_communication"), window.fade_time, "flex", function() {
            refreshScrollbar(_id("settings_screen_controls_subsection_communication"));
        });
    } else {
        anim_hide(_id("settings_screen_controls_subsection_communication"), window.fade_time, function() {
            resetScrollbar(_id("settings_screen_controls_subsection_communication"));
        });
    }
    if (element.id == "settings_controls_section_gameplay") {
        anim_show(_id("settings_screen_controls_subsection_gameplay"), window.fade_time, "flex", function() {
            refreshScrollbar(_id("settings_screen_controls_subsection_gameplay"));
        });
    } else {
        anim_hide(_id("settings_screen_controls_subsection_gameplay"), window.fade_time, function() {
            resetScrollbar(_id("settings_screen_controls_subsection_gameplay"));
        });
    }
}





function set_weapon_skin(element) {
    engine.call("set_weapon_skin", $(element).data("weapon"), $(element).data("alias"));
}

function customize_screen_previous_weapon(element) {
    engine.call("customize_screen_change_weapon", -1);
}

function customize_screen_next_weapon(element) {
    engine.call("customize_screen_change_weapon", 1);
}

/*
function shop_skill_over(skill_button) {
    var code = "";
    if ($(skill_button).data("item-category") == "favor") {
        code += "<div class='skill_tip_cost_favor'>" + $(skill_button).data("cost") + "</div>";
    } else if ($(skill_button).data("item-category") == "revenge") {
        code += "<div class='skill_tip_cost_revenge'>" + $(skill_button).data("cost") + "</div>";
    }
    code += "<div class='skill_tip_name'>" + $(skill_button).data("name") + "</div>";
    code += "<div class='skill_tip_description'>" + $(skill_button).data("description") + "</div>";
    $("#shop_skill_subcontainer").html(code);
}

function shop_skill_out() {
    $("#shop_skill_subcontainer").html("");
}

function shop_category_over(category_name, category_description) {
    $("#shop_category_subcontainer").html(
        "<div class='skill_tip_name'>" + category_name + "</div>" +
        "<div class='skill_tip_description'>" + category_description + "</div>"
    );
}

function shop_category_out() {
    $("#shop_category_subcontainer").html("");
}

function shop_skill_buy(e) {
    engine.call("buy_skill", $(e.target).data("skill"), e.which == 3 ? true : false);
}

function _shop_category_click(category_div) {
    engine.call("select_class", $(category_div).data("category"));
}
*/


function initialize_tooltip_hovers() {
    _for_each_in_class('tooltip', function(el) {
        el.addEventListener("mouseenter", function() {
            _for_each_with_class_in_parent(el, 'tip_inner', function(tip) {
                tip.classList.add("active");
            });
        });
        el.addEventListener("mouseleave", function() {
            _for_each_with_class_in_parent(el, 'tip_inner', function(tip) {
                tip.classList.remove("active");
            });
        });
    });
}

function initialize_element_tooltip_hover(el) {
    if (!el.classList.contains("tooltip")) return;

    el.addEventListener("mouseenter", function() {
        _for_each_with_class_in_parent(el, 'tip_inner', function(tip) {
            tip.classList.add("active");
        });
    });
    el.addEventListener("mouseleave", function() {
        _for_each_with_class_in_parent(el, 'tip_inner', function(tip) {
            tip.classList.remove("active");
        });
    });
}

function initialize_tooltip_type2() {
    _for_each_in_class('tooltip2', function(el) {
        add_tooltip2_listeners(el);
    });
}

var global_tooltip2_active = false;
var global_tooltip2_last_update = undefined;
function add_tooltip2_listeners(el) {
    let tt2 = _id('tooltip2');
    let menu = _id('main_menu');
    let menu_rect = menu.getBoundingClientRect();
    let posY = "bottom";
    let posX = "right";
    let timeout = undefined;
    let last_pos_x = undefined;
    let last_pos_y = undefined;
    
    el.addEventListener("mouseenter", function(e) {
        e.stopPropagation();
        last_pos_x = e.clientX;
        last_pos_y = e.clientY;

        menu_rect = menu.getBoundingClientRect();
        
        timeout = setTimeout(function() {
            if ("msgId" in el.dataset) {
                _html(tt2, localize(el.dataset.msgId));
            } else if ("msg" in el.dataset) {
                _html(tt2, el.dataset.msg);
            } else if ("msgHtmlId" in el.dataset) {
                _empty(tt2);
                tt2.appendChild(generate_tt_content(el));
            }
            tt2.style.filter = "opacity(0)";
            tt2.style.display = "flex";
            setTimeout(function() {
                tt2_rect = tt2.getBoundingClientRect();
                tt2.style.display = "none";
            
                if (last_pos_y + tt2_rect.height > menu_rect.height) {
                    posY = "top";
                    tt2.style.bottom = (menu_rect.height - last_pos_y + 10) + "px";
                    tt2.style.top = "auto";
                } else {
                    tt2.style.bottom = "auto";
                    tt2.style.top = (last_pos_y + 20) + "px";
                }
                if (last_pos_x + tt2_rect.width > menu_rect.width) {
                    posX = "left";
                    tt2.style.left = "auto";
                    tt2.style.right = (menu_rect.width - last_pos_x + 10) + "px";
                } else {
                    tt2.style.left = (last_pos_x + 25) + "px";
                    tt2.style.right = "auto";
                }

                anim_show(tt2);

                global_tooltip2_last_update = Date.now();
                global_tooltip2_active = true;
            });
        },300);
    });
    el.addEventListener("mouseleave", function(e) {
        if (timeout != undefined) {
            clearTimeout(timeout);
        }
        tt2.style.display = "none";

        global_tooltip2_last_update = undefined;
        global_tooltip2_active = false;
    });
    el.addEventListener("mousemove", function(e) {
        global_tooltip2_last_update = Date.now();
        last_pos_x = e.clientX;
        last_pos_y = e.clientY;
        if (!global_tooltip2_active) return;
        
        if (posY == "top") {
            tt2.style.bottom = (menu_rect.height - e.clientY + 10) + "px";
            tt2.style.top = "auto";
        } else {
            tt2.style.bottom = "auto";
            tt2.style.top = (e.clientY + 20) + "px";
        }
        if (posX == "left") {
            tt2.style.left = "auto";
            tt2.style.right = (menu_rect.width - e.clientX + 10) + "px";
        } else {
            tt2.style.left = (e.clientX + 25) + "px";
            tt2.style.right = "auto";
        }
    });
}

function initialize_tooltip2_cleanup_listener() {
    document.addEventListener("mousemove", function() {
        if (!global_tooltip2_active) return;
        if (global_tooltip2_last_update) {
            if ((Date.now() - global_tooltip2_last_update) > 1) {
                global_tooltip2_active = false;
                global_tooltip2_last_update = undefined;
                cleanup_floating_containers();
            }
        }
    });
}

function cleanup_floating_containers() {
    _id('tooltip2').style.display = "none";
}

function generate_tt_content(el) {
    let msg_id = el.dataset.msgHtmlId
    //console.log("generate TT content, id:",msg_id);

    if (msg_id == "daily_challenges") {
        return generate_tooltip_daily_challenges();
    }

    if (msg_id == "queue_info_quickplay") {
        return generate_tooltip_queue_info("quickplay");
    }

    if (msg_id == "queue_info_ranked") {
        return generate_tooltip_queue_info("ranked");
    }

    if (msg_id == "customization_item") {
        return generate_customization_item_info(el.dataset.id, el.dataset.type, el.dataset.rarity);
    }

    if (msg_id == "mode_description") {
        if (el.dataset.match_mode) {
            return generate_mode_info(el.dataset.match_mode);
        } else {
            return;
        }
    }

    if (msg_id == "card_tooltip") {
        if (el.dataset.match_mode) {
            return generate_card_info(el.dataset.match_mode, Number(el.dataset.instagib));
        } else {
            return;
        }
    }

    return _createElement("div","");
}

function generate_mode_info(mode) {
    let modes = mode.split(':');

    let cont = _createElement("div", "mode_description_cont");

    let count = 0;
    for (let mode of modes) {
        if (count > 0) {
            let separator = _createElement("div", "separator");
            cont.appendChild(separator);
        }
        count++;
        let title = '';
        let desc = '';
        if (mode in global_game_mode_map) {
            title = localize(global_game_mode_map[mode].i18n);
            desc = localize(global_game_mode_map[mode].desc_i18n);
        }
        
        let desc_cont = _createElement("div", "mode_description");
        desc_cont.appendChild(_createElement("div", "title", title));
        desc_cont.appendChild(_createElement("div", "desc", desc));
        cont.appendChild(desc_cont);
    }

    return cont;
}

function generate_card_info(mode, instagib) {
    let cont = _createElement("div", "mode_description_cont");        
    let desc_cont = _createElement("div", "mode_description");

    let title = localize(global_game_mode_map[mode].i18n);
    if (instagib) title += " "+localize("game_mode_type_instagib");

    let desc = localize(global_game_mode_map[mode].desc_i18n)
    if (instagib) desc = localize(global_game_mode_map[mode].desc_instagib_i18n);

    desc_cont.appendChild(_createElement("div", "title", title));
    desc_cont.appendChild(_createElement("div", "desc", desc));
    cont.appendChild(desc_cont);
    return cont;
}

function generate_tooltip_daily_challenges() {
    let list = _createElement("div", "challenge_list");
    render_daily_challenges(list, global_user_battlepass.challenges);
    return list;
}

function generate_tooltip_queue_info(type) {
    let list = _createElement("div", "queue_mode_list");

    let groups = {};

    for (let cb of global_queue_mode_checkboxes) {
        if (cb.parentElement == null) continue;
        
        if (cb.dataset.type == type && cb.dataset.mode.length && cb.dataset.enabled == "true") {
            let group = cb.parentNode.parentNode.parentNode.querySelector(".card_top .title").textContent;
            if (!(group in groups)) {
                groups[group] = [];
            }
            if (cb.querySelector(".checkbox_label").children.length) {
                let string = [];
                for (let i=0; i<cb.querySelector(".checkbox_label").children.length; i++) {
                    string.push(cb.querySelector(".checkbox_label").children[i].textContent);
                }
                groups[group].push(string.join(" "));
            } else {
                groups[group].push(cb.querySelector(".checkbox_label").textContent);
            }
        }
    }

    let count = 0;
    let max = Object.keys(groups).length;
    for (let g of Object.keys(groups)) {
        let row = _createElement("div","row");
        let dot = _createElement("div",["dot", type]);
        row.appendChild(dot);

        let group = _createElement("div", "group");
        group.innerHTML = g;
        row.appendChild(group);

        let modes = _createElement("div", "modes");
        row.appendChild(modes);
        for (let m of groups[g]) {
            let mode = _createElement("div", "mode");
            mode.innerHTML = m;
            modes.appendChild(mode);
        }

        list.appendChild(row);

        count++;
        if (count < max) {
            list.appendChild(_createElement("div", "separator"));
        }
    }

    return list;
}

function generate_customization_item_info(id, type, rarity) {
    let customization_info = createCustomizationInfo({
        "customization_id": id,
        "customization_type": type,
        "rarity": rarity,
    }, true);
    customization_info.style.maxWidth = "30vh";
    return customization_info;
}

/*
    WEAPON PRIORTY MODAL
*/
let global_weapon_priority = [];
function set_weapon_priority(data, from_engine) {
    global_weapon_priority = [];
    if (data.length) {
        let tags = data.split(",");
        for (let tag of tags) {
            if (global_item_name_map.hasOwnProperty("weapon"+tag) && global_item_name_map["weapon"+tag][3] == "weapon") {
                global_weapon_priority.push(tag);
            }
        }
    }

    let update_var = false;
    if (global_weapon_priority.length < global_weapons_priority_default.length) update_var = true;

    for (let tag of global_weapons_priority_default) {
        if (!global_weapon_priority.includes(tag)) {
            global_weapon_priority.push(tag);
        }
    }

    if (!from_engine || update_var) {
        update_variable("string", "game_weapon_priority", global_weapon_priority.join(","));
    }
}

let global_weapon_priority_selected = null;
function open_weapon_priority_modal() {
    global_weapon_priority_selected = null;

    let cont = _createElement("div", "weapon_priority_cont");
    let list = _createElement("div", "weapon_priority_list");
    cont.appendChild(list);

    let ctrl = _createElement("div", "weapon_priority_controls");
    cont.appendChild(ctrl);

    for (let tag of global_weapon_priority) {
        let weapon = _createElement("div", "weapon", localize(global_item_name_map["weapon"+tag][1]));
        weapon.dataset.tag = tag;
        list.appendChild(weapon);
        _addButtonSounds(weapon, 1);
        weapon.addEventListener("click", function() {
            if (global_weapon_priority_selected !== null) global_weapon_priority_selected.classList.remove("selected");
            else ctrl.classList.add("active");

            global_weapon_priority_selected = weapon;
            global_weapon_priority_selected.classList.add("selected");
        });
    }

    let btn_up   = _createElement("div", ["db-btn", "plain", "move_up"]);
    _addButtonSounds(btn_up, 1);
    let btn_down = _createElement("div", ["db-btn", "plain", "move_down"]);
    _addButtonSounds(btn_down, 1);
    ctrl.appendChild(btn_up);
    ctrl.appendChild(btn_down);

    btn_up.addEventListener("click", function() {
        if (global_weapon_priority_selected == null) return;
        if (global_weapon_priority_selected.previousSibling == null) return;
        list.insertBefore(global_weapon_priority_selected, global_weapon_priority_selected.previousSibling);

        let priority_list = [];
        for (let i=0; i<list.children.length; i++) { priority_list.push(list.children[i].dataset.tag); }

        set_weapon_priority(priority_list.join(","), false);
    });

    btn_down.addEventListener("click", function() {
        if (global_weapon_priority_selected == null) return;
        if (global_weapon_priority_selected.nextSibling == null) return;
        list.insertBefore(global_weapon_priority_selected, global_weapon_priority_selected.nextSibling.nextSibling);

        let priority_list = [];
        for (let i=0; i<list.children.length; i++) { priority_list.push(list.children[i].dataset.tag); }

        set_weapon_priority(priority_list.join(","), false);
    });

    openBasicModal(basicGenericModal(localize("settings_auto_switch_weapon_priority"), cont, localize("modal_close")));
}