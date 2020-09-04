

let global_game_report_active = false;
let global_game_report_countdown_interval = false;
let global_game_report_countdown = 45;
let global_game_report_rewards = [];
let global_game_report_achievement_rewards = [];
let global_game_report_progression = false;
let global_game_report_progression_map = {};

let global_game_report_rematch_enabled = false;
let global_game_report_rematch_requested = false;

let global_game_report_data_game_status = {};
let global_game_report_data_snafu = {};

function init_hud_screen_game_report() {

    _id("game_report_cont").querySelector(".chat_input").addEventListener("blur", function() {
        engine.call('set_chat_enabled', false);
    });

    bind_event('set_game_report', set_game_report);
    bind_event('show_game_report', show_game_report);

    // GAME REPORT DEV TEST
    // /devop ui_call test_game_report
    bind_event('test_game_report', function() {
        global_hud_view_active = true;

        current_match = new Match([]);
        current_match.setManifest({
            "match_id":"ca54136b-c868-43fd-8769-2dfc52dcdb2c",
            "clients": [],
        });

        set_game_report(
            // ranked example:
            '{"final":1,"match_id":"ca54136b-c868-43fd-8769-2dfc52dcdb2c","match_type":2,"mode":"ca","map":"a_bazaar","state":4,"debug":" p 4 a 4","match_time":207,"clients":[{"team":1,"user_id":"0","uuid":"6d7cfe18-b064-43d5-b6bd-cce30111bca8","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":3600,"h":0,"w":[{"i":0,"sf":7,"sh":4,"di":200,"dt":0,"ds":0,"f":1,"df":0,"dh":0},{"i":1,"sf":26,"sh":21,"di":105,"dt":0,"ds":0,"f":1,"df":0,"dh":2},{"i":2,"sf":36,"sh":25,"di":500,"dt":0,"ds":0,"f":1,"df":0,"dh":0},{"i":3,"sf":140,"sh":106,"di":530,"dt":140,"ds":0,"f":1,"df":0,"dh":0},{"i":4,"sf":42,"sh":19,"di":1802,"dt":320,"ds":649,"f":5,"df":1,"dh":0},{"i":5,"sf":78,"sh":56,"di":336,"dt":162,"ds":0,"f":2,"df":1,"dh":0},{"i":8,"sf":54,"sh":4,"di":360,"dt":0,"ds":0,"f":1,"df":0,"dh":0}],"s":12,"f":12,"d":2,"a":0}},{"team":0,"user_id":"1","uuid":"35ff1c63-2e40-4edc-8e5a-b9f70d20531d","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":2400,"di":825,"h":0,"w":[{"i":0,"sf":0,"sh":0,"di":0,"dt":150,"ds":0,"f":0,"df":1,"dh":0},{"i":1,"sf":0,"sh":0,"di":0,"dt":0,"ds":0,"f":0,"df":0,"dh":8},{"i":2,"sf":8,"sh":8,"di":145,"dt":723,"ds":0,"f":0,"df":2,"dh":0},{"i":3,"sf":60,"sh":28,"di":140,"dt":340,"ds":0,"f":0,"df":1,"dh":0},{"i":4,"sf":7,"sh":7,"di":354,"dt":578,"ds":0,"f":2,"df":1,"dh":0},{"i":5,"sf":3,"sh":0,"di":0,"dt":210,"ds":0,"f":0,"df":2,"dh":0},{"i":7,"sf":4,"sh":3,"di":225,"dt":310,"ds":0,"f":0,"df":1,"dh":0},{"i":8,"sf":0,"sh":0,"di":0,"dt":160,"ds":0,"f":0,"df":0,"dh":0}],"s":2,"f":2,"d":8,"a":1}},{"team":0,"user_id":"2","uuid":"a8faa85a-f1e5-40cb-9b00-f4fa43a4b9d1","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":2400,"di":375,"h":0,"w":[{"i":0,"sf":0,"sh":0,"di":0,"dt":50,"ds":0,"f":0,"df":0,"dh":0},{"i":1,"sf":1,"sh":0,"di":0,"dt":105,"ds":0,"f":0,"df":1,"dh":8},{"i":2,"sf":0,"sh":0,"di":0,"dt":141,"ds":0,"f":0,"df":0,"dh":0},{"i":3,"sf":80,"sh":17,"di":85,"dt":210,"ds":0,"f":1,"df":0,"dh":0},{"i":4,"sf":2,"sh":2,"di":141,"dt":1394,"ds":0,"f":0,"df":4,"dh":0},{"i":5,"sf":54,"sh":27,"di":162,"dt":180,"ds":0,"f":1,"df":1,"dh":0},{"i":7,"sf":0,"sh":0,"di":0,"dt":385,"ds":0,"f":0,"df":1,"dh":0},{"i":8,"sf":0,"sh":0,"di":0,"dt":200,"ds":0,"f":0,"df":1,"dh":0}],"s":2,"f":2,"d":8,"a":0}},{"team":1,"user_id":"3","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a7","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"w":[{"i":1,"sf":0,"sh":0,"di":0,"dt":0,"ds":0,"f":0,"df":0,"dh":2},{"i":2,"sf":37,"sh":20,"di":364,"dt":145,"ds":0,"f":1,"df":0,"dh":0},{"i":3,"sf":20,"sh":4,"di":20,"dt":85,"ds":0,"f":0,"df":1,"dh":0},{"i":4,"sf":2,"sh":2,"di":170,"dt":175,"ds":0,"f":0,"df":1,"dh":0},{"i":5,"sf":29,"sh":9,"di":54,"dt":0,"ds":0,"f":1,"df":0,"dh":0},{"i":7,"sf":8,"sh":8,"di":695,"dt":225,"ds":0,"f":2,"df":0,"dh":0}],"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"4","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a1","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"5","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a2","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":1,"user_id":"6","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a3","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":0,"user_id":"7","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a4","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":0,"user_id":"8","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a5","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}},{"team":0,"user_id":"9","uuid":"9a46dfb2-6321-4c00-931c-a78cee4be3a6","name":"Anon","join_time":0,"time_played":186,"stats":{"dt":600,"di":1200,"h":0,"s":4,"f":4,"d":2,"a":0}}],"teams":{"0":{"score":1,"placement":1,"name":"Team 1","color":"#7dd82b","stats":{"r":{"0":{"s":0,"b":0},"1":{"s":4,"b":1},"2":{"s":0,"b":0},"3":{"s":0,"b":1},"4":{"s":0,"b":0}}}},"1":{"score":4,"placement":0,"name":"Team 2","color":"#f8d309","stats":{"r":{"0":{"s":4,"b":1},"1":{"s":0,"b":0},"2":{"s":4,"b":1},"3":{"s":4,"b":0},"4":{"s":4,"b":1}}}}}}',
            '{"game_data.pov_team.color":"#18c7ff","game_data.own_team.team_score":"4","game_data.total_player_count":"4","game_data.show_scoreboard":"false","current_weapon_data.color":"#cc791d","game_data.pov_team.color_dark":"#1295bf","spectators.count":"0","game_data.pov_team.color_darker":"#074154","game_data.own_team.color":"#18c7ff","game_data.own_team.color_dark":"#1295bf","game_data.time":"44","game_data.enemy_team.color":"#23c841","game_data.physics":"0","game_data.own_team.color_darker":"#074154","game_data.enemy_team.team_id":"0","game_data.own_team.game_score":"4","game_data.own_team.team_flag_state":"0","game_data.game_stage":"4","game_data.solo_mode":"false","game_data.own_team.team_has_macguffin":"false","game_data.own_team.team_name":"Team 2","current_weapon_data.key":"6","game_data.own_team.alive_count":"2","game_data.enemy_team.color_darker":"#0b4215","game_data.own_team.team_id":"1","teams.count":"2","game_data.enemy_team.color_dark":"#1a9630","game_data.enemy_team.team_score":"0","battle_data.item_image":"","game_data.enemy_team.game_score":"1","game_data.enemy_team.team_flag_state":"0","game_data.enemy_team.team_has_macguffin":"false","frame_data.hit_marker_opacity":"0.666398","game_data.enemy_team.alive_count":"0","game_data.enemy_team.team_name":"Team 1","game_data.overtime_seconds":"0","game_data.hint_team_color":"#FFFFFF","frame_data.slide_time_max":"0","own_team_players.count":"2","enemy_team_players.count":"2","game_data.players_per_team":"2","players.count":"4","battle_data.is_item_countable":"false","common_game_data.spectating":"false","game_data.team_count":"2","misc_data.fps":"60","misc_data.pickup_color":"","misc_data.pickup_image":"","misc_data.pickup_name":"","misc_data.pickup_owner":"","game_data.show_respawn_timers":"false","game_data.game_mode":"ca","game_data.round_mode":"true","game_data.race_mode":"false","game_data.spectator":"false","game_data.location":"mos","game_data.ranked":"1","game_data.continuous":"0","game_data.team_switching":"0","game_data.in_overtime_frag_mode":"false","game_data.score_limit":"4","game_data.time_limit":"0","game_data.team_size":"2","game_data.instagib":"0","game_data.spawn_logic":"0","game_data.is_golden_frag":"false","game_data.map":"a_bazaar","game_data.hint":"","game_data.hint_image":"","game_data.map_list":"a_barrows_gate:a_bazaar:a_heikam:a_junktion","game_data.warmup":"false","game_data.round":"0","game_data.tide_time_offset":"0","game_data.dynamic_overtime_frag_limit":"0","game_mode.game_life_count":"0","game_mode.game_bounty_limit":"0","frame_data.speed":"0","frame_data.item_cooldown":"0","battle_data.self.ready":"true","frame_data.item_cooldown_total":"0","frame_data.bolt_recharging_progress":"0","frame_data.bolt_cooldown_recovery":"false","frame_data.powerup_countdown":"0","frame_data.slide_time_left":"0","frame_data.steal_progress":"0","frame_data.finish_progress":"0","common_game_data.self_alive":"true","battle_data.self.name":"Anon","battle_data.self.coins":"0","battle_data.self.hp":"200","battle_data.self.armor":"100","battle_data.self.hp_percentage":"100","battle_data.self.armor_percentage":"100","battle_data.ready_key":"F3","battle_data.have_powerup":"false","battle_data.powerup_image":"","battle_data.powerup_color":"","battle_data.have_item":"false","battle_data.item_name":"","battle_data.item_color":"","battle_data.item_keybind":"","battle_data.item_charge":"0","battle_data.is_editor_loaded":"false","current_weapon_data.tag":"mac","current_weapon_data.icon_url":"images/weapon_mac.svg","current_weapon_data.ammo":"74","current_weapon_data.max_ammo":"200","current_weapon_data.accuracy":"0","current_weapon_data.current":"true","current_weapon_data.unlimited_ammo":"false","weapons_list.count":"8","enemy_team_players":[{"alive":"false","armor_percentage":"100","avatar":"av_AT1_1","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"false","life_count":"0","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0"},{"alive":"false","armor_percentage":"100","avatar":"av_AT1_15","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"false","life_count":"0","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0"}],"own_team_players":[{"alive":"true","armor_percentage":"100","avatar":"","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"false","life_count":"2","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0","voip_muted":"false","voip_talking":"false"},{"alive":"true","armor_percentage":"100","avatar":"av_AT1_20","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"100","is_self":"true","life_count":"2","name":"Anon","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0","voip_muted":"false","voip_talking":"false"}],"players":[{"assists":"0","avatar":"","best_time":"","country":"","damage_inflicted":"1200","deaths":"2","is_self":"false","kills":"4","name":"Anon","ping":"0.001","rank_position":"-1","rank_tier":"24","ready":"true","score":"4","user_id":"3"},{"assists":"0","avatar":"av_AT1_20","best_time":"","country":"at","damage_inflicted":"3600","deaths":"2","is_self":"true","kills":"12","name":"Anon","ping":"0.001","rank_position":"-1","rank_tier":"24","ready":"true","score":"12","user_id":"0"},{"assists":"0","avatar":"av_AT1_1","best_time":"","country":"ad","damage_inflicted":"375","deaths":"8","is_self":"false","kills":"2","name":"Anon","ping":"0.001","rank_position":"-1","rank_tier":"24","ready":"true","score":"2","user_id":"2"},{"assists":"1","avatar":"av_AT1_15","best_time":"","country":"dk","damage_inflicted":"825","deaths":"8","is_self":"false","kills":"2","name":"Anon","ping":"0","rank_position":"-1","rank_tier":"26","ready":"true","score":"2","user_id":"1"}],"spectators":[],"teams":[{"color":"#18c7ff","color_dark":"#1295bf","color_darker":"#074154","game_score":"4","players_count":"2","team_id":"1","team_name":"Team 2","team_score":"4"},{"color":"#23c841","color_dark":"#1a9630","color_darker":"#0b4215","game_score":"1","players_count":"2","team_id":"0","team_name":"Team 1","team_score":"0"}],"weapons_list":[{"accuracy":"57","ammo":"997","color":"#888888","current":"false","icon_url":"images/weapon_melee.svg","key":"Z","max_ammo":"100","tag":"melee","unlimited_ammo":"true"},{"accuracy":"78","ammo":"74","color":"#cc791d","current":"true","icon_url":"images/weapon_mac.svg","key":"6","max_ammo":"200","tag":"mac","unlimited_ammo":"false"},{"accuracy":"69","ammo":"230","color":"#7c62d1","current":"false","icon_url":"images/weapon_bl.svg","key":"1","max_ammo":"150","tag":"bl","unlimited_ammo":"false"},{"accuracy":"75","ammo":"46","color":"#9bc44d","current":"false","icon_url":"images/weapon_ss.svg","key":"2","max_ammo":"40","tag":"ss","unlimited_ammo":"false"},{"accuracy":"45","ammo":"40","color":"#df1f2d","current":"false","icon_url":"images/weapon_rl.svg","key":"Q","max_ammo":"25","tag":"rl","unlimited_ammo":"false"},{"accuracy":"71","ammo":"250","color":"#cdb200","current":"false","icon_url":"images/weapon_shaft.svg","key":"F","max_ammo":"150","tag":"shaft","unlimited_ammo":"false"},{"accuracy":"0","ammo":"50","color":"#1fa8b6","current":"false","icon_url":"images/weapon_pncr.svg","key":"E","max_ammo":"25","tag":"pncr","unlimited_ammo":"false"},{"accuracy":"7","ammo":"4","color":"#9d3329","current":"false","icon_url":"images/weapon_gl.svg","key":"7","max_ammo":"25","tag":"gl","unlimited_ammo":"false"}]}'
            
            // continuous example:
            //'{"final":1,"match_id":"27b803f7-4ccd-4edb-a905-737d15c4ac41","match_type":0,"mode":"brawl","map":"b_crystal_cove","state":4,"debug":" p 1 a 1","match_time":0,"clients":[{"team":0,"user_id":"78edd912cdc84ba899a6bbc60616e97c","uuid":"689e6491-edeb-49c7-b204-0c661e1ebd08","name":"noctan","join_time":0,"time_played":0,"stats":{"dt":0,"di":0,"h":0,"w":[],"s":0,"f":0,"d":0,"a":0}}],"teams":{"0":{"score":0,"placement":0,"name":"Team 1","color":"#7dd82b","stats":{"r":{"0":{"s":0,"b":-1}}}},"1":{"score":0,"placement":254,"name":"Team 2","color":"#f8d309","stats":{"r":{"0":{"s":0,"b":-1}}}}}}',
            //'{"game_data.pov_team.color":"#0098ff","game_data.own_team.team_score":"0","game_data.total_player_count":"1","game_data.show_scoreboard":"false","current_weapon_data.color":"#cc791d","game_data.pov_team.color_dark":"#0071bf","spectators.count":"0","game_data.pov_team.color_darker":"#003254","game_data.own_team.color":"#0098ff","game_data.own_team.color_dark":"#0071bf","game_data.time":"0","game_data.enemy_team.color":"#606060","game_data.physics":"0","game_data.own_team.color_darker":"#003254","game_data.enemy_team.team_id":"1","game_data.own_team.game_score":"0","game_data.own_team.team_flag_state":"0","game_data.game_stage":"4","game_data.solo_mode":"true","game_data.own_team.team_has_macguffin":"false","game_data.own_team.team_name":"Team 1","current_weapon_data.key":"3","game_data.own_team.alive_count":"1","game_data.enemy_team.color_darker":"#202020","game_data.own_team.team_id":"0","teams.count":"2","game_data.enemy_team.color_dark":"#404040","game_data.enemy_team.team_score":"0","battle_data.item_image":"","game_data.enemy_team.game_score":"0","game_data.enemy_team.team_flag_state":"0","game_data.enemy_team.team_has_macguffin":"false","frame_data.hit_marker_opacity":"0","game_data.enemy_team.alive_count":"0","game_data.enemy_team.team_name":"","game_data.overtime_seconds":"0","game_data.hint_team_color":"#FFFFFF","frame_data.slide_time_max":"0","own_team_players.count":"1","enemy_team_players.count":"0","game_data.players_per_team":"1","players.count":"1","battle_data.is_item_countable":"false","common_game_data.spectating":"false","game_data.team_count":"2","misc_data.fps":"138","misc_data.pickup_color":"","misc_data.pickup_image":"","misc_data.pickup_name":"","misc_data.pickup_owner":"","game_data.show_respawn_timers":"false","game_data.game_mode":"brawl","game_data.round_mode":"false","game_data.race_mode":"false","game_data.spectator":"false","game_data.location":"fra","game_data.ranked":"0","game_data.continuous":"1","game_data.team_switching":"2","game_data.in_overtime_frag_mode":"false","game_data.score_limit":"0","game_data.time_limit":"30","game_data.team_size":"1","game_data.instagib":"0","game_data.spawn_logic":"0","game_data.is_golden_frag":"false","game_data.map":"b_crystal_cove","game_data.hint":"","game_data.hint_image":"","game_data.map_list":"b_crystal_cove:b_oxide:b_sunken:b_furnace:b_alchemy:b_refinery","game_data.warmup":"true","game_data.round":"0","game_data.tide_time_offset":"0","game_data.dynamic_overtime_frag_limit":"0","game_mode.game_life_count":"0","game_mode.game_bounty_limit":"0","frame_data.speed":"0","frame_data.item_cooldown":"0","battle_data.self.ready":"true","frame_data.item_cooldown_total":"0","frame_data.bolt_recharging_progress":"0","frame_data.bolt_cooldown_recovery":"false","frame_data.powerup_countdown":"0","frame_data.slide_time_left":"0","frame_data.steal_progress":"0","frame_data.finish_progress":"0","common_game_data.self_alive":"true","battle_data.self.name":"noctan","battle_data.self.coins":"0","battle_data.self.hp":"115","battle_data.self.armor":"100","battle_data.self.hp_percentage":"57.5","battle_data.self.armor_percentage":"50","battle_data.ready_key":"F3","battle_data.have_powerup":"false","battle_data.powerup_image":"","battle_data.powerup_color":"","battle_data.have_item":"false","battle_data.item_name":"","battle_data.item_color":"","battle_data.item_keybind":"","battle_data.item_charge":"0","battle_data.is_editor_loaded":"false","current_weapon_data.tag":"mac","current_weapon_data.icon_url":"images/weapon_mac.svg","current_weapon_data.ammo":"100","current_weapon_data.max_ammo":"200","current_weapon_data.accuracy":"0","current_weapon_data.current":"true","current_weapon_data.unlimited_ammo":"false","weapons_list.count":"8","enemy_team_players":[],"own_team_players":[{"alive":"true","armor_percentage":"50","avatar":"av_AT1_12","flag_color":"#ffffff","has_flag":"false","has_macguffin":"false","has_powerup":"false","hp_percentage":"62.5","is_self":"true","life_count":"0","name":"noctan","pd_powerup_color":"#ffffff","pd_powerup_image":"","ready":"true","respawn_timer":"0","voip_muted":"false","voip_talking":"false"}],"players":[{"assists":"0","avatar":"av_AT1_12","best_time":"","country":"at","damage_inflicted":"0","deaths":"0","is_self":"true","kills":"0","name":"noctan","ping":"0.035","rank_position":"-1","rank_tier":"0","ready":"true","score":"0","user_id":"78edd912cdc84ba899a6bbc60616e97c"}],"spectators":[],"teams":[{"color":"#0098ff","color_dark":"#0071bf","color_darker":"#003254","game_score":"0","players_count":"1","team_id":"0","team_name":"Team 1","team_score":"0"},{"color":"#606060","color_dark":"#404040","color_darker":"#202020","game_score":"0","players_count":"0","team_id":"1","team_name":"","team_score":"0"}],"weapons_list":[{"accuracy":"0","ammo":"999","color":"#888888","current":"false","icon_url":"images/weapon_melee.svg","key":"N","max_ammo":"100","tag":"melee","unlimited_ammo":"true"},{"accuracy":"0","ammo":"100","color":"#cc791d","current":"true","icon_url":"images/weapon_mac.svg","key":"3","max_ammo":"200","tag":"mac","unlimited_ammo":"false"},{"accuracy":"0","ammo":"250","color":"#7c62d1","current":"false","icon_url":"images/weapon_bl.svg","key":"T","max_ammo":"150","tag":"bl","unlimited_ammo":"false"},{"accuracy":"0","ammo":"50","color":"#9bc44d","current":"false","icon_url":"images/weapon_ss.svg","key":"Y","max_ammo":"40","tag":"ss","unlimited_ammo":"false"},{"accuracy":"0","ammo":"50","color":"#df1f2d","current":"false","icon_url":"images/weapon_rl.svg","key":"MMB","max_ammo":"25","tag":"rl","unlimited_ammo":"false"},{"accuracy":"0","ammo":"250","color":"#cdb200","current":"false","icon_url":"images/weapon_shaft.svg","key":"H","max_ammo":"150","tag":"shaft","unlimited_ammo":"false"},{"accuracy":"0","ammo":"50","color":"#1fa8b6","current":"false","icon_url":"images/weapon_pncr.svg","key":"S","max_ammo":"25","tag":"pncr","unlimited_ammo":"false"},{"accuracy":"0","ammo":"5","color":"#9d3329","current":"false","icon_url":"images/weapon_gl.svg","key":"7","max_ammo":"25","tag":"gl","unlimited_ammo":"false"}]}'
        );

        handlePostMatchUpdates({
            "match_id": "ca54136b-c868-43fd-8769-2dfc52dcdb2c",
            "mmr_updates": {
                "from": {
                    "rating": 1541.7686720394,
                    "rank_tier": 24,
                    "rank_position": null,
                    "cur_tier_req": 1570,
                    "next_tier_req": 1610
                },
                "to": {
                    "rating": 1571.7686720394,
                    "rank_tier": 25,
                    "rank_position": null,
                    "cur_tier_req": 1610,
                    "next_tier_req": 1650
                },
                "mode": "r_ca_2",
                "match_type": 2,
                "placement_match": 0,
                "ranked": true
            },
            "progression_updates": {
                "achievement_rewards": [
                    {
                        "achievement_id": "frags_shaft",
                        "goal": 10,
                        "reward": {
                            "customization_id": "av_smileygreen",
                            "customization_type": 2,
                            "customization_sub_type": "",
                            "customization_set_id": null,
                            "rarity": 0,
                            "amount": 1,
                            "free": true,
                            "coverage": null
                        }
                    }
                ],
                "challenges": [
                    {
                        "user_id": "0",
                        "challenge_id": "elim_rl_10",
                        "progress": 10,
                        "achieved": true,
                        "achieved_date": "2020-08-13T22:00:00.000Z",
                        "create_ts": "2020-08-11T19:28:46.000Z",
                        "current_date": "2020-08-13T22:00:00.000Z",
                        "unlocked": true,
                        "xp": 1000,
                        "goal": 10,
                        "type": 0
                    },
                    {
                        "user_id": "0",
                        "challenge_id": "play_5_qp_matches",
                        "progress": 0,
                        "achieved": false,
                        "achieved_date": null,
                        "create_ts": "2020-07-26T21:25:36.000Z",
                        "current_date": "2020-08-13T22:00:00.000Z",
                        "unlocked": true,
                        "xp": 1000,
                        "goal": 5,
                        "type": 0
                    },
                    {
                        "user_id": "0",
                        "challenge_id": "elim_pncr_10",
                        "progress": 10,
                        "achieved": true,
                        "achieved_date": "2020-08-13T22:00:00.000Z",
                        "create_ts": "2020-07-26T01:56:49.000Z",
                        "current_date": "2020-08-13T22:00:00.000Z",
                        "unlocked": true,
                        "xp": 1000,
                        "goal": 10,
                        "type": 0
                    }
                ],
                "battlepass_update": {
                    "from": {
                        "xp": 70712,
                        "level": 13,
                        "cur_level_req": 65000,
                        "next_level_req": 75000
                    },
                    "to": {
                        "xp": 91241,
                        "level": 15,
                        "cur_level_req": 85000,
                        "next_level_req": 95000
                    },
                    "owned": false
                },
                "battlepass_rewards": [
                    {
                        "customization_id": "av_smileyred",
                        "customization_type": 2,
                        "customization_sub_type": "",
                        "customization_set_id": null,
                        "rarity": 0,
                        "amount": 1,
                        "battlepass_reward_level": 8,
                        "free": false
                    },
                    {
                        "customization_id": "we_pncr_deathray",
                        "customization_type": 6,
                        "customization_sub_type": "pncr",
                        "customization_set_id": null,
                        "rarity": 2,
                        "amount": 1,
                        "battlepass_reward_level": 9,
                        "free": false,
                    },
                    {
                        "customization_id": "sp_fired",
                        "customization_type": 5,
                        "customization_sub_type": "",
                        "customization_set_id": null,
                        "rarity": 1,
                        "amount": 1,
                        "battlepass_reward_level": 10,
                        "free": false,
                    }
                ]
            },
            "players_present_count": 4,
            "rematch_enabled": true
        });

        show_game_report(true);
        engine.call("hud_mouse_control", true);
        move_open_chat_to_report();
    });

    let scoreboard_scroll = _id("report_scoreboard");
    initialize_scrollbar(scoreboard_scroll);
}

