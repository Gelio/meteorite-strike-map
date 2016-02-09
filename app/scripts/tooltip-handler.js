var d3 = require('d3');

var TooltipHandler = {
    init: init,
    displayTooltip: displayTooltip,
    hideTooltip: hideTooltip
};

module.exports = TooltipHandler;

function init() {
    this.tooltip = d3.select('.map-tooltip');
}

function displayTooltip(d) {
    console.log(this);
    this.tooltip.classed('visible', true);
    console.log('Displaying');
}

function hideTooltip() {
    this.tooltip.classed('visible', false);
    console.log('Hiding');
}