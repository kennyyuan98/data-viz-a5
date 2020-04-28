$(document).ready(function() {
	// This is the top-level function, it should call the functions to create each viz.
	// MAKE SURE that in your viz-creating function, your select() functions use specific-enough selectors so you don't modify the wrong viz!
    d3.csv("https://gist.githubusercontent.com/jxcheng/b89403eef4363348da7ced56220adc45/raw/ac7178c141bf8511a5814b84659cc5b3c86db16a/japanese_subway_accident_data.csv", function(data) {
        createMonthlyViz(data);
	});

	d3.csv("https://raw.githubusercontent.com/kennyyuan98/data-viz-a5/master/pre_processing_scripts/the_real_true_final_version.csv", function(data) {
		createDemographicsViz(data);
		createYearlyViz(data);
		createHourlyViz(data);

		// $("#severity").click(function(){
		// 	createDemographicsVizWithSeverityFilter(data, ["Fatal"]);
		// });
	});
});

const ageGroups = ["under 10", "10", "20", "30", "40", "50", "60", "70", "80", "90"];
const severityTypes = ["Fatal", "Minor Injury", "No Injury", "Severe Injury"];
const genders = ["Male", "Female"];

/* 
* Logic for creating the chart showing number of cases per month over the years (A4). 
* Note: All logic should be self-contained and shouldn't affect any data / DOM elements besides itself.
*/
function createHourlyViz(data) {
	let hourCount = new Map();
	for (let datum of data) {
		let gender = datum["gender"];
		if (gender === "Male" || gender === "Female") {
			let hour = datum["Date"].split(" ")[1].split(":")[0];
			let key = hour + " " + gender;
			if (!hourCount.has(key)) {
				hourCount.set(key, 0);
			}
			hourCount.set(key, hourCount.get(key)+1);
		}
	}
	let femaleData = [];
	let maleData = [];
	for (let entry of hourCount) {
		let hour = entry[0].split(" ")[0];
		let gender = entry[0].split(" ")[1];
		if (gender === "Male") {
			maleData.push([hour, entry[1]]);
		} else {
			femaleData.push([hour, entry[1]]);
		}
	}

	const width = $(".container").width();
	const height = 600;
	const padding = 25;
	const fontSize = "14px";
	const maxCount = Math.max(d3.max(maleData.map(e=>e[1])), d3.max(femaleData.map(e=>e[1])));
	const minCount = Math.max(d3.min(maleData.map(e=>e[1])), d3.min(femaleData.map(e=>e[1])));

	//Create SVG element
    var svg = d3.select("#accidents-per-hour")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let x = d3.scaleBand()
    	.domain(maleData.map(e=>parseInt(e[0])).sort((a,b)=>a-b))
    	.range([padding*2, width-padding]);

    let x_axis = d3.axisBottom()
	    .scale(x);

    svg.append("g")
        .attr("transform", "translate(0, "+(height-padding)+")")
        .style("font", fontSize + " sans-serif")
        .call(x_axis);

    let y = d3.scaleLinear()
    	.domain([minCount, maxCount]).nice()
    	.range([height-padding, padding]);

	let y_axis = d3.axisLeft()
		.ticks(6)
        .scale(y);	

    svg.append("g")
       .attr("transform", "translate("+padding*2+", 0)")
        .style("font", fontSize + " sans-serif")
       .call(y_axis);

	svg.append("rect")
		.attr("x", x("19")+x.bandwidth()/2)
		.attr("y", padding)
		.attr("width", x.bandwidth()*4)
		.attr("height", height-padding*2)
		.attr("fill", "#ddd");

	svg.append("rect")
		.attr("x", x("6")+x.bandwidth()/2)
		.attr("y", padding)
		.attr("width", x.bandwidth()*4)
		.attr("height", height-padding*2)
		.attr("fill", "#ddd");

	svg.append("g")
  		.attr("class","grid")
  		.attr("transform","translate("+padding*2+", 0)")
  		.style("stroke-dasharray",("3,3"))
  		.call(d3.axisLeft(y)
	    	.ticks(6)
            .tickSize(-width)
            .tickFormat("")
            .tickSizeOuter(0)	
		);

    svg.append("path")
		.datum(maleData.sort((a,b)=>parseInt(a[0])-parseInt(b[0])))
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 2)
			.attr("d", d3.line()
				.x(function(d) { return (x(d[0])) })
				.y(function(d) { return y(d[1]) })
			)
	  		.attr("transform","translate("+x.bandwidth()/2+", 0)");

    svg.append("path")
		.datum(femaleData.sort((a,b)=>parseInt(a[0])-parseInt(b[0])))
			.attr("fill", "none")
			.attr("stroke", "#d65454")
			.attr("stroke-width", 2)
			.attr("d", d3.line()
				.x(function(d) { return (x(d[0])) })
				.y(function(d) { return y(d[1]) })
			)
	  		.attr("transform","translate("+x.bandwidth()/2+", 0)");

	svg.append("g").selectAll("circle")
		.data(maleData)
		.enter()
		.append("circle")
        	.attr("r", 4)
        	.attr("fill", "steelblue")
        	.attr("cx", d=>Math.round(x(d[0])))
        	.attr("cy", d=>Math.round(y(d[1])))
	  		.attr("transform","translate("+x.bandwidth()/2+", 0)");

	svg.append("g").selectAll("circle")
		.data(femaleData)
		.enter()
		.append("circle")
        	.attr("r", 4)
        	.attr("fill", "#d65454")
        	.attr("cx", d=>Math.round(x(d[0])))
        	.attr("cy", d=>Math.round(y(d[1])))
	  		.attr("transform","translate("+x.bandwidth()/2+", 0)");
}

