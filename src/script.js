const isLoaded = { current: false };
let windowResizeTimeoutID;

document.addEventListener("DOMContentLoaded", () => {
  isLoaded.current = true;

  initializeOnFontLoaded();

  // Determine what color scheme user wants
  // Listener on system preference
  // Adds transition class
  initializeColorScheme();

  // initialize the language settings
  initiateLangauage(document.documentElement.lang);

  // update switches for english/persian and light/dark mode
  // And define change listeners on them
  initializeSwitches();

  // Substitute start/end date with text
  updateDateTexts();

  // Populate svgs that will clutter up the HTML if placed directly
  populateSVGs();

  // Remove .loading class if the images are loaded if not add listener to remove it
  imgLoaderListener();

  // Animation for line connecting two of the circles in the timeline
  animateTimeLines();

  // Resize listener for correction for lines connecting two of the circles in the timeline
  initilizeWindowResizeListener();
});

function initializeColorScheme() {
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  changeColorScheme(isDarkMode);

  document.documentElement.addEventListener(
    "transitionend",
    () => {
      document.documentElement.classList.add("color__transition");
    },
    { once: true }
  );

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      changeColorScheme(event.matches);
    });
}

function changeColorScheme(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  } else if (!isDarkMode) {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }
}

function initializeOnFontLoaded() {
  document.fonts.onloadingdone = () => {
    for (const element of document.querySelectorAll(".career__timeline")) {
      animateCareerTimeline(element);

      const beginElement = document.querySelector(".timeline__begin");

      // after the initial animation I need to remove the transition class so that it stops the transition when window resizes
      beginElement.addEventListener(
        "transitionend",
        () => {
          beginElement.classList.remove("timeline__begin__animation");
        },
        { once: true }
      );
    }

    // The sizes of english elements might be wrong and need recalculations
    handleEnglishAndPersianElementSizes(document.documentElement.lang);

    // Transition classes should be added after initialization is complete as to avoid undesired animations
    addTransitionClasses();
  };
}

