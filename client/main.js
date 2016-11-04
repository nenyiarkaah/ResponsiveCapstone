// Session.set("points", []);
console.log("I'm running client code");
// Subscriptions
Meteor.subscribe("Stations");
Meteor.subscribe("Lines");
Meteor.subscribe("Timetables");

Template.mapSVG.onRendered(() => {
    // console.log(Stations);
    // d3.xml("londonMap.svg", function(error, xml) {
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

    station: function() {
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
            Session.set("lineName", convertCommonNameToInternal(station.lines[0].id));
            Session.set("line", [station.lines[0].inbound, station.lines[0].outbound]);

            return station.lines;

        }
    },

    journeys: function() {
        line = Session.get("line");
        if (line) {
            Session.set("journeyId", 0);
            return line;
        }
    },

    timetable: function() {
        tflId = Session.get("stationId");
        directionId = Session.get("journeyId");
        line = Session.get("lineName");
        if (tflId && line && isNumber(directionId)) {
            ReactiveMethod.call('getTimetable', line, tflId, directionId);
            return Timetables.find({}, {sort: {expectedArrival: 1}}).map(function(doc) {
                item = {
                    destination: stripUndergroundStation(doc.destinationName),
                    expected: moment(doc.expectedArrival).format('HH:mm:ss'),
                    eta: moment().add(doc.timeToStation, 'seconds').fromNow()
                }
                return item;
            });
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

Template.details.events({
    'change #line-select': function(evt) {
        var newValue = convertCommonNameToInternal($(evt.target).val());
        _id = Session.get("stationId");

        var oldValue = Session.get("lineName");

        if (newValue != oldValue) {
            station = Stations.findOne({
                id: _id
            });
            line = station.lines.map((lineitem) => {
                if (lineitem.id == newValue) {
                    return lineitem;
                }
            }).filter(function(d) {
                return d != null;
            });
            Session.set("line", [line[0].inbound, line[0].outbound]);
        }
        Session.set("lineName", newValue);
    },

    'change #journey-select': function(evt) {
        allValues = Session.get("line");
        journeyId = Session.get("journeyId");
        var newValue = $(evt.target).val();
        index = allValues.indexOf(newValue);
        // console.log("index:" + index + " journeyId:" + journeyId);
        Session.set("journeyId", index);

    }
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function convertCommonNameToInternal(name) {
    return name.replace(/\s+/g, '').replace("UndergroundStation", "").replace("&", "-").toLowerCase();
}

function stripUndergroundStation(name){
  return name.replace("Underground Station", "");
}

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
