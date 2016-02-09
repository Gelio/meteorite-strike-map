var d3 = require('d3');

var TooltipHandler = {
    init: init,
    displayTooltip: displayTooltip,
    hideTooltip: hideTooltip
};

module.exports = TooltipHandler;

function init() {
    this.tooltip = d3.select('.map-tooltip');
    this.dateFormat = d3.time.format("%Y-%m-%d");
}

function displayTooltip(d) {
    var meteorite = d.properties;
    this.tooltip.classed('visible', true);
    this.tooltip.select('.meteorite-name').text(meteorite.name);
    this.tooltip.select('.meteorite-mass').text(meteorite.mass);
    this.tooltip.select('.meteorite-year').text(this.dateFormat(meteorite.date));
    this.tooltip.select('.meteorite-reclong').text(meteorite.reclong);
    this.tooltip.select('.meteorite-reclat').text(meteorite.reclat);
    this.tooltip.select('.meteorite-recclass').text(meteorite.recclass);
}

function hideTooltip() {
    this.tooltip.classed('visible', false);
}