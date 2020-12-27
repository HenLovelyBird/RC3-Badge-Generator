paper.install(window);

const colors = [
  ["black", "white"],
  ["black", "#240038", "#440069", "#670295", "#B239FF"],
  ["black", "#12002F", "#2A005E", "#41008B", "#6800E7"],
  ["black", "#002A3A", "#025D84", "#0076A9", "#05B9EC"],
  ["black", "#001B18", "#01564D", "#1FA08E", "#02FAE0"],
];
const pixelSize = 100;
let currentColor = 0;
let pixels;
let overlay;
let textContent = "ASSEMBLY XXXXXXX";
let dragging = false;
let templates;
let templatesJSON;
let indicator;

//write templates with only white pixels
//populate the canvas foreground with those templates on selction
//give the ability to write in various shades of white, their own design

//when clicking the colored pixels, set background rect in that color

// change font size so more can fit for assemblies

window.onload = function () {
  paper.setup("paperCanvas");

  //Helper Box on bottom left
  let helpButton = document.getElementById("helpbutton");
  let helpContent = document.getElementById("helpcontent");
  helpButton.onclick = function () {
    console.log("yo");
    helpContent.style.visibility =
      helpContent.style.visibility == "visible" ? "hidden" : "visible";
    helpButton.innerHTML = helpButton.innerHTML == "?" ? "Ok, thanks" : "?";
  };

  //generation process
  //   initPixels();
  //   simplexPixels();
  setText("ASSEMBLY X");

  view.onClick = function (event) {
    simplexPixels();
  };
  view.onMouseUp = function (event) {
    dragging = false;
  };

  templates = document.getElementById("templates");

  loadTemplates();

  generateOverlay();
};

//load templates from json
function loadTemplates() {
  let url = window.location.href + "/templates.json";

  fetch(url)
    .then((res) => res.json())
    .then((out) => {
      out.forEach(function (temp, idx) {
        let template = document.createElement("div");
        template.classList.add("template");
        template.addEventListener("click", function (event) {
          templatePixels(idx);
        });
        for (let y = 0; y < 6; y++) {
          for (let x = 0; x < 6; x++) {
            let pixel = document.createElement("div");
            pixel.style.backgroundColor = colors[currentColor][temp.data[y][x]];
            pixel.classList.add("pixel");
            template.appendChild(pixel);
          }
        }

        templates.appendChild(template);
      });

      templatesJSON = out;
    })
    .catch((err) => {
      throw err;
    });
}

//Set one of 8 giant background pixel colors via radio buttons
function setColor(colNr) {
  currentColor = colNr;

  pixels.children.forEach((pixel) => {
    pixel.tweenTo(
      { fillColor: colors[currentColor][pixel.colStep] },
      { duration: _.random(200, 1000) }
    );
  });
}

//generate text
function setText(text) {
  opentype.load("Orbitron-Black.ttf", function (err, font) {
    if (err) {
      console.log(err.toString());
      return;
    }

    //remove old text if it exists
    // TODO remove the previous text without doing this random indec deletion
    if (overlay.children[2]) {
      overlay.children[2].remove();
      overlay.removeChildren(2);
    }
    console.log(overlay.children);

    //prepare text input
    textContent = text;
    text = text.substr(0, 16).toUpperCase();
    text = text.split("").reverse().join("");

    //iterate through letters and set in grid
    let allLetters = new Group();
    for (let i = 0; i < text.length; i++) {
      let fontPath = font.getPath(text[i], 0, 0, 60);
      let paperPath = paper.project.importSVG(fontPath.toSVG());
      let glyphOffset = paperPath.bounds.bottomCenter.y;
      paperPath.fillColor = "white";
      paperPath.strokeColor = null;
      let letterSpacing = 50;
      let maxLineLength = 12;
      paperPath.bounds.bottomCenter = new Point(
        100 + (maxLineLength - (i % maxLineLength)) * letterSpacing,
        100,
        100 + (maxLineLength - Math.floor(i / maxLineLength)) * letterSpacing,
        100
      );
      paperPath.position.y += glyphOffset;
      if (i >= maxLineLength) {
        //special case for umlauts
        let letterBelow = allLetters.children[i - maxLineLength];
        if (
          letterBelow._class == "CompoundPath" &&
          letterBelow.intersects(paperPath)
        ) {
          letterBelow.children
            .filter(
              (path) => path.position.y - letterBelow.bounds.topLeft.y < 25
            )
            .forEach((path) => path.scale(1.2).translate([-1, 0]));
          let tmp = paperPath.subtract(letterBelow);
          tmp.fillColor = "white";
          paperPath.remove();
          paperPath = tmp;
          letterBelow.children
            .filter(
              (path) => path.position.y - letterBelow.bounds.topLeft.y < 25
            )
            .forEach((path) => path.remove());
        }
      }
      allLetters.addChild(paperPath);
    }

    allLetters.bounds.bottomRight = overlay.firstChild.bounds.bottomRight.subtract(
      [25, 25]
    );
    overlay.addChild(allLetters);
  });
}

