var global_last_item_pickup_timeout = null;
var global_last_item_pickup_multiplier = 0;
var global_last_item_pickup = null;
var global_item_pickup_ignore = {
    "dropped_health": 1,
};

// key => [color, i18n_key, image_path]
var global_item_name_map = {
    "ghost":        ["#ffffff", "item_coin",                    "images/item_ghost.svg",         ],
    "score_pickup": ["#ffdfa4", "item_score_pickup",            "images/item_ghost.svg",         ],
    "score_deny":   ["#dbdbdb", "item_score_deny",              "images/item_ghost.svg",         ],
    "flag":         ["#ffffff", "item_flag",                    "images/item_flag.svg",          ],
    "macguffin":    ["#d7b500", "item_macguffin",               "images/item_macguffin.svg",     ],
    "doubledamage": ["#ffff0d", "item_diabotical",              "images/powerup_diabotical.svg", ],
    "survival":     ["#42fc42", "item_siphonator",              "images/powerup_siphonator.svg", ],
    "haste":        ["#ff5c42", "item_haste",                   "images/powerup_surge.svg",      ],
    "vanguard":     ["#0dffff", "item_vanguard",                "images/powerup_vanguard.svg",   ],
    "weaponmelee":  ["#333333", "weapon_melee",                 "images/weapon_melee.svg",       ],
    "weaponrl":     ["#df1f2d", "weapon_rocket_launcher",       "images/weapon_rl.svg",          ],
    "weaponbl":     ["#7c62d1", "weapon_blaster",               "images/weapon_sb.svg",          ],
    "weaponsb":     ["#7c62d1", "weapon_super_blaster",         "images/weapon_sb.svg",          ],
	"weaponmb":     ["#7c62d1", "weapon_master_blaster",        "images/weapon_mb.svg",          ],
    "weaponmac":    ["#318c29", "weapon_machinegun",            "images/weapon_mac.svg",         ],
    "weaponcb_pncr":["#1fa8b6", "weapon_crossbow_pncr",         "images/weapon_pncr.svg",        ],
    "weaponcb":     ["#a65f25", "weapon_crossbow",              "images/weapon_cb.svg",          ],
    "weaponpncr":   ["#1fa8b6", "weapon_pncr",                  "images/weapon_pncr.svg",        ],
    "weapondf":     ["#cdb200", "weapon_shaft",                 "images/weapon_df.svg",          ],
    "weapongl":     ["#9d3329", "weapon_grenade_launcher",      "images/weapon_gl.svg",          ],
    "weaponshotgun":["#9bc44d", "weapon_shotgun",               "images/weapon_ss.svg",          ],
    "weaponss":     ["#9bc44d", "weapon_super_shotgun",         "images/weapon_ss.svg",          ],
    "weaponsg":     ["#9bc44d", "weapon_shotgun",               "images/weapon_sg.svg",          ],
    "weaponmg":     ["#b05620", "weapon_minigun",               "images/weapon_mg.svg",          ],
    //"weaponfg":     ["#a1751e", "weapon_scattergun",            "images/weapon_fg.svg",          ], // Scatter gun is removed, model repurposed for super shotgun
    "weaponbfg":    ["#6b318b", "weapon_bfg",                   "images/weapon_bfg.svg",         ],
    "weaponst":     ["#23598e", "weapon_laserpen",              "images/weapon_st.svg",          ],
    "weaponiw":     ["#be2f83", "weapon_implosion_weeball",     "images/weapon_iw.svg",          ],
    "weaponsw":     ["#28cdcd", "weapon_slowfield_weeball",     "images/weapon_sw.svg",          ],
    "weaponbw":     ["#b4513b", "weapon_explosive_weeball",     "images/weapon_bw.svg",          ],
    "weaponsmw":    ["#5a811e", "weapon_smoke_weeball",         "images/weapon_smw.svg",         ],
    "weaponhw":     ["#67da80", "weapon_healing_weeball",       "images/weapon_hw.svg",          ],
    "weaponkw":     ["#015850", "weapon_knockback_weeball",     "images/weapon_kw.svg",          ],
    "weaponhook":   ["#777777", "weapon_hook",                  "",                              ],
    "armort1":      ["#27b1cf", "item_armort1",                 "images/item_armort1.svg",       ],
    "armort2":      ["#27b1cf", "item_armort2",                 "images/item_armort2.svg",       ],
    "armort3":      ["#ddb625", "item_armort3",                 "images/item_armort3.svg",       ],
    "armort4":      ["#e51d1d", "item_armort4",                 "images/item_armort4.svg",       ],
    "hpt0":         ["#3dbc75", "item_hpt0",                    "images/item_hpt0.svg",          ],
    "hpt1":         ["#3dbc75", "item_hpt1",                    "images/item_hpt1.svg",          ],
    "hpt2":         ["#3dbc75", "item_hpt2",                    "images/item_hpt2.svg",          ],
    "hpt3":         ["#3dbc75", "item_hpt3",                    "images/item_hpt3.svg",          ],
    "ammovc":       ["#7c62d1", "ammo_blaster",                 "images/weapon_bl.svg",          ],
    "ammodf":       ["#cdb200", "ammo_shaft",                   "images/weapon_df.svg",          ],
    "ammorl":       ["#df1f2d", "ammo_rockets",                 "images/weapon_rl.svg",          ],
    "ammoss":       ["#9bc44d", "ammo_shotgun",                 "images/weapon_ss.svg",          ],
    "ammopncr":     ["#1fa8b6", "ammo_pncr",                    "images/weapon_pncr.svg",        ],
    "ammomac":      ["#318c29", "ammo_machinegun",              "images/weapon_mac.svg",         ],
    "ammogl":       ["#9d3329", "ammo_grenades",                "images/weapon_gl.svg",          ],
    "editpad":      ["#555555", "tool_editpad",                 "images/weapon_editpad.svg",     ],
};

