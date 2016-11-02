// Session.set("points", []);
console.log("I'm running client code");

Template.mapSVG.onRendered(() => {
    // console.log(Stations);
    d3.xml("victoriaMap.svg", function(error, xml) {
        if (error) throw error;
        // "xml" is the XML DOM tree
        // 'map' is the svg-element in our HTML file
        var htmlSVG = document.getElementById('map');
        // append the "maproot" group to the svg-element in our HTML file
        htmlSVG.appendChild(xml.documentElement);
        svg = d3.select(htmlSVG);
        //find the internal dimensions of SVG to find the ratio for transformation
        //which will fit the map the screen
        var transformRatio = calculateTransformRatio($("svg").parent().width(),
            $("svg").parent().height(), svg.select("svg").attr("width"),
            svg.select("svg").attr("height"));
        svg.select("svg")
            //responsive SVG needs these 2 attributes and no width and height attr
            .attr("preserveAspectRatio", "xMinYMin meet")
            //class to make it responsive
            .classed("svg-content-responsive", true)
            //container class to make it responsive
            .classed("svg-container", true)
            .classed("svg-content", true)
            .attr("transform", "scale(" + transformRatio + ")");

        //add click functionality
        stops = svg.selectAll("use");
        stopNames = svg.selectAll("text")
            .attr("test", function() {
                return stripSpaces(this.textContent)
            });

        intersection = svg.selectAll("intersection");

        stops
            .on("mouseover", function() {
                if (isStation(this.href.baseVal)) {

                    name = stripSpaces(this.id);
                    // highlight station name
                    stationName = stopNames.select(function() {
                            if (d3.select(this).attr("test") == name) {
                                return this;
                            }
                        }).filter(function(d) {
                            return d == null;
                        });
                    stationName.style("fill", "#FFA500");
                }
            })

        .on("mouseout", function() {
            if (isStation(this.href.baseVal)) {

                name = stripSpaces(this.id);
                // highlight station name
                stationName = stopNames.select(function() {
                    if (d3.select(this).attr("test") == name) {
                        return this;
                    }
                }).filter(function(d) {
                    return d == null;
                });
                stationName.style("fill", "#000000");
            }
        })

        .on("click", function() {
            if (isStation(this.href.baseVal)) {
                getStation(this.id);
            }
        });

        stopNames
            .on("mouseover", function() {
                name = stripSpaces(this.textContent);
                d3.select(this).style("fill", "#FFA500");
            })

        .on("mouseout", function() {
            d3.select(this).style("fill", "#000000");
        })

        .on("click", function() {
            getStation(this.textContent);
        });
    });
});

Template.details.helpers({

    station: function(){
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            return station;
        }
    },

    stationame: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            console.log(station);
            return station.commonName;
        }
    },

    lines: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            return station.lines;
        }
    },

    journeys: function(){
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            return station.lines;
        }
    },

    zone: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            var result = extractAddtionalProperty(station, "Zone");
            return "Zone - " + result;
        }
    },
    night: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            var result = extractAddtionalProperty(station, "Night");
            return "Night service - " + result;
        }
    },
    toilet: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            var result = extractAddtionalProperty(station, "Toilets");
            return "Toilets - " + result;
        }
    },
    lift: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            var result = extractAddtionalProperty(station, "Lifts");
            return "Lifts - " + result;
        }
    },

    address: function() {
        _id = Session.get("stationId");
        if (_id) {
            station = Stations.findOne({
                id: _id
            });
            var result = extractAddtionalProperty(station, "Address");
            return "Address - " + result;
        }
    },
});

function getStation(idName) {
    name = stripSpaces(idName);
    var stop = findTFLId(name);
    Session.set("stationId", stop.id);
    return stop.id;
}

function stripSpaces(str) {
    return str.replace(/\s+/g, '');
}

function isStation(type) {
    if (type.replace("#", "") === "intersection") {
        return true;
    }
    return false;
}

function calculateTransformRatio(width, height, svgWidth, svgHeight) {
    var widthRatio = width / svgWidth;
    var heightRatio = height / svgHeight;
    var ratio = 1;
    if (heightRatio <= widthRatio) {
        ratio = heightRatio;
    } else {
        ratio = widthRatio;
    }
    return ratio;
}

function findTFLId(name) {
    return Stations.findOne({
        internalName: name
    });
}

function extractAddtionalProperty(station, key) {
    return station.additionalProperties.map(function(item) {
        if (item.key == key) {
            return item.value;
        }

    }).filter(function(d) {
        return d != null;
    });
};

function getArrivals(line, tflId, journey) {
    urlAPI = "https://api.tfl.gov.uk/Line/" + line + "/Arrivals/" + tflId + "?direction=" + journey + "&app_id=&app_key=";

    Meteor.http.get(urlAPI, function(error, results) {

        if (!error) {
            var strResult = JSON.stringify(results.data);
            while (strResult.includes("$")) {
                strResult = strResult.replace("$", "base");
            }
            var data = JSON.parse(strResult);
            data.forEach(function(item) {

                id = Arrivals.insert(item);
            });
            console.log(Arrivals.find().map(function(doc) {
                return moment().utc(doc.expectedArrival).format('HH:mm:ss') || []
            }));
            console.log(Arrivals.find().map(function(doc) {
                return moment().add(doc.timeToStation, 'seconds').fromNow() || []
            }));
            console.log(Arrivals.findOne());
        } else {
            console.log(error);
        }
    });

};

// Template.arrivalsList.helpers({
//     arrivals: function() {
//             return Arrivals.find();
//     },
//     details: function() {
//         return this._id.expectedArrival;
//     }
// })
// Template.arrivalItem.helpers({
// details:function(){
//     var item = Arrivals.findOne();
//     // console.log(item.stationName);
//     item.forEach(function(){
//         console.log("test");
//     return "item.stationName;"
// });
// }
// });
