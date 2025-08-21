const isLoaded = { current: false };

document.addEventListener("DOMContentLoaded", () => {
  isLoaded.current = true;

  // Populate svgs that will clutter up the HTML if placed directly
  populateSVGs();

  // Remove .loading class if the images are loaded if not add listener to remove it
  imgLoaderListener();

  // Animation for line connecting two of the circles in the timeline
  animateTimeLines();

  // Resize listener for correction for lines connecting two of the circles in the timeline
  addResizeListener();
});

// remove animation for timeline if user zooms in on the page we don't want to have the transform animating
window.onload = () => {
  const timelineElements = document.querySelectorAll(
    ".timeline__begin__animation"
  );
  for (const element of timelineElements) {
    element.classList.remove("timeline__begin__animation");
  }
};

function animateTimeLines() {
  const timelineElements = document.querySelectorAll(".career__timeline");

  for (const element of timelineElements) {
    animateCareerTimeline(element);
  }
}

function imgLoaderListener() {
  document.querySelectorAll("img").forEach((img) => {
    if (img.complete) {
      img.closest("div")?.classList.remove("loading");
    } else {
      img.onload = () => {
        img.closest("div")?.classList.remove("loading");
      };
    }
  });
}

function populateSVGs() {
  fetchSVG("/assets/Jahad.svg").then((svg) => {
    insertElement(svg, "jahad");
  });

  fetchSVG("/assets/Simaran.svg").then((svg) => {
    insertElement(svg, "simaran");
  });

  fetchSVG("/assets/Jquery.svg").then((svg) => {
    insertElement(svg, "jquery");
  });

  fetchSVG("/assets/Processmaker.svg").then((svg) => {
    insertElement(svg, "processmaker");
  });

  fetchSVG("/assets/Language.svg").then((svg) => {
    insertElement(svg, "language");
  });

  fetchSVG("/assets/Darkmode.svg").then((svg) => {
    insertElement(svg, "dark");
  });

  fetchSVG("/assets/Lightmode.svg").then((svg) => {
    insertElement(svg, "light");
  });
}

function animateCareerTimeline(element) {
  const child = element.children[0];

  const tranlateValue =
    element.clientHeight -
    child.querySelector(".timeline__end").clientHeight -
    child.querySelector(".timeline__begin").clientHeight;

  if (!child.classList.contains("career__timeline__line__animate")) {
    child.classList.add("career__timeline__line__animate");
  }

  const beginElement = child.querySelector(".timeline__begin");
  beginElement.style.transform = `translateY(${tranlateValue}px)`;
}

function addResizeListener() {
  window.addEventListener("resize", () => {
    const elements = document.querySelectorAll(".career__timeline");

    for (const element of elements) {
      animateCareerTimeline(element);
    }
  });
}

async function fetchSVG(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onload = () => {
      const dataURL = reader.result;

      const base64Data = dataURL.split(",")[1];
      const svgString = atob(base64Data);

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = doc.documentElement;

      resolve(svgElement);
    };

    reader.readAsDataURL(blob);
  });
}

function insertElement(svg, id) {
  const intervalID = setInterval(() => {
    if (isLoaded.current) {
      clearInterval(intervalID);
      const elements = document.querySelectorAll(`#${id}`);

      elements.forEach((element, i) => {
        element.appendChild(i === 0 ? svg : svg.cloneNode(true));

        if (element.classList.contains("loading")) {
          element.classList.remove("loading");
        }
      });
    }
  }, 10);
}

document.querySelector("#languageCheckbox").addEventListener("change", (e) => {
  const isEnglish = e.target.checked;

  changeLanguage(isEnglish ? "en" : "fa");
});
document.querySelector("#languageCheckbox").checked === "en"
  ? initialENPrep()
  : initialFAPrep();

// Why not make both the Fa and En elements absolute
// Because I lose the dynamic sizing of the main element
// I want Fa to be not absolute so it can take some space from main element

// initial Fa
function initialFAPrep() {
  const farsiElement = document.querySelector("#info-farsi");
  const englishElement = document.querySelector("#info-english");

  englishElement.style.position = "absolute";
  englishElement.style.height = "100%";
  englishElement.style.opacity = 0;
  englishElement.style.width = `${farsiElement.offsetWidth}px`;
  englishElement.style.left = `-${farsiElement.offsetWidth - 16}px`; // take out one margin

  document.documentElement.lang = "fa";
  document.documentElement.classList.remove("page__lang__en");
  document.documentElement.classList.add("page__lang__fa");

  changeLanguageMain("fa");
  changeLanguageHeader("fa");
  changeLanguageDateTimeline("fa");

  addTransitionToPersonalWrappers();
}

function initialENPrep() {
  const farsiElement = document.querySelector("#info-farsi");
  const englishElement = document.querySelector("#info-english");

  englishElement.style.width = `${farsiElement.offsetWidth}px`;

  farsiElement.style.position = "absolute";
  farsiElement.style.height = "100%";
  farsiElement.style.opacity = 0;
  farsiElement.style.right = `16px`;

  document.documentElement.lang = "en";
  document.documentElement.classList.remove("page__lang__fa");
  document.documentElement.classList.add("page__lang__en");

  changeLanguageMain("en");
  changeLanguageHeader("en");
  changeLanguageDateTimeline("en");

  addTransitionToPersonalWrappers();
}

function addTransitionToPersonalWrappers() {
  setTimeout(() => {
    Array.from(document.querySelectorAll(".personal__wrapper")).forEach(
      (elem) => {
        elem.classList.add("personal__wrapper__transition");
      }
    );
  });
}

