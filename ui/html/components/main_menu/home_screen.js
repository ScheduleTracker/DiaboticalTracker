function init_screen_home() {
  const apiEndpoint = "https://dbgg.prismic.io/api/v2";
  const newsURL = "https://diabotical-portal.now.sh/news";

  PrismicJS.getApi(apiEndpoint)
    .then(function(api) {
      return api.query(
        PrismicJS.Predicates.at("document.type", "ingame_news"),
        {
          orderings: "[document.last_publication_date desc]",
          pageSize: 1
        }
      );
    })
    .then(
      function(response) {
        if (response.results.length > 0) {
          const {
            title,
            subtitle,
            body,
            background
          } = response.results[0].data;

          updateMotd(
            getMultiParagraphFromCMS(title),
            getMultiParagraphFromCMS(subtitle),
            getMultiParagraphFromCMS(body),
            newsURL,
            background ? background.url : null
          );
        }
      },
      function(err) {
        console.error("Error while calling CMS: ", err);
      }
    );
}

function updateMotd(title, subtitle, body, link, background) {
  const motdView = _id("home_screen_motd_window");

  motdView.querySelector(".title").innerHTML = title;
  motdView.querySelector(".subtitle").innerHTML = subtitle;
  //motdView.querySelector(".body").innerHTML = textClamp(body);
  motdView.querySelector(".body").innerHTML = body;
  motdView.style.display = "flex";

  if (background) {
    motdView.style.background = `url("${background}") no-repeat bottom`;
    motdView.style.backgroundColor = 'black';
    motdView.style.backgroundSize = "cover";
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
