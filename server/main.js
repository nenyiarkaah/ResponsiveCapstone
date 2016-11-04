import {
    Meteor
} from 'meteor/meteor';
Meteor.publish('Stations', function(){
    return Stations.find();
});
Meteor.publish('Lines', function(){
    return Lines.find();
});
Meteor.publish('Timetables', function(){
    var currentUserId = this.userId;
    // { createdBy: currentUserId }
    return Timetables.find();
})

Meteor.startup(() => {
    // code to run on server at startup
    GenerateLines();
    GenerateStops();
});

function GenerateLines() {
    http = "https://api.tfl.gov.uk/Line/Mode/tube/Status?detail=False&app_id=&app_key=";
    var data = Meteor.http.get(http).data;
    Lines.remove({});
    if (Lines.find().count() === 0) {
        data.forEach(function(item) {
            item = cleanUpJSON(item);
            id = Lines.insert(item);
            // console.log(item.id);
        });
    }

}

function GenerateStops() {
    //start pulling some JSON in
    http = "https://api.tfl.gov.uk/Line/victoria/StopPoints?app_id=&app_key=";
    var data = Meteor.http.get(http).data;
    Stations.remove({});
    if (Stations.find().count() === 0) {
        var knownTubeLines = Lines.find().map(function(line){
            return line.id;
        });
        data.forEach(function(item) {
            item = cleanUpJSON(item);
            id = Stations.insert(item);
            internalName = convertCommonNameToInternal(item.commonName);

            lines = item.lines.map((lineitem) => {
                // console.log(lineitem.id + " " + !!(knownTubeLines.indexOf(lineitem.id)+1));
                if (!!(knownTubeLines.indexOf(lineitem.id)+1)) {
                    return _.extend(lineitem, journey = AssignJourney(lineitem.id));
                }
            }).filter(function(d) {
                return d != null;
            });

            Stations.update({
                _id: id
            }, {
                $set: {
                    internalName: internalName,
                    lines: lines,
                    journey: AssignJourney(convertCommonNameToInternal(item.commonName))
                }
            });
            console.log(id);
            // console.log(convertCommonNameToInternal(item.commonName));
        });
    }
}

function cleanUpJSON(item) {
    var strItem = JSON.stringify(item);
    while (strItem.includes("$")) {
        strItem = strItem.replace("$", "base");
    }
    return JSON.parse(strItem);
}

function convertCommonNameToInternal(name) {
    return name.replace(/\s+/g, '').replace("UndergroundStation", "");
}

function AssignJourney(line) {
    switch (line.toLowerCase()) {
        case "bakerloo":
            return {
                inbound: "South Bound",
                outbound: "North Bound"
            };
            break;
        case "central":
            return {
                inbound: "East Bound",
                outbound: "West Bound"
            };
            break;
        case "circle":
            return {
                inbound: "East Bound",
                outbound: "West Bound"
            };
            break;
        case "district":
            return {
                inbound: "East Bound",
                outbound: "West Bound"
            };
            break;
        case "hammersmith-city":
            return {
                inbound: "East Bound",
                outbound: "West Bound"
            };
            break;
        case "jubilee":
            return {
                inbound: "East Bound",
                outbound: "West Bound"
            };
            break;
        case "metropolitan":
            return {
                inbound: "South Bound",
                outbound: "North Bound"
            };
            break;
        case "northern":
            return {
                inbound: "South Bound",
                outbound: "North Bound"
            };
            break;
        case "piccadilly":
            return {
                inbound: "South Bound",
                outbound: "North Bound"
            };
            break;
        case "victoria":
            return {
                inbound: "South Bound",
                outbound: "North Bound"
            };
            break;
        case "waterloo-city":
            return {
                inbound: "South Bound",
                outbound: "North Bound"
            };
            break;

        default:
            return {
                inbound: "inbound",
                outbound: "outbound"
            };
            break;

    }
};

Meteor.methods({
    getTimetable: function(line, tflId, directionId) {

        var direction;
        if (directionId == 0) {
            direction = "inbound";
        } else {
            direction = "outbound";
        }
        // console.log("tflId:" + tflId + " direction:" + direction + " line:" + line);
        urlAPI = "https://api.tfl.gov.uk/Line/" + line + "/Arrivals/" + tflId + "?direction=" + direction + "&app_id=&app_key=";
        Timetables.remove({});
        Meteor.http.get(urlAPI, function(error, results) {

            if (error) {
                console.log(error.reason);
                return;
            }
            var strResult = JSON.stringify(results.data);
            while (strResult.includes("$")) {
                strResult = strResult.replace("$", "base");
            }
            var data = JSON.parse(strResult);
            data.forEach(function(item) {
                id = Timetables.insert(item);
            });
        });
    }
})
