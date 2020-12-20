paper.install(window);

const colors = [
    ['black', '#240038', '#440069', '#670295', '#B239FF'],
    ['black', '#12002F', '#2A005E', '#41008B', '#6800E7'],
    ['black', '#002A3A', '#025D84', '#0076A9', '#05B9EC'],
    ['black', '#001B18', '#01564D', '#1FA08E', '#02FAE0']
];
const pixelSize = 100;
let currentColor = 0;
let pixels;
let overlay;
let textContent = 'rc3Badge';
let dragging = false;
let templates;
let templatesJSON;
let indicator;

window.onload = function () {
    paper.setup('paperCanvas');

    //Helper Box on bottom left
    let helpButton = document.getElementById("helpbutton");
    let helpContent = document.getElementById("helpcontent");
    helpButton.onclick = function () {
        console.log('yo');
        helpContent.style.visibility = helpContent.style.visibility == 'visible' ? 'hidden' : 'visible';
        helpButton.innerHTML = helpButton.innerHTML == '?' ? 'Ok, thanks' : '?';
    }
}