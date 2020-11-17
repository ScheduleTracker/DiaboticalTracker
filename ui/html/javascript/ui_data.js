var global_last_item_pickup_timeout = null;
var global_last_item_pickup_multiplier = 0;
var global_last_item_pickup = null;
var global_item_pickup_ignore = {
    "dropped_health": 1,
};

const HUD_PLAYING = 0;
const HUD_SPECTATING = 1;

const CLIENT_COMMAND_JSON_DATA = 60;
const CLIENT_COMMAND_GET_INVITE_LIST = 61;
const CLIENT_COMMAND_PARTY = 62;
const CLIENT_COMMAND_LOBBY_UPDATE_PASSWORD = 63;
const CLIENT_COMMAND_JOIN_USERID_PARTY = 64;
const CLIENT_COMMAND_GET_USERID_FROM_NAME = 65;
const CLIENT_COMMAND_GET_ONLINE_FRIENDS_DATA = 66;
const CLIENT_COMMAND_SET_PARTY_LOCATIONS = 67;
const CLIENT_COMMAND_SET_PARTY_PRIVACY = 68;
const CLIENT_COMMAND_SET_PARTY_EXPAND_SEARCH = 69;
const CLIENT_COMMAND_PARTY_JOIN_SESSION = 70;
const CLIENT_COMMAND_PARTY_JOIN_LOBBY_KEY = 71;
const CLIENT_COMMAND_GET_API_TOKEN = 72;
const CLIENT_COMMAND_COMMEND = 73;
const CLIENT_COMMAND_GET_BATTLEPASS_REWARDS = 74;
const CLIENT_COMMAND_REROLL_CHALLENGE = 75;
const CLIENT_COMMAND_ABANDON = 76;
const CLIENT_COMMAND_GET_COMP_SEASON = 77;
const CLIENT_COMMAND_SET_CUSTOMIZATION = 78;
const CLIENT_COMMAND_MESSAGE_PARTY = 79;
const CLIENT_COMMAND_MESSAGE_LOBBY = 80;
const CLIENT_COMMAND_DISCONNECTED = 81;
const CLIENT_COMMAND_GET_CUSTOM_MATCH_LIST = 82;
const CLIENT_COMMAND_DISMISS_RECONNECT = 83;
const CLIENT_COMMAND_SELECT_MAP = 84;
const CLIENT_COMMAND_GET_RANKED_MMRS = 85;
const CLIENT_COMMAND_GET_SINGLE_RANKED_MMR = 86;
const CLIENT_COMMAND_REQUEUE = 87;
const CLIENT_COMMAND_SET_COLOR = 88;
const CLIENT_COMMAND_GET_NOTIFICATIONS = 89;
const CLIENT_COMMAND_DEL_NOTIFICATION = 90;
const CLIENT_COMMAND_GET_QUEUES = 92;
const CLIENT_COMMAND_GET_RECONNECTS = 93;
const CLIENT_COMMAND_RECONNECT = 94;
const CLIENT_COMMAND_REQUEST_REMATCH = 95;
const CLIENT_COMMAND_JOIN_WARMUP = 96;
const CLIENT_COMMAND_SELECT_MODE = 97;
const CLIENT_COMMAND_LOBBY_MAKE_ADMIN = 98;
const CLIENT_COMMAND_LOBBY_REVOKE_ADMIN = 99;
const CLIENT_COMMAND_GET_MATCH_INFO = 100;
const CLIENT_COMMAND_SAVE_CHAR_PRESET = 101;
const CLIENT_COMMAND_DEL_CHAR_PRESET = 102;
const CLIENT_COMMAND_LOAD_CHAR_PRESET = 103;
const CLIENT_COMMAND_SET_ALLOW_FRIEND_REQUESTS = 104;
const CLIENT_COMMAND_OWN_DATA = 105;
const CLIENT_COMMAND_SEND_FRIEND_REQUEST = 106;
const CLIENT_COMMAND_HANDLE_FRIEND_REQUEST = 107;
const CLIENT_COMMAND_GET_FRIENDS_LIST = 108;
const CLIENT_COMMAND_REMOVE_FRIEND = 109;
const CLIENT_COMMAND_MESSAGE_USER = 110;

const MATCH_TYPE_CUSTOM = 0;
const MATCH_TYPE_TOURNAMENT = 1;
const MATCH_TYPE_RANKED = 2;
const MATCH_TYPE_QUICKPLAY = 3;

const MATCH_TYPE = {
    0: { "i18n": "match_type_custom" },
    1: { "i18n": "match_type_tournament" },
    2: { "i18n": "match_type_ranked" },
    3: { "i18n": "match_type_quickplay" },
    4: { "i18n": "match_type_warmup" },
};

const SHOP_ITEM_TYPE = {
    CUSTOMIZATION: 'c',
    PACK: 'p',
    BATTLEPASS_BASIC: 'b',
    BATTLEPASS_BUNDLE: 'B',
};

