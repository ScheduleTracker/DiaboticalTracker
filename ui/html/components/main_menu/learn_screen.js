function init_screen_learn() {
    if (typeof global_weapon_data === 'undefined' || typeof global_gamemode_data === 'undefined'){
        _id("mm_learn").style.display = "none"; //if script data doesn't exist, hide learn button and dont initialize screen
    }
    else {
        //mouseover/out events for tabs
        _for_each_with_class_in_parent(_id("learn_screen_tab_bar"), "learn_screen_button", function(el){
            el.addEventListener("mouseover", function(){                
                el.querySelector(".learn_screen_button_label").style.height = "35%";
            })
            el.addEventListener("mouseout", function(){
                el.querySelector(".learn_screen_button_label").style.height = "25%";
            })
        })

        learn_screen_initialize_tab_weapons();
        learn_screen_initialize_tab_ha();
        learn_screen_initialize_tab_powerups();

        learn_screen_change_tab('weapons'); //default tab
    }
}

function learn_screen_change_tab(tab) {
    var tabEl = _id("learn_screen_button_" + tab);
    var contentEl = _id("learn_screen_content_" + tab);

    learn_screen_highlight_button(tabEl);
    learn_screen_show_content(contentEl);
}

function learn_screen_highlight_button(tabEl){ //used both for top bar also list buttons
    var container = tabEl.parentElement;
    _for_each_with_class_in_parent(container, tabEl.classList[0], function(el){
        if(el!=tabEl){
            el.classList.remove('active');
        }
    });
    tabEl.classList.add('active');
}

function learn_screen_show_content(contentEl){ //used both for top bar and list buttons
    var container = contentEl.parentElement;
    _for_each_with_class_in_parent(container, contentEl.classList[0], function(el){
        if(el != contentEl){
            el.style.display = 'none';
        }
    });
    contentEl.style.display = 'flex';
}

//Weapons Tab

