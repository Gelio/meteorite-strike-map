var config = {
    width: 900,
    height: 600,
    mapDataUrl: './countries.geo.json',
    meteoriteDataUrl: './meteorite-strike-data.json',
    baseMapScale: 250,
    baseZoomScale: 0.5,
    zoomLimits: {
        min: 0.5,
        max: 10
    },
    meteoriteRadius: {
        min: 2,
        max: 15
    },
    meteoriteColors: ['blue', 'red', 'black']
};

module.exports = config;