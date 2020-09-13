function init_screen_home() {
  const apiEndpoint = "https://dbgg.prismic.io/api/v2";
  let currentPost = 1;
  let modt_url = null;

  /* News Post
  PrismicJS.getApi(apiEndpoint)
    .then(function(api) {
      return api.query(
        PrismicJS.Predicates.at("document.type", "news_post"),
        {
          orderings: "[document.last_publication_date desc]",
          pageSize: 3
        }
      );
    })
    .then(
      function(response) {
        if (response.results.length > 0) {
          response.results.forEach(function(result) {
            preload_image(result.data.background.url);
          });
          const post = response.results[currentPost];
          update_motd(response.results[currentPost]);
          
          setInterval(function () {
            currentPost++;
            if (currentPost >= response.results.length)
              currentPost = 0;
            
            update_motd(response.results[currentPost]);            
          }, 8000);
        }
      },
      function(err) {
        console.error("Error while calling CMS: ", err);
      }
    );
    */

  //PATCH NOTES
  PrismicJS.getApi(apiEndpoint)
    .then(function(api) {
      return api.query(
        PrismicJS.Predicates.any("document.type", ["patch_note_ingame", "temp_ingame_announcement"]),
        {
          orderings: "[document.last_publication_date desc]",
          pageSize: 8
        }
      );
    })
    .then(
      function(response) {
        if (response.results.length > 0) {
          for(let i=0; i<response.results.length; i++){
            if(response.results[i].type == "patch_note_ingame"){
              add_patch_notes(response.results[i].data);
            }
            else if(response.results[i].type == "temp_ingame_announcement"){
              add_ingame_announcement(response.results[i].data);
            }
          }
          refreshScrollbar(_id("home_screen_patch_notes_cont").querySelector(".scroll-outer"));
        }
      },
      function(err) {
        console.error("Error while calling CMS: ", err);
      }
    );

  _id("home_screen_motd_window").addEventListener("click", function(event) {
    if(event.currentTarget.dataset.uid)
       engine.call('open_browser', `https://www.diabotical.com/news#${event.currentTarget.dataset.uid}`);
   });

   // Load the variable to show/hide the home screen tutorial button
   engine.call("initialize_checkbox_value", "lobby_tutorial_launched");
}

/*
setTimeout(() => {  
  update_motd({ uid: 'mocked', slugs: null, data: { title: [ { text:  'This is a title' } ], subtitle: [ { text: 'The subtitle' } ], background: null } });
}, 3000);
*/

function add_ingame_announcement(announcement_data){
  console.log(_dump(announcement_data));
  _id("home_screen_patch_notes_cont").style.display = "flex";

  let header_row = _createElement("div", "patch_header");
  if(announcement_data.title && announcement_data.title.length){
    let title = _createElement("div", "patch_version", announcement_data.title[0].text);  
    header_row.appendChild(title);
  }

  if(announcement_data.timestamp){
    let announcement_timestamp = new Date(announcement_data.timestamp);
    let announcement_date = _createElement("div", "patch_date", announcement_timestamp.toDateString());
    header_row.appendChild(announcement_date);
  }

  _id("home_screen_patch_notes_body").appendChild(header_row);

  if(announcement_data.image.hasOwnProperty('url')){
    let announcement_image = _createElement("div", "full_image");  
    announcement_image.style.backgroundImage = `url("${announcement_data.image.url}")`;
    announcement_image.style.paddingTop = (announcement_data.image.dimensions.height  / announcement_data.image.dimensions.width) * 100 + '%';
    if(announcement_data.url.hasOwnProperty('url')){
      announcement_image.addEventListener("click", function(){
        engine.call('open_browser', announcement_data.url.url);
      })
    }
    _id("home_screen_patch_notes_body").appendChild(announcement_image);
  }

  if(announcement_data.information && announcement_data.information.length){
    var announcement_text = announcement_data.information[0].text;

    if(announcement_text.length > 0) {
      let announcement_body = _createElement("div", "patch_section_notes")
      announcement_body.innerHTML = createLineBreaksFromString(announcement_text);
      _id("home_screen_patch_notes_body").appendChild(announcement_body);
    }
  }
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

function add_patch_notes(patch_data){
  _id("home_screen_patch_notes_cont").style.display = "flex";

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

  if(patch_data.patch_introduction && patch_data.patch_introduction.length){
    var patch_introduction_text = patch_data.patch_introduction[0].text;

    if(patch_introduction_text.length > 0) {
      let patch_introduction = _createElement("div", "patch_section_notes")
      patch_introduction.innerHTML = createLineBreaksFromString(patch_introduction_text);
      _id("home_screen_patch_notes_body").appendChild(patch_introduction);
    }
  }

  if(patch_data.body && patch_data.body.length){
    for(const section of patch_data.body){
      if(section.patch_section_title && section.patch_section_title.length){
        let title = _createElement("div", "patch_section_title", section.patch_section_title[0].text);
        _id("home_screen_patch_notes_body").appendChild(title);
      }  
      let content = _createElement("div", "patch_section_notes");
      let contentHTML = getPatchNoteListFromCMS(section.patch_section_notes);
      content.innerHTML = contentHTML;
      _id("home_screen_patch_notes_body").appendChild(content);
    }
  } 

  if(patch_data.patch_outroduction && patch_data.patch_outroduction.length){
    var patch_outroduction_text = patch_data.patch_outroduction[0].text;

    if(patch_outroduction_text.length > 0) {
      let patch_outroduction = _createElement("div", "patch_section_notes")
      patch_outroduction.innerHTML = createLineBreaksFromString(patch_outroduction_text);
      _id("home_screen_patch_notes_body").appendChild(patch_outroduction);
    }
  }
}

function getPatchNoteListFromCMS(patchNotesArray) {
  if(patchNotesArray && patchNotesArray.length){
    let list = ""
    for (let note of patchNotesArray){
      if (note.hasOwnProperty('text')){
        list += "<div>\u2022 " + note.text + "</div>";
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

function update_motd({ uid, slugs, data }) {
  const {
    title,
    subtitle,
    background,
  } = data;

  const motdView = _id("home_screen_motd_window");
  const motdContainer = _id("home_screen_motd_container");
  const motdBackground = _id("home_screen_motd_background");
  const motdTitle = motdView.querySelector(".title");
  const motdSubtitle = motdView.querySelector(".subtitle");

  motdView.dataset.uid = uid;
  motdTitle.textContent = getMultiParagraphFromCMS(title);
  motdSubtitle.textContent = getMultiParagraphFromCMS(subtitle);
  //motdView.querySelector(".body").innerHTML = textClamp(getMultiParagraphFromCMS((body));
  //motdView.querySelector(".body").innerHTML = getMultiParagraphFromCMS(body);

  motdContainer.style.display = "none";
  motdView.style.display = "flex";
  replay_css_anim(motdBackground);
  replay_css_anim(motdTitle);
  replay_css_anim(motdSubtitle);

  req_anim_frame(() => {
    anim_show(motdContainer, 350, "flex");
  }, 4);
    
  if (background) {
    motdBackground.style.backgroundImage = `url("${background.url}")`;
  }
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
  render_daily_challenges(_id("home_screen_challenges"), global_user_battlepass.challenges, true);
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