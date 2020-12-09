function initialize_loading_screen(){
    /* For segments
    let loading_bar = _id("loading_screen_progress_bar");
    var loading_bar_segments_array = [];
    let loading_bar_number_of_segments = 30;
    for(let i=0; i < loading_bar_number_of_segments; i++){
        loading_bar_segments_array.push(_createElement("div", "segment"));
        loading_bar_segments_array[i].style.width = ((100 / loading_bar_number_of_segments) * 0.75) + "%";
        loading_bar.appendChild(loading_bar_segments_array[i]);
    }
    */
   
    generate_loading_screen_artwork(); //Generate artwork for first loading screen
}

function generate_loading_screen_artwork(){
    var loading_screen_backgrounds = [
        {image: 'url("/html/tipscreens/tip_screen_ball_pool.png")',
        tipX: '11vw', tipY: '20vh', tipWidth: '30vw', tipHeight: '40vh'},
        {image: 'url("/html/tipscreens/tip_screen_clawmachine_wee.png")',
        tipX: '65vw', tipY: '10vh', tipWidth: '30vw', tipHeight: '35vh'},
        {image: 'url("/html/tipscreens/tip_screen_factory.png")',
        tipX: '65vw', tipY: '15vh', tipWidth: '30vw', tipHeight: '35vh'},
        {image: 'url("/html/tipscreens/tip_screen_hammer_wee.png")',
        tipX: '5vw', tipY: '30vh', tipWidth: '25vw', tipHeight: '45vh'},
        {image: 'url("/html/tipscreens/tip_screen_rocket_wee.png")',
        tipX: '15vw', tipY: '10vh', tipWidth: '45vw', tipHeight: '25vh'},
        {image: 'url("/html/tipscreens/tip_screen_teacher_bot.png")',
        tipX: '7vw', tipY: '25vh', tipWidth: '25vw', tipHeight: '45vh'}
    ]

    let loading_screen_artwork = _id("loading_screen_artwork");

    let random_background = loading_screen_backgrounds[Math.floor(Math.random() * loading_screen_backgrounds.length)];
    loading_screen_artwork.style.backgroundImage = random_background.image;
}

