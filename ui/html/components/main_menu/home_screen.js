var latest_patch_notes_read = "";  //for showing new patch notes indicator

function init_screen_home() {
  //Set certain values to be exact pixel values to avoid overflow:hidden spilling 1px bug
  _id("home_screen").style.top = Math.floor(6 * (window.outerHeight / 100)) + "px";
  let announcement_column_width = 40;
  let announcement_margin = 1;
  document.documentElement.style.setProperty('--home-screen-column-margin', Math.floor(3 * (window.outerHeight / 100)));
  document.documentElement.style.setProperty('--announcement-margin', Math.floor(announcement_margin * (window.outerHeight / 100)));
  document.documentElement.style.setProperty('--announcement-height', Math.floor(22 * (window.outerHeight / 100)));
  document.documentElement.style.setProperty('--announcement-large-width', Math.floor(announcement_column_width * (window.outerHeight / 100)));
  document.documentElement.style.setProperty('--announcement-small-width', Math.floor(((announcement_column_width - announcement_margin) / 2) * (window.outerHeight / 100)));
  
  const apiEndpoint = "https://dbgg.prismic.io/api/v2";  
  engine.call("initialize_custom_component_value", "lobby_last_patch_notes_read");

  //PATCH NOTES
  PrismicJS.getApi(apiEndpoint)
    .then(function(api) {
      return api.query(
        PrismicJS.Predicates.at("document.type", "patch_note_ingame"),
        {
          orderings: "[document.last_publication_date desc]",
          pageSize: 8
        }
      );
    })
    .then(
      function(response) {
        if (response.results.length > 0) {
          generate_patch_banner(response.results[0].data); //front page patch notes button info
          for(let i=0; i<response.results.length; i++){
            add_patch_notes(response.results[i].data);
          }
          _id("home_screen_patch_notes_banner").style.display = "flex";
          _id("home_screen_patch_notes_banner").addEventListener("click", function(){
            open_modal_screen('patch_notes_modal_screen');
            refreshScrollbar(_id("home_screen_patch_notes_cont").querySelector(".scroll-outer"));
            if(response.results[0].data.patch_version && response.results[0].data.patch_version.length){
              engine.call("set_string_variable", "lobby_last_patch_notes_read", response.results[0].data.patch_version[0].text);
            }
          })          
        }
      },
      function(err) {
        console.error("Error while calling CMS: ", err);
      }
    );
  
  //ANNOUNCEMENTS, doesn't seem to be possible to make one call where you obtain a set amount of Type A, and a set amount of Type B, so make two calls
  PrismicJS.getApi(apiEndpoint)  
    .then(function(api) {
      return api.query(
        PrismicJS.Predicates.at("document.type", "ingame_announcement"),
        {
          orderings: "[document.last_publication_date desc]",
          pageSize: 4
        }
      );
    })
    .then(
      function(response) {
        if (response.results.length > 0) {
          _id("home_screen_announcements_cont").style.display = "flex";
          //If we have less than or equal to two announcements, make them both large
          if (response.results.length <= 2){
            for(let i=0; i<response.results.length; i++){
              add_ingame_announcement(response.results[i].data, _id("home_screen_announcements_cont"), "large");
            }
          }
          //Otherwise if we have more than 2, if there are an odd number, make the most recent one large, and the remaining small pairs
          else if (response.results.length % 2 == 1){
            add_ingame_announcement(response.results[0].data, _id("home_screen_announcements_cont"), "large");
            for(let i=1; i<response.results.length; i+= 2){              
              let smallAnnounceCont = _createElement("div", "home_screen_small_announcements_cont");
              _id("home_screen_announcements_cont").appendChild(smallAnnounceCont);
              add_ingame_announcement(response.results[i].data, smallAnnounceCont, "small");
              add_ingame_announcement(response.results[i+1].data, smallAnnounceCont, "small");
            }
          }
          //If there are more than 2, and an even number, make them all into small pairs
          else{
            for(let i=0; i<response.results.length; i+= 2){              
              let smallAnnounceCont = _createElement("div", "home_screen_small_announcements_cont");
              _id("home_screen_announcements_cont").appendChild(smallAnnounceCont);
              add_ingame_announcement(response.results[i].data, smallAnnounceCont, "small");
              add_ingame_announcement(response.results[i+1].data, smallAnnounceCont, "small");
            }
          }
        }
      },
      function(err) {
        console.error("Error while calling CMS: ", err);
      }
    );

   // Load the variable to show/hide the home screen tutorial button
   engine.call("initialize_checkbox_value", "lobby_tutorial_launched");
}

