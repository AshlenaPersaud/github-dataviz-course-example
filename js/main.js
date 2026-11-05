/* ===================================================================
   main.js
   All the JavaScript for the starter project.

   Three ideas are demonstrated here:
     1. Find an element on the page.
     2. Listen for something the user does.
     3. Change the page in response.
   =================================================================== */


/* -------------------------------------------------------------------
   PART 1: A click counter
   ------------------------------------------------------------------- */

// Find the two elements we care about, using the id="" from index.html.
const clickButton = document.getElementById("clickButton");

// When the button is clicked, open the link.
clickButton.addEventListener("click", function () {
  window.open("https://www.youtube.com/watch?v=vLX3-MrBXFk", "_blank");
});


/* -------------------------------------------------------------------
   PART 2: A bar chart drawn from data

   The data is an array of objects. Each object is one row of the chart.
   Swap in your own names and numbers and the chart redraws itself.
   ------------------------------------------------------------------- */

const sleepData = [
  { name: "Mon", hours: 10 },
  { name: "Tue", hours: 9 },
  { name: "Wed", hours: 10 },
  { name: "Thu", hours: 11 },
  { name: "Fri", hours: 7 },
  { name: "Sat", hours: 5 },
  { name: "Sun", hours: 7 }
];

const chart = document.getElementById("chart");

/**
 * Draw the chart.
 * @param {Array} data - array of { name, hours } objects
 */
function drawChart(data) {
  // Start from an empty container so we do not stack bars on top of
  // each other every time we redraw.
  chart.innerHTML = "";

  // The largest value in the data. Every bar is measured against this,
  // so the biggest bar fills 100% of the available width.
  const maxValue = Math.max(...data.map(d => d.hours));

  // Build one row per item in the data.
  data.forEach(function (d) {
    const percent = (d.hours / maxValue) * 100;

    const row = document.createElement("div");
    row.className = "bar-row";

    // Note the inline style on the middle div: this is the only place
    // where the data actually turns into a visual property.
    row.innerHTML = `
      <span class="bar-label">${d.name}</span>
      <div class="bar" style="width: ${percent}%"></div>
      <span class="bar-value">${d.hours}</span>
    `;

    chart.appendChild(row);
  });
}

// Draw the chart once, as soon as the page loads.
drawChart(sleepData);


/* -------------------------------------------------------------------
   PART 3: Sorting the chart

   Clicking the button toggles between the original order and
   largest-to-smallest.
   ------------------------------------------------------------------- */

const sortButton = document.getElementById("sortButton");
let isSorted = false;

sortButton.addEventListener("click", function () {
  isSorted = !isSorted;   // flip true <-> false

  if (isSorted) {
    // .slice() makes a copy first, so the original array is untouched.
    const sortedData = sleepData.slice().sort((a, b) => b.hours - a.hours);
    drawChart(sortedData);
    sortButton.textContent = "Back to day order";
  } else {
    drawChart(sleepData);
    sortButton.textContent = "Sort by value";
  }
});


/* -------------------------------------------------------------------
   TIP: open your browser's Developer Console (right-click the page ->
   Inspect -> Console) to see this message and any errors in your code.
   ------------------------------------------------------------------- */

console.log("main.js loaded. The chart has " + sleepData.length + " bars.");
