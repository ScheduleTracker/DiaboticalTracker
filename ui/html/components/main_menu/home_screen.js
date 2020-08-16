function init_screen_home() {
  const apiEndpoint = "https://dbgg.prismic.io/api/v2";
  let currentPost = 1;
  let modt_url = null;

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

  _id("home_screen_motd_window").addEventListener("click", function(event) {
    if(event.currentTarget.dataset.uid)
       engine.call('open_browser', `https://www.diabotical.com/news#${event.currentTarget.dataset.uid}`);
   });
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