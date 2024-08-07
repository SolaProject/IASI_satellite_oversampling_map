import { evaluate_cmap_hex } from "../my_modules/js-colormap/js-colormaps"
import * as staInfo from "./data/site-total.json";


//加载基础图层
var ESRI = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    }
);

//pbf网格图层
var gridLayer_am = L.vectorGrid.protobuf(
    // 加载pbf文件
    'https://solaproject.github.io/mbtiles_test/col_am/{z}/{x}/{y}.pbf',
    {
        rendererFactory: L.canvas.tile,
        attribution: "© Sola",
        vectorTileLayerStyles: {
            col_am: function(properties) {
                return {
                    fill: true,
                    fillColor: evaluate_cmap_hex(Math.abs(properties.data)/700, "jet", false),
                    fillOpacity: 0.5,
                    stroke: false, //不显示网格边框线
                    weight: 0,
                }
            },
        },
        maxNativeZoom: 13,
        maxZoom: 22,
    },
);

var gridLayer_pm = L.vectorGrid.protobuf(
    // 加载pbf文件
    'https://solaproject.github.io/mbtiles_test/col_pm/{z}/{x}/{y}.pbf',
    {
        rendererFactory: L.canvas.tile,
        attribution: "© Sola",
        vectorTileLayerStyles: {
            col_pm: function(properties) {
                return {
                    fill: true,
                    fillColor: evaluate_cmap_hex(Math.abs(properties.data)/1000, "jet", false),
                    fillOpacity: 0.5,
                    stroke: false, //不显示网格边框线
                    weight: 0,
                }
            },
        },
        maxNativeZoom: 13,
        maxZoom: 22,
    },
);

var gridLayer_line = L.vectorGrid.protobuf(
    // 加载pbf文件
    'https://solaproject.github.io/mbtiles_test/line2d/{z}/{x}/{y}.pbf',
    {
        rendererFactory: L.canvas.tile,
        attribution: "© Sola",
        vectorTileLayerStyles: {
            line2d: {
                color:"black",
                weight:0.5
            },
        },
        maxNativeZoom: 13,
        maxZoom: 22,
        minZoom: 10,
    },
);

var station = L.geoJSON(
    staInfo,
    {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.index);
        }
    }
)

var osm_map = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

var gaode_map = L.tileLayer(
    'http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
)

var stamen_terrain = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png?api_key=3d191c7d-2281-44e1-bf79-352a0ca9f9c1',
    {
        attribution: "Map tiles by <a href='http://stamen.com/'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/4.0'>CC BY 4.0</a>. Data by <a href='http://openstreetmap.org/'>OpenStreetMap</a>, under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>."
    }
)

var Tianditu_map = L.tileLayer.chinaProvider('TianDiTu.Normal.Map');

var gaode_map = L.tileLayer.chinaProvider('GaoDe.Normal.Map');

var google_map = L.tileLayer.chinaProvider('Google.Normal.Map');

var tencent_map = L.tileLayer.chinaProvider('Tencent.Normal.Map');

const baseLayers = {
    "ESRI World Imagery": ESRI,
    "OpenStreetMap": osm_map,
    "StamenTerrain": stamen_terrain,
    "高德地图": gaode_map,
    "天地图": Tianditu_map,
    "谷歌地图": google_map,
};

const overlays = {
    "nh3_total_column_am": gridLayer_am,
    "nh3_total_column_pm": gridLayer_pm,
    "grid_line": gridLayer_line,
    "station": station,
};

//创建地图
const map = L.map('map', {
    center: [40.9828, 120.141],
    zoom: 5,
    layers: [ESRI, gridLayer_am, gridLayer_line, station]
});
const layerControl = L.control.layers(baseLayers, overlays).addTo(map);