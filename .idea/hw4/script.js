/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;


/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .domain([-1, 1])
    .range(['#cb181d', '#034e7b']);

var gameColorScale = d3.scaleLinear()
    .range(['#b1b1b1', '#006666']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};



//For the HACKER version, comment out this call to d3.json and implement the commented out
// d3.csv call below.

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;
    createTable();
    updateTable();
})


// // ********************** HACKER VERSION ***************************
// /**
//  * Loads in fifa-matches.csv file, aggregates the data into the correct format,
//  * then calls the appropriate functions to create and populate the table.
//  *
//  */
// d3.csv("data/fifa-matches.csv", function (error, csvData) {
//
//    // ******* TODO: PART I *******
//
//
// });
// // ********************** END HACKER VERSION ***************************

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

// ******* TODO: PART II *******


    // determine axis scale
    var max1 = d3.max(teamData, function(d) {
         return d.value['Goals Made']
    });
    var max2 = d3.max(teamData, function(d) {
        return d.value['Goals Conceded']
    });
    var maxGoals = d3.max([max1, max2]);
    goalScale.domain([0, maxGoals])
        .nice();

   gameScale.domain([0, d3.max(teamData, function (d) {
       return(d.value.TotalGames)
   })]);

    gameColorScale.domain([1, d3.max(teamData, function (d) {
        return(d.value.TotalGames)
    })]);

    //create axis
    goalHeader = d3.select('#goalHeader')
        .append('svg')
        .attr('width',2*cellWidth)
        .attr('height',cellHeight);

    var gAxis = d3.axisBottom()
        .scale(goalScale);

    goalHeader.append('g')
        .call(gAxis);

    // set up table, bind data and create td's

    var tr = d3.select('tbody').selectAll('tr').data(teamData)
        .enter()
        .append('tr');

    var td = tr.selectAll('td').data(function(d) {
            return [{'type': 'aggregate', 'vis': 'teamText', 'value': d.key},
                    {'type': 'aggregate', 'vis': 'goals', 'value': [d.value['Goals Made'], d.value['Goals Conceded'] ]},
                    {'type': 'aggregate', 'vis': 'roundText', 'value': d.value.Result.label},
                    {'type': 'aggregate', 'vis': 'games', 'value': d.value.Wins},
                    {'type': 'aggregate', 'vis': 'games', 'value': d.value.Losses},
                    {'type': 'aggregate', 'vis': 'games', 'value': d.value.TotalGames}];
        });

    tableElements = td.enter()
        .append('td');

    td = tableElements.merge(td);

    //goals circles
    goalCircles = tableElements.filter( function (d) {
            return d.vis == 'goals';
        })
        .append('svg')
        .attr('width', 2*cellWidth)
        .attr('height', cellHeight)
        .append('rect')
        .attr('height',cellHeight)
        .attr('x', function(d) {
            return goalScale(d3.min(d.value))
        })
        .attr('y',3)
        .attr('height',14)
        .attr('width', function(d) {
            return goalScale(Math.abs(d.value[1]-d.value[0])) - cellBuffer
        })
        .style('opacity', 0.6)
        .style('fill', function(d) {
            return goalColorScale(d.value[0]-d.value[1])
        });

    console.log(goalCircles)

    tableElements.select('svg')
        .append('circle')
        .attr('cx', function (d) {
            return goalScale(d.value[0])
        })
        .attr('cy', function (d) {
            return cellHeight/2
        })
        .attr('class','goalScored');;

    tableElements.select('svg')
        .append('circle')
        .attr('cx', function (d) {
            return goalScale(d.value[1])
        })
        .attr('cy', function (d) {
            return cellHeight/2
        })
        .attr('class', function (d) {
            if (d.value[0] == d.value[1]) {
                return 'equal';
            }
            else {
                return 'conceded';
            }

        });

    //games bars
    newbars = tableElements.filter( function (d) {
            return d.vis == 'games';
        })
        .append('svg')
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .append('rect')
        .attr('height',cellHeight)
        .attr('width', function (d) {
            return(gameScale(d.value))
        })
        .style('fill', function (d) {
            return gameColorScale(d.value)
        });

    //text columns
    tableElements.filter(function (d) {
        return d.vis == 'teamText';
    })
        .text(function (d) {
            return d.value
        })
        .style('color','#317f19')
        .style('font-weight', 'bold');

    tableElements.filter(function (d) {
        return d.vis == 'roundText';
    })
        .text(function (d) {
            return d.value
        })
        .style('font-weight', 'bold');

    barText = tableElements.filter(function (d) {
            return d.vis == 'games'
        })
        .select('svg')
        .append('text')
        .text(function (d) {
            return d.value;
        })
        .attr('class','barText')
        .attr('y',14)
        .attr('x', function (d) {
            return gameScale(d.value);
        })
        .style('font-weight','bold')
        .style('color','#ffffff');





// ******* TODO: PART V *******

}

/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

// ******* TODO: PART III *******


};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {

    // ******* TODO: PART IV *******


}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(i) {

    // ******* TODO: PART IV *******


}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

    // ******* TODO: PART VI *******


};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

    // ******* TODO: PART VII *******


}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

    // ******* TODO: PART VII *******
    

}



