var width = 800, height = 550;
var projection = d3.geo.albers()
	.center([0, 20.5937]) //center latitude of India
	.rotate([-78.9629, 0]) //center longitude of India
	.parallels([50, 60])
	.scale(1100)
	.translate([width / 2 - 40, height / 2 + 30]);

var path = d3.geo.path()
	.projection(projection);

var svg = d3.select("#svgcontainer").append("svg")
	.attr("xmlns", "http://www.w3.org/2000/svg")
	.attr("width", width)
	.attr("height", height)
	.attr("id", "#map");

var selstate = svg.append("foreignObject")
	.attr("x", "100")
	.attr("y", "115")
	.attr("width", "120")
	.attr("height", "25")
	.append("xhtml:body");
selstate.append("p")
.attr("style", "font-weight: bold;font-size:14px;margin:0")
.text("Select State or UT");
selstate.append("select")
.attr("id", "selectstate")
.attr("style", "width:120px;font-size:15px");

// Append Div for tooltip to SVG
var div = d3.select("#svgcontainer")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var first = 0;

var display = "Total";
var region = "All";
var gender = "All";
var statename = "India";
var selected = "OSCpersons";

var bound1 = 0;
var bound2 = 0;

var color = d3.scale.threshold()
	.range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

// A position encoding for the key only.
var x = d3.scale.linear()
	.range([0, 340]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.tickSize(13);

var displaytext = "";

d3.json("indiaDST.json", function (error, districts) {

	createButtonGroup(["Total", "Percent"], "display");
	createButtonGroup(["All", "Rural", "Urban"], "region");
	createButtonGroup(["All", "Male", "Female"], "gender");

	updatelines();

	var rect = document.getElementById('gender').getBoundingClientRect();

	var val1 = d3.entries(topojson.feature(districts, districts.objects.Dist).features);
	// sort by properties descending
	var val2 = [""];

	val1.forEach(function (state, index) {
		if (val2.indexOf(state.value.properties.statename) == -1) {
			val2.push(state.value.properties.statename);
		}
	});

	val2.sort(function (a, b) {
		return d3.ascending(a, b);
	});

	var sel = document.getElementById('selectstate');
	var fragment = document.createDocumentFragment();

	val2.forEach(function (state, index) {
		var opt = document.createElement('option');
		if (state == "") {
			opt.innerHTML = "India";
		} else {
			opt.innerHTML = state;
		}

		opt.value = state;
		fragment.appendChild(opt);

	});

	sel.appendChild(fragment);

	sel.addEventListener("change", function () {
		statename = sel.options[sel.selectedIndex].text;
		bound1 = 0;
		bound2 = 0;
		updatelines();
		district();

	});

	svg.append("g")
	.attr("class", "district-baground")
	.attr("clip-path", "url(#clip-land)")
	.selectAll("path")
	.data(topojson.feature(districts, districts.objects.Dist).features)
	.enter().append("path")
	.attr("style", "fill:gray;opacity:0.1;")
	.attr("d", path)
	.on("mouseover", displaytooltip)
	// fade out tooltip on mouse out
	.on("mouseout", hidetooltip);

	var districtsvg = svg.append("g")
		.attr("class", "#districts")
		.attr("clip-path", "url(#clip-land)");

	district();

	svg.append("path")
	.datum(topojson.mesh(districts, districts.objects.Dist))
	.attr("class", "district-border")
	.attr("d", path);

	svg.append("path")
	.datum(topojson.mesh(districts, districts.objects.Dist, function (a, b) {
			return a.properties.statecode !== b.properties.statecode;
		}))
	.attr("class", "state-border")
	.attr("d", path);

	svg.append("path")
	.datum(topojson.mesh(districts, districts.objects.Dist, function (a, b) {
			return a === b;
		}))
	.attr("class", "country-border")
	.attr("d", path);

	//Setting the position of the arrow in the map key
	function hoverArrow(val) {
		var left = -9 - x(val);
		d3.select("#scaleArrow")
		.transition()
		.ease("cubic")
		.attr("x", function (d) {
			return left;
		});
	}

	function displaytooltip(d) {
		d3.select(this).attr("class", "highlight");
		div.transition()
		.duration(0)
		.style("opacity", .9)
		.style("margin-bottom", "-55px");

		div.style("position", "relative")
		.style("margin", "auto")
		.style("left", "250px")
		.style("top", "-240px")
		.style("width", "195px")
		.style("border", "0.1px solid black");
		div.append("div").text(d.properties.statename).style("text-align", "center").style("width", "190px");
		div.append("div").text(d.properties.name + " District").style("text-align", "center").style("width", "190px");

		var table = div.append("table").style("width", "190px");

		var tabledata = table.append("tr");
		tabledata.append("td").text("OSC:").style("text-align", "left");
		tabledata.append("td").text(function () {
			if (d.properties.name == "Pak Occupied Kashmir") {
				return "Not Available";
			} else {
				return getnumasstring("" + d.properties[selected]);
			}
		}).style("text-align", "right");

		tabledata = table.append("tr");
		tabledata.append("td").text("");
		if (d.properties.name == "Pak Occupied Kashmir") {
			tabledata.append("td").text("Not Available").style("text-align", "right");
		} else {
			tabledata.append("td").text(Math.round((+d.properties[selected] / +d.properties[selected.replace(/OSC/i, "total")]) * 100 * 100) / 100 + "%").style("text-align", "right");
		}

		if (d.properties.name == "Pak Occupied Kashmir") {
			hoverArrow(x.domain()[0]);
		} else {
			if (display == "Total") {
				hoverArrow(+d.properties[selected] * 0.0001);
			} else {
				if (+d.properties[selected.replace(/OSC/i, "total")] == 0) {
					hoverArrow(x.domain()[0]);
				} else {
					hoverArrow((+d.properties[selected] / +d.properties[selected.replace(/OSC/i, "total")]) * 100);
				}
			}
		}
	}

	function hidetooltip(d) {
		d3.select(this).classed("highlight", false);
		div.selectAll("*").remove();
		div.transition()
		.duration(0)
		.style("opacity", 0)
		.style("margin-bottom", "0px");
		hoverArrow(x.domain()[0]);
	}

	//Function to create district split map of India
	function district() {

		var cur_districts = document.getElementsByClassName('#districts');
		if (cur_districts.length != 0) {
			cur_districts[0].innerHTML = "";
		}

		var cur_legend = document.getElementsByClassName('key');
		len = cur_legend.length;
		for (var i = 0; i < len; i++) {
			cur_legend[i].parentElement.removeChild(cur_legend[i]);
		}

		setselanddisptxt();

		setdomains();

		displegend();

		districtsvg.selectAll("path")
		.data(topojson.feature(districts, districts.objects.Dist).features)
		.enter().append("path")
		.filter(function (d) {
			var valcolor;
			if (display == "Total") {
				valcolor = +d.properties[selected] * 0.0001;
			} else {
				if (+d.properties[selected.replace(/OSC/i, "total")] != 0) {
					valcolor = (+d.properties[selected] / +d.properties[selected.replace(/OSC/i, "total")]) * 100;
				}
			}
			return (
				(d.properties.name != "Pak Occupied Kashmir") &&
				((+d.properties[selected.replace(/OSC/i, "total")] != 0) ||
					(display == "Total")) &&
				(statename == "India" || d.properties.statename == statename) &&
				((bound1 == 0 && bound2 == 0) || ((valcolor >= bound1 && valcolor <= bound2))));
		})
		.attr("style", function (d) {

			var districtcolor;

			if (display == "Total") {
				districtcolor = "fill:" + color(+d.properties[selected] * 0.0001) + ";opacity:1;stroke-opacity: 0;stroke-width: 0.4;";
			} else {
				districtcolor = "fill:" + color((+d.properties[selected] / +d.properties[selected.replace(/OSC/i, "total")]) * 100) + ";opacity:1;stroke-opacity: 0;stroke-width: 0.4;";
			}
			return districtcolor;
		})
		.attr("d", path)
		.on("mouseover", displaytooltip)
		// fade out tooltip on mouse out
		.on("mouseout", hidetooltip);

	}

	function displegend() {
		xAxis.tickValues(color.domain())
		.tickFormat(function (d) {
			return d;
		});

		//Legend for color code
		var g = svg.append("g")
			.attr("id", "legend")
			.attr("class", "key")
			.attr("transform", "translate(390,70)");

		g.selectAll("rect")
		.data(color.range().map(function (d, i) {
				return {
					x0: i ? x(color.domain()[i - 1]) : x.range()[0],
					x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
					z: d
				};
			}))
		.enter().append("rect")
		.attr("height", 8)
		.attr("x", function (d) {
			return d.x0;
		})
		.attr("width", function (d) {
			return d.x1 - d.x0;
		})
		.style("fill", function (d) {
			return d.z;
		})
		.on("mouseover", function () {
			d3.select(this).style("fill", "yellow");
		})
		.on("mouseout", function () {
			d3.select(this).style("fill", color(x.invert(d3.select(this).attr("x"))));
		})
		.on("click", function () {
			bound1 = x.invert(d3.select(this).attr("x"));
			bound2 = x.invert(d3.select(this).attr("x")) + x.invert(d3.select(this).attr("width"));
			district();
		});

		g.call(xAxis).append("text")
		.attr("class", "caption")
		.attr("x", -6)
		.attr("y", -16)
		.text(function () {
			if (display == "Total") {
				return "Out Of School Children(OSC) in Millions";
			} else {
				return "Out Of School Children(OSC) in %";
			}

		});

		//Creating arrow for map key
		g.append("svg:image")
		.attr("xlink:href", "arrow.png")
		.attr("width", 20)
		.attr("height", 15)
		.attr("transform", "rotate(180)")
		.attr("x", -10)
		.attr("y", 0)
		.attr("id", "scaleArrow");
	}

	function setdomains() {
		if (display == "Total") {
			var val1 = d3.entries(topojson.feature(districts, districts.objects.Dist).features)
				// sort by properties descending
				.sort(function (a, b) {
					return d3.ascending(+a.value.properties[selected], +b.value.properties[selected]);
				});

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

			x.domain([Math.round(val1[0].value.properties[selected] * 0.0001), Math.ceil(val1[640].value.properties[selected] * 0.0001)]);

		} else {
			var val1 = d3.entries(topojson.feature(districts, districts.objects.Dist).features)
				// sort by properties descending
				.sort(function (a, b) {
					return d3.ascending(+a.value.properties[selected] / +a.value.properties[selected.replace(/OSC/i, "total")], +b.value.properties[selected] / +b.value.properties[selected.replace(/OSC/i, "total")]);
				});

			color.domain([
					Math.round(val1[0].value.properties[selected] / val1[0].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[80].value.properties[selected] / val1[80].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[160].value.properties[selected] / val1[160].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[240].value.properties[selected] / val1[240].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[320].value.properties[selected] / val1[320].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[400].value.properties[selected] / val1[400].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[480].value.properties[selected] / val1[480].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.round(val1[560].value.properties[selected] / val1[560].value.properties[selected.replace(/OSC/i, "total")] * 100),
					Math.ceil(val1[640].value.properties[selected] / val1[640].value.properties[selected.replace(/OSC/i, "total")] * 100)
				]);

			x.domain([Math.round(val1[0].value.properties[selected] / val1[0].value.properties[selected.replace(/OSC/i, "total")] * 100), Math.ceil(val1[640].value.properties[selected] / val1[640].value.properties[selected.replace(/OSC/i, "total")] * 100)]);

		}
	}

	function setselanddisptxt() {

		if (display == "Total") {
			if (region == "All") {
				if (gender == "All") {
					selected = "OSCpersons";
					displaytext = "Total OSC count";
				} else if (gender == "Male") {
					selected = "OSCmale";
					displaytext = "Total Male OSC count";
				} else if (gender == "Female") {
					selected = "OSCfemale";
					displaytext = "Total Female OSC count";
				}
			} else if (region == "Rural") {
				if (gender == "All") {
					selected = "OSCruralpersons";
					displaytext = "Rural OSC count";
				} else if (gender == "Male") {
					selected = "OSCruralmale";
					displaytext = "Rural Male OSC count";
				} else if (gender == "Female") {
					selected = "OSCruralfemale";
					displaytext = "Rural Female OSC count";
				}
			} else if (region == "Urban") {
				if (gender == "All") {
					selected = "OSCurbanpersons";
					displaytext = "Urban OSC count";
				} else if (gender == "Male") {
					selected = "OSCurbanmale";
					displaytext = "Urban Male OSC count";
				} else if (gender == "Female") {
					selected = "OSCurbanfemale";
					displaytext = "Urban Female OSC count";
				}
			}
		} else if (display == "Percent") {
			if (region == "All") {
				if (gender == "All") {
					selected = "OSCpersons";
					displaytext = "Total OSC percent";
				} else if (gender == "Male") {
					selected = "OSCmale";
					displaytext = "Total Male OSC percent";
				} else if (gender == "Female") {
					selected = "OSCfemale";
					displaytext = "Total Female OSC percent";
				}
			} else if (region == "Rural") {
				if (gender == "All") {
					selected = "OSCruralpersons";
					displaytext = "Rural OSC percent";
				} else if (gender == "Male") {
					selected = "OSCruralmale";
					displaytext = "Rural Male OSC percent";
				} else if (gender == "Female") {
					selected = "OSCruralfemale";
					displaytext = "Rural Female OSC percent";
				}
			} else if (region == "Urban") {
				if (gender == "All") {
					selected = "OSCurbanpersons";
					displaytext = "Urban OSC percent";
				} else if (gender == "Male") {
					selected = "OSCurbanmale";
					displaytext = "Urban Male OSC percent";
				} else if (gender == "Female") {
					selected = "OSCurbanfemale";
					displaytext = "Urban Female OSC percent";
				}
			}
		}
	}

	function createButtonGroup(bglabels, bgid) {

		var bWidth = 50; //button width
		var bHeight = 20; //button height
		var bSpace = 3; //space between buttons
		var x0 = 90; //x offset
		var y0; //y offset

		if (bgid == "display") {
			y0 = 30;
		} else if (bgid == "region") {
			y0 = 60;
		} else {
			y0 = 90;
		}

		//colors for different button states
		var defaultColor = "Orange"
			var hoverColor = "Yellow"
			var pressedColor = "Red"

			//container for all buttons
			var allButtons = svg.append("g")
			.attr("id", bgid)

			//groups for each button (which will hold a rect and text)
			var buttonGroups = allButtons.selectAll("g.button")
			.data(bglabels)
			.enter()
			.append("g")
			.attr("class", "button")
			.style("cursor", "pointer")
			.on("click", function (d, i) {
				updateButtonColors(d3.select(this), d3.select(this.parentNode));
				if (bgid == "display") {
					display = d;
				} else if (bgid == "region") {
					region = d;
				} else {
					gender = d;
				}
				bound1 = 0;
				bound2 = 0;
				district();
			})
			.on("mouseover", function () {
				if (d3.select(this).select("rect").attr("fill") != pressedColor) {
					d3.select(this)
					.select("rect")
					.attr("fill", hoverColor);
				}
			})
			.on("mouseout", function () {
				if (d3.select(this).select("rect").attr("fill") != pressedColor) {
					d3.select(this)
					.select("rect")
					.attr("fill", defaultColor);
				}
			})

			//adding a rect to each toggle button group
			//rx and ry give the rect rounded corner
			buttonGroups.append("rect")
			.attr("class", "buttonRect")
			.attr("width", bWidth)
			.attr("height", bHeight)
			.attr("x", function (d, i) {
				return x0 + (bWidth + bSpace) * i;
			})
			.attr("y", y0)
			.attr("rx", 10) //rx and ry give the buttons rounded corners
			.attr("ry", 10)
			.attr("fill", function (d, i) {
				if (i == 0) {
					return pressedColor;
				} else {
					return defaultColor;
				}
			})

			//adding text to each toggle button group, centered
			//within the toggle button rect
			buttonGroups.append("text")
			.attr("class", "buttonText")
			.attr("font-family", "FontAwesome")
			.attr("font-size", "14px")
			.attr("x", function (d, i) {
				return x0 + (bWidth + bSpace) * i + bWidth / 2;
			})
			.attr("y", y0 + bHeight / 2)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central")
			.attr("fill", "black")
			.text(function (d) {
				return d;
			})

	}

	function updateButtonColors(button, parent) {

		//colors for different button states
		var defaultColor = "Orange"
			var hoverColor = "Yellow"
			var pressedColor = "Red"

			parent.selectAll("rect")
			.attr("fill", defaultColor)
			button.select("rect")
			.attr("fill", pressedColor)
	}

	function updatelines() {

		d3.csv("india.csv", function (data) {
			data.forEach(function (d) {
				if (d.name == statename) {
					d.numdistricts = +d.numdistricts
						d.totalpersons = +d.totalpersons
						d.totalmale = +d.totalmale
						d.totalfemale = +d.totalfemale
						d.totalruralpersons = +d.totalruralpersons
						d.totalruralmale = +d.totalruralmale
						d.totalruralfemale = +d.totalruralfemale
						d.totalurbanpersons = +d.totalurbanpersons
						d.totalurbanmale = +d.totalurbanmale
						d.totalurbanfemale = +d.totalurbanfemale
						d.OSCpersons = +d.OSCpersons
						d.OSCmale = +d.OSCmale
						d.OSCfemale = +d.OSCfemale
						d.OSCruralpersons = +d.OSCruralpersons
						d.OSCruralmale = +d.OSCruralmale
						d.OSCruralfemale = +d.OSCruralfemale
						d.OSCurbanpersons = +d.OSCurbanpersons
						d.OSCurbanmale = +d.OSCurbanmale
						d.OSCurbanfemale = +d.OSCurbanfemale

						if (d.name == "India") {
							document.getElementById('line1').innerHTML = "India has 29 states and 7 union territories which have a total of " + d.numdistricts + " districts";
						} else {
							document.getElementById('line1').innerHTML = d.name + " has " + d.numdistricts + " districts";
						}
						document.getElementById('line2').innerHTML = "Total Out of School children is: " + getnumasstring("" + d.OSCpersons) + " (" + Math.round(d.OSCpersons / d.totalpersons * 10000) / 100 + "%)";
					var rural = Math.round(d.OSCruralpersons / d.totalruralpersons * 10000) / 100;
					var urban = Math.round(d.OSCurbanpersons / d.totalurbanpersons * 10000) / 100;
					var male = Math.round(d.OSCmale / d.totalmale * 10000) / 100;
					var female = Math.round(d.OSCfemale / d.totalfemale * 10000) / 100;

					document.getElementById('line3').innerHTML = getnumasstring("" + d.OSCruralpersons) + " (" + rural + "%)";
					document.getElementById('line4').innerHTML = getnumasstring("" + d.OSCurbanpersons) + " (" + urban + "%)";
					document.getElementById('line5').innerHTML = getnumasstring("" + d.OSCmale) + " (" + male + "%)";
					document.getElementById('line6').innerHTML = getnumasstring("" + d.OSCfemale) + " (" + female + "%)";

				}

			});
		});

	}

	function getnumasstring(numvalue) {

		var stnum = "";

		var tmplen = numvalue.length;
		if (tmplen > 6) {
			stnum = numvalue.substr(0, tmplen - 6) + "," + numvalue.substr(tmplen - 6, 3) + "," + numvalue.substr(tmplen - 3, 3);
		} else if (tmplen > 3) {
			stnum = numvalue.substr(0, tmplen - 3) + "," + numvalue.substr(tmplen - 3, 3);
		} else {
			stnum = numvalue;
		}
		return stnum;
	}

});
