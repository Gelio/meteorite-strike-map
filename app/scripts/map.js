var config = require('./config.js'),
    d3 = require('d3'),
    userInput = require('./user-input.js');


var Map = {
    prepareSVG: prepareSVG,
    prepareProjections: prepareProjections,
    loadResources: loadResources,
    processResources: processResources,
    drawMap: drawMap,
    updateMap: updateMap,
    displayError: displayError,
    addUserInput: addUserInput,
    addZoom: addZoom
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
    this.wholeMapGroup = this.map.append('g');

    this.countriesGroup = this.wholeMapGroup.append('g');
    this.countriesGroup.selectAll('path')
        .data(this.countriesData.features)
        .enter()
        .append('path')
        .attr('d', this.path);

    this.meteoritesGroup = this.wholeMapGroup.append('g');
    this.meteoritesGroup.selectAll('circle')
        .data(this.meteoriteData.features)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return projection(d.geometry.coordinates)[0]; })
        .attr('cy', function(d) { return projection(d.geometry.coordinates)[1]; })
        .attr('r', '2');

    this.addUserInput();
    this.addZoom();
}

function updateMap() {
    /*
    var projection = this.projection;
    this.countriesGroup.selectAll('path')
        .attr('d', this.path);

    this.meteoritesGroup.selectAll('circle')
        .attr('cx', function(d) { return projection(d.geometry.coordinates)[0]; })
        .attr('cy', function(d) { return projection(d.geometry.coordinates)[1]; })
    */
    this.wholeMapGroup.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    console.log('Updating');
}

function displayError(err) {
    console.error('There\'s been an error while downloading data', err);
    d3.select('.map-wrapper')
        .html('<div class="alert alert-warning">There\'s been an error while downloading data. Please, try again later.</div>');
}

function addUserInput() {
    this.userInput = Object.create(userInput);
}

function addZoom() {
    console.log('Adding zoom');
    this.zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on('zoom', this.updateMap.bind(this));

    this.map.append('rect')
        .attr('class', 'overlay')
        .attr('width', config.width)
        .attr('height', config.height)
        .call(this.zoom);
}