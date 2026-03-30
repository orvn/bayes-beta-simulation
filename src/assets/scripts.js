/**
 * Line chart references (original bl.ocks):
 * https://bl.ocks.org/mbostock/3883245
 * https://bl.ocks.org/mbostock/3884955
 */

"use strict";

const GRID_STEP = 1 / 200;
const TOTAL_FLIPS = 150;
const TICK_MS = 125;
const TOSS_COLS = 50;
const TOSS_X0 = 200;
const TOSS_LINE_HEIGHT = 12;
const TOSS_Y0 = 10;
const BIAS_GRID_INDEX_SCALE = 0.005;

const grid = d3.range(0, 1.005, GRID_STEP);
const factorialMemo = [];

const margin = { top: 15, right: 50, bottom: 50, left: 50 };
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

let bias = 0.15;
const numTrialsForUpdate = 1;
let n = 0;
let k = 0;
let ymax;
let coin;

let data = [];
let tosses = [];

const x = d3.scale.linear().range([0, width]);
const y = d3.scale.linear().range([height, 0]);

const line = d3.svg
  .line()
  .x((d) => x(d.x))
  .y((d) => y(d.y));

const xAxis = d3.svg.axis().scale(x).orient("bottom");
const yAxis = d3.svg.axis().scale(y).orient("left");

const svgPath = d3
  .select("body")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const svgText = d3
  .select("body")
  .append("svg")
  .attr("viewBox", `0 0 ${width + margin.left + margin.right} 75`)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

x.domain([0, 1]);

svgPath
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0,${height})`)
  .call(xAxis);

svgPath
  .append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em");

let timeoutId;

/** Exposed for the start button (`onclick` in HTML). */
function myLoop(i) {
  if (i === 1) {
    clearTimeout(timeoutId);
    ymax = 8;
    y.domain([0, ymax]);
    svgPath.select(".y.axis").call(yAxis);
    bias = document.getElementById("bias").value;
    svgText.selectAll("text").remove();
    svgPath.selectAll("path.trial").remove();
    n = 0;
    k = 0;
    data = [];
    data.push({
      trial: `num${n}`,
      values: grid.map((d) => ({ x: d, y: 1 })),
    });
    tosses = [];
  }

  timeoutId = setTimeout(() => {
    sim(numTrialsForUpdate);
    data.push({
      trial: `num${n}`,
      info: `flips:${n} heads:${k}`,
      values: grid.map((d) => ({ x: d, y: BETA(d) })),
    });

    const last = data[data.length - 1];
    const t = last.values.reduce((p, d) => (d.y > p.y ? d : p));

    const trials = svgPath.selectAll("path.trial").data(data, (d) => d.trial);
    const text = svgText.selectAll(".toss").data(tosses);

    text
      .enter()
      .append("text")
      .attr("class", (d) => (d === "H" ? "toss heads" : "toss tails"))
      .attr("id", () => `l${n}`)
      .attr("x", (d, i) => (i % TOSS_COLS) * 10 + TOSS_X0)
      .attr("y", (d, i) => TOSS_Y0 + TOSS_LINE_HEIGHT * Math.floor(i / TOSS_COLS))
      .text((d) => d)
      .on("mouseover", function () {
        const flipId = this.id.slice(1, 4);
        d3.select(`#num${flipId}`).classed("active", true);
        info(flipId);
      })
      .on("mouseout", function () {
        const flipId = this.id.slice(1, 4);
        d3.select(`#num${flipId}`).classed("active", false);
        d3.select("#info").text("hover flip to see info");
      });

    if (t.y > ymax) {
      ymax = t.y + 2;
      y.domain([0, ymax]);
      svgPath.select(".y.axis").transition().duration(125).call(yAxis);

      trials
        .transition()
        .duration(100)
        .attr("d", (d) => line(d.values))
        .attr("class", "trial prev");
    } else {
      trials.transition().duration(100).attr("class", "trial prev");
    }

    trials
      .enter()
      .append("path")
      .attr("class", "trial")
      .attr("d", () => line(data[data.length - 2].values))
      .attr("id", (d) => d.trial);

    svgPath
      .select(`path#num${n}`)
      .transition()
      .ease("linear")
      .duration(100)
      .attr("d", (d) => line(d.values));

    info(String(n - 1));

    i += 1;
    if (i < (TOTAL_FLIPS + 1) / numTrialsForUpdate) {
      myLoop(i);
    }
  }, TICK_MS);
}

function info(id) {
  const row = data[id];
  const mode = row.values.reduce((p, d) => (d.y > p.y ? d : p));
  d3.select("#info").text(
    `MAX at: ${mode.x.toFixed(3)} with density: ${mode.y.toFixed(4)} ${row.info}`
  );
  const idx = parseInt(String(Number(bias) / BIAS_GRID_INDEX_SCALE), 10);
  const atBias = row.values[idx];
  d3.select("#info2").text(
    `density at bias: ${atBias.x.toFixed(4)}, ${atBias.y.toFixed(4)}`
  );
}

function sim(numTrials) {
  for (let i = 0; i < numTrials; i += 1) {
    n += 1;
    coin = Math.random() < bias ? "H" : "T";
    k = coin === "H" ? k + 1 : k;
    tosses.push(coin);
  }
}

function factorial(m) {
  if (m === 0 || m === 1) return 1;
  if (factorialMemo[m] > 0) return factorialMemo[m];
  factorialMemo[m] = factorial(m - 1) * m;
  return factorialMemo[m];
}

function BETA(theta) {
  const norm =
    (factorial(k) * factorial(n - k)) / factorial(n + 1);
  const likelihood = theta ** k * (1 - theta) ** (n - k);
  return likelihood / norm;
}