/**
 * json_game_status json server_status update from the gameserver
 * json_snafu_data json Native snafu data model
 */
function set_game_report(json_game_status, json_snafu_data) {
    if (!json_game_status)  return;

    //console.log("game_status", json_game_status);
    //console.log("snafu_data", json_snafu_data);

    send_view_data("menu", "string", "reset_own_profile_cache");

    try {
        var game_status = JSON.parse(json_game_status);
        var snafu_data = JSON.parse(json_snafu_data);
        
        global_game_report_data_game_status = game_status;
        global_game_report_data_snafu = snafu_data;
        
        //console.log("game_status", _dump(game_status));
        //console.log("snafu_data", _dump(snafu_data));
    } catch(e) {
        console.log("game_report json parse error");
    }

    let countdown_text = _id("game_report_cont").querySelector(".countdown .text");
    let re_buttons = _id("game_report_cont").querySelector(".buttons");

    if (snafu_data["game_data.continuous"] == 1) {
        countdown_text.textContent = localize("report_next_map_in");
        re_buttons.style.display = "none";
    } else {
        countdown_text.textContent = localize("report_leaving_game_in");
        re_buttons.style.display = "flex";

        let requeue_btn = _id("game_report_requeue");
        if (game_status.match_type == MATCH_TYPE_RANKED || game_status.match_type == MATCH_TYPE_QUICKPLAY) {
            if (bool_am_i_leader) requeue_btn.style.display = "flex";
            else requeue_btn.style.display = "none";
        } else {
            requeue_btn.style.display = "none";
        }
    }


    game_report_reset_rematch_option();

    let game_report_countdown = _id("game_report_countdown");
    if (global_game_report_countdown_interval) clearInterval(global_game_report_countdown_interval);

    game_report_countdown.textContent = global_game_report_countdown;
    global_game_report_countdown_interval = setInterval(function() {
        global_game_report_countdown = global_game_report_countdown - 1;
        if (global_game_report_countdown < 0) { 
            global_game_report_countdown = 0;
            clearInterval(global_game_report_countdown_interval);
        }
        game_report_countdown.textContent = global_game_report_countdown;
    },1000);



    // sort all clients by score (independent of team)
    game_status.clients.sort(sortPlayersByStats);

    // Organize players into team arrays within the server_status object
    for (var i = 0; i < game_status.clients.length; i++) {
        var teamId = game_status.clients[i].team;
        if (teamId >= 0 && teamId < 200) {
            // Hack to make the game report work again until the server starts pre-filling all team entries rather than just the ones for initially connected players
            if (!game_status.teams[teamId]) game_status.teams[teamId] = {
                "score": 0,
                "placement": 999,
                "name": "Team "+(teamId+1),
                "color": "#ffffff"
            }

            if (game_status.teams[teamId].players === undefined) {
                game_status.teams[teamId].players = [];
            }

            game_status.teams[teamId].players.push(game_status.clients[i]);
            
            // get the correct team color from the data model (in case of color overrides being used)
            for (let team of snafu_data.teams) {
                if (teamId == team.team_id) {
                    game_status.teams[teamId].color = team.color;
                    game_status.teams[teamId].color_dark = team.color_dark;
                    game_status.teams[teamId].color_darker = team.color_darker;
                    break;
                }
            }
        }
    }

    // Make sure there is an entry for at least own and enemy team
    if (!(snafu_data["game_data.own_team.team_id"] in game_status.teams))   game_status.teams[snafu_data["game_data.own_team.team_id"]] = { "score": 0 };
    if (!(snafu_data["game_data.enemy_team.team_id"] in game_status.teams)) game_status.teams[snafu_data["game_data.enemy_team.team_id"]] = { "score": 0 };

    // Create a single array of teams
    var result = Object.keys(game_status.teams).map(function(key) {
        return game_status.teams[key];
    });

    // Sort the new teams array by their placement (this refers to data.teams[idx].placement), lower number means better placement
    result.sort((a, b) => {
        // -1 == forfeit, put those at the end
        if (a.placement == -1) return -1;
        return (a.placement > b.placement) ? 1 : -1
    });

    create_game_report(game_status, snafu_data);

    _id("game_report_progression").style.filter = "opacity(0)";
}