const NOTIFICATION_TYPE = {
    0: "battlepass",
    1: "battlepass_items",
    2: "gift_battlepass",
    3: "gift_item",
    4: "twitch_drop",
};

// key => [color, i18n_key, image_path, type]
var global_item_name_map = {
    "coin":         ["#ffffff", "item_coin",                    "images/item_coin.svg",            "mode_pickup"],
    "ghost":        ["#ffffff", "item_coin",                    "images/item_coin.svg",            "mode_pickup"],
    "score_pickup_short": ["#ffdfa4", "item_coin",              "images/item_coin.svg",            "mode_pickup"],
    "score_pickup": ["#ffdfa4", "item_score_pickup",            "images/item_coin.svg",            "mode_pickup"],
    "score_deny":   ["#dbdbdb", "item_score_deny",              "images/item_coin.svg",            "mode_pickup"],
    "flag":         ["#ffffff", "item_flag",                    "images/item_flag.svg",            "mode_pickup"],
    "macguffin":    ["#f8d206", "item_macguffin",               "images/item_macguffin.svg",       "mode_pickup"],
    "doubledamage": ["#ffff0d", "item_diabotical",              "images/powerup_diabotical.svg",   "powerup"],
    "tripledamage": ["#891e94", "item_tripledamage",            "images/powerup_tripledamage.svg", "powerup"],
    "survival":     ["#42fc42", "item_siphonator",              "images/powerup_siphonator.svg",   "powerup"],
    "haste":        ["#ff5c42", "item_haste",                   "images/powerup_surge.svg",        "powerup"],
    "vanguard":     ["#0dffff", "item_vanguard",                "images/powerup_vanguard.svg",     "powerup"],
    "weaponmelee":  ["#888888", "weapon_melee",                 "images/weapon_melee.svg",         "weapon"],
    "weaponrl":     ["#df1f2d", "weapon_rocket_launcher",       "images/weapon_rl.svg",            "weapon"],
    "weaponbl":     ["#7c62d1", "weapon_blaster",               "images/weapon_sb.svg",            "weapon"],
    "weaponmac":    ["#cc791d", "weapon_machinegun",            "images/weapon_mac.svg",           "weapon"],
    "weaponcb_pncr":["#1fa8b6", "weapon_crossbow_pncr",         "images/weapon_cb.svg",            "weapon"],
    "weaponcb":     ["#1d89cc", "weapon_crossbow",              "images/weapon_cb.svg",            "weapon"],
    "weaponpncr":   ["#1fa8b6", "weapon_pncr",                  "images/weapon_pncr.svg",          "weapon"],
    "weaponshaft":  ["#cdb200", "weapon_shaft",                 "images/weapon_shaft.svg",         "weapon"],
    "weapongl":     ["#9d3329", "weapon_grenade_launcher",      "images/weapon_gl.svg",            "weapon"],
    "weaponss":     ["#9bc44d", "weapon_super_shotgun",         "images/weapon_ss.svg",            "weapon"],
    "weaponmg":     ["#b05620", "weapon_minigun",               "images/weapon_mg.svg",            "weapon"],
    "weaponw9":     ["#6b318b", "weapon_w9",                    "images/weapon_w9.svg",            "weapon"],
    "weaponst":     ["#23598e", "weapon_laserpen",              "images/weapon_st.svg",            "weapon"],
    "weaponiw":     ["#be2f83", "weapon_implosion_weeball",     "images/weapon_iw.svg",            "weapon"],
    "weaponsw":     ["#28cdcd", "weapon_slowfield_weeball",     "images/weapon_sw.svg",            "weapon"],
    "weaponbw":     ["#b4513b", "weapon_explosive_weeball",     "images/weapon_bw.svg",            "weapon"],
    "weaponsmw":    ["#5a811e", "weapon_smoke_weeball",         "images/weapon_smw.svg",           "weapon"],
    "weaponhw":     ["#67da80", "weapon_healing_weeball",       "images/weapon_hw.svg",            "weapon"],
    "weaponkw":     ["#015850", "weapon_knockback_weeball",     "images/weapon_kw.svg",            "weapon"],
    "weaponhook":   ["#777777", "weapon_hook",                  "",                                "weapon"],
    "armort1":      ["#27b1cf", "item_armort1",                 "images/item_armort1.svg",         "armor"],
    "armort2":      ["#27b1cf", "item_armort2",                 "images/item_armort2.svg",         "armor"],
    "armort3":      ["#ddb625", "item_armort3",                 "images/item_armort3.svg",         "armor"],
    "armort4":      ["#e51d1d", "item_armort4",                 "images/item_armort4.svg",         "armor"],
    "hpt0":         ["#3dbc75", "item_hpt0",                    "images/item_hpt0.svg",            "health"],
    "hpt1":         ["#3dbc75", "item_hpt1",                    "images/item_hpt1.svg",            "health"],
    "hpt2":         ["#3dbc75", "item_hpt2",                    "images/item_hpt2.svg",            "health"],
    "hpt3":         ["#3dbc75", "item_hpt3",                    "images/item_hpt3.svg",            "health"],
    "ammobl":       ["#7c62d1", "ammo_blaster",                 "images/weapon_bl.svg",            "ammo"],
    "ammoshaft":    ["#cdb200", "ammo_shaft",                   "images/weapon_shaft.svg",         "ammo"],
    "ammorl":       ["#df1f2d", "ammo_rockets",                 "images/weapon_rl.svg",            "ammo"],
    "ammoss":       ["#9bc44d", "ammo_shotgun",                 "images/weapon_ss.svg",            "ammo"],
    "ammopncr":     ["#1fa8b6", "ammo_pncr",                    "images/weapon_pncr.svg",          "ammo"],
    "ammomac":      ["#cc791d", "ammo_machinegun",              "images/weapon_mac.svg",           "ammo"],
    "ammogl":       ["#9d3329", "ammo_grenades",                "images/weapon_gl.svg",            "ammo"],
    "editpad":      ["#555555", "tool_editpad",                 "images/weapon_editpad.svg",       "special"],
};

