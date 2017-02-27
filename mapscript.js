    var state;
    var width = 800,
    height = 550;
    var formatNumber = d3.format(",d");
    var projection = d3.geo.albers()
    .center([0, 20.5937])   //center latitude of India
    .rotate([-78.9629, 0])   //center longitude of India
    .parallels([50, 60])
    .scale(1100)
    .translate([width / 2 - 40 , height / 2 + 30 ]);

    var path = d3.geo.path()
    .projection(projection);

    var svg = d3.select("body").append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "#map");

svg.append("foreignObject")
        .attr("x","100")
        .attr("y","130")
        .attr("width","100")
        .attr("height","25")
        .append("xhtml:body")
        .append("select")
        .attr("id","selectstate")
        .attr("style","width:120px;font-size:15px");

        // Append Div for tooltip to SVG
    var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    var first = 0;

    var display = "Total";
    var region = "All";
    var gender = "All";
	var statename = "No Selection";

var bound1 = 0;
var bound2 = 0;

    createButtonGroup(["Total","Percent"],"display");
    createButtonGroup(["All","Rural","Urban"],"region");
    createButtonGroup(["All","Male","Female"],"gender");

    function createButtonGroup(bglabels,bgid){

    var bWidth= 50; //button width
    var bHeight= 20; //button height
    var bSpace= 3; //space between buttons
    var x0= 100; //x offset
    var y0; //y offset

    if(bgid=="display"){
        y0= 40;
    }else if(bgid=="region"){
        y0= 70;
    }else{
        y0= 100;
    }

    //colors for different button states 
    var defaultColor= "Orange"
    var hoverColor= "Yellow"
    var pressedColor= "Red"

    //container for all buttons
    var allButtons= svg.append("g")
        .attr("id",bgid)

    //groups for each button (which will hold a rect and text)
    var buttonGroups= allButtons.selectAll("g.button")
        .data(bglabels)
        .enter()
        .append("g")
        .attr("class","button")
        .style("cursor","pointer")
        .on("click",function(d,i) {
            updateButtonColors(d3.select(this), d3.select(this.parentNode));
            if(bgid=="display"){
                display = d;
                //codeChange(d,region,gender);
            }else if(bgid=="region"){
                region = d;
                //codeChange(display,d,gender);
            }else{
                gender = d;
                //codeChange(display,region,d);
            }
			bound1=0;
			bound2=0;
            district();
        })
        .on("mouseover", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                d3.select(this)
                    .select("rect")
                    .attr("fill",hoverColor);
            }
        })
        .on("mouseout", function() {
            if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                d3.select(this)
                    .select("rect")
                    .attr("fill",defaultColor);
            }
        })

    //adding a rect to each toggle button group
    //rx and ry give the rect rounded corner
    buttonGroups.append("rect")
        .attr("class","buttonRect")
        .attr("width",bWidth)
        .attr("height",bHeight)
        .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
        .attr("y",y0)
        .attr("rx",10) //rx and ry give the buttons rounded corners
        .attr("ry",10)
        .attr("fill",function(d,i){
                if(i==0){
                    return pressedColor;
                }else{
                    return defaultColor;
                }
            })

    //adding text to each toggle button group, centered 
    //within the toggle button rect
    buttonGroups.append("text")
        .attr("class","buttonText")
        .attr("font-family","FontAwesome")
        .attr("font-size", "14px")
        .attr("x",function(d,i) {
            return x0 + (bWidth+bSpace)*i + bWidth/2;
        })
        .attr("y",y0+bHeight/2)
        .attr("text-anchor","middle")
        .attr("dominant-baseline","central")
        .attr("fill","black")
        .text(function(d) {return d;})
    
    
    
    
    


    }

    function updateButtonColors(button, parent) {

        //colors for different button states 
    var defaultColor= "Orange"
    var hoverColor= "Yellow"
    var pressedColor= "Red"

        parent.selectAll("rect")
            .attr("fill",defaultColor)
        button.select("rect")
            .attr("fill",pressedColor)
    }

    //Function to create district split map of India
    function district() { 



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

         var cur_disptxt = document.getElementsByClassName('disptxt');
        len = cur_disptxt.length;
            for (var i = 0; i < len; i++) {
               cur_disptxt[i].parentElement.removeChild(cur_disptxt[i]);
            }


        console.log("display: " + display);
        console.log("region: " + region);
        console.log("gender: " + gender);

    var color = d3.scale.threshold()
    //.domain([ .5, 1, 3, 5, 10, 30, 50, 80, 100 ])
    .range([ "#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

    // A position encoding for the key only.
    var x = d3.scale.linear()
        //.domain([0, 100])
        .range([0, 340]);

    var displaytext = "";
    d3.json("indiaDST.json", function(error, districts) {
        
        
        




       var selected = "OSCpersons";

        if(display == "Total"){
                                            if(region == "All"){
                                                if(gender == "All"){
                                                    selected = "OSCpersons"; 
                                                    displaytext = "Total OSC count";
                                                }else if(gender == "Male"){
                                                    selected = "OSCmale"; 
                                                    displaytext = "Total Male OSC count";
                                                }else if(gender == "Female"){
                                                    selected = "OSCfemale"; 
                                                    displaytext = "Total Female OSC count";
                                                }
                                            }else if(region == "Rural"){
                                                if(gender == "All"){
                                                    selected = "OSCruralpersons"; 
                                                    displaytext = "Rural OSC count";
                                                }else if(gender == "Male"){
                                                    selected = "OSCruralmale"; 
                                                    displaytext = "Rural Male OSC count";
                                                }else if(gender == "Female"){
                                                    selected = "OSCruralfemale"; 
                                                    displaytext = "Rural Female OSC count";
                                                }
                                            }else if(region == "Urban"){
                                                if(gender == "All"){
                                                    selected = "OSCurbanpersons"; 
                                                    displaytext = "Urban OSC count";
                                                }else if(gender == "Male"){
                                                    selected = "OSCurbanmale"; 
                                                    displaytext = "Urban Male OSC count";
                                                }else if(gender == "Female"){
                                                    selected = "OSCurbanfemale"; 
                                                    displaytext = "Urban Female OSC count";
                                                }
                                            }
                                        }else if(display == "Percent"){
                                            if(region == "All"){
                                                if(gender == "All"){
                                                    selected = "OSCpersons"; 
                                                    displaytext = "Total OSC percent";
                                                }else if(gender == "Male"){
                                                    selected = "OSCmale"; 
                                                    displaytext = "Total Male OSC percent";
                                                }else if(gender == "Female"){
                                                    selected = "OSCfemale"; 
                                                    displaytext = "Total Female OSC percent";
                                                }
                                            }else if(region == "Rural"){
                                                if(gender == "All"){
                                                    selected = "OSCruralpersons"; 
                                                    displaytext = "Rural OSC percent";
                                                }else if(gender == "Male"){
                                                    selected = "OSCruralmale"; 
                                                    displaytext = "Rural Male OSC percent";
                                                }else if(gender == "Female"){
                                                    selected = "OSCruralfemale"; 
                                                    displaytext = "Rural Female OSC percent";
                                                }
                                            }else if(region == "Urban"){
                                                if(gender == "All"){
                                                    selected = "OSCurbanpersons"; 
                                                    displaytext = "Urban OSC percent";
                                                }else if(gender == "Male"){
                                                    selected = "OSCurbanmale"; 
                                                    displaytext = "Urban Male OSC percent";
                                                }else if(gender == "Female"){
                                                    selected = "OSCurbanfemale"; 
                                                    displaytext = "Urban Female OSC percent";
                                                }
                                            }
                                        }

        if(display == "Total"){
      var val1 = d3.entries(topojson.feature(districts, districts.objects.Dist).features)
              // sort by properties descending
              .sort(function(a, b) { return d3.ascending(+a.value.properties[selected], +b.value.properties[selected]); });

            color.domain([
              Math.round(val1[0].value.properties[selected] * 0.0001),
              Math.round(val1[80].value.properties[selected] * 0.0001),
              Math.round(val1[160].value.properties[selected] * 0.0001),
              Math.round(val1[240].value.properties[selected] * 0.0001),
              Math.round(val1[320].value.properties[selected] * 0.0001),
              Math.round(val1[400].value.properties[selected] * 0.0001),
              Math.round(val1[480].value.properties[selected] * 0.0001),
              Math.round(val1[560].value.properties[selected] * 0.0001),
              Math.ceil(val1[640].value.properties[selected] * 0.0001)
            ]);

            x.domain([Math.round(val1[0].value.properties[selected] * 0.0001),Math.ceil(val1[640].value.properties[selected] * 0.0001)]);
        
        }else{            
            var val1 = d3.entries(topojson.feature(districts, districts.objects.Dist).features)
              // sort by properties descending
              .sort(function(a, b) { return d3.ascending(+a.value.properties[selected]/+a.value.properties[selected.replace(/OSC/i,"total")], +b.value.properties[selected]/+b.value.properties[selected.replace(/OSC/i,"total")]); });

            
            color.domain([
              Math.round(val1[0].value.properties[selected]/val1[0].value.properties[selected.replace(/OSC/i,"total")] * 100),
              Math.round(val1[80].value.properties[selected]/val1[80].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.round(val1[160].value.properties[selected]/val1[160].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.round(val1[240].value.properties[selected]/val1[240].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.round(val1[320].value.properties[selected]/val1[320].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.round(val1[400].value.properties[selected]/val1[400].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.round(val1[480].value.properties[selected]/val1[480].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.round(val1[560].value.properties[selected]/val1[560].value.properties[selected.replace(/OSC/i,"total")] * 100),
                Math.ceil(val1[640].value.properties[selected]/val1[640].value.properties[selected.replace(/OSC/i,"total")] * 100)
            ]);
            
            

            x.domain([Math.round(val1[0].value.properties[selected]/val1[0].value.properties[selected.replace(/OSC/i,"total")] * 100),Math.ceil(val1[640].value.properties[selected]/val1[640].value.properties[selected.replace(/OSC/i,"total")] * 100)]);
            
            
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
        .attr("transform", "translate(380,70)");
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
    .style("fill", function(d) { return d.z; })
	.on("mouseover", function() {
        d3.select(this).style("fill", "yellow");
    })
    .on("mouseout", function() {
        d3.select(this).style("fill", color(x.invert(d3.select(this).attr("x"))));
    })
    .on("click", function() {
        bound1=x.invert(d3.select(this).attr("x"));
		bound2=x.invert(d3.select(this).attr("x"))+x.invert(d3.select(this).attr("width"));
		district();
    });
    g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -16)
    .text("Out Of School Children(OSC) in Millions");

        
    //Creating arrow for map key
            g.append("svg:image")
                .attr("xlink:href", "arrow.png")
                .attr("width", 20)
                .attr("height", 15)
                .attr("transform", "rotate(180)")
                .attr("x", -9)
                .attr("y", 0)
                .attr("id", "scaleArrow");
    //Setting the position of the arrow in the map key
        function hoverArrow(val) {
            var left = -9 - x(val);
            d3.select("#scaleArrow")
                .transition()
                .ease("cubic")
                .attr("x", function(d) {
                    return left;
                });
        }
        
        
                    svg.append("g")
                      .attr("class", "#districts")
                      .attr("clip-path", "url(#clip-land)")
                    .selectAll("path")
                    .data(topojson.feature(districts, districts.objects.Dist).features)
                    .enter().append("path")
                    .attr("style", function(d) { 
					
                            var districtcolor;
							var valcolor;

                            if(d.properties.name == "Pak Occupied Kashmir"){
                                districtcolor = "fill:\"gray\";opacity:0.1;";
                             }else{
                                 if(display == "Total"){
                                     districtcolor = "fill:"+color(+d.properties[selected] * 0.0001)+";opacity:1;";
									 valcolor = +d.properties[selected] * 0.0001;
                                 }else{
                                     if(+d.properties[selected.replace(/OSC/i,"total")] == 0){
                                        districtcolor = "fill:\"gray\";opacity:0.1;";
                                    }else{
                                        districtcolor = "fill:"+color((+d.properties[selected]/+d.properties[selected.replace(/OSC/i,"total")]) * 100)+";opacity:1;";
										valcolor = (+d.properties[selected]/+d.properties[selected.replace(/OSC/i,"total")]) * 100;
                                    }
                                 }
                                 
                             }
							if(statename != "No Selection" && d.properties.statename != statename){
								districtcolor = "fill:\"gray\";opacity:0.1;";
							}
							
							if(bound1 != 0 || bound2 != 0){
								if(districtcolor != "fill:\"gray\";opacity:0.1;" && (valcolor<bound1 || valcolor>bound2)){
									districtcolor = "fill:\"gray\";opacity:0.1;";
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
                                    div.append("div").text(d.properties.name).style("text-align","center").style("width","150px");
                                    var tmp = "" + d.properties[selected];
                        
                                var stnum = "";

                                    var tmplen = tmp.length;
                                    if(tmplen>6){
                                        stnum = tmp.substr(0,tmplen-6)+","+tmp.substr(tmplen-6,3)+","+tmp.substr(tmplen-3,3);
                                    }else if(tmplen>3){
                                        stnum = tmp.substr(0,tmplen-3)+","+tmp.substr(tmplen-3,3);
                                    }else{
                                        stnum = tmp;
                                    }
									
								if(d.properties.name == "Pak Occupied Kashmir"){
									stnum = "Not Available";
								}
								
								var table = div.append("table").style("width","150px");
								
								var tabledata = table.append("tr");
								tabledata.append("td").text("OSC:").style("text-align","left");
								tabledata.append("td").text(stnum).style("text-align","right");
								
								tabledata = table.append("tr");
								tabledata.append("td").text("");
								if(d.properties.name == "Pak Occupied Kashmir"){
									tabledata.append("td").text("");
								}else{
								tabledata.append("td").text(Math.round((+d.properties[selected]/+d.properties[selected.replace(/OSC/i,"total")]) * 100*100)/100+"%").style("text-align","right");
								}
							
							
                            
                            if(d.properties.name == "Pak Occupied Kashmir"){
                                    hoverArrow(0);
                                }else{
                                    if(display == "Total"){
                                        hoverArrow(+d.properties[selected] * 0.0001);
                                    }else{
                                         if(+d.properties[selected.replace(/OSC/i,"total")] == 0){
                                            hoverArrow(0);
                                        }else{
                                            hoverArrow((+d.properties[selected]/+d.properties[selected.replace(/OSC/i,"total")]) * 100);
                                        }
                                    }
                                }
        
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
        
                    svg.append("path")
                    .datum(topojson.mesh(districts, districts.objects.Dist, function(a, b) { return a.properties.statecode !== b.properties.statecode; }))
                    .attr("class", "state-border")
                    .attr("d", path);
                    svg.append("path")
                    .datum(topojson.mesh(districts, districts.objects.Dist, function(a, b) { return a === b; }))
                    .attr("class", "state-border")
                    .attr("d", path);


                    svg.append("text")
                      .attr("class", "disptxt")
                      .attr("x", 40)
                      .attr("y", 80)
                      .style("text-anchor", "middle")
                      //.text(displaytext)
                      .attr("style","font-weight: normal; font-size: 12px;");

                });
        
        


    }

    district();

d3.json("indiaDST.json", function(error, districts) {
var rect = document.getElementById('gender').getBoundingClientRect();
        console.log(rect.top, rect.right, rect.bottom, rect.left);
        
        var val1 = d3.entries(topojson.feature(districts, districts.objects.Dist).features);
              // sort by properties descending
        var val2 = [""];
        
        val1.forEach(function(state, index) {
            //console.log(val2.indexOf(state.value.properties.statename));
            if(val2.indexOf(state.value.properties.statename) == -1){
                //console.log(state.value.properties.statename);
                val2.push(state.value.properties.statename);
            }
        });
        
             val2.sort(function(a, b) { return d3.ascending(a,b); });

        
        
        

    
    
        var sel = document.getElementById('selectstate');
        var fragment = document.createDocumentFragment();

        val2.forEach(function(state, index) {
            var opt = document.createElement('option');
            if(state == ""){
                opt.innerHTML = "No Selection";
            }else{
                opt.innerHTML = state;
            }
            
            opt.value = state;
            fragment.appendChild(opt);
        });

        sel.appendChild(fragment);
		
    
    sel.addEventListener("change", function() {
		statename = sel.options[sel.selectedIndex].text
		bound1=0;
		bound2=0;
        district();
    
});
});