function changeLanguage(lang) {
  changeLanguageOuterLayer(lang);
  changeLanguageMain(lang);
  changeLanguageHeader(lang);
  changeLanguageDateTimeline(lang);
}

function changeLanguageOuterLayer(lang) {
  const farsiElement = document.querySelector("#info-farsi");
  const englishElement = document.querySelector("#info-english");
  const main = document.querySelector("main");

  if (lang === "en") {
    farsiElement.style.transform = `translateX(100%)`;
    farsiElement.style.opacity = 0;

    main.style.transform = `translateX(${farsiElement.offsetWidth}px)`;

    englishElement.style.transform = `translateX(100%)`;
    englishElement.style.opacity = 1;
  } else if (lang === "fa") {
    farsiElement.style.transform = `translateX(0)`;
    farsiElement.style.opacity = 1;

    main.style.transform = `translateX(0)`;

    englishElement.style.transform = `translateX(0)`;
    englishElement.style.opacity = 0;
  }

  document.documentElement.lang = lang;
}

function changeLanguageMain(lang) {
  for (const job of document.querySelectorAll(".career__section")) {
    const persianInfoSection = job.querySelector(".career__info__farsi");
    const englishInfoSection = job.querySelector(".career__info__english");
    const careerTimeline = job.querySelector(".career__timeline");

    if (lang === "en") {
      persianInfoSection.style.transform = `translateX(${persianInfoSection.offsetWidth}px)`;
      persianInfoSection.style.opacity = 0;
      englishInfoSection.style.opacity = 1;

      careerTimeline.style.transform = `translateX(${persianInfoSection.offsetWidth}px)`;

      englishInfoSection.style.transform = `translateX(${
        englishInfoSection.offsetWidth + 32
      }px)`;
    } else if (lang === "fa") {
      persianInfoSection.style.transform = "translateX(0)";
      persianInfoSection.style.opacity = 1;
      englishInfoSection.style.opacity = 0;

      careerTimeline.style.transform = `translateX(0)`;

      englishInfoSection.style.transform = `translateX(0)`;
    }
  }
}

// Same width for english element as persian one
Array.from(document.querySelectorAll(".career__section")).forEach((job) => {
  const persianInfoSection = job.querySelector(".career__info__farsi");
  const englishInfoSection = job.querySelector(".career__info__english");

  englishInfoSection.style.width = persianInfoSection.offsetWidth + "px";

  persianInfoSection.classList.add("career__info__transition");
  englishInfoSection.classList.add("career__info__transition");
});

// Substitute start/end date with text
updateDateTexts();

function updateDateTexts() {
  Array.from(document.querySelectorAll("[data-start-date]")).forEach(
    (element) => {
      const {
        englishEndDate,
        englishStartDate,
        persianEndDate,
        persianStartDate,
      } = getDateTexts(element.dataset);

      for (const elem of element.querySelectorAll(
        "[data-start-date-persian]"
      )) {
        elem.append(persianStartDate);
      }

      for (const elem of element.querySelectorAll("[data-end-date-persian]")) {
        elem.append(persianEndDate);
      }

      for (const elem of element.querySelectorAll(
        "[data-start-date-english]"
      )) {
        elem.append(englishStartDate);
      }

      for (const elem of element.querySelectorAll("[data-end-date-english]")) {
        elem.append(englishEndDate);
      }
    }
  );
}

function changeLanguageDateTimeline(lang) {
  for (const element of document.querySelectorAll("[data-start-date]")) {
    const { startDate, endDate } = element.dataset;

    const {
      englishEndDate,
      englishStartDate,
      persianEndDate,
      persianStartDate,
    } = getDateTexts(element.dataset);

    for (const elem of element.querySelectorAll("[data-start-date-timeline]")) {
      elem.innerText = lang === "en" ? englishStartDate : persianStartDate;
    }

    for (const elem of element.querySelectorAll("[data-end-date-timeline]")) {
      elem.innerText = lang === "en" ? englishEndDate : persianEndDate;
    }
  }
}

function getDateTexts(props) {
  const { startDate, endDate } = props;
  const persianStartDate = new Date(startDate)
    .toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
    })
    .split(" ")
    .reverse()
    .join(" ");

  const persianEndDate = new Date(endDate)
    .toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
    })
    .split(" ")
    .reverse()
    .join(" ");

  const englishStartDate = new Date(startDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const englishEndDate = new Date(endDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return { englishStartDate, englishEndDate, persianStartDate, persianEndDate };
}

// Add transition class to header
setTimeout(() => {
  Array.from(
    document.querySelectorAll(".main__header__persian, .main__header__english")
  ).forEach((elem) => {
    if (!elem.classList.contains("main__header__transition")) {
      elem.classList.add("main__header__transition");
    }
  });
}, 0);

function changeLanguageHeader(lang) {
  const englishHeader = document.querySelector(".main__header__english");
  const persianHeader = document.querySelector(".main__header__persian");

  const persianHeaderSize = persianHeader.firstElementChild.offsetWidth;

  if (lang === "en") {
    englishHeader.style.transform = `translateX(32px)`;
    persianHeader.style.transform = `translateX(${persianHeaderSize + 16}px)`;
    englishHeader.style.opacity = 1;
    persianHeader.style.opacity = 0;
  } else {
    englishHeader.style.transform = `translateX(-${englishHeader.offsetWidth}px)`;
    persianHeader.style.transform = `translateX(0)`;
    englishHeader.style.opacity = 0;
    persianHeader.style.opacity = 1;
  }
}