let global_item_pickups_in_scoreboard = [
    "hpt3",
    "armort4",
    "armort3",
    "armort2",
    "doubledamage",
    "tripledamage",
    "vanguard",
    "survival",
    "haste",
];

let global_ingame_shop_item_map = {
    "ammo":         ["ingame_shop_item_ammo",        "ingame_shop_item_ammo_desc",        "images/weapon_mac.svg",           "#ffffff" ],
    "hp":           ["ingame_shop_item_hp",          "ingame_shop_item_hp_desc",          "images/hud_icon_hp.svg",          "#3dbc75" ],
    "survival":     ["ingame_shop_item_survival",    "ingame_shop_item_survival_desc",    "images/powerup_siphonator.svg",   "#42fc42" ],
    "vanguard":     ["ingame_shop_item_vanguard",    "ingame_shop_item_vanguard_desc",    "images/powerup_vanguard.svg",     "#0dffff" ],
    "berserker":    ["ingame_shop_item_berserker",   "ingame_shop_item_berserker_desc",   "images/icons/fa/exclamation.svg", "#ff0000" ],
    "second_wind":  ["ingame_shop_item_second_wind", "ingame_shop_item_second_wind_desc", "images/item_hpt0.svg",            "#3dbc75" ],
    "slowfield":    ["ingame_shop_item_slowfield",   "ingame_shop_item_slowfield_desc",   "images/weapon_sw.svg",            "#28cdcd" ],

    /*
        ammo Full ammo refill (machinegun ammo icon orange)
        hp Hp buff (cross icon green)
        survival (Siphonator) (this requires it to last until the end of next round or only start when the next round starts, so that you don't have to time your purchase with the final second of the buy phase to not waste time, survival/siphonator icon green
        vanguard vanguard (same as survival's requirements, vanguard icon blue)
        berserker  extra 50% damage when below 50 hp (exclamation mark icon red)
        second_wind second wind, going down to 0 hp instantly fills up your health once, only triggers and is only available for purchase once (item_hpt0 green)
        slowfield slowfield weeball, can only have one at a time (weaponsw blue)
    */
};

// weapon index to data map
let global_weapon_idx_name_map = {
    0 : "default",
    1 : "editpad",
    2 : "weaponmelee",
    3 : "weaponmac",
    4 : "weaponbl",
    5 : "weaponss",
    6 : "weaponrl",
    7 : "weaponshaft",
    8 : "weaponcb",
    9 : "weaponpncr",
    10: "weapongl",
    11: "weaponw9",
    12: "weaponmg",
    13: "weaponst",
    14: "weaponhw",
    15: "weaponiw",
    16: "weaponsw",
    17: "weaponbw",
    18: "weaponsmw",
    19: "weaponkw",   
    20: "weaponhook",
};
  
// weapon index to data map
let global_weapon_idx_name_map2 = {
    0 : "weaponmelee",
    1 : "weaponmac",
    2 : "weaponbl",
    3 : "weaponss",
    4 : "weaponrl",
    5 : "weaponshaft",
    6 : "weaponcb",
    7 : "weaponpncr",
    8 : "weapongl",
    9 : "weaponw9",
    10: "weaponmg",
    11: "weaponst",
    12: "weaponhw",
    13: "weaponiw",
    14: "weaponsw",
    15: "weaponbw",
    16: "weaponsmw",
    17: "weaponkw",   
    18: "weaponhook",
};

// Reverse weapon tag to index lookup map
let global_weapon_tag_idx_map = {};
for (let idx in global_weapon_idx_name_map2) {
    global_weapon_tag_idx_map[global_weapon_idx_name_map2[idx].substring(6)] = parseInt(idx);
}

