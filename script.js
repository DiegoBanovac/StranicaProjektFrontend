document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector(".input-group input");
  const tableBody = document.querySelector("#dataTable tbody");
  const tableHeadings = document.querySelectorAll("thead th");
  const toggleChartButton = document.getElementById("toggleChart");
  const tableSection = document.querySelector(".table_body");
  const chartSection = document.querySelector(".chart_section");
  const ctx = document.getElementById("myChart").getContext("2d");
  let chart;

  async function fetchData() {
    try {
      const response = await fetch("https://stranicaprojekt.onrender.com/data");
      const data = await response.json();

      data.forEach((row) => {
        const tr = document.createElement("tr");

        const countryTd = document.createElement("td");
        countryTd.textContent = row["Country"];
        tr.appendChild(countryTd);

        [
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
        ].forEach((year) => {
          const td = document.createElement("td");
          td.textContent = row[year] || "";
          tr.appendChild(td);
        });

        tableBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function searchTable() {
    const query = search.value.toLowerCase();
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const matches = Array.from(cells).some((cell) =>
        cell.textContent.toLowerCase().includes(query)
      );
      row.style.display = matches ? "" : "none";
    });
  }

  let currentSortColumn = null;
  let currentSortOrder = true;

  tableHeadings.forEach((head, index) => {
    head.onclick = () => {
      if (currentSortColumn !== null && currentSortColumn !== head) {
    
        tableHeadings[currentSortColumn].classList.remove("active");
        tableHeadings[currentSortColumn].classList.remove("asc");
        tableHeadings[currentSortColumn].classList.remove("desc");
      }

      currentSortColumn = index;
      currentSortOrder = !currentSortOrder;

      head.classList.toggle("asc", currentSortOrder);
      head.classList.toggle("desc", !currentSortOrder);
      head.classList.add("active");

      sortTable(index, currentSortOrder);
    };
  });

  function sortTable(columnIndex, ascending) {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const sortedRows = rows.sort((a, b) => {
      const aText = a.querySelectorAll("td")[columnIndex].textContent.trim();
      const bText = b.querySelectorAll("td")[columnIndex].textContent.trim();

      if (!isNaN(aText) && !isNaN(bText)) {
        return ascending ? aText - bText : bText - aText;
      }

      return ascending
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });

    sortedRows.forEach((row) => tableBody.appendChild(row));
  }

  function generateChart() {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const labels = [
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
    ];
    const datasets = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const country = cells[0].textContent;
      const data = Array.from(cells)
        .slice(1)
        .map((cell) => parseFloat(cell.textContent) || 0);

      datasets.push({
        label: country,
        data: data,
        borderColor: getRandomColor(),
        fill: false,
        hidden: true, 
      });
    });

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              const meta = ci.getDatasetMeta(index);
              meta.hidden = !meta.hidden;
              ci.update();
            },
          },
          title: {
            display: true,
            text: "Broj novih imigranata u drzavama na podruciju Europe u posljednih 10 godina",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Godina",
            },
          },
          y: {
            title: {
              display: true,
              text: "Broj imigranata",
            },
          },
        },
      },
    });
  }

  function toggleView() {
    const isTableHidden = tableSection.classList.contains("hidden");

    if (isTableHidden) {
      tableSection.classList.remove("hidden");
      chartSection.classList.add("hidden");
      toggleChartButton.textContent = "Generate Chart";
    } else {
      tableSection.classList.add("hidden");
      chartSection.classList.remove("hidden");
      generateChart();
      toggleChartButton.textContent = "Show Table";
    }
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  toggleChartButton.addEventListener("click", toggleView);
  fetchData();
  search.addEventListener("input", searchTable);
});
