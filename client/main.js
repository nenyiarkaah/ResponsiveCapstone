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
        // console.log(transformRatio);
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
        stopNames = svg.selectAll("text");
        intersection = svg.selectAll("intersection");

        stops
        .on("mouseover", function(){
            if(isStation(this.href.baseVal)){
            // console.log(this.id);
            d3.select(this).style("fill", "#FFA500");
        }
        })

        .on("mouseout", function(){
            if(isStation(this.href.baseVal)){
            // console.log(this.id);
            d3.select(this).style("fill", "#ffffff");
        }
        })

        .on("click", function(){
            if(isStation(this.href.baseVal)){
            console.log(this.id);
            d3.select(this).style("fill", "808080");
        }
        });

        stopNames
        .on("mouseover", function(){

            console.log(this.textContent);
            d3.select(this).style("fill", "#FFA500");
        })

        .on("mouseout", function(){
            // console.log(this.id);
            d3.select(this).style("fill", "black");
        });
        //
        // .on("click", function(){
        //     if(isStation(this.href.baseVal))
        //     console.log(this.id);
        //     d3.select(this).style("fill", "808080");
        // });
        // .on("mouseout", function(){d3.select(this).style("fill", "808080");});

        intersection
        .on("mouseover", function(){
            console.log("hit intersection");
            d3.select(this).style("fill", "#FFA500");
        })

        .on("mouseout", function(){
            d3.select(this).style("fill", "#ffffff");
        });
        //
        // .on("click", function(){
        //     if(isStation(this.href.baseVal))
        //     console.log(this.id);
        //     d3.select(this).style("fill", "808080");
        // });
        // .on("mouseout", function(){d3.select(this).style("fill", "808080");});
        // console.log(stops);
        console.log(intersection);
    });

    function isStation(type) {
        if(type.replace("#", "") === "intersection") {
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
});
