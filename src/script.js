let windowResizeTimeoutID;

const YEAR = 365 * 24 * 60 * 60 * 1000;

document.addEventListener("DOMContentLoaded", () => {
  initializeOnFontLoaded(document.documentElement.lang);

  // Determine what color scheme user wants
  // Listener on system preference
  // Adds transition class
  initializeColorScheme();

  // initialize the language settings
  initiateLangauage();

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
  animateTimeLines(document.documentElement.lang);

  // Resize listener for correction for lines connecting two of the circles in the timeline
  initilizeWindowResizeListener();

  // Populate hover elements with relevant content and add event listener on mouseenter
  initializeHoverInfoElements();
});

function initializeColorScheme() {
  const savedPreference = getColorSchemeFromLocalStorage();

  const isDarkMode = savedPreference
    ? savedPreference === "dark"
    : window.matchMedia &&
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

function getColorSchemeFromLocalStorage() {
  return localStorage.getItem("colorScheme");
}

function setColorSchemeToLocalStorage(colorScheme) {
  localStorage.setItem("colorScheme", colorScheme);
}

function changeColorScheme(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  } else if (!isDarkMode) {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }

  setColorSchemeToLocalStorage(isDarkMode ? "dark" : "light");
}

function initializeOnFontLoaded(lang) {
  document.fonts.onloadingdone = () => {
    // The sizes of english elements might be wrong and need recalculations
    handleEnglishAndPersianElementSizes(document.documentElement.lang);

    // Transition classes should be added after initialization is complete as to avoid undesired animations
    addTransitionClasses();
  };
}

function animateTimeLines(lang) {
  for (const element of document.querySelectorAll(".career__timeline")) {
    animateCareerTimeline(element, lang);
  }
}

function animateCareerTimeline(element, lang) {
  const relevantHeightElement = element
    .closest(".career__section")
    .querySelector(
      lang === "en" ? ".career__info__english" : ".career__info__farsi"
    );

  const timelineEnd = element.querySelector(".timeline__end");
  const timelineBegin = element.querySelector(".timeline__begin");

  const height = parseFloat(
    window.getComputedStyle(relevantHeightElement).height
  );

  const child = element.firstElementChild;

  if (!child.classList.contains("career__timeline__line__animate")) {
    timelineBegin.addEventListener(
      "transitionend",
      () => {
        child.classList.add("career__timeline__line__animate");
      },
      { once: true }
    );
  }

  child.style.height = `${height}px`;

  timelineBegin.style.transform = `translateY(${
    height - timelineEnd.clientHeight - timelineBegin.clientHeight
  }px)`;
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
    updateAriaForSwitches();
  });

  lightModeCheckbox.addEventListener("change", (e) => {
    const isDarkMode = !e.target.checked;

    changeColorScheme(isDarkMode);
    updateAriaForSwitches();
  });

  languageCheckbox.checked = document.documentElement.lang === "en";
  languageCheckbox.ariaLabel = "Language toggle";

  lightModeCheckbox.checked =
    document.documentElement.classList.contains("light");
  lightModeCheckbox.ariaLabel = "Color scheme toggle";

  updateAriaForSwitches();
}

function updateAriaForSwitches() {
  const languageCheckbox = document.querySelector("#languageCheckbox");
  const lightModeCheckbox = document.querySelector("#lightModeCheckbox");

  languageCheckbox.ariaPressed =
    document.documentElement.lang === "en" ? "English" : "Persian";

  lightModeCheckbox.ariaPressed = document.documentElement.classList.contains(
    "light"
  )
    ? "Light mode"
    : "Dark mode";
}

function initiateLangauage() {
  const languagePreference = getLangugageFromLocalStorage();

  if (languagePreference) {
    document.documentElement.lang = languagePreference;
  }

  const lang = document.documentElement.lang;

  changeLanguageMain(lang);
  changeLanguageHeader(lang);
  changeLanguageDateTimeline(lang);
}

function getLangugageFromLocalStorage() {
  return localStorage.getItem("language");
}

function setLanguageToLocalStorage(lang) {
  localStorage.setItem("language", lang);
}

function changeLanguage(lang) {
  changeLanguageOuterLayer(lang);
  changeLanguageMain(lang);
  changeLanguageHeader(lang);
  changeLanguageDateTimeline(lang);
  changeLanguageTitle(lang);
  changeTimelineHoverTexts(lang);
  changeBirthdayTexts(lang);

  animateTimeLines(lang);

  setLanguageToLocalStorage(lang);
}

