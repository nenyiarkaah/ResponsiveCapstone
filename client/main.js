    Session.set("points", []);
    console.log("I'm running client code");

    Template.mapSVG.onRendered(() => {
        
        d3.xml("victoriaMap.svg", function(error, xml) {
            if (error) throw error;
            // console.log(xml);
            // "xml" is the XML DOM tree
            var htmlSVG = document.getElementById('map'); // the svg-element in our HTML file
            // append the "maproot" group to the svg-element in our HTML file
            htmlSVG.appendChild(xml.documentElement);
        });
    });