function createYearlyViz(data) {
	let yearCount = new Map();
	for (let datum of data) {
		let year = "20" + datum["Date"].split(" ")[0].split("/")[2];
		if (year !== "2020") {
			if (!yearCount.has(year)) {
				yearCount.set(year, 0);
			}
			yearCount.set(year, yearCount.get(year)+1);
		}
	}
	let yearData = [];
	for (let entry of yearCount) {
		yearData.push(entry);
	}

	const width = $(".container").width();
	const height = 500;
	const padding = 25;
	const fontSize = "14px";
	const maxCount = d3.max(yearData.map(e=>e[1]));
	const minCount = d3.min(yearData.map(e=>e[1]));

	//Create SVG element
    var svg = d3.select("#accidents-per-year")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let x = d3.scaleBand()
    	.domain(yearData.map(e=>e[0]).sort())
    	.range([padding*2, width-padding])
    	.padding(0.1);

	let x_axis = d3.axisBottom()
	    .scale(x);

    svg.append("g")
        .attr("transform", "translate(0, "+(height-padding)+")")
        .style("font", fontSize + " sans-serif")
        .call(x_axis);

    let y = d3.scaleLinear()
    	.domain([minCount, maxCount]).nice()
    	.range([height-padding, padding]);

	let y_axis = d3.axisLeft()
        .scale(y);	

    svg.append("g")
       .attr("transform", "translate("+padding*2+", 0)")
        .style("font", fontSize + " sans-serif")
       .call(y_axis);

	svg.append("g")
  		.attr("class","grid")
  		.attr("transform","translate("+padding*2+", 0)")
  		.style("stroke-dasharray",("3,3"))
  		.call(d3.axisLeft(y)
	    	.ticks(10)
            .tickSize(-width)
            .tickFormat("")
            .tickSizeOuter(0)	
		);

	svg.append("path")
		.datum(yearData)
			.attr("fill", "none")
			.attr("stroke", "steelblue")
			.attr("stroke-width", 2)
			.attr("d", d3.line()
				.x(function(d) { return (x(d[0])) })
				.y(function(d) { return y(d[1]) })
			)
	  		.attr("transform","translate("+x.bandwidth()/2+", 0)");

	svg.append("g").selectAll("circle")
		.data(yearData)
		.enter()
		.append("circle")
        	.attr("r", 4)
        	.attr("fill", "steelblue")
        	.attr("cx", d=>Math.round(x(d[0])))
        	.attr("cy", d=>Math.round(y(d[1])))
	  		.attr("transform","translate("+x.bandwidth()/2+", 0)");
}