function learn_screen_initialize_tab_weapons() {

    var list = _id("learn_screen_item_list_weapons");
    var infoContainer = _id("learn_screen_info_weapons");

    var relevantWeapons = {
        'weaponmelee':  {'script_key': 'sword',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'range': 'distance',
                                    'knockback': 'ground_knockback',
                                },
                        'weapon_image': '/html/images/entities/weapon_sword.png.dds',
                        'description': 'Despite its short reach, decent damage and large knockback make this a valuable weapon nonetheless. Requiring no ammunition to fire, your Melee weapon is always ready to help you push away those who would invade your personal space, and cause enemies to think twice before approaching, lest they be punted half a league to their doom.'
                        },
        'weaponmac':    {'script_key': 'machinegun',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponmac.png.dds',
                        'ammo_image': '/html/images/entities/ammomac.png.dds',
                        'description': 'The standard starting weapon and a handy all range gun for slowly chipping away at your opponent. Though it is recommended you seek out other, stronger weapons for tackling healthy opponents, the Machine Gun can be a useful tool to support allies and return fire in a pinch.'
                        },
        'weaponbl':     {'script_key': 'blaster',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'projectile_speed': 'speed',
                                    'splash_radius': 'splash_radius',
                                    'splash_damage': '',
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponbl.png.dds',
                        'ammo_image': '/html/images/entities/ammobl.png.dds',
                        'description': 'Casting a flurry of searing hot plasma balls towards your chosen prey, the Blaster is an excellent multi-purpose support weapon. Though difficult to wield with accuracy it boasts an incredibly high maximum DPS that can be put to use at close range, while still outputting good damage at longer ranges if the user can correctly lead their targets.<div>By hugging a wall and firing slightly below yourself while jumping, the blaster can also be used to scale walls and quickly overcome obstacles.</div>'
                        },
        'weaponss':     {'script_key': 'super_shotgun',
                        'entries': {'damage_per_shot': 'damage',
                                    'shots_per_round': 'shots_per_round',
                                    'max_damage': '',
                                    'fire_interval': 'rate', 
                                    'max_dps': '',
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponss.png.dds',
                        'ammo_image': '/html/images/entities/ammoss.png.dds',
                        'description': 'Superseding its less super sibling completely, this trusty burst damage weapon will eat great chunks of damage from your opponents especially at point blank range. <div>Best used at short to medium range, a good solid hit or two of the Super Shotgun can dispatch all but the most well prepared foe, provided you can get close enough.</div>'
                        },
        'weaponrl':     {'script_key': 'rocket_launcher',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'projectile_speed': 'speed',
                                    'splash_radius': 'splash_radius',
                                    'splash_damage': '',
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponrl.png.dds',
                        'ammo_image': '/html/images/entities/ammorl.png.dds',
                        'description': "The Rocket Launcher is a high damage, close-range weapon with great utility. Use in direct combat to bounce targets around to set up consecutive shots or attempt combination kills. Try to anticipate your opponent's movements around the map, as a well placed prediction rocket can unnerve even the most experienced combatant.<div>By firing at the ground and jumping at the same time, you can also propel yourself across great vertical distances with the knockback of your own rocket.</div>"
                        },
        'weaponshaft':  {'script_key': 'shaft',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponshaft.png.dds',
                        'ammo_image': '/html/images/entities/ammoshaft.png.dds',
                        'description': 'A medium range instant hit beam weapon with an incredible rate of fire, the Shaft allows you to control the space around you and impose your authority over your opponents. <div>Attempt to blast the paint from your enemies and, if you can expertly track their movements as they try to squirm and dodge, burn through to their very core.</div><div>Warning: Passive buzzing sound emitted by coil can be heard by nearby enemies.</div>',
                        'flavour_text': 'In certain societies the shaft is an object of worship, in which prestige is gained through the impressiveness of ones shaft'
                        },
        'weaponcb':     {'script_key': 'crossbow',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'projectile_speed': 'speed',
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponcb.png.dds',
                        'ammo_image': '/html/images/entities/ammopncr.png.dds',
                        'description': "An ancient stick and string weapon brought to the modern age, the Crossbow fires an arcing projectile that increases in damage the further it travels. Compensate for gravity and aim true to poke your opponents full of holes. <div>This weapon upgrades into the Point'n'Click Rifle.</div>"
                        },
        'weaponpncr':   {'script_key': 'pncr',
                        'entries': {'base_damage': 'damage',
                                    'bonus_damage_per_hit': 'bonus_consecutive_damage',
                                    'max_damage': '',
                                    'fire_interval': 'rate', 
                                    'knockback': 'ground_knockback',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weaponpncr.png.dds',
                        'ammo_image': '/html/images/entities/ammopncr.png.dds',
                        'description': "No instruction needed as it’s all in the name, often abbreviated to simply PnCR (pronounced Pincer), the Point'n'Click Rifle is a long range instant hit weapon that rewards accurate aiming. Damage mounts with consecutive hits to the maximum, but resets as soon as a miss is registered.<div>Warning: Loud electromagnetic hum will give away position to opponents listening carefully.</div>",
                        'flavour_text': 'Sometimes the PnCR is referred to as the RAiL due to claims it may have Random Accuracy if Losing'
                        },
        'weapongl':     {'script_key': 'grenade_launcher',
                        'entries': {'damage': 'damage', 
                                    'fire_interval': 'rate', 
                                    'dps': '',
                                    'projectile_speed': 'speed',
                                    'splash_radius': 'splash_radius',
                                    'splash_damage': '',
                                    'knockback': 'ground_knockback',
                                    'fuse_time': 'duration',
                                    'starting_ammo': 'default_weapon_pickup_ammo',
                                    'ammo_pickup': 'default_ammo_pickup_ammo',
                                    'max_ammo': 'max_ammo'
                                },
                        'weapon_image': '/html/images/entities/weapongl.png.dds',
                        'ammo_image': '/html/images/entities/ammogl.png.dds',
                        'description': "Make any room a no-go zone by flooding it with grenades or conserve your ammunition and attempt to master their arcing, bouncing path. The Grenade Launcher is an excellent area denial tool which can be used to punish overly aggressive or careless opponents who push without thought."
                        }
    };
    var relevantWeebles = ['weaponiw', 'weaponsw', 'weaponbw', 'weaponsmw', 'weaponhw', 'weaponkw'];
    
    function generate_weapons_content(item, type){
        //create list item
        let listItem = _createElement("div","learn_screen_list_button", localize(global_item_name_map[item][1]).toUpperCase());
        listItem.style.setProperty("--itemIcon", "url(/html/" + global_item_name_map[item][2] + ")");
        listItem.style.setProperty("--backgroundItemColor", hexToRGBA(global_item_name_map[item][0], 0.65));

        //create info screens
        let infoItem = _createElement("div", "learn_screen_weapon_item"); //each weapons own page

        let weaponInfoContainer = _createElement("div");
        
        let ammoInfoTextContainer = _createElement("div");
        
        infoContainer.appendChild(infoItem);
        infoItem.style.display = "none";

        if (type == 'weapon'){
            var currentWeapon = relevantWeapons[item].script_key;
            var entriesObject = relevantWeapons[item].entries;
        }
        else if (type == 'weeball'){
            var entriesObject = {
                'a': '', 
                'b': ''
            };
        }

        //Preprocess damage entries to handle cases with multiple damage ranges
        var updateDamage = false;
        var addAirKnockback = false;
        var addSelfKnockback = false;

        if (Object.values(entriesObject).indexOf('damage') >= 0){ //do this here to reconstruct labels if we have min/max damage automatically (e.g. balance patch)
            if (global_weapon_data[currentWeapon].damage.split(' ').length == 2) { //min/max damage
                if (global_weapon_data[currentWeapon].damage.split(' ')[0] == global_weapon_data[currentWeapon].damage.split(' ')[1]) {
                    let actualDamage = global_weapon_data[currentWeapon].damage.split(' ')[0];
                    global_weapon_data[currentWeapon].damage = actualDamage;
                }
                else{ //if min =/= max
                    updateDamage = true;
                }
            }
        }

        if (Object.keys(entriesObject).indexOf('knockback') >= 0){ //if we use knockback, check knockback variants to see if they are required
            if (global_weapon_data[currentWeapon].hasOwnProperty('knockback')) { //air knockback
                if(global_weapon_data[currentWeapon].ground_knockback != global_weapon_data[currentWeapon].knockback){
                    addAirKnockback = true;
                }
            }
            if (global_weapon_data[currentWeapon].hasOwnProperty('ground_knockback_self')) { //air knockback
                if(global_weapon_data[currentWeapon].ground_knockback != global_weapon_data[currentWeapon].ground_knockback_self){
                    addSelfKnockback = true;
                }
            }
        }

        if(updateDamage || addAirKnockback || addSelfKnockback) {
            var newEntriesObject = {};
            for (let key in entriesObject){
                if (key == 'damage' && updateDamage){
                    newEntriesObject['damage_range'] = '';
                    newEntriesObject['min_damage_distance'] = 'min_damage_distance';
                    newEntriesObject['max_damage_distance'] = 'max_damage_distance';
                }
                else if (key == 'damage_per_shot' && updateDamage){
                    newEntriesObject['damage_range_per_shot'] = '';
                    newEntriesObject['min_damage_distance'] = 'min_damage_distance';
                    newEntriesObject['max_damage_distance'] = 'max_damage_distance';
                }
                else if (key == 'dps' && updateDamage){
                    newEntriesObject['dps_range'] = '';
                }
                else if (key == 'knockback'){
                    newEntriesObject[key] = entriesObject[key];
                    if (addAirKnockback){
                        newEntriesObject['air_knockback'] = 'knockback';
                    }
                    if (addSelfKnockback){
                        newEntriesObject['self_knockback'] = 'ground_knockback_self';
                    }
                }
                else {
                    newEntriesObject[key] = entriesObject[key];
                }
            }
            entriesObject = newEntriesObject;
        }

        if (global_weapon_data[currentWeapon].hasOwnProperty('shots_per_round')){
            if(entriesObject.hasOwnProperty('damage')){
                entriesObject
            }
        }

        for (let label in entriesObject){
            let cellText = "-"; //if all of our checks fail

            let infoRow = _createElement("div", "learn_screen_weapon_item_row");

            let infoLabel = _createElement("div", "learn_screen_weapon_item_label");
            let infoLabelText = _createElement("div", "text_container", localize("learn_screen_" + label));
            infoLabel.appendChild(infoLabelText);

            let infoCell = _createElement("div", "learn_screen_weapon_item_cell");

            if(global_weapon_data[currentWeapon].hasOwnProperty(entriesObject[label])) {
                cellText = global_weapon_data[currentWeapon][entriesObject[label]];
            }
            if(label == 'fire_interval'){
                cellText += ' ms';
            }
            else if(label == 'max_damage'){
                if(global_weapon_data[currentWeapon].hasOwnProperty('shots_per_round')){ //shotgun max damage
                    let damageArray = global_weapon_data[currentWeapon].damage.split(' ')
                    let maxDamage = damageArray.length == 2 ? Math.max(parseFloat(damageArray[0]), parseFloat(damageArray[1])) : parseFloat(damageArray[0]);
                    cellText = _clean_float(parseFloat(maxDamage) * parseFloat(global_weapon_data[currentWeapon].shots_per_round));
                } 
                else if(global_weapon_data[currentWeapon].hasOwnProperty('bonus_consecutive_damage')){ //pncr max damage
                    let baseDamage = parseFloat(global_weapon_data[currentWeapon].damage);
                    let bonusConsecutiveDamage = parseFloat(global_weapon_data[currentWeapon].bonus_consecutive_damage);
                    let maxBonusConsecutiveDamageInstances = parseFloat(global_weapon_data[currentWeapon].max_bonus_consecutive_damage_instances);
                    cellText = _clean_float(baseDamage + (bonusConsecutiveDamage * maxBonusConsecutiveDamageInstances));
                } 
            }
            else if(label == 'dps'){
                cellText = _clean_float(parseFloat(global_weapon_data[currentWeapon].damage) * 1000 / parseFloat(global_weapon_data[currentWeapon].rate)); 
            }
            else if(label == 'max_dps'){ //we have this if we have shots_per_round
                let damageArray = global_weapon_data[currentWeapon].damage.split(' ')
                let maxDamage = damageArray.length == 2 ? Math.max(parseFloat(damageArray[0]), parseFloat(damageArray[1])) : parseFloat(damageArray[0]);
                cellText = _clean_float(maxDamage * parseFloat(global_weapon_data[currentWeapon].shots_per_round) * 1000 / parseFloat(global_weapon_data[currentWeapon].rate)); 
            }
            else if(label == 'range'){
                cellText += ' u';
            }
            else if(label == 'projectile_speed'){
                cellText = _clean_float(global_weapon_data[currentWeapon].speed) + ' ups';
            }
            else if(label == 'damage_range' || label == 'damage_range_per_shot'){
                cellText = global_weapon_data[currentWeapon].damage.split(' ')[0] + " - " + global_weapon_data[currentWeapon].damage.split(' ')[1];
            }
            else if(label == 'min_damage_distance'){
                let inequality = parseFloat(global_weapon_data[currentWeapon].min_damage_distance) > parseFloat(global_weapon_data[currentWeapon].max_damage_distance) ? "> " : "< ";
                cellText = inequality + cellText + " u";
            }
            else if(label == 'max_damage_distance'){
                let inequality = parseFloat(global_weapon_data[currentWeapon].min_damage_distance) > parseFloat(global_weapon_data[currentWeapon].max_damage_distance) ? "< " : "> ";
                cellText = inequality + cellText + " u";
            }
            else if(label == 'dps_range'){
                cellText = _clean_float(parseFloat(global_weapon_data[currentWeapon].damage.split(' ')[0]) * 1000 / parseFloat(global_weapon_data[currentWeapon].rate));
                cellText += " - ";
                cellText += _clean_float(parseFloat(global_weapon_data[currentWeapon].damage.split(' ')[1]) * 1000 / parseFloat(global_weapon_data[currentWeapon].rate)); 
            }
            else if(label == 'fuse_time'){
                cellText += ' ms';
            }
            else if(label == 'splash_radius'){
                cellText += ' u';
            }
            else if(label == 'splash_damage'){
                let minSplash = global_weapon_data[currentWeapon].hasOwnProperty('min_splash_damage') ? global_weapon_data[currentWeapon].min_splash_damage : 1;
                let maxSplash = global_weapon_data[currentWeapon].hasOwnProperty('splash_damage') ? global_weapon_data[currentWeapon].splash_damage : global_weapon_data[currentWeapon].damage;
                cellText = minSplash + " - " + maxSplash;
            }

            let infoCellText = _createElement("div", "text_container", cellText);
            infoCell.appendChild(infoCellText);

            if(label == 'starting_ammo' || label == 'ammo_pickup' || label == 'max_ammo'){
                ammoInfoTextContainer.appendChild(infoRow);
            }
            else {weaponInfoContainer.appendChild(infoRow);}
            
            infoRow.appendChild(infoLabel);
            infoRow.appendChild(infoCell);
        }

        //combo rates - styled with initial styling maybe broken now
        /*
        let comboRateContainer = _createElement("div");
        comboRateContainer.style.display = 'flex';
        comboRateContainer.style.flexDirection = 'column';
        comboRateContainer.style.marginTop = '2vh'; //gap between combo rate are and element above it 

        if (global_weapon_data[currentWeapon].hasOwnProperty('combo_rate')){

            let comboRateTitle = _createElement("div");
            comboRateTitle.style.display = 'flex';
            comboRateTitle.style.justifyContent = 'center';
            comboRateTitle.style.alignItems = 'center';
            comboRateTitle.style.fontSize = '1.4vh';

            comboRateTitle.style.backgroundColor = hexToRGBA(global_item_name_map[item][0], 0.6);
            comboRateTitle.appendChild(_createElement("div", "", localize('learn_screen_switch_rate')));

            let comboRateIcons = _createElement("div", "learn_screen_weapon_item_row");
            let comboRateInfoRow = _createElement("div", "learn_screen_weapon_item_row");
            
            for (const [index, value] of global_weapon_data[currentWeapon].combo_rate.entries()){
                let weap = 'false';

                switch (value.trim().match(/\S+/g)[0]){
                    case 'machinegun': weap = 'weaponmac'; break;
                    case 'super_shotgun': weap = 'weaponss'; break;
                    case 'shaft': weap = 'weaponshaft'; break;
                    case 'rocket_launcher': weap = 'weaponrl'; break;
                    case 'pncr': weap = 'weaponpncr'; break;
                    case 'blaster': weap = 'weaponbl'; break;
                    case 'grenade_launcher': weap = 'weapongl'; break;
                }

                let rate = value.trim().match(/\S+/g)[1];

                let weapIcon = _createElement("div")
                weapIcon.style.flex = '1';
                weapIcon.style.height = '2vh';
                if(weap != 'false'){
                    weapIcon.style.backgroundImage = "url(/html/" + global_item_name_map[weap][2] + "?fill=" + global_item_name_map[weap][0] + ")"
                    weapIcon.style.backgroundPosition = 'center';
                    weapIcon.style.backgroundRepeat = 'no-repeat';
                    weapIcon.style.backgroundSize = 'contain';
                }

                let weapRate = _createElement("div", "learn_screen_weapon_small_text_cell");
                weapRate.appendChild(_createElement("div", "", rate + " ms"))

                weapIcon.style.backgroundColor = 'rgba(0, 162, 255, 0.15)';
                weapRate.style.backgroundColor = 'rgba(0, 162, 255, 0.15)';

                weapIcon.style.marginTop = '0.2vh';
                weapRate.style.paddingTop = '0.2vh';

                if(index != 0){
                    weapIcon.style.marginLeft = '0.1vh';
                    weapRate.style.marginLeft = '0.1vh';
                }
                if(index != global_weapon_data[currentWeapon].combo_rate.length - 1){
                    weapIcon.style.marginRight = '0.1vh';
                    weapRate.style.marginRight = '0.1vh';
                }

                comboRateIcons.appendChild(weapIcon);
                comboRateInfoRow.appendChild(weapRate);              
            }

            comboRateContainer.appendChild(comboRateTitle);
            comboRateContainer.appendChild(comboRateIcons);
            comboRateContainer.appendChild(comboRateInfoRow);
        }*/

        //draw weapon image        
        let weaponDescriptionContainer = _createElement("div", ["learn_screen_row_container", "description"]);

        if(relevantWeapons[item].hasOwnProperty('weapon_image')){
            let infoPowerupRender = _createElement("div", "learn_screen_weapon_image");
            infoPowerupRender.style.backgroundImage = "url(" + relevantWeapons[item].weapon_image + ")";
            weaponDescriptionContainer.appendChild(infoPowerupRender);
        }

        if(relevantWeapons[item].hasOwnProperty('description')){
            let weaponDescriptionTextContainer = _createElement("div", "learn_screen_weapon_info_description_text_container");
            let weaponDescriptionText = _createElement("div", "learn_screen_item_description");

            let weaponTitleContainer = _createElement("div", ["learn_screen_row_container", "title"]);
            let weaponTitle = _createElement("div", "learn_screen_weapon_title", localize(global_item_name_map[item][1]).toUpperCase());
            let accentLine = _createElement("div", "learn_screen_weapon_accent_line");
            weaponTitleContainer.appendChild(weaponTitle);
            weaponTitleContainer.appendChild(accentLine);

            weaponDescriptionText.innerHTML = relevantWeapons[item].description;

            weaponDescriptionTextContainer.appendChild(weaponTitleContainer);
            weaponDescriptionTextContainer.appendChild(weaponDescriptionText);

            weaponDescriptionContainer.appendChild(weaponDescriptionTextContainer);
        }        

        infoItem.appendChild(weaponDescriptionContainer);

        //bottom flavour text
        //let flavourTextContainer = _createElement("div", "learn_screen_weapon_flavour_text_container");
        //let flavourText = _createElement("div", "learn_screen_flavour_text", relevantWeapons[item].flavour_text);

        //flavourTextContainer.appendChild(flavourText);

        //weapon information rows
        infoItem.appendChild(weaponInfoContainer);

        //infoItem.appendChild(comboRateContainer);

        //draw ammo information rows with ammo image next to them
        let ammoContainer = _createElement("div");        
        let ammoInfoContainer = _createElement("div", "learn_screen_row_container");
        
        if(relevantWeapons[item].entries.hasOwnProperty('starting_ammo')){
            ammoContainer.style.marginTop = '2vh'; //create gap between ammo and main weapon stats
            ammoInfoContainer.appendChild(ammoInfoTextContainer);

            if(relevantWeapons[item].hasOwnProperty('ammo_image')){
                var infoAmmoRender = _createElement("div", "learn_screen_ammo_image");
                infoAmmoRender.style.backgroundImage = "url(" + relevantWeapons[item].ammo_image + ")";
            }

            //ammo title
            let ammoTitleContainer = _createElement("div", ["learn_screen_row_container", "title"]);
            let ammoTitle = _createElement("div", "learn_screen_weapon_title", localize("learn_screen_ammo").toUpperCase());
            let ammoAccentLine = _createElement("div", "learn_screen_weapon_accent_line");
            ammoTitleContainer.appendChild(infoAmmoRender);
            ammoTitleContainer.appendChild(ammoTitle);
            ammoTitleContainer.appendChild(ammoAccentLine);

            ammoContainer.appendChild(ammoTitleContainer);  
            ammoContainer.appendChild(ammoInfoContainer);      
        }

        infoItem.appendChild(ammoContainer);

        //infoItem.appendChild(flavourTextContainer);

        listItem.addEventListener("click", function(){
            learn_screen_highlight_button(listItem);
            learn_screen_show_content(infoItem);
            refreshScrollbar(_id("learn_screen_content_weapons").querySelector(".crosshair_scroll"));
        })
        list.appendChild(listItem);

        if(item == 'weaponmelee'){ //default screen is melee
            learn_screen_highlight_button(listItem);
            learn_screen_show_content(infoItem);
        }
    }

    for (const item of Object.keys(relevantWeapons)) {
        generate_weapons_content(item, 'weapon');
    }    
}

//Health and Armour Tab

function learn_screen_initialize_tab_ha(){
    var healthContainer = _id("learn_screen_info_health");
    var armorContainer = _id("learn_screen_info_armor");

    let healthImageRow = _createElement("div", "learn_screen_ha_image_row");
    let healthImageRowNames = _createElement("div", "learn_screen_row_container");
    let healthImageRowAliases = _createElement("div", "learn_screen_row_container");

    let armorImageRow = _createElement("div", "learn_screen_ha_image_row");
    let armorImageRowNames = _createElement("div", ["learn_screen_row_container", "haImageText"]);
    let armorImageRowAliases = _createElement("div", "learn_screen_row_container");

    var relevantHealth = ['hpt0', 'hpt1', 'hpt2', 'hpt3'];
    var relevantArmor = ['armort1', 'armort2', 'armort3', 'armort4'];

    var tableHeaders = ['name', 'limit', 'respawn_time'];

    function generate_ha_header(container){
        let headerRow = _createElement("div", "learn_screen_ha_header_row");

        for(let name of tableHeaders){
            let header = _createElement("div", "learn_screen_ha_item_cell_header");
            let headerText = _createElement("div", "text_container", localize("learn_screen_" + name).toUpperCase());
            header.appendChild(headerText);
            headerRow.appendChild(header);
        }

        container.appendChild(headerRow);
    }

    function generate_ha_content(item, container){

        let contentItemRow = _createElement("div", "learn_screen_ha_item_row")

        for(let label of tableHeaders){
            var cell = _createElement("div", "learn_screen_ha_item_cell");
            let cellContent = ''
            if (label == 'name') {
                cellContent = localize(global_item_name_map[item][1]);

                //write name for image renders here also
                let itemName = _createElement("div", "learn_screen_ha_image_text_cell");
                let itemNameText = _createElement("div", "name", cellContent);
                itemName.appendChild(itemNameText);

                let itemAlias = _createElement("div", "learn_screen_ha_image_text_cell");
                if(item == 'hpt0'){let itemAliasText = _createElement("div", "alias", localize("learn_screen_bubbles")); itemAlias.appendChild(itemAliasText)}
                else if(item == 'hpt3'){let itemAliasText = _createElement("div", "alias", localize("learn_screen_mega_health")); itemAlias.appendChild(itemAliasText)}
                else if(item == 'armort1'){let itemAliasText = _createElement("div", "alias", localize("learn_screen_shards")); itemAlias.appendChild(itemAliasText)}
                else if(item == 'armort2'){let itemAliasText = _createElement("div", "alias", localize("learn_screen_blue_armor")); itemAlias.appendChild(itemAliasText)}
                else if(item == 'armort3'){let itemAliasText = _createElement("div", "alias", localize("learn_screen_yellow_armor")); itemAlias.appendChild(itemAliasText)}
                else if(item == 'armort4'){let itemAliasText = _createElement("div", "alias", localize("learn_screen_red_armor")); itemAlias.appendChild(itemAliasText)}

                if(item.startsWith('hp')){
                    healthImageRowNames.appendChild(itemName);
                    healthImageRowAliases.appendChild(itemAlias);
                }
                else if(item.startsWith('armor')){
                    armorImageRowNames.appendChild(itemName);
                    armorImageRowAliases.appendChild(itemAlias);
                }
            }
            else if (label == 'limit') {
                cell.classList.add("middle");
                if (item == 'hpt0' || item == 'hpt3'){
                    cellContent = global_gamemode_data.default.game_max_hp;
                }
                else if (item == 'hpt1' || item == 'hpt2'){
                    cellContent = global_gamemode_data.default.game_ghost_limit_hp;
                }
                else if (item == 'armort1' || item == 'armort4'){
                    cellContent = global_gamemode_data.default.game_max_armor
                }
                else if (item == 'armort2' || item == 'armort3'){
                    cellContent = global_gamemode_data.default.game_medium_armor
                }
            }

            else if (label == 'respawn_time') {
                if (item == 'hpt3'){
                    cellContent = '35s';
                }
                else if (item == 'armort1' || item == 'armort4' || item == 'armort2' || item == 'armort3'){
                    cellContent = '25s';
                }
                else{
                    cellContent = '20s';
                }
            }

            let textCell = _createElement("div", "text_container", cellContent);
            cell.appendChild(textCell);
            contentItemRow.appendChild(cell);
        }
        container.appendChild(contentItemRow);
    }

    //Draw content health

    let healthTitleRow = _createElement("div", ["learn_screen_row_container", "title"]);
    let healthTitle = _createElement("div", "learn_screen_ha_title", localize("learn_screen_health").toUpperCase());
    let healthAccentLine = _createElement("div", "learn_screen_ha_accent_line");

    healthTitleRow.appendChild(healthTitle);
    healthTitleRow.appendChild(healthAccentLine);

    healthContainer.appendChild(healthTitleRow);

    generate_ha_header(healthContainer);

    for (let item of relevantHealth){
        generate_ha_content(item, healthContainer);
        
        let imageRender = _createElement("div", "learn_screen_ha_image");
        imageRender.style.backgroundImage = "url(/html/images/entities/" + item + ".png.dds)"
        if(item == 'hpt0'){imageRender.style.height = '5.4vh'}
        else if(item == 'hpt3'){imageRender.style.height = '9.5vh'}
        else{imageRender.style.height = '7.7vh'}
        healthImageRow.appendChild(imageRender);
    }
    healthContainer.appendChild(healthImageRow);
    healthContainer.appendChild(healthImageRowNames);
    healthContainer.appendChild(healthImageRowAliases);

    //Draw content armor
    
    let armorTitleRow = _createElement("div", ["learn_screen_row_container", "title"]);
    let armorTitle = _createElement("div", "learn_screen_ha_title", localize("learn_screen_armor").toUpperCase());
    let armorAccentLine = _createElement("div", "learn_screen_ha_accent_line");

    armorTitleRow.appendChild(armorTitle);
    armorTitleRow.appendChild(armorAccentLine);

    armorContainer.appendChild(armorTitleRow);

    generate_ha_header(armorContainer);

    for (let item of relevantArmor){
        generate_ha_content(item, armorContainer);

        let imageRender = _createElement("div", "learn_screen_ha_image");
        imageRender.style.backgroundImage = "url(/html/images/entities/" + item + ".png.dds)"
        //manually adjust image heights so things have correct relative sizes
        if(item == 'armort1'){imageRender.style.height = '7vh'}
        else{imageRender.style.height = '12vh'}
        armorImageRow.appendChild(imageRender);
    }
    armorContainer.appendChild(armorImageRow);
    armorContainer.appendChild(armorImageRowNames);
    armorContainer.appendChild(armorImageRowAliases);
}

//Powerups Tab - for powerups we dont get any data from scripts so hardcode all info
function learn_screen_initialize_tab_powerups() {
    var list = _id("learn_screen_item_list_powerups");
    var infoContainer = _id("learn_screen_info_powerups");

    var relevantPowerups = {
        'survival':     {'powerupImage': '/html/images/entities/survival.png.dds',
                        'entries':{'Initial Spawn (Brawl)': '1:00',
                                    'Respawn Time (Brawl)': '240s',
                                    'Duration': '30s',
                                    'Health Gained on Pickup': '50',
                                    'Armor Gained on Pickup': '50'},
                        'description': 'When equipped with Siphonator you passively heal for 5 health every second and any damage you deal to enemies heals you for 50% of the damage dealt. Additionally, your friendly fire heals your teammates for 50% of weapon damage. <div>Seek out 1v1 confrontations safe in the knowledge that you can outlast your opponent, and pay attention to the health of your teammates, as a clutch heal can turn the tide of a fight.</div>'
                        }, 
        'vanguard':     {'powerupImage': '/html/images/entities/vanguard.png.dds',
                        'entries':{'Initial Spawn (Brawl)': '1:00',
                                    'Respawn Time (Brawl)': '240s',
                                    'Duration': '30s',
                                    'Health Gained on Pickup': '50',
                                    'Armor Gained on Pickup': '50'},
                        'description': 'A potent shield that protects its wielder from even the most ferocious of attacks, Vanguard reduces damage taken by 50% and mitigates all self damage. Group up with your allies and charge first into the breach, soaking up damage and carving a path for your team to take control.'
                        },  
        'tripledamage': {'powerupImage': '/html/images/entities/tripledamage.png.dds',
                        'entries':{'Initial Spawn': '1:00',
                                    'Respawn Time': '120s',
                                    'Duration': '30s',
                                    'Available In': 'TDM, MacGuffin'},
                        'description': 'A triple damage boost to all of your weaponry provides a significant advantage in any fight you possess Vindicator. Out damage opponents even wielding the same weaponry and bring encounters to a rapid conclusion, so long as you can survive their focused efforts to take you down together.'
                        }, 
        'doubledamage': {'powerupImage': '/html/images/entities/doubledamage.png.dds', //Diabotical
                        'entries':{'Initial Spawn (Brawl)': '3:00',
                                    'Respawn Time (Brawl)': '240s',
                                    'Duration': '30s',
                                    'Health Gained on Pickup': '50',
                                    'Armor Gained on Pickup': '50'},
                        'description': 'Possessed by the incredible energies of Diabotical your attacks gain extra viciousness, with all damage you deal being quadrupled. Music blasts from your core fuelling a spree like no other as you crush all who cower before you. <div>Decimate the competition! But beware, for though it is true that while equipped with Diabotical you are the most dangerous force on the field, to the brave or simply unhinged, you are also the biggest target.</div>'
                        },
    };
    
    function generate_powerups_content(item){
        //create list items
        let listItem = _createElement("div","learn_screen_list_button", localize(global_item_name_map[item][1]).toUpperCase());
        listItem.style.setProperty("--itemIcon", "url(/html/" + global_item_name_map[item][2] + ")");
        listItem.style.setProperty("--backgroundItemColor", hexToRGBA(global_item_name_map[item][0], 0.65));

        //create info screens
        let infoItem = _createElement("div", "learn_screen_powerup_item");

        let powerupInfoContainer = _createElement("div");

        infoItem.style.display = "none";
        infoContainer.appendChild(infoItem);

        listItem.addEventListener("click", function(){
            learn_screen_highlight_button(listItem);
            learn_screen_show_content(infoItem);
        })
        list.appendChild(listItem);

        if(item == 'survival'){ 
            //default screen is siphonator
            learn_screen_highlight_button(listItem);
            learn_screen_show_content(infoItem);
        }

        //create descriptions
        let powerupDescriptionContainer = _createElement("div", ["learn_screen_row_container", "description"]);

        let infoPowerupRender = _createElement("div", "learn_screen_powerup_image");
        infoPowerupRender.style.backgroundImage = "url(" + relevantPowerups[item].powerupImage + ")";
        powerupDescriptionContainer.appendChild(infoPowerupRender);

        let powerupDescriptionTextContainer = _createElement("div", "learn_screen_powerup_info_description_text_container");
        //let weaponDescriptionText = _createElement("div", "learn_screen_item_description", relevantWeapons[item].description);

        let powerupDescriptionText = _createElement("div", "learn_screen_item_description");
        powerupDescriptionText.innerHTML = relevantPowerups[item].description;

        let powerupTitleContainer = _createElement("div", ["learn_screen_row_container", "title"]);
        let powerupTitle = _createElement("div", "learn_screen_powerup_title", localize(global_item_name_map[item][1]).toUpperCase());
        let accentLine = _createElement("div", "learn_screen_powerup_accent_line");
        powerupTitleContainer.appendChild(powerupTitle);
        powerupTitleContainer.appendChild(accentLine);
        
        powerupDescriptionTextContainer.appendChild(powerupTitleContainer);
        powerupDescriptionTextContainer.appendChild(powerupDescriptionText);

        powerupDescriptionContainer.appendChild(powerupDescriptionTextContainer);


 
        //create info rows
        entriesObject = relevantPowerups[item].entries;
        for (let label in entriesObject){
            let infoRow = _createElement("div", "learn_screen_powerup_item_row");

            let infoLabel = _createElement("div", "learn_screen_powerup_item_label");
            let infoLabelText = _createElement("div", "text_container", label); //LOCALIZE THIS WHEN GAMEMODE SCREEN IS IN
            infoLabel.appendChild(infoLabelText);

            infoLabel.style.setProperty("--itemColor", hexToRGBA(global_item_name_map[item][0], 0.6));
            //infoLabel.style.color = _backgroundFontColor(global_item_name_map[item][0]); just white seems to look better

            let infoCell = _createElement("div", "learn_screen_powerup_item_cell");
            let cellText = entriesObject[label];
            let infoCellText = _createElement("div", "text_container", cellText);
            infoCell.appendChild(infoCellText);

            infoRow.appendChild(infoLabel);
            infoRow.appendChild(infoCell);

            powerupInfoContainer.appendChild(infoRow);
        }

        infoItem.appendChild(powerupDescriptionContainer);

        infoItem.appendChild(powerupInfoContainer);
    }

    for (const item of Object.keys(relevantPowerups)) {
        generate_powerups_content(item);
    }    
}