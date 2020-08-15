function init_screen_aim() {

    //{'weapon':'', 'name':'', 'description':'', 'videoURL':''},
    //weapon refers to global_item_name_map name
    let aim_scenarios = [{'name':'pncr_flickshots', 'title':'Flickshots', 'weapon':'weaponpncr', 'description': 'Flick flack click clack', 'videoURL':'/html/images/gamemode_cards/PRACTICE_intro.webm'},
                        {'name':'shaft_close', 'title':'Close Tracking', 'weapon':'weaponshaft', 'description': 'Worlds best IQ test'},
                        {'name':'shaft_mid', 'title':'Mid Tracking', 'weapon':'weaponshaft', 'description': 'Worlds best IQ test'},
                        {'name':'shaft_far', 'title':'Far Tracking', 'weapon':'weaponshaft', 'description': 'Worlds best IQ test'},];

    let scenario_list = _id("aim_screen_scenario_list");

    for (let scenario of aim_scenarios){
        let el = _createElement("div", ["scenario", "click-sound", "mouseover-sound4"]);
        scenario_list.appendChild(el);

        let scenario_icon = _createElement("div", "scenario_icon");
        scenario_icon.style.setProperty("--weaponIcon", "url(/html/" + global_item_name_map[scenario.weapon][2] + ")");
        if(scenario.weapon == 'weaponshaft'){scenario_icon.style.backgroundPosition = '50% 40%'} //shaft icon is not centred properly by default

        let scenario_title = _createElement("div", "scenario_title", localize(scenario.title));

        let scenario_weapon = _createElement("div", "scenario_weapon", localize(global_item_name_map[scenario.weapon][1]));

        el.appendChild(scenario_icon);
        el.appendChild(scenario_title);
        el.appendChild(scenario_weapon);
        
        el.style.setProperty("--weaponColor", hexToRGBA(global_item_name_map[scenario.weapon][0], 0.65));

        let video_container = _id("scenario_video_container");
        let scenarioVideo = _createElement("video", "scenario_video");
        scenarioVideo.src = scenario.hasOwnProperty('videoURL') ? scenario.videoURL : '/html/images/gamemode_cards/AIM_intro.webm';
        scenarioVideo.loop = true;
        scenarioVideo.pause();
        scenarioVideo.style.display = "none";
        video_container.appendChild(scenarioVideo);

        el.addEventListener("click", function(){
            if(_id("scenario_play_button").dataset.scenarioName !=  scenario.name){ //no need to do anything if we are already on the scenario we click
                var container = el.parentElement;
                _for_each_with_class_in_parent(container, "scenario", function(e){
                    if(e != el){
                        e.classList.remove('active');
                    }
                });
                el.classList.add('active');

                set_aim_scenario(scenario, scenarioVideo, true);
            }
        })

        if(scenario.name == "pncr_flickshots"){ //default to this one
            el.classList.add('active');
            set_aim_scenario(scenario, scenarioVideo, false);
        }
    }
    
    function set_aim_scenario(scenario, scenarioVideo, shouldPlay){
        if(_id("scenario_play_button").dataset.scenario != scenario.name){
            /* need indicators if allowing pause/play on click
            scenarioVideo.addEventListener("click", function(){
                if(scenarioVideo.paused){
                    scenarioVideo.play();
                }
                else{
                    scenarioVideo.pause();
                }
            })*/
            let video_container = _id("scenario_video_container");
            _for_each_with_class_in_parent(video_container, "scenario_video", function(el){
                el.pause();
                el.classList.remove("active_video");
                el.style.display = "none";
            })
            scenarioVideo.currentTime = 0;
            scenarioVideo.style.display = "flex";
            scenarioVideo.classList.add("active_video");
            if(shouldPlay){scenarioVideo.play();}
            
            _id("scenario_description_title").textContent = localize(scenario.title);
            _id("scenario_description").textContent = localize(scenario.description);
            _id("scenario_play_button").dataset.scenarioName =  scenario.name;
        }
    }
}

function load_aim_scenario(scenarioName) {
    if (typeof scenarioName !== 'undefined') engine.call("load_aim_" + scenarioName);
}

function aim_scenario_set_video_play(shouldPlay){
    let scenarioVideo = _get_first_with_class_in_parent(_id("scenario_video_container"), "active_video");
    if(typeof scenarioVideo !== 'undefined'){
        if(shouldPlay){
            scenarioVideo.play();
        }
        else{
            scenarioVideo.pause();
        }
    }
}