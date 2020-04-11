// nodes
const episodeList = document.querySelector("#episode-list");
const showDetail = document.querySelector("#show-detail");
const showList = document.querySelector("#show-list");
const searchForm = document.forms["search-form"];
const submitButton = searchForm.elements.submit;
const query = searchForm.elements.query;

// api
const baseurl = "https://api.tvmaze.com";

// suscribe to listeners
searchForm.addEventListener("submit", submitHandler);

query.addEventListener("input", inputHandler);

showList.addEventListener("click", clickHandler);

// fetch
async function fetcher(endpoint) {
  const response = await fetch(`${baseurl}/${endpoint}`);

  return await response.json();
}

function submitHandler(event) {
  event.preventDefault();

  fetcher(`search/shows?q=${query.value}`)
    .then((dataset) => render(dataset, query.value))
    .catch((error) => console.error(error.message));
}

function inputHandler(event) {
  submitDisableStateHandler();
}

function clickHandler(event) {
  if (event.target.nodeName !== "A") {
    return false;
  }

  event.preventDefault();

  const showId = event.target.dataset.id;
  const endpoints = [`shows/${showId}`, `shows/${showId}/episodes`];
  const fetchers = endpoints.map((endpoint) => fetcher(endpoint));

  Promise.all(fetchers)
    .then((dataset) => {
      const [show, episodes] = dataset;

      renderDetail(show, episodes);
    })
    .catch((error) => console.error(error.message));
}

// renders
function render(dataset, query) {
  const shows = dataset.map((data) => data.show);

  // clean show list before render new result
  showList.innerHTML = "";

  if (!shows.length) {
    showList.innerHTML = `No results for criteria <b>${query}</b>`;
  }

  for (const show of shows) {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.setAttribute("href", "#");
    a.setAttribute("data-id", show.id);
    a.textContent = show.name;

    li.append(a);
    showList.append(li);
  }
}

function renderDetail(show, episodes) {
  renderShow(show);
  renderEpisodes(episodes);
}

function renderShow(show) {
  // clean show list before render new result
  showDetail.innerHTML = "";

  // name
  const name = document.createElement("h1");
  const image = document.createElement("img");
  const summary = document.createElement("div");
  const detail = document.createElement("table");
  const premieredRow = document.createElement("tr");
  const premieredTitle = document.createElement("td");
  const premieredContent = document.createElement("td");
  const statusRow = document.createElement("tr");
  const statusTitle = document.createElement("td");
  const statusContent = document.createElement("td");
  const typeRow = document.createElement("tr");
  const typeTitle = document.createElement("td");
  const typeContent = document.createElement("td");
  const genresRow = document.createElement("tr");
  const genresTitle = document.createElement("td");
  const genresContent = document.createElement("td");

  // name
  name.textContent = show.name;

  // image
  if (show.image) {
    image.src = show.image.medium;
  }

  // summary
  summary.innerHTML = show.summary;

  // detail
  // premiered
  premieredTitle.textContent = "Premiered";
  premieredContent.textContent = show.premiered;

  premieredRow.append(premieredTitle);
  premieredRow.append(premieredContent);

  // status
  statusTitle.textContent = "Status";
  statusContent.textContent = show.status;

  statusRow.append(statusTitle);
  statusRow.append(statusContent);

  // type
  typeTitle.textContent = "Type";
  typeContent.textContent = show.type;

  typeRow.append(typeTitle);
  typeRow.append(typeContent);

  // genres
  genresTitle.textContent = "Genres";
  genresContent.textContent = show.genres.join(", ");

  genresRow.append(genresTitle);
  genresRow.append(genresContent);

  // append to table
  detail.append(premieredRow);
  detail.append(statusRow);
  detail.append(typeRow);
  detail.append(genresRow);

  // append
  showDetail.append(name);
  showDetail.append(image);
  showDetail.append(summary);
  showDetail.append(detail);
}

function renderEpisodes(episodes) {
  // clean episodes list before render new result
  episodeList.innerHTML = "";

  const seasons = groupBySeason(episodes);

  for (const season in seasons) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const list = document.createElement("div");

    summary.textContent = season;

    if (season === "1") {
      details.setAttribute("open", true);
    }

    for (const episode of seasons[season]) {
      const detail = document.createElement("details");
      const li = document.createElement("summary");
      const image = document.createElement("img");
      const p = document.createElement("p");

      li.textContent = episode.name;

      if (episode.image) {
        image.src = episode.image.medium;
        detail.append(image);
      }

      p.innerHTML = episode.summary;

      detail.append(li);
      detail.append(p);

      list.append(detail);
    }

    details.append(summary);
    details.append(list);

    episodeList.append(details);
  }
}

// helpers
function submitDisableStateHandler() {
  if (!query.value) {
    submitButton.setAttribute("disabled", "disabled");
  } else {
    submitButton.removeAttribute("disabled");
  }
}

function groupBySeason(episodes) {
  return episodes.reduce((previousValue, currentValue) => {
    if (!previousValue[currentValue.season]) {
      previousValue[currentValue.season] = [currentValue];
    } else {
      previousValue[currentValue.season] = previousValue[
        currentValue.season
      ].concat(currentValue);
    }
    return previousValue;
  }, {});
}

// init
submitDisableStateHandler();
