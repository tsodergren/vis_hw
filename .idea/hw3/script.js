// Global var for FIFA world cup data
var allWorldCupData;
var selectedBar = -1;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function updateBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect(),
        xAxisWidth = 100,
        yAxisHeight = 70;

    // ******* TODO: PART I *******

    // Create the x and y scales; make
    // sure to leave room for the axes


    var margin = {top: 0, right: 0, bottom: 70, left: 70},
        width = svgBounds.width - margin.left - margin.right,
        height = svgBounds.height - margin.top - margin.bottom;

    // Create colorScale

    var colorScale = d3.scaleLinear()
        .domain([0, d3.max(allWorldCupData, function(d) {
            return d[selectedDimension]
        })])
        .range(['steelblue', 'darkblue']);

    // Create the axes (hint: use #xAxis and #yAxis)

    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(allWorldCupData.map(function(d) {
            return d.year
        }));
    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(allWorldCupData, function(d) {
            return d[selectedDimension]
        })])
        .nice();

    console.log(allWorldCupData)
    d3.max(allWorldCupData, function(d) {
        return d[selectedDimension]
    })

    var xAxis = d3.axisBottom()
        .scale(xScale);
    var yAxis = d3.axisLeft()
        .scale(yScale);

    var xAxisGroup = d3.select('#xAxis');
    xAxisGroup.attr('transform', 'translate(' + margin.left + ',' + height +')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor','end')
        .attr('dx', '-.8em')
        .attr('dy', '-.55em')
        .attr('transform', 'rotate(-90)' );

    var yAxisGroup = d3.select('#yAxis');
    yAxisGroup.attr('transform', 'translate(' + margin.left + ', 0)')
        .transition()
        .duration(2000)
        .call(yAxis);

    t = yAxisGroup.selectAll(".tick");
    numel = t.size();
    t.each(function (d, i) {
        if ( i == numel-1 ) {
            this.remove();}
        });

    // Create the bars (hint: use #bars)

  var bars = d3.select('#bars').selectAll('rect').data(allWorldCupData);

    //Exit old elements
    bars.exit().remove();

    //Enter new elements and update bars with merge
    bars = bars.enter().append('rect')
        .attr("width", 20)
        .attr("x", function(d) {
            return xScale(d.year)+margin.left;
        })
        .merge(bars)
        .attr('class','unselected')
        .style("fill", function (d, i) {
            if (i == selectedBar) {
                return '#d20a11'
            } else {
                return colorScale(d[selectedDimension])
            }
        })
        .transition()
        .duration(2000)
        .attr("y", function(d) {
            return yScale(d[selectedDimension]);
        })
        .attr("height", function(d) {
            return height - yScale(d[selectedDimension]);
        });




    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
    // Color the selected bar to indicate is has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.

    bars = d3.select('#bars').selectAll('rect');
    bars.on('click', function(d,i) {
        selectedBar = i;
        updateBarChart(selectedDimension);
        updateInfo(i);
        updateMap(i);
    })

}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData() {

    // ******* TODO: PART I *******
    var selectedDimension = document.getElementById('dataset').value;
    updateBarChart(selectedDimension)
}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******

    selectedData = allWorldCupData.slice(oneWorldCup, oneWorldCup+1);



    var edition = d3.select('#edition').data(selectedData)
    edition = edition.text( function (d) {
        return d.EDITION;
    })

    var host = d3.select('#host').data(selectedData);
    host = host.text( function(d) {
        return d.host
    });

    var winner = d3.select('#winner').data(selectedData);
    winner = winner.text( function(d) {
        return d.winner
    });

    var silver = d3.select('#silver').data(selectedData);
    silver = silver.text( function(d) {
        return d.runner_up
    });

    var teams = d3.select('#teams').data(selectedData)

    teams=teams.selectAll('li')
        .data(function (d) {
            return d.teams_names
        });

    teams.enter().append('li')
        .merge(teams)
        .text( function (d) {
            return d
        })

    teams.exit().remove();
    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

}

/**
 * Renders and updated the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)
    var path = d3.geoPath().projection(projection);
    var mainMap = d3.select('#map');


    d3.json('data/world.json', function(json) {
        mainMap.selectAll('path')
            .data(topojson.feature(json, json.objects.countries).features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class','countries')
            .attr('id', function(d) {
                return d.id;
            });

        mainMap.exit().remove();
    });

    var graticule = d3.geoGraticule();
    mainMap.append('path')
        .datum(graticule)
        .attr('class','grat')
        .attr('d', path)
        .attr('id', 'grid');


}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.

    var map = d3.select('#map').selectAll('path');
    map.attr('class','countries');
    map.classed('grat', function() {
        if (this.id == 'grid') { return true}
    })


}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(oneWorldCup) {

    //Clear any previous selections;
    clearMap();

    var selectedData = allWorldCupData.slice(oneWorldCup, oneWorldCup+1);

    var host = selectedData.map(function(d) {return d.host_country_code});
    var teamNames = selectedData.map(function(d) {return d.teams_names})[0];
    var teamCodes = selectedData.map(function(d) {return d.teams_iso})[0];

    var winner = selectedData.map(function(d) {return d.winner});
    var silver = selectedData.map(function(d) {return d.runner_up});

    for (var j=0; j<teamCodes.length; j++) {
        d3.select('#map').selectAll('path')
            .each(function(d,i) {
                if(d.id == teamCodes[j]) {
                    if(teamCodes[j] == host) {
                        this.setAttribute('class', 'host')
                    }
                    else {
                        this.setAttribute('class','team')
                    }
                }
            })
        if (teamNames[j] == winner) {
            var winnerCode = teamCodes[j];
        }
        else if (teamNames[j] == silver) {
            var silverCode = teamCodes[j];
        }
    }

    var winnerCountry = d3.select('#' + winnerCode);
    var silverCountry = d3.select('#' + silverCode);


    var projection = d3.geoConicConformal().scale(150).translate([400, 350]);
    var path = d3.geoPath().projection(projection);

    d3.json("data/world.json", function(json) {
        var data = topojson.feature(json, json.objects.countries);

        var centroid = path.centroid(winnerCountry.datum());
        var centroid2 = path.centroid(silverCountry.datum());
        var classes = ['gold','silver'];

        var centroids = [centroid, centroid2];

        var map = d3.select('#points').selectAll('circle').data(centroids);

        map.exit().remove();

        map.enter().append('circle')
            .merge(map)
            .attr('class',function(d, i) {return classes[i]})
            .attr('cx', function(d) {return d[0]})
            .attr('cy', function(d) {return d[1]});
    });

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.


    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.



}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

//Load in json data to make map
d3.json("data/world.json", function (error, world) {
    if (error) throw error;
    drawMap(world);
});

// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;

    allWorldCupData.sort(function(a, b) {
        return d3.ascending(a.year, b.year)
    })
    // Draw the Bar chart for the first time
    updateBarChart('attendance');
});