//generate white box
function generateOverlay() {
  //   if (overlay) {
  //     overlay.removeChildren();
  //   }
  overlay = new Group();

  let bgRect = new Path.Rectangle(
    [200 + pixelSize * 1, 200 + pixelSize * 1],
    [pixelSize * 6, pixelSize * 6]
  );
  bgRect.fillColor = "#b239ff";
  overlay.addChild(bgRect);

  let lineRect = new Path.Rectangle([200, 200], [pixelSize * 6, pixelSize * 6]);
  lineRect.strokeWidth = 6;
  lineRect.strokeColor = "white";
  overlay.addChild(lineRect);

  overlay.position = project.view.bounds.center.add([
    -pixelSize / 2,
    -pixelSize / 2,
  ]);

  overlay.onClick = function (event) {
    event.stop();
  };

  overlay.onMouseDrag = function (event) {
    overlay.position.x += event.delta.x;
    overlay.position.x = clampValue(
      overlay.position.x,
      project.view.bounds.center.x - pixelSize / 4,
      project.view.bounds.center.x + pixelSize / 4
    );
    overlay.position.y += event.delta.y;
    overlay.position.y = clampValue(
      overlay.position.y,
      project.view.bounds.center.y - pixelSize / 4,
      project.view.bounds.center.y + pixelSize / 4
    );

    pixels.position.x -= event.delta.x / 2;
    pixels.position.x = clampValue(
      pixels.position.x,
      project.view.bounds.center.x - pixelSize / 4,
      project.view.bounds.center.x + pixelSize / 4
    );
    pixels.position.y -= event.delta.y / 2;
    pixels.position.y = clampValue(
      pixels.position.y,
      project.view.bounds.center.y - pixelSize / 4,
      project.view.bounds.center.y + pixelSize / 4
    );

    event.stop();
    dragging = true;
  };
}

//create pixel paths
function initPixels() {
  indicator = new Path.Rectangle([0, 0], [pixelSize, pixelSize]);
  indicator.strokeWidth = 3;
  indicator.strokeCap = "round";
  indicator.dashArray = [4, 10];

  //   let bgRect = new Path.Rectangle([200, 200], [pixelSize * 6, pixelSize * 6]);
  //   bgRect.fillColor = "#b239ff";

  pixels = new Group();
  //   pixels.addChild(bgRect);

  _.range(6 * 6).forEach(function (_val, idx) {
    let x = idx % 6;
    let y = Math.floor(idx / 6);
    let rect = new Path.Rectangle(
      [pixelSize * x + 200, pixelSize * y + 200],
      [pixelSize, pixelSize]
    );
    rect.fillColor = colors[currentColor][0];
    rect.applyMatrix = false;
    rect.scaling = 1.01;
    rect.colStep = 0;
    rect.strokeWidth = 3;
    rect.strokeCap = "round";
    rect.dashArray = [4, 10];
    rect.onClick = function (event) {
      event.stop();
      this.colStep = (this.colStep + 1) % 5;
      this.tweenTo(
        { fillColor: colors[currentColor][this.colStep] },
        { duration: _.random(0, 200) }
      );
    };
    rect.onMouseEnter = function (event) {
      if (!dragging) {
        indicator.strokeColor = "lightgrey";
        indicator.position = this.position;
      }
    };
    rect.onMouseLeave = function (event) {
      indicator.strokeColor = undefined;
    };
    pixels.addChild(rect);
  });

  pixels.position = project.view.bounds.center;
  pixels.sendToBack();
}

//generate pixel grid using simplex noise
function simplexPixels() {
  let simplex = new SimplexNoise();
  let values = [];

  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 6; y++) {
      values.push(simplex.noise2D(x / 10, y / 10));
    }
  }

  //scale noise to complete range
  let min = _.min(values),
    max = _.max(values);

  let strechedValues = values.map((value) =>
    translateValue(value, min, max, -1, 1)
  );
  strechedValues = strechedValues.map((val) =>
    val < 0 ? 0 : Math.ceil(val / 0.25)
  );

  strechedValues.forEach(function (val, idx) {
    pixels.children[idx].scale(
      (pixelSize * 1.01) / pixels.children[idx].bounds.width
    );
    pixels.children[idx].fillColor = colors[currentColor][val];
    pixels.children[idx].colStep = val;
    pixels.children[idx].tweenFrom(
      { scaling: 0.0001 },
      { duration: _.random(0, 200) + val * 200 }
    );
  });
}

//color pixels based on template
function templatePixels(id) {
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      let val = templatesJSON[id].data[y][x];
      let idx = 6 * y + x;
      pixels.children[idx].scale(
        (pixelSize * 1.01) / pixels.children[idx].bounds.width
      );
      pixels.children[idx].fillColor = colors[currentColor][val];
      pixels.children[idx].colStep = val;
      pixels.children[idx].tweenFrom(
        { scaling: 0.0001 },
        { duration: _.random(0, 200) + val * 200 }
      );
    }
  }
}

function clampValue(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

function translateValue(value, leftMin, leftMax, rightMin, rightMax) {
  leftSpan = leftMax - leftMin;
  rightSpan = rightMax - rightMin;

  return rightMin + ((value - leftMin) / leftSpan) * rightSpan;
}

function removeBlackPixels() {
  pixels.children
    .filter((pixel) => pixel.colStep == 0)
    .forEach((pixel) => (pixel.fillColor = null));
}

function restoreBlackPixels() {
  pixels.children
    .filter((pixel) => pixel.fillColor == null)
    .forEach((pixel) => (pixel.fillColor = "black"));
}

//let user download canvas content as SVG
function downloadSVG() {
  removeBlackPixels();
  project.view.update();
  var svg = project.exportSVG({ asString: true, bounds: "content" });
  var svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = textContent + ".svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  restoreBlackPixels();
}

//let user download canvas content as PNG
function downloadPNG() {
  removeBlackPixels();
  project.view.update();
  var canvas = document.getElementById("paperCanvas");
  var downloadLink = document.createElement("a");
  downloadLink.href = canvas.toDataURL("image/png;base64");
  downloadLink.download = textContent + ".png";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  restoreBlackPixels();
}