/*
setTimeout(() => {  
  update_motd({ uid: 'mocked', slugs: null, data: { title: [ { text:  'This is a title' } ], subtitle: [ { text: 'The subtitle' } ], background: null } });
}, 3000);
*/

function add_ingame_announcement(announcement_data, container, size){
  //console.log(_dump(announcement_data));
  _id("home_screen_announcements_cont").style.display = "flex";
  let announcement_text_container = _createElement("div", "announcement_text_container");
  let announcement = _createElement("div", ["announcement", size]);
  let announcement_background = _createElement("div", "announcement_background");

  if(size == "small" && announcement_data.background_small.hasOwnProperty('url')){     
    announcement_background.style.backgroundImage = `url("${announcement_data.background_small.url}")`;
  }
  else if(announcement_data.background.hasOwnProperty('url')){     
    announcement_background.style.backgroundImage = `url("${announcement_data.background.url}")`;
  }

  if(announcement_data.url){
    announcement.classList.add("clickable");
    announcement.addEventListener("mousedown", _play_click1);
    announcement.addEventListener("mouseenter", function(){
      _play_mouseover2();
      announcement_background.classList.add("hovered");
    });
    announcement.addEventListener("mouseleave", function(){
      announcement_background.classList.remove("hovered");
    })

    if(announcement_data.url.startsWith("https://")){
      announcement.addEventListener("click", function(){
        engine.call('open_browser', announcement_data.url);
      })
      let expand_icon = _createElement("div", "expand_icon");
      announcement.appendChild(expand_icon);
    }
    else if(announcement_data.url.startsWith("ingame://")){
      if(announcement_data.url == "ingame://shop"){announcement.addEventListener("click", function(){open_shop()})}
      else if(announcement_data.url.startsWith("ingame://map/")){
        announcement.addEventListener("click", function(){
          engine.call('console_return', "/map " + announcement_data.url.substr(13));
        })
        let announcement_demo = _createElement("div", "demo_now", "Demo Now");
        announcement.appendChild(announcement_demo);
      }
      else if(announcement_data.url == "ingame://play_screen_quick_play"){announcement.addEventListener("click", function(){open_play('play_screen_quickplay')})}
    }
  }
  if(announcement_data.type){
    let announcement_type = _createElement("div", "announcement_type", announcement_data.type);
    announcement.appendChild(announcement_type);
  }  
  if(announcement_data.icon.hasOwnProperty('url')){
    let announcement_icon = _createElement("div", "announcement_icon");
    announcement_icon.style.backgroundImage = `url("${announcement_data.icon.url}")`;
    announcement.appendChild(announcement_icon);
    announcement.style.justifyContent = 'flex-start';
    if(size == 'large'){
      announcement_text_container.style.width = '70%';
    }
  }
  if(announcement_data.title){
    let announcement_title = _createElement("div", "announcement_title", announcement_data.title);
    if(announcement_data.title_color){
      announcement_title.style.color = announcement_data.title_color;
    }
    announcement_text_container.appendChild(announcement_title);
  }
  if(announcement_data.information && announcement_data.information.length){
    if(size == 'large' || announcement_data.show_information_when_small) {
      for(let info of announcement_data.information){
        if(info.text){
          let announcement_information = _createElement("div", "announcement_information");
          announcement_information.innerHTML = info.text;
          announcement_information.style.color = info.text_color;
          announcement_text_container.appendChild(announcement_information);
        }
      }
    }
  }
  
  if(announcement_data.use_countdown && announcement_data.countdown){
    let countdown_target = new Date(announcement_data.countdown).getTime();
    //let countdown_target = new Date().getTime() + 3000;  //use for testing
    let countdown_information = _createElement("div",  "announcement_countdown");
    announcement_text_container.appendChild(countdown_information);
    
    let announcement_live = _createElement("div", "announcement_live", "live");
    
    if(countdown_target - (new Date().getTime()) > 0){
      _for_each_with_class_in_parent(announcement_text_container, "announcement_information", function(el){
        el.style.display = "none";
      })
      var countdown_interval = setInterval(function setRemainingTime(){
        let currentTime = new Date().getTime();
        let timeRemaining = countdown_target - currentTime;

        if(timeRemaining < 0){
          clearInterval(countdown_interval);
          countdown_information.style.display = "none";
          _for_each_with_class_in_parent(announcement_text_container, "announcement_information", function(el){
            el.style.display = "flex";
          })
          if(announcement_data.show_live_at_end_of_countdown){announcement_live.style.display = "flex";}
        }

        //timeRemaining is in milliseconds, each value is remainder relative to larger division
        var days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        countdown_information.textContent = "";
        if(days > 0) {countdown_information.textContent += days + "d"}
        if(days > 0 || hours > 0) {countdown_information.textContent += " " + hours + "h"}
        if(days > 0 || hours > 0 || minutes > 0) {countdown_information.textContent += " " + minutes + "m"}
        if(days > 0 || hours > 0 || minutes > 0 || seconds > 0) {countdown_information.textContent += " " + seconds + "s"}

        return setRemainingTime;
      }(), 1000); //use immediately invoked function expression so that the interval function fires immediately and doesnt wait for interval to pass
    }
    else{
      if(announcement_data.show_live_at_end_of_countdown){announcement_live.style.display = "flex";}
    }             
    announcement.appendChild(announcement_live);
  }  
  
  announcement.appendChild(announcement_background);
  announcement.appendChild(announcement_text_container);
  container.appendChild(announcement);
}