function changeTimelineHoverTexts(lang) {
  for (const elem of document.querySelectorAll(
    ".career__timeline[data-hover-info]"
  )) {
    const { startDate, endDate } = elem.closest(".career__section").dataset;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const yearsAndMonths = ((end.getTime() - start.getTime()) / YEAR).toFixed(
      1
    ); // output should be like => 1.6 - 1.7

    const [year, month] = (
      lang === "en" ? yearsAndMonths : getPersianNumbers(yearsAndMonths)
    ).split(".");

    elem.dataset.hoverInfo =
      lang === "en"
        ? ` ${year} ${year === "1" ? "year" : "years"} and ${month} ${
            month === "1" ? "month" : "months"
          }`
        : `${year} سال و ${month} ماه`;
  }
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
        englishInfoSection.offsetWidth + 16
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

function getMainHeight(lang) {
  const main = document.querySelector("main");

  const headerElement = main.querySelector(
    lang === "en" ? ".main__header__english" : ".main__header__persian"
  );
  const headerComputedStyles = window.getComputedStyle(headerElement);

  // header height
  const headerHeight =
    headerElement.offsetHeight + parseFloat(headerComputedStyles.marginTop);

  // common margin between header and first job
  const headerMarginBottom = parseFloat(headerComputedStyles.marginBottom);
  const firstCareerSection = main.querySelector(".career__section");
  const firstCareerSectionStyles = window.getComputedStyle(firstCareerSection);
  const headerAndFirstJobCommonMargin = Math.max(
    headerMarginBottom,
    parseFloat(firstCareerSectionStyles.marginTop)
  );

  // Sum of all jobs heights
  const jobs = Array.from(document.querySelectorAll(".career__section"));
  const sumOfJobsHeight = jobs.reduce((result, job, i) => {
    const element = job.querySelector(
      lang === "en" ? ".career__info__english" : ".career__info__farsi"
    );
    const jobStyles = window.getComputedStyle(element);
    const jobHeight = element.offsetHeight;

    const nextJob = jobs.at(i + 1);
    let commonMargin = 0;
    if (nextJob !== undefined) {
      const nextJobElementStyles = window.getComputedStyle(nextJob);

      commonMargin = Math.max(
        parseFloat(jobStyles.marginBottom),
        parseFloat(nextJobElementStyles.marginTop)
      );
    }

    return result + jobHeight + commonMargin;
  }, 0);

  return headerHeight + headerAndFirstJobCommonMargin + sumOfJobsHeight + 40;
}

function updateDateTexts() {
  for (const element of document.querySelectorAll("[data-start-date]")) {
    const {
      englishEndDate,
      englishStartDate,
      persianEndDate,
      persianStartDate,
    } = getDateTexts(element.dataset);

    for (const elem of element.querySelectorAll("[data-start-date-persian]")) {
      elem.append(persianStartDate);
    }

    for (const elem of element.querySelectorAll("[data-end-date-persian]")) {
      elem.append(persianEndDate);
    }

    for (const elem of element.querySelectorAll("[data-start-date-english]")) {
      elem.append(englishStartDate);
    }

    for (const elem of element.querySelectorAll("[data-end-date-english]")) {
      elem.append(englishEndDate);
    }
  }
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
    englishHeader.style.transform = `translateX(16px)`;
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

  for (const elem of document.querySelectorAll(".timeline__begin")) {
    elem.classList.add("timeline__begin__animation");
  }

  for (const elem of document.querySelectorAll(".page__controls")) {
    elem.classList.add("page__control__transition");
  }
}

function removeTransitionClasses() {
  for (const elem of document.querySelectorAll(
    ".personal__wrapper__transition, .career__info__transition, .main__header__transition, .main__wrapper__transition, .timeline__language__transition, .timeline__begin__animation, .page__control__transition"
  )) {
    elem.classList.remove(
      "personal__wrapper__transition",
      "career__info__transition",
      "main__header__transition",
      "main__wrapper__transition",
      "timeline__language__transition",
      "timeline__begin__animation",
      "page__control__transition"
    );
  }
}

function handleEnglishAndPersianElementSizes(lang) {
  const infoFarsi = document.querySelector("#info-farsi");
  const infoEnglish = document.querySelector("#info-english");

  infoEnglish.style.width = `${infoFarsi.offsetWidth}px`;
  infoEnglish.style.left = `-${infoFarsi.offsetWidth}px`;

  animateTimeLines(document.documentElement.lang);

  const mainHeight = getMaxMainHeight();
  const main = document.querySelector("main");
  main.style.minHeight = mainHeight + "px";

  changeLanguage(lang);
}

function getMaxMainHeight() {
  const enMainHeight = getMainHeight("en");
  const faMainHeight = getMainHeight("fa");

  return Math.max(enMainHeight, faMainHeight);
}

function changeLanguageTitle(lang) {
  if (lang === "fa") {
    document.title = "محسن افشاری";
  } else {
    document.title = "Mohsen Afshari";
  }
}

function initializeHoverInfoElements() {
  const infoElement = document.querySelector(".page__item__info");
  infoElement.hidden = true;

  document.addEventListener("mousemove", (e) => {
    e.clientX;
    e.clientY;

    infoElement.style.top = e.clientY + 20 + "px";
    infoElement.style.left = e.clientX + 10 + "px";
  });

  for (const element of document.querySelectorAll("[data-hover-info]")) {
    element.addEventListener("mouseenter", (e) => {
      const text = element.dataset.hoverInfo;

      infoElement.hidden = false;
      infoElement.innerText = text;
    });

    element.addEventListener("mouseleave", (e) => {
      infoElement.hidden = true;
    });
  }
}

function changeBirthdayTexts(lang) {
  for (const element of document.querySelectorAll("[data-birthday]")) {
    const birthday = new Date(element.dataset.birthday);
    const now = Date.now();

    const difference = Math.trunc((now - birthday) / YEAR);

    element.dataset.hoverInfo =
      lang === "en"
        ? `${difference} years old`
        : `${getPersianNumbers(difference.toString())} ساله هستم`;
  }
}

function getPersianNumbers(xxx) {
  return xxx.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}