function generate_loading_screen_tip(gamemode){
    //Use separate function to load artwork and tips because tips are context sensitive
    var loading_tips = {
        general:[
            {"i18n": "loading_tip_general_1_frox", author:"frox"},
            {"i18n": "loading_tip_general_2_flawlessdbt", author:"FlawlessDBT"},
            {"i18n": "loading_tip_general_3_snexwang", author:"snexwang"},
            {"i18n": "loading_tip_general_4_un1d", author:"Un1d"},
            {"i18n": "loading_tip_general_5_d0pebear99", author:"d0pebear99"},
            {"i18n": "loading_tip_general_6_pop", author:"Pop"},
            {"i18n": "loading_tip_general_7_tomau5", author:"Tomau5"},
            {"i18n": "loading_tip_general_8_tomau5", author:"Tomau5"},
            {"i18n": "loading_tip_general_9_fragtastic", author:"fragtastic"},
            {"i18n": "loading_tip_general_10_g4rlock", author:"G4rlock"},
            {"i18n": "loading_tip_general_11_dan_dead_or_alive", author:"Dan Dead Or Alive"},
            {"i18n": "loading_tip_general_12_drrifted_", author:"drrifted_"},
            {"i18n": "loading_tip_general_13_doggerdemon", author:"doggerdemon"},
            {"i18n": "loading_tip_general_14_pressok", author:"PressOK"},
            {"i18n": "loading_tip_general_15_g4mb4", author:"G4mb4"},
            {"i18n": "loading_tip_general_16_inactiveaccount", author:"inactiveaccount "},
            {"i18n": "loading_tip_general_17_mr_kt", author:"Mr.kt"},
            {"i18n": "loading_tip_general_18_jysandy", author:"jysandy"},
            {"i18n": "loading_tip_general_19_zydian05", author:"zydian05 "},
            {"i18n": "loading_tip_general_20_amrojare", author:"amrojare"},
            {"i18n": "loading_tip_general_21_grev", author:"grev"},
            {"i18n": "loading_tip_general_22_c3zz", author:"c3zz"},
            {"i18n": "loading_tip_general_23_vit0so", author:"vit0so"},
            {"i18n": "loading_tip_general_24_owenz0r", author:"owenz0r"},
            {"i18n": "loading_tip_general_25_tekn0z", author:"Tekn0z"},
            {"i18n": "loading_tip_general_26_cadsmar", author:"Cadsmar"},
            {"i18n": "loading_tip_general_27_westyy", author:"westyy"},
            {"i18n": "loading_tip_general_28_dobbelburger", author:"Dobbelburger"},
            {"i18n": "loading_tip_general_29_seekay", author:"Seekay"},
            {"i18n": "loading_tip_general_30_reign_", author:"reign_"},
            {"i18n": "loading_tip_general_31_gretel", author:"gretel"},
            {"i18n": "loading_tip_general_32_e_r_n_y", author:"e r n y"},
            {"i18n": "loading_tip_general_33_kok0mo", author:"Kok0mo"},
            {"i18n": "loading_tip_general_34_nonstickswag", author:"nonstickswag "},
            {"i18n": "loading_tip_general_35_yikespike", author:"YikeSpike"},
            {"i18n": "loading_tip_general_36_peenscreeker", author:"PeenScreeker"},
            {"i18n": "loading_tip_general_37_groparoo", author:"groparoo"},
            {"i18n": "loading_tip_general_38_lemmingNr13", author:"LemmingNr13"},
            {"i18n": "loading_tip_general_39_imageomega", author:"ImageOmega"},
            {"i18n": "loading_tip_general_40_gppp", author:"Gppp"},
            {"i18n": "loading_tip_general_41_real_kranken", author:"real_Kranken"},
            {"i18n": "loading_tip_general_42_groparoo", author:"groparoo"},
            {"i18n": "loading_tip_general_43_gerby", author:"gerby"},
            {"i18n": "loading_tip_general_44_saka", author:"Saka"},
            {"i18n": "loading_tip_general_45_frustzwerg", author:"frustzwerg"},
            {"i18n": "loading_tip_general_46_nerfhalo1", author:"Nerfhalo1"},
            {"i18n": "loading_tip_general_47_mister_wong", author:"Mister_Wong"},
            {"i18n": "loading_tip_general_48_internetdonut", author:"internetdonut"},
            {"i18n": "loading_tip_general_49_coredusk", author:"CoredusK"},
            {"i18n": "loading_tip_general_50_kerim", author:"Kerim"},
            {"i18n": "loading_tip_general_51_blakeeo", author:"blakeeo"},
            {"i18n": "loading_tip_general_52_yonecessito", author:"yonecessito"},
            {"i18n": "loading_tip_general_53_moody", author:"moody"},
            {"i18n": "loading_tip_general_54_sohm", author:"Sohm"},
            {"i18n": "loading_tip_general_55_sakiir", author:"SakiiR"},
            {"i18n": "loading_tip_general_56_creep", author:"creep"}
        ],
        pickups:[
            {"i18n": "loading_tip_pickups_1_dukeajc", author:"DukeAJC"},
            {"i18n": "loading_tip_pickups_2_satan_inside", author:"satan_inside"},
            {"i18n": "loading_tip_pickups_3_kok0mo", author:"Kok0mo"},
            {"i18n": "loading_tip_pickups_4_clkou", author:"clkou"},
            {"i18n": "loading_tip_pickups_5_typhon", author:"Typhon"},
            {"i18n": "loading_tip_pickups_6_saka", author:"Saka"},
            {"i18n": "loading_tip_pickups_7_cjwovo", author:"Cjwovo"},
            {"i18n": "loading_tip_pickups_8_smolin", author:"Smolin"},
            {"i18n": "loading_tip_pickups_9_quick_autophagie", author:"quick_autophagie"},
            {"i18n": "loading_tip_pickups_10_bananmanx47", author:"bananmanx47"},
            {"i18n": "loading_tip_pickups_11_track004", author:"track004"},
            {"i18n": "loading_tip_pickups_12_nonstickswag", author:"nonstickswag"}
        ],
        duel:[
            {"i18n": "loading_tip_duel_1_nubb3r", author:"nubb3r"},
            {"i18n": "loading_tip_duel_2__saif", author:"_saif"},
            {"i18n": "loading_tip_duel_3_drad1k", author:"Drad1k"},
            {"i18n": "loading_tip_duel_4_pagedmov", author:"pagedMov"}
        ],
        wipeout:[
            {"i18n": "loading_tip_wipeout_1_sav", author:"sav"},
            {"i18n": "loading_tip_wipeout_2_big_bad_beaver", author:"Big Bad Beaver"},
            {"i18n": "loading_tip_wipeout_3_b0oboy", author:"b0oboy"},
            {"i18n": "loading_tip_wipeout_4_nommme", author:"nommme"}
        ],
        macguffin:[
            {"i18n": "loading_tip_macguffin_1_satan_inside", author:"satan_inside"},
            {"i18n": "loading_tip_macguffin_2_anima", author:"Anima"},
            {"i18n": "loading_tip_macguffin_3_kainalo", author:"Kainalo"},
            {"i18n": "loading_tip_macguffin_4_nommme", author:"nommme"},
            {"i18n": "loading_tip_macguffin_5_akacia", author:"Akacia"},
            {"i18n": "loading_tip_macguffin_6_cjwovo", author:"Cjwovo"}
        ],
        extinction:[
            {"i18n": "loading_tip_extinction_1_sav", author:"sav"},
            {"i18n": "loading_tip_extinction_2_nommme", author:"nommme"}
        ],
        weebow:[
            {"i18n": "loading_tip_weebow_1_satan_inside", author:"satan_inside"}
        ],
        freezetag:[
            {"i18n": "loading_tip_freezetag_1_dw", author:"dw"},
            {"i18n": "loading_tip_freezetag_2_dw", author:"dw"}
        ]
    }

    var relevant_tips = loading_tips.general;       
    //only show gamemode specific tips if loading into that gamemode, only show pickup specific tips if that gamemode has pickups
    if(loading_tips.hasOwnProperty(gamemode)){relevant_tips = relevant_tips.concat(loading_tips[gamemode])};
    if(gamemode == 'duel' || gamemode == "macguffin" || gamemode == "extinction"){relevant_tips = relevant_tips.concat(loading_tips.pickups)}; 

    let loading_screen_community_quote = _id("loading_screen_community_quote");
    let loading_screen_community_author = _id("loading_screen_community_author");
    let random_tip = relevant_tips[Math.floor(Math.random() * relevant_tips.length)];

    if (random_tip.hasOwnProperty("i18n")) loading_screen_community_quote.textContent = '"' + localize(random_tip.i18n) + '"';
    else loading_screen_community_quote.textContent = '"' + random_tip.tip + '"';
    
    loading_screen_community_author.textContent = random_tip.author;
}