function game_report_open_tab(btn, tab) {
    if (btn.classList.contains("active")) return;

    let prev = btn.parentElement.parentElement.querySelector('.active');
    if (prev) prev.classList.remove("active");

    btn.classList.add("active");

    
    let prev_cont = _id("game_report_cont").querySelector(".report_content .content.active");
    if (prev_cont) prev_cont.classList.remove("active");

    if (tab == "mapvote") _id("report_mapvote").classList.add("active");
    if (tab == "scoreboard") _id("report_scoreboard").classList.add("active");
    if (tab == "stats") _id("report_stats").classList.add("active");

    global_game_report_tab_switched = true;
}

function show_game_report(visible) {
    //console.log("show_game_report", visible);
    global_game_report_active = visible;

    if (visible) {


        anim_show(_id("game_report"), 500, "flex");

        if (global_show_rank_change) {
            showRankScreen(function() {
                anim_show(_id("game_report_progression"));
                setTimeout(function() {
                    if (global_game_report_progression) {
                        animate_bp_progress();
                    }
                }, 1000);
            }, true);

            anim_show(_id("game_report_cont"), 500, "flex");
            global_show_rank_change = false;
        } else {
            anim_show(_id("game_report_progression"));
            anim_show(_id("game_report_cont"), 100, "flex", function() {
                if (global_game_report_progression) {
                    animate_bp_progress();
                }
            });
        }

        
        //anim_hide(_id("game_hud"), 100); //Just in case, seems like show_ingame_hud gets called sometimes when it shouldn't :S

        // Hide the chat elements since game_report has its own chat ui
        anim_hide(game_hud_special, 100);

        let scoreboard_scroll = _id("report_scoreboard");
        if (scoreboard_scroll) refreshScrollbar(scoreboard_scroll);

        move_open_chat_to_report();

    } else {
        anim_hide(_id("game_report_cont"), 100);
        anim_hide(_id("game_report"), 100);
    }
}