// weapon index to data map
let global_weapon_idx_name_map = {
    0 : "default",
    1 : "editpad",
    2 : "weaponmelee",
    3 : "weaponbl",
    4 : "weaponsg",
    5 : "weaponss",
    6 : "weaponrl",
    7 : "weapondf",
    8 : "weaponcb_pncr",
    9 : "weaponpncr",
    10: "weaponmac",
    11: "weapongl",
    12: "weaponbfg",
    13: "weaponmg",
    14: "weaponst",
    15: "weaponhw",
    16: "weaponiw",
    17: "weaponsw",
    18: "weaponbw",
    19: "weaponsmw",
    20: "weaponkw",   
    21: "weaponhook",
};
  
// weapon index to data map
let global_weapon_idx_name_map2 = {
    0 : "weaponmelee",
    1 : "weaponbl",
    2 : "weaponsg",
    3 : "weaponss",
    4 : "weaponrl",
    5 : "weapondf",
    6 : "weaponcb_pncr",
    7 : "weaponpncr",
    8 : "weaponmac",
    9 : "weapongl",
    10: "weaponbfg",
    11: "weaponmg",
    12: "weaponst",
    13: "weaponhw",
    14: "weaponiw",
    15: "weaponsw",
    16: "weaponbw",
    17: "weaponsmw",
    18: "weaponkw",   
    19: "weaponhook",
};

var global_hud_need_strafe_calculations = false;
var global_hud_need_pitch_calculations = false;
var global_hud_direction_hints_enabled = false;

var global_ping_colors = {
    "green": "#41e447",
    "yellow": "#ece453",
    "orange": "#ea9a31",
    "red": "#ff2828"
};

var global_region_map = {
    "online":{ "flag": "", "i18n": "datacenter_direct_online", "provider": "", "name": "Direct Connection - ONLINE" },
    "lan": { "flag": "",   "i18n": "datacenter_direct_lan", "provider": "", "name": "Direct Connection - LAN" },
    "ash": { "flag": "us", "i18n": "datacenter_ash", "provider": "i3D.net", "name": "Ashburn" },
    "chi": { "flag": "us", "i18n": "datacenter_chi", "provider": "i3D.net", "name": "Chicago" },
    "dal": { "flag": "us", "i18n": "datacenter_dal", "provider": "i3D.net", "name": "Dallas" },
    "fra": { "flag": "de", "i18n": "datacenter_fra", "provider": "i3D.net", "name": "Frankfurt" },
    "hon": { "flag": "hk", "i18n": "datacenter_hon", "provider": "i3D.net", "name": "Hong Kong" },
    "joh": { "flag": "za", "i18n": "datacenter_joh", "provider": "i3D.net", "name": "Johannesburg" },
    "los": { "flag": "us", "i18n": "datacenter_los", "provider": "i3D.net", "name": "Los Angeles" },
    "mos": { "flag": "ru", "i18n": "datacenter_mos", "provider": "i3D.net", "name": "Moscow" },
    "par": { "flag": "fr", "i18n": "datacenter_par", "provider": "i3D.net", "name": "Paris" },
    "rot": { "flag": "nl", "i18n": "datacenter_rot", "provider": "i3D.net", "name": "Rotterdam" },
    "sao": { "flag": "br", "i18n": "datacenter_sao", "provider": "i3D.net", "name": "São Paulo" },
    "sea": { "flag": "us", "i18n": "datacenter_sea", "provider": "i3D.net", "name": "Seattle" },
    "sin": { "flag": "sg", "i18n": "datacenter_sin", "provider": "i3D.net", "name": "Singapore" },
    "syd": { "flag": "au", "i18n": "datacenter_syd", "provider": "i3D.net", "name": "Sydney" },
    "tok": { "flag": "ja", "i18n": "datacenter_tok", "provider": "i3D.net", "name": "Tokyo" },
    "war": { "flag": "pl", "i18n": "datacenter_war", "provider": "i3D.net", "name": "Warsaw" },
};


