"use strict";
(function(){
    let data = ""
    let svgContainer = ""
    let filteredData = ""
    let genFilteredData = ""
    let legendaryInput = "legendaryAll"
    let generationInput = "genAll"

    // dimensions for svg
    const measurements = {
        width: 800,
        height: 500,
        marginAll: 50
    }

    // div for tooltip
    const div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

    // load data, append svg to body, make scatterplot
    svgContainer = d3.select('body').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then((data) => filteredData = data)
        .then((data) => replaceType2(data))
        .then(() => makeScatterPlot(data))

    // filter data for legendary and generation conditions
    function filterData(data, legendaryInput, generationInput) {
        filteredData = data.filter(function(d, i) {
            if (legendaryInput !== "legendaryAll") {
                return data[i].Legendary === legendaryInput;
            } else {
                return data[i];
            }
        });
        genFilteredData = filteredData.filter(function(d, i) {
            if (generationInput !== "genAll") {
                return filteredData[i].Generation === generationInput;
            } else {
                return filteredData[i];
            }
        });
        filteredData = genFilteredData;
        return filteredData;
    }

    // replace empty type 2s with "None"
    function replaceType2(data) {
        data = data.filter(function (d,i) {
            if (data[i]["Type 2"] === "") {
                return data[i]["Type 2"] = "None";
            }
        })
    }

    // on change to legendary input, remove previous scatterplot
    // and remake scatterplot with new filtered values
    d3.select("#legendary").on("change", function(d) {
        legendaryInput = d3.select("#legendary").node().value;
        filteredData = filterData(data, legendaryInput, generationInput);
        d3.selectAll("svg > *").remove();
        makeScatterPlot(filteredData);
    })

    // on change to generation input, remove previous scatterplot
    // and remake scatterplot with new filtered values
    d3.select("#generation").on("change", function(d) {
        generationInput = d3.select("#generation").node().value;
        filteredData = filterData(data, legendaryInput, generationInput);
        d3.selectAll("svg > *").remove();
        makeScatterPlot(filteredData);
    })

    // make scatterplot
    function makeScatterPlot(data) {
        let specialDef = data.map((row) => parseInt(row["Sp. Def"]))
        let totalStats = data.map((row) =>  parseFloat(row["Total"]))
        // find range of data
        const limits = findMinMax(specialDef, totalStats)
        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.spDefMin - 5, limits.spDefMax])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.tStatsMax, limits.tStatsMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])
        drawAxes(scaleX, scaleY)
        plotData(scaleX, scaleY)
        makeLabels()
    }

    // find min and max for range
    function findMinMax(specialDef, totalStats) {
        return {
            spDefMin: d3.min(specialDef),
            spDefMax: d3.max(specialDef),
            tStatsMin: d3.min(totalStats),
            tStatsMax: d3.max(totalStats)
        }
    }

    // draw axes 
    function drawAxes(scaleX, scaleY) {
        let xAxis = d3.axisBottom()
            .scale(scaleX)
        let yAxis = d3.axisLeft()
            .scale(scaleY)
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)
        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    // plot data points
    function plotData(scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }   
        
        const circles = svgContainer
            .selectAll(".circle")
            .data(filteredData)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 3)
                // fill dots according to type 1
                .style("fill", function(d, i) {
                    if (data[i]["Type 1"] === "Bug") {
                        return "#4E79A7"
                    } else if (data[i]["Type 1"] === "Dark") {
                        return "#A0CBE8"
                    } else if (data[i]["Type 1"] === "Electric") {
                        return "#F28E2B"
                    } else if (data[i]["Type 1"] === "Fairy") {
                        return "#FFBE7D"
                    } else if (data[i]["Type 1"] === "Fighting") {
                        return "#59A14F"
                    } else if (data[i]["Type 1"] === "Fire") {
                        return "#8CD17D"
                    } else if (data[i]["Type 1"] === "Ghost") {
                        return "#B6992D"
                    } else if (data[i]["Type 1"] === "Grass") {
                        return "#499894"
                    } else if (data[i]["Type 1"] === "Ground") {
                        return "#86BCB6"
                    } else if (data[i]["Type 1"] === "Ice") {
                        return "#FABFD2"
                    } else if (data[i]["Type 1"] === "Normal") {
                        return "#E15759"
                    } else if (data[i]["Type 1"] === "Poison") {
                        return "#FF9D9A"
                    } else if (data[i]["Type 1"] === "Psychic") {
                        return "#79706E"
                    } else if (data[i]["Type 1"] === "Steel") {
                        return "#BAB0AC"
                    } else if (data[i]["Type 1"] === "Water") {
                        return "#D37295"
                    } else if (data[i]["Type 1"] === "Dragon") {
                        return "#FCD745"
                    } else if (data[i]["Type 1"] === "Flying") {
                        return "#D5A5C9"
                    } else if (data[i]["Type 1"] === "Rock") {
                        return "#966C5D"
                    }
                })
                // tooltips for pokemon name, type 1 and type 2
                .on("mouseover", function(d) {		
                    div.transition()		
                        .duration(200)		
                        .style("opacity", .9);		
                    div	.html("Pokemon Name: " + d["Name"] + "<br/>"  + "Type 1: " + d["Type 1"] + "<br/>" + "Type 2: " + d["Type 2"])	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                    })					
                .on("mouseout", function(d) {		
                    div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });
    }
    
    // make title and axes labels
    function makeLabels() {
        svgContainer.append('text')
            .attr('x', 260)
            .attr('y', 40)
            .style('font-size', '14pt')
            .text("Pokemon: Special Defense vs Total Stats");
        svgContainer.append('text')
            .attr('x', 395)
            .attr('y', 490)
            .style('font-size', '10pt')
            .text('Sp. Def');
        svgContainer.append('text')
            .attr('transform', 'translate(15, 250)rotate(-90)')
            .style('font-size', '10pt')
            .text('Total');
    }
})()