let global_weapons_in_scoreboard = [0,1,2,3,4,5,6,7,8];
// For the customization weapon tabs:
let global_weapons_with_skins = [0,1,2,3,4,5,6,7,8];
// For the weapon priority list
let global_weapons_priority_default = ["rl","shaft","ss","bl","gl","pncr","cb","mac","melee"];
// The reload times are used to calculate the weapon usage statistic in %
let global_weapon_reload_times = {
    0 : 700,
    1 : 50,
    2 : 92,
    3 : 950 / 21,  // divide Shotgun reload time by 21 to get a usage relevant stat, doing this here so its not missed if we change indexes of weapons
    4 : 800,
    5 : 48,
    6 : 1000,
    7 : 1450,
    8 : 100,
    9 : 800,
    10: 1000,
    11: 1500,
    12: 1000,
    13: 1000,
    14: 1000,
    15: 1000,
    16: 1000,
    17: 1000,
    18: 850,
};

let global_report_reasons = [
    {"id": 0, "i18n": "report_reason_offensive_sticker_setup" },
    {"id": 1, "i18n": "report_reason_cheating" },
    {"id": 2, "i18n": "report_reason_offensive_speech" },
    {"id": 3, "i18n": "report_reason_bug_exploit" },
    {"id": 4, "i18n": "report_reason_griefing" },
    {"id": 5, "i18n": "report_reason_pause_abuse" },
];

var global_ping_colors = {
    "green": "#41e447",
    "yellow": "#ece453",
    "orange": "#ea9a31",
    "red": "#ff2828"
};


// Important: always refer to "Nitrado" hosting as "Nitrado Enterprise"!
var global_region_map = {
    "direct":{ "flag": "", "i18n": "datacenter_direct", "provider": "",  "name": "Direct Connection" },
    "online":{ "flag": "", "i18n": "datacenter_direct_online", "provider": "",  "name": "Direct Connection - ONLINE" },
    "lan": { "flag": "",   "i18n": "datacenter_direct_lan", "provider": "",     "name": "Direct Connection - LAN" },
    "ash": { "flag": "us", "i18n": "datacenter_ash", "provider": "i3D.net",     "name": "Ashburn" },
    "bue": { "flag": "ar", "i18n": "datacenter_bue", "provider": "i3D.net",     "name": "Buenos Aires"},
    "chi": { "flag": "us", "i18n": "datacenter_chi", "provider": "i3D.net",     "name": "Chicago" },
    "cla": { "flag": "us", "i18n": "datacenter_cla", "provider": "i3D.net",     "name": "Santa Clara" },
    "dal": { "flag": "us", "i18n": "datacenter_dal", "provider": "i3D.net",     "name": "Dallas" },
    "dub": { "flag": "ae", "i18n": "datacenter_dub", "provider": "i3D.net",     "name": "Dubai" },
    "fra": { "flag": "de", "i18n": "datacenter_fra", "provider": "i3D.net",     "name": "Frankfurt" },
    "hon": { "flag": "hk", "i18n": "datacenter_hon", "provider": "i3D.net",     "name": "Hong Kong" },
    "ist": { "flag": "tr", "i18n": "datacenter_ist", "provider": "i3D.net",     "name": "Istanbul"},
    "joh": { "flag": "za", "i18n": "datacenter_joh", "provider": "i3D.net",     "name": "Johannesburg" },
    "lon": { "flag": "gb", "i18n": "datacenter_lon", "provider": "Nitrado Enterprise", "name": "London" },
    "los": { "flag": "us", "i18n": "datacenter_los", "provider": "i3D.net",     "name": "Los Angeles" },
    "mad": { "flag": "es", "i18n": "datacenter_mad", "provider": "i3D.net",     "name": "Madrid" },
    "mia": { "flag": "us", "i18n": "datacenter_mia", "provider": "Nitrado Enterprise", "name": "Miami"},
    "mos": { "flag": "ru", "i18n": "datacenter_mos", "provider": "i3D.net",     "name": "Moscow" },
    "mum": { "flag": "in", "i18n": "datacenter_mum", "provider": "i3D.net",     "name": "Mumbai"},
    "par": { "flag": "fr", "i18n": "datacenter_par", "provider": "i3D.net",     "name": "Paris" },
    "rot": { "flag": "nl", "i18n": "datacenter_rot", "provider": "i3D.net",     "name": "Rotterdam" },
    "san": { "flag": "cl", "i18n": "datacenter_san", "provider": "EdgeUno",     "name": "Santiago"},
    "sao": { "flag": "br", "i18n": "datacenter_sao", "provider": "i3D.net",     "name": "São Paulo" },
    "sea": { "flag": "us", "i18n": "datacenter_sea", "provider": "i3D.net",     "name": "Seattle" },
    "sin": { "flag": "sg", "i18n": "datacenter_sin", "provider": "i3D.net",     "name": "Singapore" },
    "syd": { "flag": "au", "i18n": "datacenter_syd", "provider": "i3D.net",     "name": "Sydney" },
    "tok": { "flag": "jp", "i18n": "datacenter_tok", "provider": "i3D.net",     "name": "Tokyo" },
    "war": { "flag": "pl", "i18n": "datacenter_war", "provider": "i3D.net",     "name": "Warsaw" },
    "yek": { "flag": "ru", "i18n": "datacenter_yek", "provider": "G-Core Labs", "name": "Yekaterinburg"},
    "tes": { "flag": "nl", "i18n": "datacenter_tes", "provider": "i3D.net",     "name": "Test Location" },
};