function open_loading_screen(gamemode){
    generate_loading_screen_tip(gamemode);    
    _id("loading_screen").style.display = "flex";    
}

function close_loading_screen(){
    //Hide loading screen and clear text/bar progress
    _id("loading_screen").style.display = "none";
    let loading_bar = _id("loading_screen_progress_bar");
    let loading_status_text = _id("loading_screen_status_text");
    let loading_screen_community_quote = _id("loading_screen_community_quote");
    let loading_screen_community_author = _id("loading_screen_community_author");
    loading_bar.childNodes[0].style.width = "0%";
    loading_status_text.textContent = "";
    loading_screen_community_quote.textContent = "";
    loading_screen_community_author.textContent = "";
    generate_loading_screen_artwork(); //Generate new background now after closing loading screen for next load
}

function update_loading_screen(loading_progress, status_text){
    let loading_bar = _id("loading_screen_progress_bar");
    let loading_status_text = _id("loading_screen_status_text");
    /* For segments
    for(let i=0; i < loading_progress * loading_bar.childElementCount; i++){
        loading_bar.childNodes[i].style.visibility = "visible";
    }
    */
    loading_bar.childNodes[0].style.width = (loading_progress * 100) + "%";
    loading_status_text.textContent = status_text;
}

/*
setTimeout(() => {
    open_loading_screen();
    let loading_progress = 0;
    var testInterval = setInterval(() => {        
        if(loading_progress < 1) {
            loading_progress += 0.1;
            loading_progress = Math.min(loading_progress, 1);
        }        
        else if(loading_progress == 1){clearInterval(testInterval)}

        update_loading_screen(loading_progress, "Loading map duel-bioplant");
    }, 500);
}, 1000);
*/
