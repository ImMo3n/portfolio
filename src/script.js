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
      const element = document.querySelector(`#${id}`);
      if (element === null) {
        return;
      }

      element.appendChild(svg);

      if (!element.classList.contains("loading")) {
        return;
      }

      element.classList.remove("loading");
    }
  }, 10);
}