const CUSTOM_MULTI_TEAM_MODES = ["brawl","instagib","ghosthunt","ffa","race"];
const CUSTOM_SOLO_MODES = ["duel","ffa"];
const CUSTOM_ROUND_BASED_MODES = ["ca","shaft_arena","rocket_arena","wipeout","macguffin","extinction","bounty"];
const CUSTOM_TIMELIMIT_ONLY_MODES = ["duel", "race"];
const CUSTOM_SPECIAL_COOP_MODES = ["survival"];

const CUSTOM_FRAG_LIMITS = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100, 150, 200, 250, 300, 500, 1000, 0];
const CUSTOM_ROUND_LIMITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];
const CUSTOM_CAPTURE_LIMITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 0];

var global_game_mode_map = {
    "brawl": {
        "mode": "brawl",
        "name": "Brawl",
        "i18n": "game_mode_brawl",
        "desc_i18n": "game_mode_desc_brawl",
        "announce": "announcer_common_gamemode_brawl",
        "enabled": true,
        "image": "brawl_loop.jpg", // html/images/gamemode_cards/
        "icon": "/html/images/gamemodes/brawl.svg"
    },
    "duel": {
        "mode": "duel",
        "name": "Duel",
        "i18n": "game_mode_duel",
        "desc_i18n": "game_mode_desc_duel",
        "announce": "announcer_common_gamemode_duel",
        "enabled": true,
        "image": "duel_loop.jpg",
        "icon": "/html/images/gamemodes/duel.svg"
    },
    "ca": {
        "mode": "ca",
        "name": "Aim Arena",
        "i18n": "game_mode_arena",
        "desc_i18n": "game_mode_desc_arena",
        "announce": "announcer_common_gamemode_arena",
        "enabled": true,
        "image": "arena_loop.jpg",
        "icon": "/html/images/gamemodes/arena.svg"
    },
    "rocket_arena": {
        "mode": "rocket_arena",
        "name": "Rocket Arena",
        "i18n": "game_mode_rocket_arena",
        "desc_i18n": "game_mode_desc_rocket_arena",
        "announce": "announcer_common_gamemode_rocket_arena",
        "enabled": true,
        "image": "arena_loop.jpg",
        "icon": "/html/images/gamemodes/arena.svg"
    },
    "shaft_arena": {
        "mode": "shaft_arena",
        "name": "Shaft Arena",
        "i18n": "game_mode_shaft_arena",
        "desc_i18n": "game_mode_desc_shaft_arena",
        "announce": "announcer_common_gamemode_shaft_arena",
        "enabled": true,
        "image": "arena_loop.jpg",
        "icon": "/html/images/gamemodes/arena.svg"
    },
    "wipeout": {
        "mode": "wipeout",
        "name": "Wipeout",
        "i18n": "game_mode_wipeout",
        "desc_i18n": "game_mode_desc_wipeout",
        "announce": "announcer_common_gamemode_wipeout",
        "enabled": true,
        "image": "wipeout_loop.jpg",
        "icon": "/html/images/gamemodes/wipeout.svg"
    },
    "ctf": {
        "mode": "ctf",
        "name": "Capture The Flag",
        "i18n": "game_mode_ctf",
        "desc_i18n": "game_mode_desc_ctf",
        "announce": "announcer_common_gamemode_ctf",
        "enabled": true,
        "image": "ctf_loop.jpg",
        "icon": "/html/images/gamemodes/ctf.svg"
    },
    "flagrun": {
        "mode": "flagrun",
        "name": "Wee-bow Flag Run",
        "i18n": "game_mode_flagrun",
        "desc_i18n": "game_mode_desc_flagrun",
        "announce": "announcer_common_gamemode_flagrun",
        "enabled": false,
        "image": "arcade_loop.jpg",
        "icon": "/html/images/gamemodes/instagib.svg"
    },
    "coinrun": {
        "mode": "coinrun",
        "name": "Wee-bow Gold Rush",
        "i18n": "game_mode_coinrun",
        "desc_i18n": "game_mode_desc_coinrun",
        "announce": "announcer_common_gamemode_coinrun",
        "enabled": true,
        "image": "arcade_loop.jpg",
        "icon": "/html/images/gamemodes/instagib.svg"
    },
    "macguffin": {
        "mode": "macguffin",
        "name": "MacGuffin",
        "i18n": "game_mode_macguffin",
        "desc_i18n": "game_mode_desc_macguffin",
        "announce": "announcer_common_gamemode_macguffin",
        "enabled": true,
        "image": "macguffin_loop.jpg",
        "icon": "/html/images/gamemodes/macguffin.svg"
    },
    "ghosthunt": {
        "mode": "ghosthunt",
        "name": "Wee-bow Instagib",
        "i18n": "game_mode_instagib",
        "desc_i18n": "game_mode_desc_instagib",
        "announce": "announcer_common_gamemode_wee-bow_instagib",
        "enabled": true,
        "image": "arcade_loop.jpg",
        "icon": "/html/images/gamemodes/instagib.svg"
    },
    "instagib_duel": {
        "mode": "instagib_duel",
        "name": "Instagib Duel",
        "i18n": "game_mode_instagib_duel",
        "desc_i18n": "game_mode_desc_instagib_duel",
        "announce": "announcer_common_gamemode_instagib_duel",
        "enabled": true,
        "image": "arcade_loop.jpg",
        "icon": "/html/images/gamemodes/instagib.svg"
    },
    "race": {
        "mode": "race",
        "name": "Time Trials",
        "i18n": "game_mode_race",
        "desc_i18n": "game_mode_desc_race",
        "announce": "announcer_common_gamemode_time_trials",
        "enabled": true,
        "image": "arcade_loop.jpg",
        "icon": "/html/images/gamemodes/race.svg"
    },
    "tdm": {
        "mode": "tdm",
        "name": "Team Deathmatch",
        "i18n": "game_mode_tdm",
        "desc_i18n": "game_mode_desc_tdm",
        "announce": "announcer_common_gamemode_tdm",
        "enabled": true,
        "image": "brawl_loop.jpg",
        "icon": "/html/images/gamemodes/tdm.svg"
    },
    "protdm": {
        "mode": "protdm",
        "name": "Pro-Team Deathmatch",
        "i18n": "game_mode_protdm",
        "desc_i18n": "game_mode_desc_protdm",
        "announce": "announcer_common_gamemode_tdm",
        "enabled": false,
        "image": "brawl_loop.jpg",
        "icon": "/html/images/gamemodes/tdm.svg"
    },
    "tw": {
        "mode": "tw",
        "name": "Team Wars",
        "i18n": "game_mode_tw",
        "desc_i18n": "game_mode_desc_tw",
        "announce": "",
        "enabled": false,
        "image": "brawl_loop.jpg",
        "icon": ""
    },
    "warmup": {
        "mode": "warmup",
        "name": "Warmup",
        "i18n": "game_mode_warmup",
        "desc_i18n": "game_mode_desc_warmup",
        "announce": "announcer_common_gamemode_warmup",
        "enabled": false,
        "image": "practice_loop.jpg",
        "icon": ""
    },
    "extinction": {
        "mode": "extinction",
        "name": "Extinction",
        "i18n": "game_mode_extinction",
        "desc_i18n": "game_mode_desc_extinction",
        "announce": "announcer_common_gamemode_extinction",
        "enabled": true,
        "image": "arcade_loop.jpg",
        "icon": "/html/images/gamemodes/tdm.svg"
    },
    "bounty": {
        "mode": "bounty",
        "name": "Bounty",
        "i18n": "game_mode_bounty",
        "desc_i18n": "game_mode_desc_bounty",
        "announce": "announcer_common_gamemode_bounty",
        "enabled": false,
        "image": "brawl_loop.jpg",
        "icon": "/html/images/gamemodes/tdm.svg"
    },
    "ft": {
        "mode": "ft",
        "name": "Freeze Tag",
        "i18n": "game_mode_ft",
        "desc_i18n": "game_mode_desc_ft",
        "announce": "announcer_common_gamemode_ft",
        "enabled": true,
        "image": "brawl_loop.jpg",
        "icon": "/html/images/gamemodes/tdm.svg"
    },
    "survival": {
        "mode": "survival",
        "name": "Survival",
        "i18n": "game_mode_survival",
        "desc_i18n": "game_mode_desc_survival",
        "announce": "announcer_common_gamemode_survival",
        "enabled": true,
        "image": "brawl_loop.jpg",
        "icon": "/html/images/gamemodes/tdm.svg"
    },
    "ffa": {
        "mode": "ffa",
        "name": "Free For All",
        "i18n": "game_mode_ffa",
        "desc_i18n": "game_mode_desc_ffa",
        "desc_instagib_i18n": "game_mode_desc_ffa_instagib", // localization key for description of this mode  with the instagib modifier enabled
        "announce": "announcer_common_gamemode_ffa",
        "enabled": true,
        "image": "brawl_loop.jpg",
        "icon": "/html/images/gamemodes/brawl.svg"
    },
};