var global_game_mode_map = {
    "brawl": {
        "mode": "brawl",
        "name": "Brawl",
        "i18n": "game_mode_brawl",
        "desc_i18n": "game_mode_desc_brawl",
        "enabled": false,
    },
    "duel": {
        "mode": "duel",
        "name": "Duel",
        "i18n": "game_mode_duel",
        "desc_i18n": "game_mode_desc_duel",
        "enabled": false,
    },
    "ca": {
        "mode": "ca",
        "name": "Arena",
        "i18n": "game_mode_clan_arena",
        "desc_i18n": "game_mode_desc_arena",
        "enabled": true,
    },
    "rocket_arena": {
        "mode": "rocket_arena",
        "name": "Rocket Arena",
        "i18n": "game_mode_rocket_arena",
        "desc_i18n": "game_mode_desc_rocket_arena",
        "enabled": true,
    },
    "shaft_arena": {
        "mode": "shaft_arena",
        "name": "Shaft Arena",
        "i18n": "game_mode_shaft_arena",
        "desc_i18n": "game_mode_desc_shaft_arena",
        "enabled": true,
    },
    "wipeout": {
        "mode": "wipeout",
        "name": "Wipeout",
        "i18n": "game_mode_wipeout",
        "desc_i18n": "game_mode_desc_wipeout",
        "enabled": true,
    },
    "ctf": {
        "mode": "ctf",
        "name": "Capture The Flag",
        "i18n": "game_mode_capture_the_flag",
        "desc_i18n": "game_mode_desc_ctf",
        "enabled": false,
    },
    "macguffin": {
        "mode": "macguffin",
        "name": "MacGuffin",
        "i18n": "game_mode_macguffin",
        "desc_i18n": "game_mode_desc_macguffin",
        "enabled": false,
    },
    "ghosthunt": {
        "mode": "ghosthunt",
        "name": "Instagib",
        "i18n": "game_mode_instagib",
        "desc_i18n": "game_mode_desc_instagib",
        "enabled": true,
    },
    "race": {
        "mode": "race",
        "name": "Time Trials",
        "i18n": "game_mode_race",
        "desc_i18n": "game_mode_desc_race",
        "enabled": false,
    },
    "tdm": {
        "mode": "tdm",
        "name": "Team Deathmatch",
        "i18n": "game_mode_tdm",
        "desc_i18n": "game_mode_desc_tdm",
        "enabled": false,
    },
    "tw": {
        "mode": "tw",
        "name": "Team Wars",
        "i18n": "game_mode_tw",
        "desc_i18n": "game_mode_desc_tw",
        "enabled": false,
    },
};

var global_physics_map = {
    "0":  { "i18n": "custom_settings_physics_default" },
    "1":  { "i18n": "custom_settings_physics_vintage" },
    "2":  { "i18n": "custom_settings_physics_hybrid" },
    "3":  { "i18n": "custom_settings_physics_freestyle" },
    "10": { "i18n": "custom_settings_physics_classic" },
    "20": { "i18n": "custom_settings_physics_retro" },
    "21": { "i18n": "custom_settings_physics_twitchy" },
    "30": { "i18n": "custom_settings_physics_tactical" },
    "31": { "i18n": "custom_settings_physics_legacy" },
};