function create_game_report(game_status, snafu_data) {
    //console.log("game_status", _dump(game_status));

    // HACK, don't do anything for aim trainer scenarios
    if (game_status.mode.substr(0,4) == 'aim_') return;

    let game_report = _id("game_report_cont");
    let report_head = game_report.querySelector(".report_head");
    let report_top = game_report.querySelector(".report_top");
    let scoreboard = _id("report_scoreboard_inner");
    _empty(scoreboard);

    let player_lookup = {};
    let placement_lookup = {};
    for (let t of snafu_data.teams) {
        t.players = [];
        for (let c of game_status.clients) {
            if (t.team_id == c.team) {
                t.players.push(c);
            }
        }

        if (t.team_id in game_status.teams) {
            game_status.teams[t.team_id].team_id = t.team_id;
            placement_lookup[game_status.teams[t.team_id].placement] = t;
        }
    }

    for (let p of snafu_data.players) {
        player_lookup[p.user_id] = p;
    }

    let first_user_own = undefined;
    let first_user_enemy = undefined;
    if (snafu_data.own_team_players.length) first_user_own = snafu_data.own_team_players[0];
    if (snafu_data.enemy_team_players.length) first_user_enemy = snafu_data.enemy_team_players[0];

    //console.log("game_status", _dump(game_status));
    //console.log("snafu_data", _dump(snafu_data));

    let team_size = Number(snafu_data["game_data.team_size"]);
    let team_count = Number(snafu_data["game_data.team_count"]);

    // Create a single array of teams
    var teams = Object.keys(game_status.teams).map(function(key) { return game_status.teams[key]; });

    // Sort the new teams array by their placement (this refers to game_status.teams[idx].placement), lower number means better placement
    teams.sort((a, b) => {
        // -1/255 == forfeit, put those at the end
        if (a.placement == -1 || a.placement == 255) return -1;
        return (a.placement > b.placement) ? 1 : -1
    });

    let victory = false;
    if (game_status.teams[snafu_data["game_data.own_team.team_id"]].placement == 0) victory = true;

    //======//
    // HEAD //
    //======//
    let head_left = report_head.querySelector(".result_text");
    let head_right = report_head.querySelector(".mode_map_time");    

    // HEAD LEFT
    let result_text = (victory) ? localize("ingame_victory") : localize("ingame_defeat");
    if (snafu_data["game_data.spectator"] == "true") head_left.style.visibility = "hidden";
    else head_left.style.visibility = "visible";
    head_left.textContent = result_text;

    // HEAD RIGHT
    _empty(head_right);
    head_right.appendChild(_createElement("div", "type", localize(MATCH_TYPE[game_status.match_type].i18n)));
    head_right.appendChild(_createElement("div", "mode", localize(global_game_mode_map[game_status.mode].i18n)));
    head_right.appendChild(_createElement("div", "map", _format_map_name(game_status.map)));
    head_right.appendChild(_createElement("div", "time", _seconds_to_digital(game_status.match_time)));

    //=================//
    // MAIN SCOREBOARD //
    //=================//

    let show_team_names = true;
    if (team_size == 1) {
        show_team_names = false;
    }

    let self_name = undefined;
    let self_stats = undefined;

    let first_name = undefined;
    let first_stats = undefined;

    /*
    if (game_status.mode == "duel") {
        scoreboard.appendChild(_createElement("div","duel","TBA"));
    } else {
        */
        let last_team_id = null;
        for (let t of teams) {
            if (t.team_id < 0) continue;
            if (!t.players || !t.players.length) continue;            
            last_team_id = t.team_id;
        }
        let player_rows = 0;
        let header_row_rendered = false;
        for (let t of teams) {
            let team_id = t.team_id;

            if (team_id < 0) continue;
            if (!t.players || !t.players.length) continue;
            
            let team = _createElement("div", "team");
            let team_name = t.name;
            let team_score_value = 0;

            if (team_id in game_status.teams) {
                team.style.setProperty("--team_color", game_status.teams[team_id].color);
                team.style.setProperty("--team_color2", game_status.teams[team_id].color_dark);
                team.style.setProperty("--team_color3", game_status.teams[team_id].color_darker);
                
                if (game_status.teams[team_id].placement == 0) team.classList.add("winner");

                team_name = game_status.teams[team_id].name;
                team_score_value = game_status.teams[team_id].score;
            }

            if ("players" in t && t.players.length) {
                for (let p of t.players) {
                    if (global_self.user_id == p.user_id) {
                        team_name = localize("your_team") + " - " + team_name;
                        break;
                    }
                }
            }
       
            if (show_team_names || !header_row_rendered) {
                let head_row = _createElement("div", "head_row");

                if (!show_team_names) team_name = "";
                head_row.appendChild(_createElement("div","team_name", team_name));

                if (!header_row_rendered) {
                    if (snafu_data["game_data.ranked"] == "1") {
                        head_row.appendChild(_createElement("div",["label", "rank"], localize("stats_rank")));
                    }
                    if (game_status.mode == "race") {
                        head_row.appendChild(_createElement("div","label", localize("stats_best_time")));
                    } else {
                        //if (game_status.mode == "ctf") {
                        //    head_row.appendChild(_createElement("div","label", localize("stats_captures")));
                        //}
                        if (team_size > 1) {
                            head_row.appendChild(_createElement("div","label", localize("stats_score")));
                        }
                        head_row.appendChild(_createElement("div",["label","kda"], localize("stats_kda")));
                        head_row.appendChild(_createElement("div","label", localize("stats_dmg_done")));
                        head_row.appendChild(_createElement("div","label", localize("stats_dmg_taken")));
                        head_row.appendChild(_createElement("div",["label", "best_w"], localize("stats_best_weapon")));
                        if (current_match.match_type == MATCH_TYPE_RANKED || current_match.match_type == MATCH_TYPE_QUICKPLAY) {
                            head_row.appendChild(_createElement("div", "label", localize("commend")));
                        }
                        head_row.appendChild(_createElement("div", ["label", "tscore"]));
                        header_row_rendered = true;
                    }
                }
                team.appendChild(head_row);
            }

            // Reset the odd/even row colors if each team has more than one player
            if (team_size > 1) {
                player_rows = 0;
            }

            let team_inner = _createElement("div", "team_inner");
            team.appendChild(team_inner);

            let team_players = _createElement("div", "team_players");
            team_inner.appendChild(team_players);

            if ("players" in t && t.players.length) {
                for (let p of t.players) {
                    /*
                    if (!player_lookup[p.user_id]) {
                        console.log("missing player_data", p.user_id, _dump(p));
                        continue;
                    }
                    */
                    if (!p.stats) {
                        console.log("missing player stats", p.user_id, _dump(p));
                        continue;
                    }
                    player_rows++;

                    let player_row = _createElement("div", "player_row");
                    if (player_rows % 2 == 0) player_row.classList.add("even");
                    
                    if (global_self.user_id == p.user_id) {
                        player_row.classList.add("self");
                        self_name = p.name;
                        self_stats = p.stats;

                        player_row.appendChild(_createElement("div", "self_arrow"));
                    }

                    if (first_name == undefined) {
                        first_name = p.name;
                        first_stats = p.stats;
                    }

                    let avatar = _createElement("div", "avatar");
                    if (player_lookup[p.user_id]) avatar.style.backgroundImage = "url("+_avatarUrl(player_lookup[p.user_id].avatar)+")";
                    player_row.appendChild(avatar);
                    player_row.appendChild(_createElement("div","name", p.name));

                    if (snafu_data["game_data.ranked"] == "1") {
                        let rank_icon_cont = _createElement("div", "rank");
                        if (p.user_id == global_self.user_id && current_match.mm_mode && current_match.mm_mode in global_self.mmr) {
                            rank_icon_cont.appendChild(renderRankIcon(global_self.mmr[current_match.mm_mode].rank_tier, global_self.mmr[current_match.mm_mode].rank_position, team_size, "small"));
                        } else {
                            if (player_lookup[p.user_id]) rank_icon_cont.appendChild(renderRankIcon(player_lookup[p.user_id].rank_tier, player_lookup[p.user_id].rank_position, team_size, "small"));
                        }
                        player_row.appendChild(rank_icon_cont);
                    }

                    if (game_status.mode == "race") {
                        if (player_lookup[p.user_id]) player_row.appendChild(_createElement("div","stat", player_lookup[p.user_id].best_time));
                    } else {
                        if (team_size > 1) {
                            player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_SCORE]));
                        }
                        player_row.appendChild(_createElement("div",["stat","kda"], p.stats[GLOBAL_ABBR.STATS_KEY_FRAGS]));
                        player_row.appendChild(_createElement("div",["stat","kda"], p.stats[GLOBAL_ABBR.STATS_KEY_DEATHS]));
                        player_row.appendChild(_createElement("div",["stat","kda"], p.stats[GLOBAL_ABBR.STATS_KEY_ASSISTS]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED]));
                        player_row.appendChild(_createElement("div","stat", p.stats[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN]));

                        let w = getPlayersBestWeapon(p.stats);
                        player_row.appendChild(_createElement("div",["stat", "best_w"], w.acc+"%"));

                        let w_data = undefined;
                        if (w.idx in global_weapon_idx_name_map2) w_data = global_item_name_map[global_weapon_idx_name_map2[w.idx]];
                        let icon = _createElement("div", "icon");
                        if (w_data) icon.style.backgroundImage = "url("+w_data[2]+"?fill=white)";
                        let best_w = _createElement("div",["stat", "best_w", "icon_cont"]);
                        best_w.appendChild(icon);
                        player_row.appendChild(best_w);

                        if (current_match.match_type == MATCH_TYPE_RANKED || current_match.match_type == MATCH_TYPE_QUICKPLAY) {
                            let commend_cont = _createElement("div", ["stat"]);
                            // Check that the user_id is not in our party
                            if (p.user_id != global_self.user_id && 
                                p.user_id in current_match.clients && 
                                global_self.user_id in current_match.clients && 
                                current_match.clients[p.user_id].party != current_match.clients[global_self.user_id].party) {

                                let commend = _createElement("div", "commend");
                                commend.addEventListener("click", function(e) {
                                    if (commend.classList.contains("commended")) return;

                                    _play_click1();
                                    e.stopPropagation();

                                    commend.classList.add("commended");
                                    send_string(CLIENT_COMMAND_COMMEND, p.user_id);
                                });
                                commend_cont.appendChild(commend);
                            }
                            player_row.appendChild(commend_cont);
                        }
                    }
                    team_players.appendChild(player_row);

                    player_row.addEventListener("click", function() {
                        _play_click1();
                        selectPlayer(p.name, p.stats, true);
                    });
                }
            }

            let team_score = _createElement("div", "team_score");
            team_score.appendChild(_createElement("div", "team_score_inner", team_score_value));
            team_inner.appendChild(team_score);

            scoreboard.appendChild(team);

            if (team_size > 1) {
                if (last_team_id != team_id) scoreboard.appendChild(_createElement("div", "separator"));
            }
        }
    //}

    if (self_stats) selectPlayer(self_name, self_stats, false);
    else if (first_stats) selectPlayer(first_name, first_stats, false);

    renderMapVote(snafu_data);

    game_report_switch_content(_id("report_tab_scoreboard"), _id("report_scoreboard"));

    global_game_report_tab_switched = false;
    if (snafu_data["game_data.continuous"] == 1) {
        let time_to_mapvote = global_game_report_countdown / 2;
        if (time_to_mapvote < 10 && global_game_report_countdown > 15) time_to_mapvote = 10;

        setTimeout(function() {
            console.log("auto switch to map vote", global_game_report_tab_switched);
            if (global_game_report_tab_switched) return;
            game_report_switch_content(_id("report_tab_mapvote"), _id("report_mapvote"));
        }, time_to_mapvote * 1000);
    }
}
let global_game_report_tab_switched = false;