function createDemographicsViz(originalData) {
	let data = filterDemographicDataBySeverity(originalData, severityTypes);

	const width = $(".container").width();
	const height = 600;
	const padding = 25;
	const fontSize = "14px";
	const maxCount = Math.max(d3.max(data["Male"].map(d=>d[1])), d3.max(data["Female"].map(d=>d[1])));

	//Create SVG element
    var svg = d3.select("#demographics")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let x = d3.scaleBand()
    	.domain(ageGroups)
    	.range([padding*2, width-padding])
    	.padding(0.1);

	let x_axis = d3.axisBottom()
	    .scale(x);

    svg.append("g")
        .attr("transform", "translate(0, "+(height-padding)+")")
        .style("font", fontSize + " sans-serif")
        .call(x_axis);

    let y = d3.scaleLinear()
    	.domain([0, maxCount]).nice()
    	.range([height-padding, padding]);

	let y_axis = d3.axisLeft()
        .scale(y);	

    svg.append("g")
       .attr("transform", "translate("+padding*2+", 0)")
        .style("font", fontSize + " sans-serif")
       .call(y_axis);

	svg.append("g")
  		.attr("class","grid")
  		.attr("transform","translate("+padding*2+", 0)")
  		.style("stroke-dasharray",("3,3"))
  		.call(d3.axisLeft(y)
	    	.ticks(10)
            .tickSize(-width)
            .tickFormat("")
            .tickSizeOuter(0)	
		);

	updateDemographicsViz(data, svg, x, y, height, padding, true);

	$(".severity").click(function() {
		let severityFilters = [];
		let numChecked = 0;
		$(".severity").each(function(i, e) {
			if (e.checked) {
				severityFilters.push(e.value);
				numChecked++;
			}
		});

		if (numChecked === 0) {
			$(this).prop("checked", true);
			alert("No data to display!");
		}
		else {
			let newData = filterDemographicDataBySeverity(originalData, severityFilters);
			updateDemographicsViz(newData, svg, x, y, height, padding, false);
		}
	})
}

function updateDemographicsViz(data, svg, x, y, height, padding, isFirstUpdate) {

	let female = svg.selectAll("rect.female").data(data["Female"]);
	let male = svg.selectAll("rect.male").data(data["Male"]);

	if (isFirstUpdate) {
		female = female.enter().append("rect");
		male = male.enter().append("rect");
	} else {
		female = female.enter().append("rect")
	    	.merge(female).transition().duration(1000);
		male = male.enter().append("rect")
	    	.merge(male).transition().duration(1000);
	}

    female
    	.attr("class", "female")
    	.attr("x", d=>x(d[0]))
		.attr("y", d=>y(d[1]))
		.attr("width", (d) => x.bandwidth()/2)
		.attr("height", (d) =>(height-padding-y(d[1])))
		.style("cursor", "pointer")
		.style("fill", "#d65454");

	male
    	.attr("class", "male")
    	.attr("x", d=>x(d[0])+x.bandwidth()/2)
		.attr("y", d=>y(d[1]))
		.attr("width", (d) => x.bandwidth()/2)
		.attr("height", (d) =>(height-padding-y(d[1])))
		.style("cursor", "pointer")
		.style("fill", "steelblue");
}