let global_queues = {
    /* data coming from the MS
    "<queue_name>": {
        "i18n": "game_mode_<mode_name>",
        "vs": "5v5/FFA/Instagib X etc.",
        "queue_name": localize(i18n)+" "+vs,
        "team_size": 5,
        "locked": false,
        "leaderboard": true,
        "ranked": true,
        "roles": [
            { "name": "attack", "i18n": "role_attack" },
            { "name": "defend", "i18n": "role_defend" },
        ],
        "modes": [{
            "maps": [
                "mg_crystal_cove",
                "mg_sunken",
            ],
            "physics": 0,
            "instagib": false,
            "mode_name": "macguffin",
            "queue_name": "r_team_3",
            "time_limit": 0,
            "score_limit": 2,
        }]
    },
    */
};

var global_general_card_data = {
    "practice": {
        "i18n": "game_mode_practice_range",
        "desc_i18n": "",
    },
    "licensecenter": {
        "i18n": "game_mode_license_center",
        "desc_i18n": "",
    }
}

var global_physics_map = {
    "0":  { "i18n": "custom_settings_physics_diabotical" },
    "1":  { "i18n": "custom_settings_physics_race" },
    "2":  { "i18n": "custom_settings_physics_vintage" },
    /*
    "2":  { "i18n": "custom_settings_physics_hybrid" },
    "3":  { "i18n": "custom_settings_physics_freestyle" },
    "10": { "i18n": "custom_settings_physics_classic" },
    "20": { "i18n": "custom_settings_physics_retro" },
    "21": { "i18n": "custom_settings_physics_twitchy" },
    "30": { "i18n": "custom_settings_physics_tactical" },
    "31": { "i18n": "custom_settings_physics_legacy" },
    */
};

