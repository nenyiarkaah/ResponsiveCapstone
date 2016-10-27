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
            Stations.insert({
                tflId: item.naptanId,
                name: item.commonName,
                internalName: convertCommonNameToInternal(item.commonName)
            });
            console.log(item.naptanId);
        });
    }

    function convertCommonNameToInternal(name) {
        return name.replace(/\s+/g, '').replace("UndergroundStation", "");
    }
});