function updateGameReportRank(mode) {
    if (!(mode in global_self.mmr)) return;
    if (!(mode in global_queues)) return;

    let self_rank = _id("game_report_cont").querySelector(".player_row.self .rank");
    if (self_rank) {
        _empty(self_rank);
        self_rank.appendChild(renderRankIcon(global_self.mmr[mode].rank_tier, global_self.mmr[mode].rank_position, global_queues[mode].team_size, "small"));
    }
}

function selectPlayer(name, stats, show) {
    let cont = _id("report_stats");
    _empty(cont);

    cont.appendChild(_createElement("div", "title", name));

    let stats_cont = _createElement("div", "stats");

    let legend = _createElement("div", "legend");
    legend.appendChild(_createElement("div", "placeholder"));
    legend.appendChild(_createElement("div", "label", localize("stats_frags")+" / "+localize("stats_deaths")));
    legend.appendChild(_createElement("div", "label", localize("stats_dmg_done")));
    legend.appendChild(_createElement("div", "label", localize("stats_dmg_taken")));
    legend.appendChild(_createElement("div", "label", localize("stats_hit")+" / "+localize("stats_fired")));
    legend.appendChild(_createElement("div", "label", localize("stats_accuracy")));
    stats_cont.appendChild(legend);

    if (GLOBAL_ABBR.STATS_KEY_WEAPONS in stats) {
        for (let s of stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {

            // Only show stats of main weapons
            if (!global_weapons_in_scoreboard.includes(s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX])) continue;

            let weapon = _createElement("div", "weapon");

            let w_data = undefined;
            if (s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX] in global_weapon_idx_name_map2) {
                w_data = global_item_name_map[global_weapon_idx_name_map2[s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX]]];
            }

            let s_frags = (s[GLOBAL_ABBR.STATS_KEY_FRAGS] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_FRAGS] : "--";
            let s_deaths = (s[GLOBAL_ABBR.STATS_KEY_DEATHS_FROM] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_DEATHS_FROM] : "--";
            let s_dmg_i = (s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] : "--";
            let s_dmg_t = (s[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_DAMAGE_TAKEN] : "--";
            let s_shots_h = (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] : "--";
            let s_shots_f = (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) ? s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] : "--";
            let s_acc = '--';
            if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined && s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) {
                if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0)
                    s_acc = Math.round(s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] * 100);
                else
                    s_acc = 0; 
            }
            

            let icon = _createElement("div", "icon");
            if (w_data) icon.style.backgroundImage = "url("+w_data[2]+"?fill="+w_data[0]+")";
            weapon.appendChild(icon);
            weapon.appendChild(_createElement("div", "stat", s_frags+" / "+s_deaths));
            weapon.appendChild(_createElement("div", "stat", s_dmg_i));
            weapon.appendChild(_createElement("div", "stat", s_dmg_t));
            weapon.appendChild(_createElement("div", "stat", s_shots_h+" / "+s_shots_f));
            weapon.appendChild(_createElement("div", "stat", s_acc+"%"));

            stats_cont.appendChild(weapon);
        }
    }

    cont.appendChild(stats_cont);

    if (show) game_report_switch_content(_id("report_tab_stats"), _id("report_stats"));
}