// battlepass season id -> data map
var global_battlepass_data = {
    "test_bp": {
        "shop-image": "",
        "fullscreen-image": "",
        "title": "battlepass_1_title", // localize key
        "price_basic": 1000,   // gets updated by MS
        "price_bundle": 2800,  // gets updated by MS
        "price_level": 100,    // !! has to match whats defined on the MS, does currently not get updated automatically
    },
    "bp_season_1": {
        //"shop-image": "/html/customization/avatar/av_AT1_2.png.dds",
        "shop-image": "/html/customization_pack/battlepass_season_1.png",
        "fullscreen-image": "/html/images/backgrounds/battlepass_season_1.png",
        "title": "battlepass_1_title", // localize key
        "price_basic": 1000,   // gets updated by MS
        "price_bundle": 2800,  // gets updated by MS
        "price_level": 100,    // !! has to match whats defined on the MS, does currently not get updated automatically
    },
    "bp_season_2": {
        //"shop-image": "/html/customization/avatar/av_AT1_2.png.dds",
        "shop-image": "",
        "fullscreen-image": "",
        "title": "battlepass_2_title", // localize key
        "price_basic": 1000,
        "price_bundle": 2800,
        "price_level": 100,
    },
};

var global_customization_type_map = {
    "0": { "name": "currency",          "prefix": "cu", "group": "",                  "img_path": "/html/customization/currency/",          "i18n": "customization_type_currency" },
    "1": { "name": "sticker",           "prefix": "st", "group": "sticker",           "img_path": "/resources/asset_thumbnails/",           "i18n": "customization_type_sticker" },
    "2": { "name": "avatar",            "prefix": "av", "group": "profile",           "img_path": "/html/customization/avatar/",            "i18n": "customization_type_avatar" },
    "3": { "name": "music",             "prefix": "mu", "group": "music",             "img_path": "/html/customization/music/",             "i18n": "customization_type_music" },
    "4": { "name": "emote",             "prefix": "em", "group": "emote",             "img_path": "/html/customization/emote/",             "i18n": "customization_type_emote" },
    "5": { "name": "spray",             "prefix": "sp", "group": "spray",             "img_path": "/html/customization/spray/",             "i18n": "customization_type_spray" },
    "6": { "name": "weapon",            "prefix": "we", "group": "weapon",            "img_path": "/html/customization/weapon/",            "i18n": "customization_type_weapon" },
    "7": { "name": "weapon_attachment", "prefix": "wa", "group": "weapon_attachment", "img_path": "/html/customization/weapon_attachment/", "i18n": "customization_type_weapon_attachment" },
    "8": { "name": "announcer",         "prefix": "an", "group": "",                  "img_path": "/html/customization/announcer/",         "i18n": "customization_type_announcer" },
    "9": { "name": "shoes",             "prefix": "sh", "group": "character",         "img_path": "/html/customization/shoes/",             "i18n": "customization_type_shoes" },
    "10":{ "name": "country",           "prefix": "co", "group": "profile",           "img_path": "/html/customization/flag/",              "i18n": "customization_type_flag" },
    "11":{ "name": "shell",             "prefix": "se", "group": "character",         "img_path": "/html/customization/shell/",             "i18n": "customization_type_shell" },
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
    "country": 10,
    "shell": 11,
};