// battlepass season id -> data map
var global_battlepass_data = {
    "bp_pre_season1": {
        "level-image": "/html/images/icons/battlepass_level.png",

        "title": "battlepass_1_title", // localize key
        "description": "battlepass_1_description", // localize key
        "tag": "battlepass_1_tag", // localize key
        "colors": {
            "color": "#f77b2f",
            "gradient_1": "#D16D2E",
            "gradient_2": "#C35816",
            "gradient_hover_1": "#dd7534",
            "gradient_hover_2": "#cf601a",
            "gradient_active_1": "#e47b3a",
            "gradient_active_2": "#e06b22"
        }
    },
    "bp_season1": {
        "level-image": "/html/images/icons/battlepass_2_level.png",

        "title": "battlepass_2_title", // localize key
        "description": "battlepass_2_description", // localize key
        "tag": "battlepass_2_tag", // localize key
        "colors": {
            "color": "#0082d0",
            "gradient_1": "#0082d0",
            "gradient_2": "#0367a5",
            "gradient_hover_1": "#0a8ada",
            "gradient_hover_2": "#0974b8",
            "gradient_active_1": "#1594e2",
            "gradient_active_2": "#32a6ee"
        }
    },
};

var global_customization_type_map = {
    "0": { "name": "currency",          "i18n": "customization_type_currency" },
    "1": { "name": "sticker",           "i18n": "customization_type_sticker" },
    "2": { "name": "avatar",            "i18n": "customization_type_avatar" },
    "3": { "name": "music",             "i18n": "customization_type_music" },
    "4": { "name": "emote",             "i18n": "customization_type_emote" },
    "5": { "name": "spray",             "i18n": "customization_type_spray" },
    "6": { "name": "weapon",            "i18n": "customization_type_weapon" },
    "7": { "name": "weapon_attachment", "i18n": "customization_type_weapon_attachment" },
    "8": { "name": "announcer",         "i18n": "customization_type_announcer" },
    "9": { "name": "shoes",             "i18n": "customization_type_shoes" },
    "10":{ "name": "flag",              "i18n": "customization_type_flag" },
};

var global_customization_type_id_map = {
    "currency": 0,
    "sticker": 1,
    "avatar": 2,
    "music": 3,
    "emote": 4,
    "spray": 5,
    "weapon": 6,
    "weapon_attachment": 7,
    "announcer": 8,
    "shoes": 9,
    "flag": 10,
};

const customization_item_order = [6, 7, 9, 4, 5, 3, 8, 2, 1, 10];

var global_rarity_map = {
    "0": { "i18n": "rarity_common" },
    "1": { "i18n": "rarity_uncommon" },
    "2": { "i18n": "rarity_rare" },
    "3": { "i18n": "rarity_epic" },
    "4": { "i18n": "rarity_legendary" },
};

var GLOBAL_AVAILABLE_COUNTRY_FLAGS = [
    "af","ax","al","dz","as","ad","ao","ai","ag","ar","am","aw","au","at","az","bs","bh","bd","bb","by","be","bz","bj","bm","bt","bo","ba","bw",
    "br","io","bn","bg","bf","bi","cv","kh","cm","ca","ky","cf","td","cl","cn","cx","cc","co","km","cg","cd","ck","cr","ci","hr","cu","cw","cz",
    "dk","dj","dm","do","ec","eg","sv","gq","er","ee","sz","et","fk","fj","fi","fr","pf","ga","gm","ge","de","gh","gi","gr","gl","gd","gu","gt",
    "gg","gn","gw","ht","va","hn","hk","hu","is","in","id","ir","iq","ie","im","il","it","jm","jp","je","jo","kz","ke","ki","kp","kr","kw","kg",
    "la","lv","lb","ls","lr","ly","li","lt","lu","mo","mg","mw","my","mv","ml","mt","mh","mq","mr","mu","mx","fm","md","mc","mn","me","ms","ma",
    "mz","mm","na","nr","np","nl","nz","ni","ne","ng","nu","nf","mk","no","om","pk","pw","ps","pa","pg","py","pe","ph","pl","pt","pr","qa","ro",
    "ru","rw","kn","lc","vc","ws","sm","st","sa","sn","rs","sc","sl","sg","sx","sk","si","sb","so","za","ss","es","lk","sd","sr","se","ch","sy",
    "tw","tj","tz","th","tl","tg","tk","to","tt","tn","tr","tm","tc","tv","ug","ua","ae","gb","us","uy","uz","vu","ve","vn","vg","vi","eh","ye",
    "zm","zw"
];

const GLOBAL_ABBR = {
    STATS_KEY_DAMAGE_TAKEN: "dt",
    STATS_KEY_DAMAGE_INFLICTED: "di",
    STATS_KEY_DAMAGE_SELF: "ds",
    STATS_KEY_HEALING: "h",
    STATS_KEY_SCORE: "s",
    STATS_KEY_FRAGS: "f",
    STATS_KEY_DEATHS: "d",
    STATS_KEY_DEATHS_FROM: "df",
    STATS_KEY_DEATHS_WHILE_HELD: "dh",
    STATS_KEY_WEAPON_IDX: "i",
    STATS_KEY_SHOTS_FIRED: "sf",
    STATS_KEY_SHOTS_HIT: "sh",
};



