var config = require('./config.js'),
    tooltipHandler = require('./tooltip-handler.js'),
    d3 = require('d3');


var Map = {
    prepareSVG: prepareSVG,
    prepareProjections: prepareProjections,
    loadResources: loadResources,
    processResources: processResources,
    drawMap: drawMap,
    updateMap: updateMap,
    displayError: displayError,
    addZoom: addZoom,
    computeMeteoriteScale: computeMeteoriteScale
};

module.exports = Map;

function prepareSVG() {
    this.map = d3.select('.map')
        .attr('width', config.width)
        .attr('height', config.height);

    this.tooltipHandler = tooltipHandler;
    this.tooltipHandler.init();
}

function prepareProjections() {
    this.path = d3.geo.path();
    this.projection = d3.geo.mercator().
        scale(config.baseMapScale);
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

    this.meteoriteData.features = this.meteoriteData.features.map(function(feature) {
        feature.properties.date = new Date(feature.properties.year);
        return feature;
    });

    this.computeMeteoriteScale();
}

function drawMap() {
    var projection = this.projection;
    this.wholeMapGroup = this.map.append('g');

    this.countriesGroup = this.wholeMapGroup.append('g');
    this.countriesGroup.selectAll('path')
        .data(this.countriesData.features)
        .enter()
        .append('path')
        .attr('class', 'country-path')
        .attr('d', this.path);

    this.meteoritesGroup = this.wholeMapGroup.append('g');
    this.meteoritesGroup.selectAll('circle')
        .data(this.meteoriteData.features)
        .enter()
        .append('circle')
        .attr('class', 'meteorite')
        .attr('cx', function(d) { return projection(d.geometry.coordinates)[0]; })
        .attr('cy', function(d) { return projection(d.geometry.coordinates)[1]; })
        .attr('r', (function(d) { return this.meteoriteScale(d.properties.mass); }).bind(this))
        .style('fill', (function(d, i) { return config.meteoriteColors[i % config.meteoriteColors.length]; }))
        .on('mouseover', this.tooltipHandler.displayTooltip.bind(this.tooltipHandler))
        .on('mouseout', this.tooltipHandler.hideTooltip.bind(this.tooltipHandler));

    this.addZoom();
    this.zoom.event(this.wholeMapGroup);
}

function updateMap() {
    // Transform map
    this.wholeMapGroup.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

    // Change borders
    this.wholeMapGroup.selectAll('.country-path').style('stroke-width', 1 / d3.event.scale + 'px');

    // Change meteorites (disabled, because we zoom not with projection, but by scaling an svg element)
    //this.wholeMapGroup.selectAll('.meteorite').attr('r', (function(d) { return this.meteoriteScale(d.properties.mass) / d3.event.scale + 'px'; }).bind(this));
}

function displayError(err) {
    console.error('There\'s been an error while downloading data', err);
    d3.select('.map-wrapper')
        .html('<div class="alert alert-warning">There\'s been an error while downloading data. Please, try again later.</div>');
}

function addZoom() {
    this.zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(config.baseZoomScale)
        .scaleExtent([config.zoomLimits.min, config.zoomLimits.max])
        .size([config.width, config.height])
        .translate([200, 100])
        .on('zoom', this.updateMap.bind(this));

    this.map.call(this.zoom);
}

function computeMeteoriteScale() {
    this.meteoriteScale = d3.scale.linear()
        .range([config.meteoriteRadius.min, config.meteoriteRadius.max])
        .domain([
            d3.min(this.meteoriteData.features, function(d) { return Number(d.properties.mass); }),
            d3.max(this.meteoriteData.features, function(d) { return Number(d.properties.mass); })
        ]);
}