const customization_item_order = [0, 11, 6, 7, 9, 4, 3, 5, 8, 2, 1, 10];

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
    "dk","dj","dm","do","ec","eg","sv","gq","er","ee","sz","et","fk","fj","fi","fo","fr","pf","ga","gm","ge","de","gh","gi","gr","gl","gd","gu","gt",
    "gg","gn","gw","gy","ht","va","hn","hk","hu","is","in","id","ir","iq","ie","im","il","it","jm","jp","je","jo","kz","ke","ki","kp","kr","kw","kg",
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
    STATS_KEY_SCORE: "s",
    STATS_KEY_FRAGS: "f",
    STATS_KEY_DEATHS: "d",
    STATS_KEY_DEATHS_FROM: "df",
    STATS_KEY_DEATHS_WHILE_HELD: "dh",
    STATS_KEY_ITEM_IDX: "i",
    STATS_KEY_SHOTS_FIRED: "sf",
    STATS_KEY_SHOTS_HIT: "sh",
    STATS_KEY_WEAPONS: "w",
    STATS_KEY_ROUNDS: "r",
    STATS_KEY_BASE: "b",
    STATS_KEY_ASSISTS: "a",
    STATS_KEY_PING: "p",
    STATS_KEY_ITEMS: "it",
    STATS_KEY_COUNT: "c",
    STATS_KEY_TEAM_HEALING: "th",
    STATS_KEY_OWN_HEALING: "oh",
    STATS_KEY_ARMOR_TAKEN: "at",
};



// all of those default to rarity 0
var GLOBAL_DEFAULT_CUSTOMIZATION_OPTIONS = {
    "avatar": [
        /*
        "smileyblue", "smileygreen", "smileyorange", "smileypurple", "smileyred", "smileyteal", "smileyyellow",
        "AT1_1", "AT1_2", "AT1_3", "AT1_4", "AT1_5", "AT1_6", "AT1_7", "AT1_8", "AT1_9", "AT1_10",
        "AT1_11", "AT1_12", "AT1_13", "AT1_14", "AT1_15", "AT1_16", "AT1_17", "AT1_18", "AT1_19",        
        "AT1_20", "AT1_21", "AT1_22", 
        "AT2_1", "AT2_2", "AT2_3", "AT2_4", "AT2_5", "AT2_6", "AT2_7", "AT2_8", "AT2_9", "AT2_10", 
        "AT2_11", "AT2_12", "AT2_13", "AT2_14", "AT2_15", "AT2_16", "AT2_17", "AT2_18", "AT2_19", "AT2_20", 
        "AT2_21", "AT2_22", "AT2_23", "AT2_24",
        */
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



var global_ranks = {
    "1": { "anim": "01_paintjob.webm" },
    "2": { "anim": "02_paintjob.webm" },
    "3": { "anim": "03_paintjob.webm" },
    "4": { "anim": "04_paintjob.webm" },
    "5": { "anim": "05_paintjob.webm" },
    "6": { "anim": "06_stone.webm" },
    "7": { "anim": "07_stone.webm" },
    "8": { "anim": "08_stone.webm" },
    "9": { "anim": "09_stone.webm" },
    "10": { "anim": "10_stone.webm" },
    "11": { "anim": "11_wood.webm" },
    "12": { "anim": "12_wood.webm" },
    "13": { "anim": "13_wood.webm" },
    "14": { "anim": "14_wood.webm" },
    "15": { "anim": "15_wood.webm" },
    "16": { "anim": "16_iron.webm" },
    "17": { "anim": "17_iron.webm" },
    "18": { "anim": "18_iron.webm" },
    "19": { "anim": "19_iron.webm" },
    "20": { "anim": "20_iron.webm" },
    "21": { "anim": "21_copper.webm" },
    "22": { "anim": "22_copper.webm" },
    "23": { "anim": "23_copper.webm" },
    "24": { "anim": "24_copper.webm" },
    "25": { "anim": "25_copper.webm" },
    "26": { "anim": "26_silver.webm" },
    "27": { "anim": "27_silver.webm" },
    "28": { "anim": "28_silver.webm" },
    "29": { "anim": "29_silver.webm" },
    "30": { "anim": "30_silver.webm" },
    "31": { "anim": "31_gold.webm" },
    "32": { "anim": "32_gold.webm" },
    "33": { "anim": "33_gold.webm" },
    "34": { "anim": "34_gold.webm" },
    "35": { "anim": "35_gold.webm" },
    "36": { "anim": "36_crystal.webm" },
    "37": { "anim": "37_crystal.webm" },
    "38": { "anim": "38_crystal.webm" },
    "39": { "anim": "39_crystal.webm" },
    "40": { "anim": "40_crystal.webm" },
    "top_1": { "anim": "41_special04.webm" },
    "top_2": { "anim": "42_special03.webm" },
    "top_3": { "anim": "43_special02.webm" },
    "top_4": { "anim": "44_legend.webm" },
};