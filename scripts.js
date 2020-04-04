$(document).ready(function() {
	// This is the top-level function, it should call the functions to create each viz.
	// MAKE SURE that in your viz-creating function, your select() functions use specific-enough selectors so you don't modify the wrong viz!
	d3.csv("https://gist.githubusercontent.com/kennyyuan98/6256ac48a40147748d78cd544b63942d/raw/21922ad6877a68a2eee9a382986508f6eb92f302/accidentdata-time.csv", function(data) {
		createMonthlyViz(data);
	});
});

/* 
* Logic for creating the chart showing number of cases per month over the years (A4). 
* Note: All logic should be self-contained and shouldn't affect any data / DOM elements besides itself.
*/
function createMonthlyViz(data) {
	const rawData = data;
	const width = $(".content").width() - 100; // scales width based on the .content's width
	const height = 700;
	const xOffset = 50;
	const fontSize = "12px";
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const colorPalette = d3.interpolateHcl("#f4e153", "#362142");
	const t = d3.transition()
		.duration(1000)
		.ease(d3.easeLinear);

	// Note: these helper methods only pertain to this viz, so they're defined within this scope (not global).
	function getYear(dateTime) {
		// there's a few cases where there's a comma after the year, as in "2018,"
		dateTime = dateTime.replace(",", "")
		let year = parseInt(dateTime.split(" ")[0].split("/")[2])
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
    const tooltip = d3.select("#accidents-per-month").append("div")
		.attr("class", "svg-tooltip")
		.style("position", "absolute")
		.style("visibility", "hidden");

	svg.selectAll("rect.bar")
		.on("mouseover", function(){
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
			let year = d3.select(this)
				.attr("data-year");
			return tooltip
				.style("visibility", "hidden");
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
}
