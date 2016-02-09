var config = require('./config.js'),
    d3 = require('d3');


var Map = {
    prepareSVG: prepareSVG,
    prepareProjections: prepareProjections,
    loadResources: loadResources,
    processResources: processResources,
    drawMap: drawMap,
    displayError: displayError
};

module.exports = Map;

function prepareSVG() {
    this.map = d3.select('.map')
        .attr('width', config.width)
        .attr('height', config.height);
}

function prepareProjections() {
    this.path = d3.geo.path();
    this.projection = d3.geo.mercator().
        scale(config.baseScale);
    this.path.projection(this.projection);
}

function loadResources() {
    return new Promise((function(resolve, reject) {
        // Load countries data (whole map)
        d3.json(config.mapDataUrl, (function(err, countriesData) {
            if(err)
                return reject(err);

            this.countriesData = countriesData;

            // Load meteorite data
            d3.json(config.meteoriteDataUrl, (function(err, meteoriteData) {
                if(err)
                    return reject(err);

                this.meteoriteData = meteoriteData;
                this.processResources();
                resolve();
            }).bind(this))
        }).bind(this));
    }).bind(this));
}

function processResources() {
    // Delete features without geometries
    this.meteoriteData.features = this.meteoriteData.features.filter(function(feature) {
        return feature.geometry;
    });
}

function drawMap() {
    var projection = this.projection;
    this.countriesGroup = this.map.append('g');

    this.countriesGroup.selectAll('path')
        .data(this.countriesData.features)
        .enter()
        .append('path')
        .attr('d', this.path);

    this.meteoritesGroup = this.map.append('g');
    this.meteoritesGroup.selectAll('path')
        .data(this.meteoriteData.features)
        .enter()
        .append('circle')
        .attr('cx', function(d) { console.log(d); return projection(d.geometry.coordinates)[0]; })
        .attr('cy', function(d) { return projection(d.geometry.coordinates)[1]; })
        .attr('r', '2');
}

function displayError(err) {
    console.error('There\'s been an error while downloading data', err);
    d3.select('.map-wrapper')
        .html('<div class="alert alert-warning">There\'s been an error while downloading data. Please, try again later.</div>');
}