function insertPrismicSpan(text, spans){
  let styledHTML = ""
  if(spans.length){
    if(spans[0].type == 'hyperlink'){
      var startPos = spans[0].start;
      var endPos = spans[0].end;
      styledHTML = [text.slice(0, endPos), '</div>', text.slice(endPos)].join('');
      styledHTML = [text.slice(0, startPos), '<div>', text.slice(startPos)].join('');
    }
  }
  else{
    styledHTML = text;
  }
  return styledHTML
}

function generate_patch_banner(patch_data){
  //console.log(_dump(patch_data));
  let patch_banner = _id("home_screen_patch_notes_banner");
  let patch_banner_head = _id("patch_notes_banner_header");

  let patch_version = _createElement("div", "patch_column_left");
  patch_version.appendChild(_createElement("div", "", localize("home_screen_patch_notes")));  
  patch_banner_head.appendChild(patch_version);

  let patch_date = _createElement("div", "patch_column_right");  
  patch_banner_head.appendChild(patch_date);

  if(patch_data.patch_version && patch_data.patch_version.length){
    patch_version.appendChild(_createElement("div", "", patch_data.patch_version[0].text))
  }

  if(patch_data.timestamp){
    let patch_timestamp = new Date(patch_data.timestamp);
    patch_date.appendChild(_createElement("div", "", patch_timestamp.toDateString()));
  }

  if(latest_patch_notes_read != patch_data.patch_version[0].text){    
    let patch_new = _createElement("div", "patch_new", localize("home_screen_new_exclamation"));
    patch_date.appendChild(patch_new);
    patch_banner.addEventListener("click", function(){
      patch_new.style.display = "none";
    })
  }

  patch_date.appendChild(_createElement("div"))
  
  var summary_text = _createElement("div", "patch_summary", "Including updates to ");
  for(let i=0; i < patch_data.body.length; i++){
    let section = patch_data.body[i];   
    if(section.patch_section_title && section.patch_section_title.length){
        if(i == 0){
          summary_text.textContent += section.patch_section_title[0].text;   
        }
        else if(i == patch_data.body.length - 1){
          summary_text.textContent += " and " + section.patch_section_title[0].text;  
        }
        else{          
          summary_text.textContent += ", " + section.patch_section_title[0].text;  
        }
    }     
  }
  patch_banner.appendChild(summary_text); 
}

