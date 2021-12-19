document.addEventListener("DOMContentLoaded", function () {
  var prom = [];
  var url = [
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  ];

  url.forEach((u) => prom.push(d3.json(u)));
  Promise.all(prom)
    .then((d) => {
      createChart(d);
    })
    .catch((error) => console.error(error.message));

  function createChart(data) {
    // Variables and constants
    const W = 1000;
    const H = 600;
    const PADDING = 60;
    const STATS = data[0];
    const TOPOLOGY = data[1];

    var minBachelorsOrHigher = STATS.reduce((a, b) =>
      a.bachelorsOrHigher < b.bachelorsOrHigher ? a : b
    ).bachelorsOrHigher;
    var maxBachelorsOrHigher = STATS.reduce((a, b) =>
      a.bachelorsOrHigher > b.bachelorsOrHigher ? a : b
    ).bachelorsOrHigher;

    // Title text and description
    d3.select("#title").text("USA Educational Stats");
    d3.select("#description").html(
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );

    // Color scale
    var colorScale = d3
      .scaleQuantile()
      .domain([minBachelorsOrHigher, maxBachelorsOrHigher])
      .range(colorbrewer.Reds[7]);

    // Create the canvas
    const svg = d3
      .select(".chartContainer")
      .append("svg")
      .attr("width", W)
      .attr("height", H);

    // Initilaize tooltip
    var tooltip = d3
      .select(".chartContainer")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // Begin drawing
    var path = d3.geoPath();

    // Counties
    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(TOPOLOGY, TOPOLOGY.objects.counties).features) // Since data is given in topojson-format
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        var result = STATS.filter((o) => o.fips === d.id);
        return result[0] ? result[0].bachelorsOrHigher : 0;
      })
      .attr("fill", (d) => {
        var result = STATS.filter((o) => o.fips === d.id);
        return result[0] ? colorScale(result[0].bachelorsOrHigher) : "none";
      })
      .attr("stroke", "#000")
      .attr("stroke-width", "0.1")
      .on("mouseover", (i, d) => {
        tooltip
          .transition()
          .duration(0)
          .style("left", i.pageX + 10 + "px")
          .style("top", i.pageY - 25 + "px")
          .style("opacity", 0.9)
          .attr("data-education", () => {
            var result = STATS.filter((o) => o.fips === d.id);
            return result[0] ? result[0].bachelorsOrHigher : 0;
          });
        tooltip.html(() => {
          var result = STATS.filter((o) => o.fips === d.id);
          return result[0]
            ? result[0]["area_name"] +
                ", " +
                result[0]["state"] +
                ": " +
                result[0].bachelorsOrHigher +
                "%"
            : 0;
        });
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // States
    svg
      .append("g")
      .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(TOPOLOGY, TOPOLOGY.objects.states).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.2");

    // Country
    svg
      .append("g")
      .attr("class", "nation")
      .selectAll("path")
      .data(topojson.feature(TOPOLOGY, TOPOLOGY.objects.nation).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#38761d")
      .attr("stroke-width", "0.4");

    // Legend
    var colorRange = [];
    for (var i = 0; i < colorScale.range().length; i++) {
      colorRange.push(colorScale.invertExtent(colorScale.range()[i])[0]);
    }

    var legend = svg.append("g").attr("id", "legend");
    var legendColors = legend
      .selectAll("rect")
      .data(colorRange)
      .enter()
      .append("rect")
      .attr("fill", (d) => colorScale(d))
      .attr("x", (d, i) => W - 400 + i * 40 + "")
      .attr("y", (d, i) => 30 + "")
      .attr("width", "40")
      .attr("height", "10");
    var legendText = legend
      .selectAll("text")
      .data(colorRange)
      .enter()
      .append("text")
      .attr("x", (d, i) => W - 400 + i * 40 + "")
      .attr("y", (d, i) => 50 + "")
      .attr("dy", "0.35em")
      .text((d) => Math.round((d + Number.EPSILON) * 100) / 100)
      .style("font-size", ".8em");
  }
});
