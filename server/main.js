import {
    Meteor
} from 'meteor/meteor';

Meteor.startup(() => {
    // code to run on server at startup
    //start pulling some JSON in
    stationHTTP = "https://api.tfl.gov.uk/Line/victoria/StopPoints?app_id=&app_key=";
    var data = Meteor.http.get(stationHTTP).data;
    Stations.remove({});
    if (Stations.find().count() === 0) {
        data.forEach(function(item) {
            var strItem = JSON.stringify(item);
            while (strItem.includes("$")) {
                strItem = strItem.replace("$", "base");
            }
            item = JSON.parse(strItem);
            id = Stations.insert(item);
            Stations.update({_id:id}, {$set: {internalName: convertCommonNameToInternal(item.commonName)}})
            console.log(id);
        });
    }

    function convertCommonNameToInternal(name) {
        return name.replace(/\s+/g, '').replace("UndergroundStation", "");
    }
});
