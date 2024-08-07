import { evaluate_cmap_hex } from "../my_modules/js-colormap/js-colormaps"
import * as staInfo from "./data/site-total.json";

const cmap = "jet"
const reverse = false

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
        interactive: true,
        getFeatureId: function(feature) {
            return feature.properties.id;
        },
        vectorTileLayerStyles: {
            col_am: function(properties) {
                return {
                    fill: true,
                    fillColor: evaluate_cmap_hex(Math.abs(properties.data)/1000, cmap, reverse),
                    fillOpacity: 0.5,
                    stroke: false, //不显示网格边框线
                    weight: 0,
                }
            },
        },
        maxNativeZoom: 13,
        maxZoom: 22,
        // minZoom: 7,
    },
);

var gridLayer_pm = L.vectorGrid.protobuf(
    // 加载pbf文件
    'https://solaproject.github.io/mbtiles_test/col_pm/{z}/{x}/{y}.pbf',
    {
        rendererFactory: L.canvas.tile,
        attribution: "© Sola",
        interactive: true,
        getFeatureId: function(feature) {
            return feature.properties.id;
        },
        vectorTileLayerStyles: {
            col_pm: function(properties) {
                return {
                    fill: true,
                    fillColor: evaluate_cmap_hex(Math.abs(properties.data)/1000, cmap, reverse),
                    fillOpacity: 0.5,
                    stroke: false, //不显示网格边框线
                    weight: 0,
                }
            },
        },
        maxNativeZoom: 13,
        maxZoom: 22,
        // minZoom: 7,
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
            var index = String(feature.properties.index)
            var lon = feature.properties.longitude.toFixed(3)
            var lat = feature.properties.latitude.toFixed(3)
            layer.bindPopup(
                `
                <table>
                <tbody>
                    <tr>
                    <td><b>Station ID: </b></td>
                    <td>${index}</td>
                    </tr>
                    <tr>
                    <td><b>Longitude: </b></td>
                    <td>${lon}</td>
                    </tr>
                    <td><b>Latitude: </b></td>
                    <td>${lat}</td>
                    </tr>
                </tbody>
                </table>
                `
            );
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
    zoom: 7,
    layers: [ESRI, gridLayer_am, gridLayer_line, station]
});
//鼠标悬浮显示网格信息
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = '<b>Data indicators</b>' + '<br />' +
        (props ? '氨气柱浓度: ' + props.data + ' mol/km<sup>2</sup>' + '<br />'
        : '鼠标悬停网格区域显示相关信息');
};
info.addTo(map);
const layerControl = L.control.layers(baseLayers, overlays).addTo(map);


function highlightFeature(e) {
    //更新信息
    var props = e.layer.properties;
    info.update(props);
}
function resetHighlight(e) {
    //重置信息
    info.update();
}
gridLayer_am.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
});
gridLayer_pm.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
});

// station.on('click', function (e) { // this line and below
//     L.popup()
//         .setContent(`Id: ${e.layer.properties.index}`)
//         .setLatLng(e.latlng)
//         .openOn(map);
// });

var lonlat_info = L.control({position: 'bottomright'});
lonlat_info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    // this.update();
    return this._div;
};
lonlat_info.update = function (lon, lat) {
    this._div.innerHTML = `
    <table>
      <tbody>
        <tr>
          <td><b>Lon:</b></td>
          <td>${lon.toFixed(3)}</td>
        </tr>
        <tr>
          <td><b>Lat:</b></td>
          <td>${lat.toFixed(3)}</td>
        </tr>
      </tbody>
    </table>
    `
};

lonlat_info.addTo(map);
function update_lonlat(e) {
    var lon = e.latlng.lng;
    var lat = e.latlng.lat;
    lonlat_info.update(lon, lat);
}
map.on({
    mousemove: update_lonlat
});

//添加常见控件
L.control.scale({maxWidth:100,metric:true,imperial:false}).addTo(map); // 比例尺控件

//添加图例控件
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100, 200, 300, 400, 500, 600, 800, 900, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + evaluate_cmap_hex(grades[i]/1000, cmap, reverse) + '"></i> ' + grades[i] + '<br>';
    }

    return div;
};

legend.addTo(map);