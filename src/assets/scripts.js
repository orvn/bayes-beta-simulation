// http://bl.ocks.org/mbostock/3883245 : line chart
// http://bl.ocks.org/mbostock/3884955 : series of line charts

var bias = 0.15,
  numTrialsForUpdate = 1,
  n = 0,
  k = 0,
  ymax,
  coin;
var grid = d3.range(0, 1.005, 1 / 200);
var f = [];
var data = [];

var margin = { top: 15, right: 50, bottom: 50, left: 50 },
  width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]);

var y = d3.scale.linear().range([height, 0]);

var line = d3.svg
  .line()
  .x(function (d) {
    return x(d.x);
  })
  .y(function (d) {
    return y(d.y);
  });

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left");

var svg_path = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg_text = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", 75)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain([0, 1]);

svg_path
  .append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg_path
  .append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em");
var timeoutNr;

var tosses = [];
function myLoop(i) {
  if (i == 1) {
    clearTimeout(timeoutNr);
    ymax = 8;
    y.domain([0, ymax]);
    svg_path.select(".y.axis").call(yAxis);
    bias = document.getElementById("bias").value;
    svg_text.selectAll("text").remove();
    svg_path.selectAll("path.trial").remove();
    (n = 0), (k = 0);
    data = [];
    data.push({
      trial: "num" + n,
      values: grid.map(function (d) {
        return { x: d, y: 1 };
      }),
    });
    tosses = [];
  }
  timeoutNr = setTimeout(function () {
    sim(numTrialsForUpdate);
    data.push({
      trial: "num" + n,
      info: "flips:" + n + " heads:" + k,
      values: grid.map(function (d) {
        return { x: d, y: BETA(d) };
      }),
    });

    var t = data[data.length - 1].values.reduce(function (p, d) {
      return d.y > p.y ? d : p;
    });

    var trials = svg_path.selectAll("path.trial").data(data, function (d) {
      return d.trial;
    });

    var text = svg_text.selectAll(".toss").data(tosses);

    var t_enter = text.enter();
    t_enter
      .append("text")
      .attr("class", function (d) {
        return d === "H" ? "toss heads" : "toss tails";
      })
      .attr("id", function () {
        return "l" + n;
      })
      .attr("x", function (d, i) {
        return (i % 50) * 10 + 200;
      })
      .attr("y", function (d, i) {
        return 10 + 12 * Math.floor(i / 50);
      })
      .text(function (d) {
        return d;
      })
      .on("mouseover", function () {
        var id = this.id.slice(1, 4);
        d3.select("#num" + id).classed("active", true);
        info(id);
      })
      .on("mouseout", function () {
        var id = this.id.slice(1, 4);
        d3.select("#num" + id).classed("active", false);
        d3.select("#info").text("hover flip to see info");
      });

    if (t.y > ymax) {
      ymax = t.y + 2;
      y.domain([0, ymax]);
      svg_path.select(".y.axis").transition().duration(125).call(yAxis);

      trials
        .transition()
        .duration(100)
        .attr("d", function (d) {
          return line(d.values);
        })
        .attr("class", "trial prev");
    } else {
      trials.transition().duration(100).attr("class", "trial prev");
    }

    var trials_enter = trials.enter();

    trials_enter
      .append("path")
      .attr("class", "trial")
      .attr("d", function (d) {
        return line(data[data.length - 2].values);
      })
      .attr("id", function (d) {
        return d.trial;
      });

    var anim = svg_path.select("path#num" + n);
    anim
      .transition()
      .ease("linear")
      .duration(100)
      .attr("d", function (d) {
        return line(d.values);
      });

    info(n - 1);

    if (++i < 151 / numTrialsForUpdate) myLoop(i);
  }, 125);
}

function info(id) {
  var t = data[id].values.reduce(function (p, d) {
    return d.y > p.y ? d : p;
  });
  d3.select("#info").text(
    "MAX at: " +
      t.x.toFixed(3) +
      " with density: " +
      t.y.toFixed(4) +
      " " +
      data[id].info
  );
  var pos = parseInt(bias / 0.005);
  d3.select("#info2").text(
    "density at bias: " +
      data[id].values[pos].x.toFixed(4) +
      ", " +
      data[id].values[pos].y.toFixed(4)
  );
}

function sim(numTrials) {
  for (var i = 0; i < numTrials; i++) {
    n += 1;
    coin = Math.random() < bias ? "H" : "T";
    k = coin === "H" ? k + 1 : k;
    tosses.push(coin);
  }
}

function factorial(n) {
  if (n == 0 || n == 1) return 1;
  if (f[n] > 0) return f[n];
  return (f[n] = factorial(n - 1) * n);
}

function BETA(theta) {
  var norm = (factorial(k) * factorial(n - k)) / factorial(n + 1);
  var ptimesl = Math.pow(theta, k) * Math.pow(1 - theta, n - k);
  return ptimesl / norm;
}