function add_patch_notes(patch_data){

  let header_row = _createElement("div", "patch_header");
  if(patch_data.patch_version && patch_data.patch_version.length){
    let patch_version = _createElement("div", "patch_version", "Patch " + patch_data.patch_version[0].text);  
    header_row.appendChild(patch_version);
  }

  if(patch_data.timestamp){
    let patch_timestamp = new Date(patch_data.timestamp);
    let patch_date = _createElement("div", "patch_date", patch_timestamp.toDateString());
    header_row.appendChild(patch_date);
  }

  _id("home_screen_patch_notes_body").appendChild(header_row);

  let patch_section_text_cont = _createElement("div", "patch_section_text_container");

  if(patch_data.patch_introduction && patch_data.patch_introduction.length){
    var patch_introduction_text = patch_data.patch_introduction[0].text;

    if(patch_introduction_text.length > 0) {
      let patch_introduction = _createElement("div", "patch_section_notes")
      patch_introduction.innerHTML = createLineBreaksFromString(patch_introduction_text);
      patch_section_text_cont.appendChild(patch_introduction);
    }
  }

  if(patch_data.body && patch_data.body.length){
    for(const section of patch_data.body){
      if(section.patch_section_title && section.patch_section_title.length){
        let title = _createElement("div", "patch_section_title", section.patch_section_title[0].text);
        patch_section_text_cont.appendChild(title);
      }  
      let content = _createElement("div", "patch_section_notes");
      let contentHTML = getPatchNoteListFromCMS(section.patch_section_notes);
      content.innerHTML = contentHTML;
      patch_section_text_cont.appendChild(content);
    }
  } 

  if(patch_data.patch_outroduction && patch_data.patch_outroduction.length){
    var patch_outroduction_text = patch_data.patch_outroduction[0].text;

    if(patch_outroduction_text.length > 0) {
      let patch_outroduction = _createElement("div", "patch_section_notes")
      patch_outroduction.innerHTML = createLineBreaksFromString(patch_outroduction_text);
      patch_section_text_cont.appendChild(patch_outroduction);
    }
  }

  _id("home_screen_patch_notes_body").appendChild(patch_section_text_cont);
}

function getPatchNoteListFromCMS(patchNotesArray) {
  if(patchNotesArray && patchNotesArray.length){
    let list = ""
    for (let note of patchNotesArray){
      if (note.hasOwnProperty('text')){
        list += "<div class='patch_note_line'><div class='patch_note_bullet_point'>\u2022</div><div style='padding-right: 1.5vh'>" + note.text + "</div></div>";
        //padding style on the text to avoid text container being mysteriously wider than it should be
      }
    }
    list += ""
    return list;
  }
  else{
    return "";
  }
}

function createLineBreaksFromString(contentStr) {
  let contentHTML = "";
  contentStr.split("\n").forEach(paragraph => contentHTML += "<div>" + paragraph + "</div>");
  return contentHTML;
}

function getMultiParagraphFromCMS(contentArray) {
  if (contentArray && contentArray.length) {
    return contentArray.map(paragraph => paragraph.text).join(" ");
  } else {
    return "";
  }
}

function textClamp(text) {
  const MAX_BODY_WORDS = 50;
  let newText = text
    .split(" ")
    .slice(0, MAX_BODY_WORDS)
    .join(" ");

  if (newText.length < text.length) newText += "...";

  return newText;
}

function render_home_challenges() {
  render_daily_challenges(_id("home_screen_challenges"), global_user_battlepass.challenges, true, true);
}
function show_home_challenges() {
  anim_show(_id("home_screen_challenges_cont"), 350, "block");
}

function home_screen_load_tutorial() {
  home_screen_update_tutorial_played();
  engine.call("load_tutorial");
}

function home_screen_update_tutorial_played() {
  update_variable("bool", "lobby_tutorial_launched", true);
  setTimeout(function() {
    _id("home_screen_load_tutorial").style.display = "none";
  }, 1000);
}

function home_screen_show_hide_tutorial_button(hide) {
  // HACK hide the tutorial button temporarily
  /*
  _id("home_screen_load_tutorial").style.display = "none";
  return;
  */

  if (hide === false) {
    _id("home_screen_load_tutorial").style.display = "flex";
  } else {
    _id("home_screen_load_tutorial").style.display = "none";
  }
}

/*
    // DEBUG TESTS FUNCTIONS

    _for_each_with_class_in_parent(_id("home_screen"), "party_invite", function(el) {
        el.style.backgroundColor = "black";
        el.style.color = "white";
        el.style.marginBottom = "0.2vh";
        el.style.padding = "0.5vh 1vh";
        el.addEventListener("click", function() {
            send_json_data({"action": "invite-add", "type": "party", "user-id": Number(this.dataset.id) });
        });
    });

    _for_each_with_class_in_parent(_id("home_screen"), "lobby_invite", function(el) {
        el.style.backgroundColor = "black";
        el.style.color = "white";
        el.style.marginBottom = "0.2vh";
        el.style.padding = "0.5vh 1vh";
        el.addEventListener("click", function() {
            send_json_data({"action": "invite-add", "type": "lobby", "user-id": Number(this.dataset.id) });
        });
    });
*/