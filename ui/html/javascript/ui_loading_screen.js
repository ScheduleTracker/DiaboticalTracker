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
            {tip:"With Siphonator it's possible to heal your teammates by shooting them.",
            author:"frox"},
            {tip:"The Shaft and PnCR both make a slight sound when you're holding them which may alert others, try and use them wisely.",
            author:"FlawlessDBT"},
            {tip:"Avoiding damage is just as important as dealing it.",
            author:"snexwang"},
            {tip:"Behind every eggbot is another human being, good manners are just as important as good aim.",
            author:"Un1d"},
            {tip:"Jumping off an ascending elevator platform allows you to reach higher grounds.",
            author:"d0pebear99"},
            {tip:"Enemies can hear you move across the map. Crouching allows you to move silently.",
            author:"Pop"},
            {tip:"Weapons have different reload times. Try to figure out which combos work best!",
            author:"Tomau5"},
            {tip:"Eggbots are as jacked as they are cracked. Use your Melee weapon to knock enemies off maps!",
            author:"Tomau5"},
            {tip:"Struggling with the Rocket Launcher? Aim at your enemy's feet instead of attempting a more difficult direct body shot.",
            author:"fragtastic"},
            {tip:"Sometimes standing and listening is more effective than running and shooting.",
            author:"G4rlock"},
            {tip:"Head over to the r/Diabotical Reddit if you love the game! If you don’t love the game, we hope you love yourself.",
            author:"Dan Dead Or Alive"},
            {tip:"When another player is above you, their eggbot emits a higher-pitched sound. When they are below you, they emit a lower-pitched sound.",
            author:"drrifted_"},
            {tip:"Get the high ground! It is wise to get a height advantage before engaging enemies.",
            author:"doggerdemon"},
            {tip:"No micropohone? Use pings to communicate with your team.",
            author:"PressOK"},
            {tip:"Take a short break every now and then, straighten your back, stretch your fingers and relax your eyes. You're better well rested, than overplayed.",
            author:"G4mb4"},
            {tip:"Learn, practice and execute strafe jumping to quickly accelerate your eggbot's movement past what's normally possible.",
            author:"inactiveaccount "},
            {tip:"Jump and throw the Implosion Weeball in front of you for a massive speed boost!",
            author:"Mr.kt"},
            {tip:"You can jump higher by firing a rocket at your feet as you jump.",
            author:"jysandy"},
            {tip:"Having the right weapon for the right situation is essential to come out as the winner. If you're having a hard time doing so try to rebind the weapon keys to something you're more comfortable with.",
            author:"zydian05 "},
            {tip:"Please do not dress your eggbot in a way you would not dress yourself.",
            author:"amrojare"},
            {tip:"Use the Slow Field Weeball to trap your opponent or deter them from advancing.",
            author:"grev"},
            {tip:"Movement is key in battle. When engaged in a fight, remember to practice strafing to dodge and juke your opponent.",
            author:"c3zz"},
            {tip:"When your enemy is low on health, any damage you deal to them will make them scream in pain.",
            author:"vit0so"},
            {tip:"Did you know you can climb walls with the Blaster?",
            author:"owenz0r"},
            {tip:"Using the right weapon during combat is crucial, but remember some weapons (like the Shaft) are faster to swap out than others.",
            author:"Tekn0z"},
            {tip:"The Explosive Weeball is great for environmental frags, dispersing groups of enemies, or popping a foe up for an easy shot.",
            author:"Cadsmar"},
            {tip:"Not familiar with this map? Try hosting a custom game and explore the map to learn your surroundings.",
            author:"westyy"},
            {tip:"There is no cow level. But if you practice using the map editor you can eventually make one!",
            author:"Dobbelburger"},
            {tip:"If your opponent is giving you a tough time, think about what they're doing that works, and then try to turn that against them.",
            author:"Seekay"},
            {tip:"A dead bot cannot fight back. Sometimes it’s best to disengage and continue the fight on your terms.",
            author:"reign_"},
            {tip:"Perfectly match your Diabotical mouse sensitivity with other games by going to 'Settings -> Weapons -> Mouse Details'.",
            author:"gretel"},
            {tip:"The PnCR is used by FIRST pointing and THEN clicking, the order is essential!",
            author:"e r n y"},
            {tip:"The Point'n'Click Rifle's base damage is 70. For each shot that hits in a row, its damage increases by 5, up to 100!",
            author:"Kok0mo"},
            {tip:"Watch out for enemies above you when taking a jump pad as you are quite vulnerable in the air.",
            author:"nonstickswag "},
            {tip:"Going around a tight angle? Use your dash when you land to maintain your speed!",
            author:"YikeSpike"},
            {tip:"Don't get caught with your Machine Gun out! Find better weapons before engaging.",
            author:"PeenScreeker"},
            {tip:"You can auto-jump by keeping the jump key pressed.",
            author:"groparoo"},
            {tip:"Getting hit will prevent you from dodging for a short amount of time.",
            author:"LemmingNr13"},
            {tip:"Weeballs are your friend. Use them to control the space around you.",
            author:"ImageOmega"},
            {tip:"Use the PnCR to cover angles and routes, and fight at long range.",
            author:"Gppp"},
            {tip:"Shooting eggs in the air is like shooting fish in a barrel! Dodging is best done grounded.",
            author:"real_Kranken"},
            {tip:"Map knowledge is one of the best strengths a player can have. Learn paths and try moving fluidly on maps in practice mode.",
            author:"groparoo"},
            {tip:"The Blaster is the weapon with the highest damage per second, but it can be hard to hit with. Use it to lock down corridors!",
            author:"gerby"},
            {tip:"You cannot dash for a short time after taking damage.",
            author:"Saka"},
            {tip:"Focus on winning the warmup to secure a psychological advantage.",
            author:"frustzwerg"},
            {tip:"Don't jump against the Shaft.",
            author:"Nerfhalo1"},
            {tip:"Map positioning is equally as important as aim.",
            author:"Mister_Wong"},
            {tip:"Sometimes it's okay to get a little wild, experiment with your weapons and try something new!",
            author:"internetdonut"},
            {tip:"Dominating and controlling small parts of the map is an essential skill for victory.",
            author:"CoredusK"},
            {tip:"Have an escape plan BEFORE you engage.",
            author:"Kerim"},
            {tip:"Try to keep moving during fights. Adapt your movement to your enemies weapon to throw off their aim.",
            author:"blakeeo"},
            {tip:"Having trouble with the wall of weapons? Try to learn the Rocket Launcher, PnCR and Shaft first.",
            author:"yonecessito"},
            {tip:"There's a right weapon for every situation, experiment with each of them to find where they're most useful.",
            author:"moody"},
            {tip:"Sometimes running is fighting.",
            author:"Sohm"},
            {tip:"When you face a flying enemy, go for the Shaft.",
            author:"SakiiR"},
            {tip:"When hiding in the bushes, don't do it with a PnCR or your Shaft in hand - those weapons make sound.",
            author:"creep"}
        ],
        pickups:[
            {tip:"Mega Health respawns every 35 seconds and all armor pickups respawn every 25 seconds.",
            author:"DukeAJC"},
            {tip:"If a taken item goes from grey to green, it will respawn very shortly!",
            author:"satan_inside"},
            {tip:"Be sure to pick up health and armor! It increases your overall health and leaves your opponent scrounging for resources.",
            author:"Kok0mo"},
            {tip:"If you get the Vanguard power up, you can do rocket jumps without hurting yourself.",
            author:"clkou"},
            {tip:"Controlling resources is crucial to winning.",
            author:"Typhon"},
            {tip:"In team modes, try to contest every Power Up that spawns.",
            author:"Saka"},
            {tip:"Blue Armor can only get you to 150 armor and Yellow 175. Grab the Red Armor to hit the max armor stack of 200.",
            author:"Cjwovo"},
            {tip:"Armor absorbs 66% of incoming damage - collect it! You don't have to outaim your opponents, you can outstack them!",
            author:"Smolin"},
            {tip:"When learning a new map, try to remember the major item locations and find routes between them.",
            author:"quick_autophagie"},
            {tip:"You can ping items and enemies to make your team aware of them.",
            author:"bananmanx47"},
            {tip:"Be comfortable finding the Power-ups, Mega Health, and Red Armor. The mini-map can help you learn their locations on each map.",
            author:"track004"},
            {tip:"Keep an eye on Red, Blue and Yellow Armors, as well as the Mega Health. Controlling these key items will allow you to stack up before going into battle.",
            author:"nonstickswag"}
        ],
        duel:[
            {tip:"Duels are won by golden frag. A comeback streak is always a possibility.",
            author:"nubb3r"},
            {tip:"Try to figure out if you're closer to the Red Armor or Mega Health when the game starts.",
            author:"_saif"},
            {tip:"Duels are rarely won only by simply out aiming your opponent, the key is to focus on controlling the Mega Health and the Red Armor. Build up your health and armor stacks before committing to a fight, if you don't your opponent will.",
            author:"Drad1k"},
            {tip:"Try to avoid letting the big items respawn at the same time; this will allow you to grab one and get to the other before its up.",
            author:"pagedMov"}
        ],
        wipeout:[
            {tip:"In Wipeout you get one Healing Weeball each life. You can use it to heal yourself after a fight or to help out a teammate in need.",
            author:"13800ip"},
            {tip:"Your team can stack Healing Weeballs to quickly patch up and return to the fight.",
            author:"Big Bad Beaver"},
            {tip:"In wipeout you take no self-damage, so you can use rocket jumping to quickly close in on the last opponent to wipe them out before the time expires.",
            author:"b0oboy"},
            {tip:"Ping the last opponent alive to notify your teammates of where to go.",
            author:"nommme"}
        ],
        macguffin:[
            {tip:"Remember, in MacGuffin the bases switch between rounds, and you can choose your base in the final round.",
            author:"satan_inside"},
            {tip:"You can throw the MacGuffin like a weeball, throw it to your teammates to gain distance or to stop the enemy from getting it when you're about to die.",
            author:"Anima"},
            {tip:"You can throw the MacGuffin by pressing the 'Use Item'-key.",
            author:"Kainalo"},
            {tip:"Ping the enemy MacGuffin carrier to notify your teammates of where to go.",
            author:"nommme"},
            {tip:"Before the round starts in MacGuffin, don't forget to look around the map and figure out which base is yours!",
            author:"Akacia"},
            {tip:"At the start of a MacGuffin match, if you spawn near a major item, sometimes it's best to grab it then avoid fights until the MacGuffin spawns to maximize your stack.",
            author:"Cjwovo"}
        ],
        extinction:[
            {tip:"When you are a ghost you can attack your enemies with no remorse, but be aware of allies that might need your protection.",
            author:"13800ip"},
            {tip:"Ping the last opponent alive to notify your teammates of where to go.",
            author:"nommme"}
        ],
        weebow:[
            {tip:"Make sure to convert your frags into points for your team by picking up the coins!",
            author:"satan_inside"}
        ],
        freezetag:[
            {tip:"Stand next to frozen teammates to unfreeze them.",
            author:"dw"},
            {tip:"You can unfreeze players by pushing them into hazard areas.",
            author:"dw"}
        ]
    }

    var relevant_tips = loading_tips.general;       
    //only show gamemode specific tips if loading into that gamemode, only show pickup specific tips if that gamemode has pickups
    if(loading_tips.hasOwnProperty(gamemode)){relevant_tips = relevant_tips.concat(loading_tips[gamemode])};
    if(gamemode == 'duel' || gamemode == "macguffin" || gamemode == "extinction"){relevant_tips = relevant_tips.concat(loading_tips.pickups)}; 

    let loading_screen_community_quote = _id("loading_screen_community_quote");
    let loading_screen_community_author = _id("loading_screen_community_author");
    let random_tip = relevant_tips[Math.floor(Math.random() * relevant_tips.length)];
    loading_screen_community_quote.textContent = '"' + random_tip.tip + '"';
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
