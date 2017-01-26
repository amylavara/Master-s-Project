var state;
var width = 800,
height = 550;
var formatNumber = d3.format(",d");
var projection = d3.geo.albers()
.center([0, 20.5937])   //center latitude of India
.rotate([-78.9629, 0])   //center longitude of India
.parallels([50, 60])
.scale(1000)
.translate([width / 2 , height / 2 + 80 ]);

var path = d3.geo.path()
.projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "#map");

    // Append Div for tooltip to SVG
var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

var first = 0;

var display = 1;
var region = 3;
var gender = 6;




//Function to create district split map of India
function district(dispselection) { 
    
    
    
    var cur_districts = document.getElementsByClassName('#districts');

        // Now remove them
        var len = cur_districts.length;
        for (var i = 0; i < len; i++) {
            cur_districts[0].parentElement.removeChild(cur_districts[0]);
        }
        //console.log(document.getElementsByClassName('state-border'));
        var cur_districtborder = document.getElementsByClassName('district-border');
    len = cur_districtborder.length;
        for (var i = 0; i < len; i++) {
           cur_districtborder[i].parentElement.removeChild(cur_districtborder[i]);
        }
    
    var cur_legend = document.getElementsByClassName('key');
    len = cur_legend.length;
        for (var i = 0; i < len; i++) {
           cur_legend[i].parentElement.removeChild(cur_legend[i]);
        }
    
    
    if(dispselection == 1 || dispselection == 2){
        display = dispselection;
    }else if(dispselection == 3 || dispselection == 4 || dispselection == 5){
        region = dispselection;
    }else if(dispselection == 6 || dispselection == 7 || dispselection == 8){
        gender = dispselection;
    }
  
    console.log("display: " + display);
    console.log("region: " + region);
    console.log("gender: " + gender);
    
var color = d3.scale.threshold();
//.domain([ .5, 1, 3, 5, 10, 30, 50, 80, 100 ])
//.range([ "#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
    
// A position encoding for the key only.
var x = d3.scale.linear();
    //.domain([0, 100])
    //.range([0, 480]);
    
    if(display == 1){
       color.domain([ .5, 1, 3, 5, 10, 30, 50, 80, 100 ])
           .range([ "#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
       x.domain([0, 100])
        .range([0, 480]);
    }else{
        color.domain([ 5, 10, 20, 30, 40, 50, 60, 70, 80 ])
           .range([ "#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
       x.domain([0, 80])
        .range([0, 480]);
    }
    
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(color.domain())
    .tickFormat(function(d) { return d;});
    
    //Legend for color code
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(40,40)");
g.selectAll("rect")
    .data(color.range().map(function(d, i) {
                return {
x0: i ? x(color.domain()[i - 1]) : x.range()[0],
x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
z: d
};
}))
.enter().append("rect")
.attr("height", 8)
.attr("x", function(d) { return d.x0; })
.attr("width", function(d) { return d.x1 - d.x0; })
.style("fill", function(d) { return d.z; });
g.call(xAxis).append("text")
.attr("class", "caption")
.attr("y", -6)
.text("Out Of School Children(OSC) in Millions");
    
    
d3.json("indiaDST.json", function(error, districts) {
    
 
    
    
                svg.append("g")
                  .attr("class", "#districts")
                  .attr("clip-path", "url(#clip-land)")
                .selectAll("path")
                .data(topojson.feature(districts, districts.objects.Dist).features)
                .enter().append("path")
                .style("fill", function(d) { 
                        var districtcolor;
                    
                        if(d.properties.name == "Data Not Available"){
                            districtcolor = "gray";
                         }else{   
                            if(display == 1){
                                //document.getElementById('count')[0].className='active';
                                if(region == 3){
                                    //document.getElementById('totalregion')[0].className='active';
                                    if(gender == 6){   
                                        districtcolor = color(d.properties.OSCpersons * 0.0001);
                                    }else if(gender == 7){
                                        districtcolor = color(d.properties.OSCmale * 0.0001);
                                    }else if(gender == 8){
                                        districtcolor = color(d.properties.OSCfemale * 0.0001);
                                    }
                                }else if(region == 4){
                                    if(gender == 6){
                                        districtcolor = color(d.properties.OSCruralpersons * 0.0001);
                                    }else if(gender == 7){
                                        districtcolor = color(d.properties.OSCruralmale * 0.0001);
                                    }else if(gender == 8){
                                        districtcolor = color(d.properties.OSCruralfemale * 0.0001);
                                    }
                                }else if(region == 5){
                                    if(gender == 6){
                                        districtcolor = color(d.properties.OSCurbanpersons * 0.0001);
                                    }else if(gender == 7){
                                        districtcolor = color(d.properties.OSCurbanmale * 0.0001);
                                    }else if(gender == 8){
                                        districtcolor = color(d.properties.OSCurbanfemale * 0.0001);
                                    }
                                }
                            }else if(display == 2){
                                //document.getElementById('percent')[0].className='active';
                                if(region == 3){
                                    if(gender == 6){
                                        if(d.properties.totalpersons == 0){
                                            districtcolor = "gray";
                                        }else{
                                            districtcolor = color((d.properties.OSCpersons/d.properties.totalpersons) * 100);
                                        }
                                    }else if(gender == 7){
                                        if(d.properties.totalmale == 0){
                                            districtcolor = "gray";
                                        }else{
                                            districtcolor = color((d.properties.OSCmale/d.properties.totalmale) * 100);
                                        }
                                    }else if(gender == 8){
                                        if(d.properties.totalfemale == 0){
                                            districtcolor = "gray";
                                        }else{
                                            districtcolor = color((d.properties.OSCfemale/d.properties.totalfemale) * 100);
                                        }
                                    }
                                }else if(region == 4){
                                    if(gender == 6){
                                        if(d.properties.totalruralpersons == 0){
                                            districtcolor = "gray";
                                        }else{
                                        districtcolor = color((d.properties.OSCruralpersons/d.properties.totalruralpersons) * 100);
                                        }
                                    }else if(gender == 7){
                                        if(d.properties.totalruralmale == 0){
                                            districtcolor = "gray";
                                        }else{
                                        districtcolor = color((d.properties.OSCruralmale/d.properties.totalruralmale) * 100);
                                        }
                                    }else if(gender == 8){
                                        if(d.properties.totalruralfemale == 0){
                                            districtcolor = "gray";
                                        }else{
                                        districtcolor = color((d.properties.OSCruralfemale/d.properties.totalruralfemale) * 100);
                                        }
                                    }
                                }else if(region == 5){
                                    if(gender == 6){
                                        if(d.properties.totalurbanpersons == 0){
                                            districtcolor = "gray";
                                        }else{
                                        districtcolor = color((d.properties.OSCurbanpersons/d.properties.totalurbanpersons) * 100);
                                        }
                                    }else if(gender == 7){
                                        if(d.properties.totalurbanmale == 0){
                                            districtcolor = "gray";
                                        }else{
                                        districtcolor = color((d.properties.OSCurbanmale/d.properties.totalurbanmale) * 100);
                                        }
                                    }else if(gender == 8){
                                        if(d.properties.totalurbanfemale == 0){
                                            districtcolor = "gray";
                                        }else{
                                        districtcolor = color((d.properties.OSCurbanfemale/d.properties.totalurbanfemale) * 100);
                                        }
                                    }
                                }
                            }
                         }
                    
                        return districtcolor; 
                    })
                    .attr("d", path)
                .on("mouseover", function(d) {
                                d3.select(this).attr("class", "highlight");
                                div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                div.style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                                div.append("div").text(d.properties.name);
                                var tmp = "" + d.properties.OSCpersons;
                            var stnum = "";
                            var tmplen = tmp.length;
                            if(tmplen>6){
                                stnum = tmp.substr(0,tmplen-6)+","+tmp.substr(tmplen-6,3)+","+tmp.substr(tmplen-3,3);
                            }else if(tmplen>3){
                                stnum = tmp.substr(0,tmplen-3)+","+tmp.substr(tmplen-3,3);
                            }else{
                                stnum = tmp;
                            }
                    
                            if(d.properties.name == "Data Not Available"){
                                stnum = "No Data";
                            }
                        div.append("div").text("OSC: "+stnum);
                        div.append("div").text("percent: "+ Math.round((d.properties.OSCpersons/d.properties.totalpersons) * 100*100)/100);
                        })
                        // fade out tooltip on mouse out
                        .on("mouseout", function(d) {
                            d3.select(this).classed("highlight", false);
                            div.selectAll("*").remove();
                            div.transition()
                                .duration(0)
                                .style("opacity", 0);
                        });
                
                svg.append("path")
                .datum(topojson.mesh(districts, districts.objects.Dist))
                .attr("class", "district-border")
                .attr("d", path);
                
            });
    
    
    
    

    
    
            
        }





 
//Function to create district split map of selected state 
function districttotals() {
    
    
    
    var cur_districts = document.getElementsByClassName('#districts');

        // Now remove them
        var len = cur_districts.length;
        for (var i = 0; i < len; i++) {
            cur_districts[0].parentElement.removeChild(cur_districts[0]);
        }
        //console.log(document.getElementsByClassName('state-border'));
        var cur_districtborder = document.getElementsByClassName('district-border');
    len = cur_districtborder.length;
        for (var i = 0; i < len; i++) {
           cur_districtborder[i].parentElement.removeChild(cur_districtborder[i]);
        }
    
    var cur_legend = document.getElementsByClassName('key');
    len = cur_legend.length;
        for (var i = 0; i < len; i++) {
           cur_legend[i].parentElement.removeChild(cur_legend[i]);
        }
    
    var color = d3.scale.threshold()
.domain([ .5, 1, 3, 5, 10, 30, 80, 100 ])
.range([ "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
    
// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 100])
    .range([0, 480]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(color.domain())
    .tickFormat(function(d) { return d;});
    
    //Legend for color code
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(40,40)");
g.selectAll("rect")
    .data(color.range().map(function(d, i) {
                return {
x0: i ? x(color.domain()[i - 1]) : x.range()[0],
x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
z: d
};
}))
.enter().append("rect")
.attr("height", 8)
.attr("x", function(d) { return d.x0; })
.attr("width", function(d) { return d.x1 - d.x0; })
.style("fill", function(d) { return d.z; });
g.call(xAxis).append("text")
.attr("class", "caption")
.attr("y", -6)
.text("Out Of School Children(OSC) in Millions");
    
    
            d3.json("indiaDST.json", function(error, districts) {
                svg.append("g")
                  .attr("class", "#districts")
                  .attr("clip-path", "url(#clip-land)")
                .selectAll("path")
                .data(topojson.feature(districts, districts.objects.Dist).features)
                .enter().append("path")
                .style("fill", function(d) { 
                        var districtcolor;
                        if(d.properties.name == "Data Not Available"){
                            districtcolor = "gray";
                        }else{
                            districtcolor = color(d.properties.outofschool * 0.0001);
                        }
                        return districtcolor; 
                    })
                    .attr("d", path)
                .on("mouseover", function(d) {
                                d3.select(this).attr("class", "highlight");
                                div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                div.style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                                div.append("div").text(d.properties.name);
                                var tmp = "" + d.properties.outofschool;
                            var stnum = "";
                            var tmplen = tmp.length;
                            if(tmplen>6){
                                stnum = tmp.substr(0,tmplen-6)+","+tmp.substr(tmplen-6,3)+","+tmp.substr(tmplen-3,3);
                            }else if(tmplen>3){
                                stnum = tmp.substr(0,tmplen-3)+","+tmp.substr(tmplen-3,3);
                            }else{
                                stnum = tmp;
                            }
                    
                            if(d.properties.name == "Data Not Available"){
                                stnum = "No Data";
                            }
                        div.append("div").text("OSC: "+stnum);
                        div.append("div").text("percent: "+ Math.round((d.properties.outofschool/d.properties.totalppulation) * 100*100)/100);
                        })
                        // fade out tooltip on mouse out
                        .on("mouseout", function(d) {
                            d3.select(this).classed("highlight", false);
                            div.selectAll("*").remove();
                            div.transition()
                                .duration(0)
                                .style("opacity", 0);
                        });
                
                svg.append("path")
                .datum(topojson.mesh(districts, districts.objects.Dist))
                .attr("class", "district-border")
                .attr("d", path);
                
            });
        }

function districtpercent() {
    
    var cur_districts = document.getElementsByClassName('#districts');

        // Now remove them
        var len = cur_districts.length;
        for (var i = 0; i < len; i++) {
            cur_districts[0].parentElement.removeChild(cur_districts[0]);
        }
        //console.log(document.getElementsByClassName('state-border'));
        var cur_districtborder = document.getElementsByClassName('district-border');
    len = cur_districtborder.length;
        for (var i = 0; i < len; i++) {
           cur_districtborder[i].parentElement.removeChild(cur_districtborder[i]);
        }
    
         var cur_legend = document.getElementsByClassName('key');
    len = cur_legend.length;
        for (var i = 0; i < len; i++) {
           cur_legend[i].parentElement.removeChild(cur_legend[i]);
        }
    
    var color = d3.scale.threshold()
.domain([ 5, 10, 15, 25, 35, 45, 55 ])
.range([ "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
    

    
// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 55])
    .range([0, 480]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(color.domain())
    .tickFormat(function(d) { return d;});
    
    //Legend for color code
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(40,40)");
g.selectAll("rect")
    .data(color.range().map(function(d, i) {
                return {
x0: i ? x(color.domain()[i - 1]) : x.range()[0],
x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
z: d
};
}))
.enter().append("rect")
.attr("height", 8)
.attr("x", function(d) { return d.x0; })
.attr("width", function(d) { return d.x1 - d.x0; })
.style("fill", function(d) { return d.z; });
g.call(xAxis).append("text")
.attr("class", "caption")
.attr("y", -6)
.text("Out Of School Children(OSC) in Percent");
    

            d3.json("indiaDST.json", function(error, districts) {
                svg.append("g")
                  .attr("class", "#districts")
                  .attr("clip-path", "url(#clip-land)")
                .selectAll("path")
                .data(topojson.feature(districts, districts.objects.Dist).features)
                .enter().append("path")
                .style("fill", function(d) { 
                        var districtcolor;
                        if(d.properties.name == "Data Not Available"){
                            districtcolor = "gray";
                        }else{
                            districtcolor = color( (d.properties.outofschool/d.properties.totalppulation) * 100);
                        }
                        return districtcolor; 
                    })
                    .attr("d", path)
                .on("mouseover", function(d) {
                                d3.select(this).attr("class", "highlight");
                                div.transition()
                                    .duration(200)
                                    .style("opacity", .9);
                                div.style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY - 28) + "px");
                                div.append("div").text(d.properties.name);
                                var tmp = "" + d.properties.outofschool;
                            var stnum = "";
                            var tmplen = tmp.length;
                            if(tmplen>6){
                                stnum = tmp.substr(0,tmplen-6)+","+tmp.substr(tmplen-6,3)+","+tmp.substr(tmplen-3,3);
                            }else if(tmplen>3){
                                stnum = tmp.substr(0,tmplen-3)+","+tmp.substr(tmplen-3,3);
                            }else{
                                stnum = tmp;
                            }
                    
                            if(d.properties.name == "Data Not Available"){
                                stnum = "No Data";
                            }
                        div.append("div").text("OSC: "+stnum);
                    div.append("div").text("percent: "+ Math.round((d.properties.outofschool/d.properties.totalppulation) * 100*100)/100);
                    
                        })
                        // fade out tooltip on mouse out
                        .on("mouseout", function(d) {
                            d3.select(this).classed("highlight", false);
                            div.selectAll("*").remove();
                            div.transition()
                                .duration(0)
                                .style("opacity", 0);
                        });
                
                svg.append("path")
                .datum(topojson.mesh(districts, districts.objects.Dist))
                .attr("class", "district-border")
                .attr("d", path);
                
            });
        }


district(0);
    
