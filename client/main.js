// Session.set("points", []);
console.log("I'm running client code");

Template.mapSVG.onRendered(() => {

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
        console.log(transformRatio);
        svg.select("svg")
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        //class to make it responsive
        .classed("svg-content-responsive", true)
        //container class to make it responsive
        .classed("svg-container", true)
        .classed("svg-content", true)
        .attr("transform", "scale(" + transformRatio + ")");
    });

    function calculateTransformRatio(width, height, svgWidth, svgHeight) {
        var widthRatio = width/svgWidth;
        var heightRatio = height/svgHeight;
        var ratio = 1;
        if (heightRatio <= widthRatio) {
            ratio = heightRatio;
        } else {
            ratio = widthRatio;
        }
        return ratio;
    }
});