function getPlayersBestWeapon(stats) {
    let weapon_index = -1;
    let max_dmg = 0;
    let acc = 0;
    if (GLOBAL_ABBR.STATS_KEY_WEAPONS in stats) {
        for (let s of stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {

            // Only count stats of main weapons
            if (!global_weapons_in_scoreboard.includes(s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX])) continue;

            if (s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] !== undefined && s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED] > max_dmg) {

                weapon_index = s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX];
                max_dmg = s[GLOBAL_ABBR.STATS_KEY_DAMAGE_INFLICTED];

                if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined && s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) {
                    if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0) {
                        acc = Math.round(s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] * 100);
                    }
                }
            }

        }
    }

    return {
        "idx": weapon_index,
        "acc": acc
    }
}
/*
function getAvgPlayerAccuracy(stats) {
    let accuracies = [];

    if (GLOBAL_ABBR.STATS_KEY_WEAPONS in stats) {
        for (let s of stats[GLOBAL_ABBR.STATS_KEY_WEAPONS]) {

            // Only count stats of main weapons
            if (!global_weapons_in_scoreboard.includes(s[GLOBAL_ABBR.STATS_KEY_WEAPON_IDX])) continue;

            if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] !== undefined && s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] !== undefined) {
                if (s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED] > 0) {
                    accuracies.push(s[GLOBAL_ABBR.STATS_KEY_SHOTS_HIT] / s[GLOBAL_ABBR.STATS_KEY_SHOTS_FIRED]);
                }
            }
        }
    }

    let total = 0;
    for (let acc of accuracies) total += acc;
    
    return accuracies.length > 0 ? Math.round(total / accuracies.length * 100) : 0;
}
*/