// all of those default to rarity 0
var GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS = {
    "avatar": [
        "smileyblue", "smileygreen", "smileyorange", "smileypurple", "smileyred", "smileyteal", "smileyyellow",
        "AT1_1", "AT1_2", "AT1_3", "AT1_4", "AT1_5", "AT1_6", "AT1_7", "AT1_8", "AT1_9", "AT1_10",
        "AT1_11", "AT1_12", "AT1_13", "AT1_14", "AT1_15", "AT1_16", "AT1_17", "AT1_18", "AT1_19",        
        "AT1_20", "AT1_21", "AT1_22", 
        "AT2_1", "AT2_2", "AT2_3", "AT2_4", "AT2_5", "AT2_6", "AT2_7", "AT2_8", "AT2_9", "AT2_10", 
        "AT2_11", "AT2_12", "AT2_13", "AT2_14", "AT2_15", "AT2_16", "AT2_17", "AT2_18", "AT2_19", "AT2_20", 
        "AT2_21", "AT2_22", "AT2_23", "AT2_24",
    ],

    // Temporarily adding all the stickers, see customize_screen.js -> set_asset_browser_content
    "sticker": []
};

var global_fov_preview_images = {
//    "wellspring_hud": [
//        {
//            "fov":90,
//            "fov_type":"4|ML|3",
//            "width": 1920,
//            "height": 810,
//            "src": "images/hud_preview_background.png",
//        },
//    ],
    "temple_quarry": [
        {
            "fov":7.1907,
            "fov_type":"vML",
            "width": 1920,
            "height": 1080,
            "src": "images/fov_preview/fov_preview_7,1907.png",
        },
        {
            "fov":50,
            "fov_type":"vML",
            "width": 1920,
            "height": 1080,
            "src": "images/fov_preview/fov_preview_50.png",
        },
        {
            "fov":140,
            "fov_type":"vML",
            "width": 1920,
            "height": 1080,
            "src": "images/fov_preview/fov_preview_140.png",
        },
    ],
    "depot": [
        {
            "fov":1,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_1.png",
        },
        {
            "fov":5,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_5.png",
        },
        {
            "fov":10,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_10.png",
        },
        {
            "fov":20,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_20.png",
        },
        {
            "fov":30,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_30.png",
        },
        {
            "fov":40,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_40.png",
        },
        {
            "fov":50,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_50.png",
        },
        {
            "fov":60,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_60.png",
        },
        {
            "fov":70,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_70.png",
        },
        {
            "fov":80,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_80.png",
        },
        {
            "fov":90,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_90.png",
        },
        {
            "fov":100,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_100.png",
        },
        {
            "fov":110,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_110.png",
        },
        {
            "fov":120,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_120.png",
        },
        {
            "fov":130,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_130.png",
        },
        {
            "fov":140,
            "fov_type":"vML",
            "pitch":0.0329947,
            "yaw":-13.8751,
            "pos":[-834.296,-333.662,-201.524],
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/depot_fov_140.png",
        },
    ],
    "crystal_cove": [
        {
            "fov":1,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_1.png",
        },
        {
            "fov":2,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_2.png",
        },
        {
            "fov":3,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_3.png",
        },
        {
            "fov":5,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_5.png",
        },
        {
            "fov":10,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_10.png",
        },
        {
            "fov":20,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_20.png",
        },
        {
            "fov":40,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_40.png",
        },
        {
            "fov":70,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_70.png",
        },
        {
            "fov":110,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_110.png",
        },
        {
            "fov":140,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/crystal_cove_fov_140.png",
        },
    ],
    "wellspring": [
        {
            "fov":1,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_1.png",
        },
        {
            "fov":2,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_2.png",
        },
        {
            "fov":3,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_3.png",
        },
        {
            "fov":5,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_5.png",
        },
        {
            "fov":10,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_10.png",
        },
        {
            "fov":20,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_20.png",
        },
        {
            "fov":40,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_40.png",
        },
        {
            "fov":70,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_70.png",
        },
        {
            "fov":110,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_110.png",
        },
        {
            "fov":140,
            "fov_type":"vML",
            "width": 1920,
            "height": 810,
            "src": "images/fov_preview/wellspring_fov_140.png",
        },
    ],
};