function filterDemographicDataBySeverity(data, severityFilters) {
	let counts = {};
	for (let datum of data) {
		let age = String(datum["age"]);
		let gender = datum["gender"];
		let severity = datum["severity_of_injury"]; // "", "Fatal", "Minor Injury", "No Injury", "Severe Injury"

		if (age !== "" && ageGroups.includes(age) && (gender === "Male" || gender === "Female") && severityFilters.includes(severity)) {
			if (!(gender in counts)) {
				counts[gender] = {};
			}
			if (!(age in counts[gender])) {
				counts[gender][age] = 0;
			}
			counts[gender][age]++;
		}
	}
	let reformattedData = {"Male": [], "Female": []};
	for (let age in counts["Male"]) {
		reformattedData["Male"].push([age, counts["Male"][age]]);
	}
	for (let age in counts["Female"]) {
		reformattedData["Female"].push([age, counts["Female"][age]]);
	}
	// console.log(reformattedData);
	return reformattedData;
}


//function createMonthlyViz(data, data2) {
function createMonthlyViz(data) {
	const rawData = data;
	const width = $(".container").width() - 100; // scales width based on the .content's width
	const height = 700;
	const xOffset = 50;
	const fontSize = "14px";
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const colorPalette = d3.interpolateHcl("#f4e153", "#362142");
	const t = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	// Note: these helper methods only pertain to this viz, so they're defined within this scope (not global).
	function getYear(dateTime) {
		// there's a few cases where there's a comma after the year, as in "2018,"
		dateTime = dateTime.replace(",", "")
		let year = parseInt("20"+dateTime.split(" ")[0].split("/")[2])
		return year
	}

	function getMonth(dateTime) {
		let month = parseInt(dateTime.split(" ")[0].split("/")[0])
		if (month >= 1 && month <= 12) {
			return month
		}
		else {
			// there's a few weird cases where month is the second element, as in dd/mm/YYYY
			return parseInt(dateTime.split(" ")[0].split("/")[1])
		}
	}

	let dataByYear = d3.rollups(data, v => v.length, d => getYear(d.Date), d => getMonth(d.Date));
	dataByYear.shift();

	let max = Math.max.apply(Math, dataByYear.map(x => x[1].flat().filter((a,i)=>i%2==1)).flat());
	let min = Math.min.apply(Math, dataByYear.map(x => x[1].flat().filter((a,i)=>i%2==1)).flat());
    
    let specifics = {2020: {}, 2019: {}, 2018: {}, 2017: {}, 2016: {}, 2015: {},
                     2014: {}, 2013: {}, 2012: {}, 2011: {}, 2010: {}};

    for (let i = 0; i < rawData.length; ++i) {
        // date stuff
        let currD = rawData[i].Date;
        let currM = getMonth(currD);
        let currY = getYear(currD);
        // additional info that we want
        let sev = severityTypes.includes(rawData[i].Severity) ? rawData[i].Severity : "Not Available";
        let sex = genders.includes(rawData[i].Sex) ? rawData[i].Sex : "Not Available";
        
        if (currM in specifics[currY]) {
            specifics[currY][currM].sev[sev] += 1;
            specifics[currY][currM].sex[sex] += 1;
        } else {
            specifics[currY][currM] = {sev: {"Fatal": 0, "Minor Injury": 0,
                                             "No Injury": 0, "Severe Injury": 0,
                                             "Not Available": 0},
                                       sex: {"Male": 0, "Female": 0, "Not Available": 0}};
            specifics[currY][currM].sev[sev] += 1;
            specifics[currY][currM].sex[sex] += 1;
        } // end if-else
    } // end for loop


    //Create SVG element
    var svg = d3.select("#accidents-per-month")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // X-axis
    var x = d3.scaleBand()
	    .domain(d3.range(months.length))
	    .range([0, width - (xOffset + 25)])
	    .padding(0.1);

	var x_axis = d3.axisBottom()
	    .scale(x)
	    .tickFormat(i => months[i])
	    .tickSizeOuter(0);

    svg.append("g")
        .attr("transform", "translate(" + xOffset + ", " + (height - 25)  +")")
        .style("font", fontSize + " sans-serif")
        .call(x_axis);

	// Y-axis
    var y = d3.scaleLinear()
	    .domain([min, max]).nice() // gets the max # of injuries
		.range([height - 25, 25]);

	var y_axis = d3.axisLeft()
        .scale(y);	

    svg.append("g")
       .attr("transform", "translate(" + xOffset + ", 0)")
       .style("font", fontSize + " sans-serif")
       .call(y_axis);

    // Z-axis
	var z = d3.scaleOrdinal()
	    .domain(dataByYear.map(x => x[0])) // gets all the years (2010-2020) from the data
	    .range(d3.quantize(colorPalette, dataByYear.length)) // segments our colorPalette into the number of years

	// Render data points
    dataByYear.forEach((e) =>
	    svg.append("g")
			.attr("fill", z(e[0])) // uses the legend to assign the right color (year) to the data point
		.selectAll("rect")
		.data(e[1]) // this is the array with the data for each month for the current year e[0]
		.enter()
			.append("rect")
			.attr("data-year", e[0])
			.attr("class", "y" + e[0] + " bar") // used for mouseover effects
			.attr("x", (d, i) => x(d[0]-1)+xOffset) // months are 0-indexed 
			.attr("y", d => y(d[1])) // injury count for that month
			.attr("height", d => 8)
			.attr("width", x.bandwidth()));

    // Generate averages line
    const active = new Set(dataByYear.map((e) => e[0]));

    function computeAverages() {
		return d3.rollups(rawData.filter((e) => active.has(getYear(e.Date))), v => v.length/active.size, d => getMonth(d.Date)-1).sort((a, b) => d3.ascending(a[0], b[0])); 
	}

	let line = d3.line(computeAverages())
	    .x(d => x(d[0]))
	    .y(d => y(d[1]));

    svg.append("path")
        .attr("class", "path")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line(computeAverages()))
        .attr("transform", "translate(" + (x.bandwidth()/2 + xOffset) + ")");

    // Render tooltips
    let ttToggle = false;
    
    const tooltip = d3.select("#accidents-per-month").append("div")
		.attr("class", "svg-tooltip")
		.style("position", "absolute")
		.style("visibility", "hidden");

	svg.selectAll("rect.bar")
		.on("mouseover", function(){
            d3.select(this).style("cursor", "pointer");
			let year = d3.select(this)
				.attr("data-year");
			let month = months[d3.select(this).data()[0][0]-1];
			let count = d3.select(this)
				.data()[0][1];
			tooltip.text(month + " " + year + ": " + count + " injuries")
				.style("font", fontSize + " sans-serif");
			return tooltip.style("visibility", "visible");
		})
		.on("mousemove", function(){
			return tooltip
                .style("top", (d3.event.pageY-10)+"px")
                .style("left", (d3.event.pageX-tooltip.style("width").replace("px","")-20)+"px");
		})
		.on("mouseout", function(){
            ttToggle = false;
			let year = d3.select(this)
				.attr("data-year");
			return tooltip
				.style("visibility", "hidden");
		})
        .on("click", function(){
            ttToggle = !ttToggle;
            console.log(ttToggle);
            let year = d3.select(this).attr("data-year");
            let yearInt = parseInt(year);
            let monthInt = d3.select(this).data()[0][0];
            let month = months[monthInt-1];
            let count = d3.select(this).data()[0][1];
            if (ttToggle) {
                tooltip.text(month + " " + year + ": " + count + " injuries\n\n"
                     + "INJURIES BY GENDER:\n"
                     + "  " + specifics[yearInt][monthInt].sex.Male + " males\n"
                     + "  " + specifics[yearInt][monthInt].sex.Female + " females\n"
                     + "  " + specifics[yearInt][monthInt].sex["Not Available"] + " not available\n\n"
                     + "INJURIES BY SEVERITY:\n"
                     + "  " + specifics[yearInt][monthInt].sev["No Injury"] + " no injury\n"
                     + "  " + specifics[yearInt][monthInt].sev["Minor Injury"] + " minor injury\n"
                     + "  " + specifics[yearInt][monthInt].sev["Severe Injury"] + " severe injury\n"
                     + "  " + specifics[yearInt][monthInt].sev["Fatal"] + " fatal\n"
                     + "  " + specifics[yearInt][monthInt].sev["Not Available"] + " not available");
            } else {
                tooltip.text(month + " " + year + ": " + count + " injuries")
                    .style("font", fontSize + " sans-serif");
            }
        
        return tooltip
            .style("visibility", "visible")
            .style("top", (d3.event.pageY-10)+"px")
            .style("left", (d3.event.pageX-tooltip.style("width").replace("px","")-20)+"px");
    });

	// Render legend
	$("#accidents-per-month").prepend($("<div class='legend'>"));
	let legend = d3.select("div#accidents-per-month div.legend")
		.append("svg")
		.attr("width", 100)
		.attr("height", 250);

	function show(year) {
		d3.select("#accidents-per-month")
			.selectAll("rect.y" + year)
			.transition(t)
			.attr("data-active", 1)
			.style("opacity", "1");
		active.add(year);
	}

	function hide(year) {
		d3.select("#accidents-per-month")
			.selectAll("rect.y" + year)
			.transition(t)
			.attr("data-active", 0)
			.style("opacity", "0.1");
		active.delete(year);
	}

	function toggle(year) {
		let current = d3.select("#accidents-per-month").selectAll("rect.y" + year);
		if (current.attr("data-active") == 0) {
			show(year);
		}
		else {
			hide(year);
		}
		d3.select("#accidents-per-month>svg") // make sure to not mess with any other paths
			.select(".path")
			.transition(t)
			.attr("d", line(computeAverages()));
	}

	legend.selectAll("g")
		.data(dataByYear.map(x => x[0]))
		.enter()
		.append("g")
			.attr("transform", (d, i) => `translate(0, ${(i - (dataByYear.length - 1) / 2) * 20 + 110})`)
		    .style("font", fontSize + " sans-serif")
			.call(g => g.append("rect")
			    .style("cursor", "pointer")
			    .attr("class", (e) => "y" + e + " legend")
			    .attr("width", 20)
			    .attr("height", 20)
			    .attr("fill", z)
			    .attr("data-active", 1))
			.call(g => g.append("text")
			    .style("cursor", "pointer")
			    .attr("x", 24)
			    .attr("y", 9)
			    .attr("dy", "0.5em")
			    .text(d => d))
			.on("click", (e) => toggle(e));

	// Extra description in the legend
	$("div#accidents-per-month div.legend").append($("<p id='blue-line-desc'>Blue line represents the average number of accidents in a given month, over the selected years.</p>"));

	// Hide all button in legend
	function hideAll() {
		dataByYear.map((e) => e[0]).forEach((e) => hide(e));
		d3.select("#accidents-per-month>svg").select(".path").transition(t).attr("d", line(computeAverages()));
	}

	let hideButton = $("<button>Clear All</button>");
	$("div#accidents-per-month div.legend").append(hideButton);
	hideButton.click(function() {hideAll()});

	// Show all button in legend
	function showAll() {
		dataByYear.map((e) => e[0]).forEach((e) => show(e));
		d3.select("#accidents-per-month>svg").select(".path").transition(t).attr("d", line(computeAverages()));
	}

	let selectButton = $("<button>Select All</button>");
	$("div#accidents-per-month div.legend").append(selectButton);
	selectButton.click(function() {showAll()});

	toggle(2018);
	toggle(2017);
	toggle(2016);
	toggle(2015);
	toggle(2014);
	toggle(2013);
	toggle(2012);
	toggle(2011);
	console.log(active);
}