function renderMapVote(snafu_data) {
    let map_vote_cont = _id("report_mapvote");
    _empty(map_vote_cont);

    let map_vote_btn = _id("report_tab_mapvote");
    if (snafu_data["game_data.continuous"] == 1) map_vote_btn.style.display = "block";
    else map_vote_btn.style.display = "none";

    let maps = [];
    if (snafu_data["game_data.map_list"] && snafu_data["game_data.map_list"].length) maps = snafu_data["game_data.map_list"].split(":");

    // Filter out the map that was just played, unless its the only map in the list
    let valid_maps = [];
    if (maps.length > 2) {
        for (let map of maps) {
            if (map != snafu_data["game_data.map"]) valid_maps.push(map);
        }
    } else {
        valid_maps = maps;
    }

    if (valid_maps.length > 6) {
        valid_maps = getRandomElementsFromArray(valid_maps, 6);
    }

    let map_list = _createElement("div", "map_list");
    if (valid_maps.length <= 3) {
        map_list.style.setProperty("--map_row_count", 3);
    } else if (valid_maps.length == 4) {
        map_list.style.setProperty("--map_row_count", 2);
    } else if (valid_maps.length > 4) {
        map_list.style.setProperty("--map_row_count", 3);
    }

    for (let map of valid_maps) {
        let map_div = _createElement("div", ["map", "vote_option"]);

        map_div.dataset.option = map;
        map_div.style.backgroundImage = "url("+_mapUrl(map)+")";
        map_div.appendChild(_createElement("div","name",_format_map_name(map)));

        map_div.appendChild(_createElement("div", "vote_cont"));

        map_div.addEventListener("click", function() {
            _play_click1();

            let prev = map_list.querySelector(".selected");
            if (prev) prev.classList.remove("selected");

            map_div.classList.add("selected");

            send_string(CLIENT_COMMAND_SELECT_MAP, map);
        });

        map_list.appendChild(map_div);
    }
    map_vote_cont.appendChild(map_list);
}

function game_report_update_vote_counts(data) {
    if (!global_game_report_active) return;

    let cont = undefined;
    if (data.type == "map") cont = _id("report_mapvote");
    if (data.type == "mode") return;
    if (!cont) return;

    _for_each_with_class_in_parent(cont, "vote_option", function(opt_el) {
        let vote_cont = _get_first_with_class_in_parent(opt_el, "vote_cont");
        if (!vote_cont) return;

        _empty(vote_cont);
        if (opt_el.dataset.option in data.votes && data.votes[opt_el.dataset.option] > 0) {
            for (let i=0; i<data.votes[opt_el.dataset.option]; i++) {
                vote_cont.appendChild(_createElement("div", "vote"));
            }
        }
    });
}

function game_report_switch_content(tab, new_content) {
    let new_button = tab.firstElementChild;
    let gr = _id("game_report_cont");
    let button_prev_active = gr.querySelector(".report_tabs .active");
    if (new_button === button_prev_active) return;
    if (button_prev_active) button_prev_active.classList.remove("active");
    new_button.classList.add("active");

    let prev_active = gr.querySelector(".report_content .content.active");
    if (prev_active) prev_active.classList.remove("active");
    new_content.classList.add("active");

    global_game_report_tab_switched = true;
}


function clear_battle_pass_progression() {
    global_game_report_progression = false;
    global_game_report_progression_map = {};
    global_game_report_rewards.length = 0;
    global_game_report_achievement_rewards.length = 0;
    _empty(_id("game_report_progression"));
}

function set_battle_pass_rewards(rewards) {
    if (rewards && rewards.length) {
        global_game_report_rewards = rewards;
    } else {
        global_game_report_rewards = [];
    }
}

function set_achievement_rewards(rewards) {
    //console.log("set_achievement_rewards", _dump(rewards));
    if (rewards && rewards.length) {
        global_game_report_achievement_rewards = rewards;
    } else {
        global_game_report_achievement_rewards = [];
    }
    /*
    set_achievement_rewards [
        {
            "achievement_id": "play_games",
            "goal": 1,
            "reward": {
                "customization_id": "av_smileyblue",
                "customization_type": 2,
                "customization_sub_type": "",
                "customization_set_id": null,
                "rarity": 0,
                "amount": 1,
                "free": false,
                "coverage": null
            }
        },
        {
            "achievement_id": "play_games_duel",
            "goal": 1,
            "reward": {
                "customization_id": "av_smileyred",
                "customization_type": 2,
                "customization_sub_type": "",
                "customization_set_id": null,
                "rarity": 0,
                "amount": 1,
                "free": false,
                "coverage": null
            }
        }
    ]
    */
}

function set_battle_pass_progression(update) {
    if (!update) {
        global_game_report_progression = false;
        return;
    }

    global_game_report_progression = true;

    let cont = _id("game_report_progression");

    let progress_cont = _createElement("div", "progress_cont");

    let level_icon_prev = _createElement("div", "bp_level_icon", update.from.level);
    let level_icon_next = _createElement("div", "bp_level_icon", update.from.level + 1);
    if (update.owned) {
        level_icon_prev.classList.add("paid");
        level_icon_next.classList.add("paid");
    }
    let progress_bar = _createElement("div", "progress_bar");
    let progress_bar_inner = _createElement("div", "inner");
    progress_bar.appendChild(progress_bar_inner);

    let init_width = Math.floor((update.from.xp - update.from.cur_level_req) / (update.from.next_level_req - update.from.cur_level_req) * 100);
    progress_bar.dataset.initWidth = init_width;
    progress_bar_inner.style.width = init_width + '%';

    progress_cont.appendChild(level_icon_prev);
    progress_cont.appendChild(progress_bar);
    progress_cont.appendChild(level_icon_next);

    cont.appendChild(progress_cont);

    global_game_report_progression_map.level_icon_prev = level_icon_prev;
    global_game_report_progression_map.level_icon_next = level_icon_next;
    global_game_report_progression_map.progress_bar_inner = progress_bar_inner;
    global_game_report_progression_map.from = update.from;
    global_game_report_progression_map.to = update.to;
    global_game_report_progression_map.owned = update.owned;
}