function animateTimeLines() {
  for (const element of document.querySelectorAll(".career__timeline")) {
    animateCareerTimeline(element);
  }
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
  const svgAndElements = Array.from(
    document.querySelectorAll("[data-svg-url]")
  ).reduce((result, elem) => {
    const svgUrl = elem.dataset.svgUrl;

    if (svgUrl === undefined) {
      console.error(`element: ${elem}`);
      throw new Error("Url of the element not found");
    }

    if (result[svgUrl] === undefined) {
      result[svgUrl] = [elem];
    } else {
      result[svgUrl].push(elem);
    }

    return result;
  }, {});

  for (const url in svgAndElements) {
    fetchSVG(url).then((svg) => {
      svgAndElements[url].forEach((element) => {
        element.append(svg.cloneNode(true));
        element.classList.remove("loading");
      });
    });
  }
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

function initilizeWindowResizeListener() {
  window.addEventListener("resize", () => {
    if (!windowResizeTimeoutID) {
      removeTransitionClasses();
    } else {
      clearTimeout(windowResizeTimeoutID);
    }

    for (const element of document.querySelectorAll(".career__timeline")) {
      animateCareerTimeline(element);
    }

    handleEnglishAndPersianElementSizes(document.documentElement.lang);

    windowResizeTimeoutID = setTimeout(() => {
      addTransitionClasses();
      windowResizeTimeoutID = undefined;
    }, 300);
  });
}

function initializeSwitches() {
  const languageCheckbox = document.querySelector("#languageCheckbox");
  const lightModeCheckbox = document.querySelector("#lightModeCheckbox");

  languageCheckbox.addEventListener("change", (e) => {
    const isEnglish = e.target.checked;

    changeLanguage(isEnglish ? "en" : "fa");
  });

  lightModeCheckbox.addEventListener("change", (e) => {
    const isDarkMode = !e.target.checked;

    changeColorScheme(isDarkMode);
  });

  languageCheckbox.checked = document.documentElement.lang === "en";

  lightModeCheckbox.checked =
    document.documentElement.classList.contains("light");
}

function initiateLangauage(lang) {
  const farsiElement = document.querySelector("#info-farsi");
  const englishElement = document.querySelector("#info-english");

  // Why not make both the Fa and En elements absolute
  // Because I lose the dynamic sizing of the main element
  // I want Fa to be not absolute so it can take some space from main element
  englishElement.style.position = "absolute";
  englishElement.style.height = "100%";
  englishElement.style.opacity = 0;
  englishElement.style.width = `${farsiElement.offsetWidth}px`;
  englishElement.style.left = `-${farsiElement.offsetWidth - 16}px`; // take out one margin

  changeLanguageMain(lang);
  changeLanguageHeader(lang);
  changeLanguageDateTimeline(lang);
}

function changeLanguage(lang) {
  changeLanguageOuterLayer(lang);
  changeLanguageMain(lang);
  changeLanguageHeader(lang);
  changeLanguageDateTimeline(lang);
  changeLanguageTitle(lang);
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

    englishInfoSection.style.width = persianInfoSection.offsetWidth + "px";

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

function getMainHeight() {
  const main = document.querySelector("main");

  const persianHeaderElement = main.querySelector(".main__header__persian");
  const englishHeaderElement = main.querySelector(".main__header__english");

  const persianHeaderComputedStyles =
    window.getComputedStyle(persianHeaderElement);
  const englishHeaderComputedStyles =
    window.getComputedStyle(englishHeaderElement);

  const headerMarginBottom = Math.max(
    parseFloat(persianHeaderComputedStyles.marginBottom),
    parseFloat(englishHeaderComputedStyles.marginBottom)
  );

  // header height
  const headerHeight = Math.max(
    persianHeaderElement.offsetHeight +
      parseFloat(persianHeaderComputedStyles.marginTop),
    englishHeaderElement.offsetHeight +
      parseFloat(englishHeaderComputedStyles.marginTop)
  );

  // common margin between header and first job
  const firstCareerSection = main.querySelector(".career__section");
  const firstCareerSectionStyles = window.getComputedStyle(firstCareerSection);
  const headerAndFirstJobCommonMargin = Math.max(
    headerMarginBottom,
    parseFloat(firstCareerSectionStyles.marginBottom)
  );

  // Sum of all jobs heights
  const jobs = Array.from(document.querySelectorAll(".career__section"));
  const sumOfJobsHeight = jobs.reduce((result, job, i) => {
    const farsiElement = job.querySelector(".career__info__farsi");
    const farsiElementStyles = getComputedStyle(
      farsiElement.closest(".career__section")
    );

    const englishElement = job.querySelector(".career__info__english");
    const englishElementStyles = getComputedStyle(
      englishElement.closest(".career__section")
    );

    const farsiEnglishElementHeight = Math.max(
      farsiElement.offsetHeight,
      englishElement.offsetHeight
    );

    const nextJob = jobs.at(i + 1);
    let commonMargin = 0;
    if (nextJob !== undefined) {
      const nextJobFarsiElement = nextJob
        .querySelector(".career__info__farsi")
        .closest(".career__section");

      const nextJobEnglishElement = nextJob
        .querySelector(".career__info__english")
        .closest(".career__section");

      const nextJobFarsiElementStyles =
        window.getComputedStyle(nextJobFarsiElement);
      const nextJobEnglishElementStyles = window.getComputedStyle(
        nextJobEnglishElement
      );

      commonMargin = Math.max(
        Math.max(
          parseFloat(nextJobFarsiElementStyles.marginTop),
          parseFloat(farsiElementStyles.marginBottom)
        ),
        Math.max(
          parseFloat(nextJobEnglishElementStyles.marginTop),
          parseFloat(englishElementStyles.marginBottom)
        )
      );
    }

    return result + farsiEnglishElementHeight + commonMargin;
  }, 0);

  return headerHeight + headerAndFirstJobCommonMargin + sumOfJobsHeight + 128;
}

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

function addTransitionClasses() {
  document
    .querySelector(".main__wrapper")
    .classList.add("main__wrapper__transition");

  for (const elem of document.querySelectorAll(".personal__wrapper")) {
    elem.classList.add("personal__wrapper__transition");
  }

  for (const elem of document.querySelectorAll(".career__section")) {
    const persianInfoSection = elem.querySelector(".career__info__farsi");
    const englishInfoSection = elem.querySelector(".career__info__english");

    persianInfoSection.classList.add("career__info__transition");
    englishInfoSection.classList.add("career__info__transition");
  }

  for (const elem of document.querySelectorAll(
    ".main__header__persian, .main__header__english"
  )) {
    elem.classList.add("main__header__transition");
  }

  for (const elem of document.querySelectorAll(".career__timeline")) {
    elem.classList.add("timeline__language__transition");
  }
}

function removeTransitionClasses() {
  for (const elem of document.querySelectorAll(
    ".personal__wrapper__transition, .career__info__transition, .main__header__transition, .main__wrapper__transition, .timeline__language__transition"
  )) {
    elem.classList.remove(
      "personal__wrapper__transition",
      "career__info__transition",
      "main__header__transition",
      "main__wrapper__transition",
      "timeline__language__transition"
    );
  }
}

function handleEnglishAndPersianElementSizes(lang) {
  const infoFarsi = document.querySelector("#info-farsi");
  const infoEnglish = document.querySelector("#info-english");
  infoEnglish.style.width = `${infoFarsi.offsetWidth}px`;
  infoEnglish.style.left = `-${infoFarsi.offsetWidth - 16}px`; // take out one margin

  changeLanguage(lang);

  const mainHeight = getMainHeight();
  console.log(mainHeight);

  const main = document.querySelector("main");
  main.style.minHeight = mainHeight + "px";
}

function changeLanguageTitle(lang) {
  if (lang === "fa") {
    document.title = "محسن افشاری";
  } else {
    document.title = "Mohsen Afshari";
  }
}
