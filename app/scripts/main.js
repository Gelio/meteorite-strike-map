var config = require('./config.js'),
    map = require('./map.js');


window.addEventListener('load', init);

function init() {
    map.prepareSVG();
    map.prepareProjections();
    map.loadResources()
        .then(map.drawMap.bind(map), map.displayError.bind(map));
}