function set_progression_reward_unlocks() {
    let cont = _id("game_report_progression");

    let rewards_outer_cont = _createElement("div", "rewards_cont");
    cont.appendChild(rewards_outer_cont);

    let unlocked_count = global_game_report_rewards.length + global_game_report_achievement_rewards.length;

    if (global_game_report_rewards.length || global_game_report_achievement_rewards.length) {

        let unlocked_reward_cont = _createElement("div", ["rewards_block", "unlocked"]);
        unlocked_reward_cont.appendChild(_createElement("div", "title", localize_ext("battlepass_unlocked_rewards", {"count": unlocked_count})));

        let rewards_cont = _createElement("div", "rewards");
        unlocked_reward_cont.appendChild(rewards_cont);

        // Battle Pass Rewards
        if (global_game_report_rewards.length) {        
            for (let r of global_game_report_rewards) {
                let item_cont = _createElement("div", "customization_item_cont");

                let item = _createElement("div", ["customization_item", "image", "rarity_bg_"+r.rarity]);
                item_cont.appendChild(item);

                let img = renderCustomizationInner("game_report", r.customization_type, r.customization_id, r.amount);
                item.appendChild(img);

                rewards_cont.appendChild(item_cont);
            }
        }

        // Achievement Rewards
        if (global_game_report_achievement_rewards.length) {            
            for (let r of global_game_report_achievement_rewards) {
                let item_cont = _createElement("div", "customization_item_cont");

                let item = _createElement("div", ["customization_item", "image", "rarity_bg_"+r.reward.rarity]);
                item_cont.appendChild(item);

                let img = renderCustomizationInner("game_report", r.reward.customization_type, r.reward.customization_id, r.amount);
                item.appendChild(img);

                rewards_cont.appendChild(item_cont);
            }
        }

        rewards_outer_cont.appendChild(unlocked_reward_cont);
    }

    if (global_game_report_progression && !global_game_report_progression_map.owned) {
        // Show last few customizations that can be unlocked by buying the battlepass
        let unlockable_rewards = [];
        for (let level = parseInt(global_game_report_progression_map.to.level); level > 0; level--) {
            if (level in global_hud_battlepass_rewards) {
                for (let reward of global_hud_battlepass_rewards[level]) {
                    if (reward.free == false) {
                        unlockable_rewards.push(reward);
                    }
                }
            }
        }

        // Sort with rarity descending, so we always show the most highest rarity items that can be unlocked
        unlockable_rewards.sort(function(a, b) { return b.rarity - a.rarity; });

        let max_unlockable = 5;
        if (unlocked_count > 0) {
            if (unlockable_rewards.length > 0) rewards_outer_cont.appendChild(_createElement("div", "separator"));
            max_unlockable = max_unlockable - unlocked_count;
            if (max_unlockable <= 0) max_unlockable = 1;
        }

        if (unlockable_rewards.length > 0) {
            let unlocked_reward_cont = _createElement("div", ["rewards_block", "locked"]);
            unlocked_reward_cont.appendChild(_createElement("div", "title", localize_ext("battlepass_unlock_rewards_msg", {"count": unlockable_rewards.length})));

            let rewards_cont = _createElement("div", "rewards");
            unlocked_reward_cont.appendChild(rewards_cont);

            let count = 0;
            for (let r of unlockable_rewards) {
                count++;
                if (count > max_unlockable) break;

                let item_cont = _createElement("div", "customization_item_cont");

                let item = _createElement("div", ["customization_item", "image", "rarity_bg_"+r.rarity]);
                item_cont.appendChild(item);

                let img = renderCustomizationInner("game_report", r.customization_type, r.customization_id, r.amount);
                item.appendChild(img);

                rewards_cont.appendChild(item_cont);
            }

            let upgrade_button = _createElement("div", ["db-btn", "upgrade"], localize("battlepass_button_upgrade"));
            upgrade_button.addEventListener("click", function() {
                engine.call("set_menu_view", true);
                send_view_data("menu", "string", "open_battlepass_upgrade");
            });
            _addButtonSounds(upgrade_button, 1);
            rewards_cont.appendChild(upgrade_button);

            rewards_outer_cont.appendChild(unlocked_reward_cont);
        }
    }
    

}

function animate_bp_progress() {
    if (!("from" in global_game_report_progression_map)) return;
    if (!("to" in global_game_report_progression_map)) return;

    let map = global_game_report_progression_map;
    let animation_steps = [];

    let time_per_full_level = 3000;

    if (map.from.level == map.to.level) {
        let from = (map.from.xp - map.from.cur_level_req) / (map.from.next_level_req - map.from.cur_level_req);
        let to = (map.to.xp - map.to.cur_level_req) / (map.to.next_level_req - map.to.cur_level_req);
        let animation_time = time_per_full_level * (to - from);
        animation_steps.push({
            "from": Math.floor(from * 100),
            "to": Math.floor(to * 100),
            "level_prev": map.from.level,
            "level_next": map.from.level + 1,
            "easing": easing_functions.linear,
            "duration": animation_time, 
        });
    } else {
        let levels_gained = map.to.level - map.from.level;

        let initial_perc = (map.from.xp - map.from.cur_level_req) / (map.from.next_level_req - map.from.cur_level_req)
        let first_animation_time = time_per_full_level * (1 - initial_perc);
        animation_steps.push({
            "from": Math.floor(initial_perc * 100),
            "to": 100,
            "level_prev": map.from.level,
            "level_next": map.from.level + 1,
            "easing": easing_functions.linear,
            "duration": first_animation_time
        });
        if (levels_gained > 1) {
            for (let i=1; i<levels_gained; i++) {
                animation_steps.push({
                    "from": 0,
                    "to": 100,
                    "level_prev": map.from.level + i,
                    "level_next": map.from.level + i + 1,
                    "easing": easing_functions.linear,
                    "duration": time_per_full_level,
                });
            }
        }
        let last_perc = (map.to.xp - map.to.cur_level_req) / (map.to.next_level_req - map.to.cur_level_req);
        let last_animation_time = time_per_full_level * (1 - last_perc);
        animation_steps.push({
            "from": 0,
            "to": Math.floor(last_perc * 100),
            "level_prev": map.to.level,
            "level_next": map.to.level + 1,
            "easing": easing_functions.linear,
            "duration": last_animation_time,
        });
    }

    map.level_icon_prev.textContent = map.from.level;
    map.level_icon_next.textContent = map.to.level;

    setTimeout(() => {
        run_animation();
    },1000);

    function run_animation() {
        let anim = animation_steps.shift();

        map.level_icon_prev.textContent = anim.level_prev;
        map.level_icon_next.textContent = anim.level_next;

        anim_start({
            "element": map.progress_bar_inner,
            "width": [anim.from, anim.to, '%'],
            "duration": anim.duration,
            "easing": anim.easing,
            "completion": function() {
                setTimeout(() => {
                    if (animation_steps.length) {
                        run_animation();
                    }
                }, 10);
            }
        })
    }
}

// When the game_report is sent
function game_report_reset_rematch_option() {
    global_game_report_rematch_requested = false;
    let cont = _id("game_report_rematch_cont");

    if (!global_game_report_rematch_enabled) {
        cont.style.display = "none";
    } else {
        
        let btn = cont.querySelector(".rematch");
        btn.classList.remove("requested");
        btn.classList.remove("accepted");
        btn.textContent = localize("request_rematch");
        
        let total_players = Number(global_game_report_data_snafu["game_data.team_count"]) * Number(global_game_report_data_snafu["game_data.team_size"]);
        game_report_rematch_states(total_players, 0);

        cont.style.display = "flex";
    }
}

function game_report_handle_rematch_update(data) {
    //console.log("game_report_handle_rematch_update", _dump(data));
    game_report_rematch_states(data.required_requests, data.requests);

    let countdown_text = _id("game_report_cont").querySelector(".countdown .text");
    let btn = _id("game_report_rematch_cont").querySelector(".rematch");

    if (data.accepted) {
        btn.classList.add("accepted");
        countdown_text.textContent = localize("report_next_map_in");
        btn.textContent = localize("rematch_accepted");
    } else {
        btn.classList.remove("accepted");
        countdown_text.textContent = localize("report_leaving_game_in");
        if (data.self_requested) {
            btn.classList.add("requested");
            btn.textContent = localize("rematch_requested");
        } else {
            btn.classList.remove("requested");
            btn.textContent = localize("request_rematch");
        }
    }
}

function game_report_rematch_states(total, accepted) {
    let rematch_state = _id("game_report_rematch_cont").querySelector(".rematch_state");
    _empty(rematch_state);

    for (let i=0; i<total; i++) {
        if (i < accepted) {
            rematch_state.appendChild(_createElement("div", ["state", "accepted"]));
        } else {
            rematch_state.appendChild(_createElement("div", "state"));
        }
    }
}

// When the player clicks on the request match button 
function game_report_request_rematch() {
    let btn = _id("game_report_rematch_cont").querySelector(".rematch");
    if (!global_game_report_rematch_requested) {
        global_game_report_rematch_requested = true;
        btn.classList.add("requested");
        _id("report_tab_mapvote").style.display = "block";

        send_string(CLIENT_COMMAND_REQUEST_REMATCH);
    }

    game_report_switch_content(_id("report_tab_mapvote"), _id("report_mapvote"));
}

// When 100% of the players accepted the rematch
function game_report_rematch_accepted() {
    let countdown_text = _id("game_report_cont").querySelector(".countdown .text");
    countdown_text.textContent = localize("report_next_map_in");

    let btn = _id("game_report_rematch_cont").querySelector(".rematch");
    btn.classList.add("accepted");
}

function game_report_requeue() {
    if (global_game_report_data_game_status.hasOwnProperty("match_type")) {
        send_string(CLIENT_COMMAND_REQUEUE, global_game_report_data_game_status.match_type);
    }
    button_game_over_quit();
}
