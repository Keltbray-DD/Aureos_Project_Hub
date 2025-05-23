document.addEventListener("DOMContentLoaded", async function () {
    await projectIdCheck()
    projectId = sessionStorage.getItem('projectId')

    projectName = sessionStorage.getItem('projectName')
    if(projectName){
      document.getElementById('heroTitle').innerText = `${projectName}`
    }else{
      document.getElementById('heroTitle').innerText = `Loading...`
    }
    
    projectDataDash = await getProjectDetails()

    if(document.getElementById('heroTitle').innerText === 'Loading...'){
      projectName = projectDataDash.project_data[0].ProjectName
      document.getElementById('heroTitle').innerText = `${projectName}`
      sessionStorage.setItem('projectName',projectName)
    }

    generateSubmittalDashboards()
    
    inProjectArea = true
    console.log('inProjectArea',inProjectArea)
    generateMenu()
})

function clearFilters() {
    $.fn.dataTable.ext.search = [];
    table.columns().search('').draw();
}

async function generatePercentages(items) {
    const total = items.length;
    const statusColors = {
    Open: "#4e79a7",
    Closed: "#f28e2b",
    Pending: "#e15759"
    };

    const counts = items.reduce((acc, item) => {
    const status = item.status_value || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
    }, {});

    const container = document.getElementById("statusSummary");
    container.innerHTML = ""; // clear if re-rendering

    Object.entries(counts).forEach(([status, count]) => {
    const percent = ((count / total) * 100).toFixed(1);
    const color = statusColors[status] || "#999";

    const row = document.createElement("div");
    row.className = "status-row";
    row.innerHTML = `
        <div class="status-label">${status}</div>
        <div class="status-bar-container">
        <div class="status-bar-fill" style="width:${percent}%; background:${color};">${percent}%</div>
        </div>
        <div class="status-percent">${count} of ${total} items</div>
    `;
    container.appendChild(row);
    });
}

async function renderOverallPieChart(array,htmlElement) {
    console.log('renderOverallPieChart',array)
    // Count frequencies of each status_value
    const statusCounts = array.reduce((acc, row) => {
        const status = row.status_value || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Prepare chart data
    const labels = Object.keys(statusCounts);
    const values = Object.values(statusCounts);

    // Render chart
    pieChartOverall = new Chart(document.getElementById(`statusOverallPieChart${htmlElement}`), {
        type: 'pie',
        data: {
        labels: labels,
        datasets: [{
            label: 'Status Distribution',
            data: values,
            backgroundColor: ['#4e79a7', '#f28e2b', '#59a14f', '#76b7b2'],
            borderWidth: 1
        }]
        },
        options: {
            maintainAspectRatio: false, // 👈 lets the canvas stretch
        responsive: true,
        plugins: {
            legend: {
            position: 'top'
            },
            title: {
            display: true,
            text: 'Overall Status Breakdown'
            }
        }
        }
      });
            pieChartOverall.options.onClick = function (evt, elements) {
            if (!elements.length) return;
            const clickedIndex = elements[0].index;
            const status = pieChartOverall.data.labels[clickedIndex];

            // Filter table
            table.search('').draw(); // Clear global search
            table.columns(1).search(status).draw(); // Column 1 = status_value
        };
    }

    // Pie chart rendering by selected month
    async function renderPieChart(month,htmlElement) {
        let pieChart
        const grouped = monthMap[month] || [];
        const statusCount = grouped.reduce((acc, item) => {
            acc[item.status_value] = (acc[item.status_value] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(statusCount);
        const data = Object.values(statusCount);

        if (pieChart) pieChart.destroy();

        pieChart = new Chart(document.getElementById(`statusPieChart${htmlElement}`), {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ['#4e79a7', '#f28e2b', '#76b7b2', '#59a14f']
                }]
            },
            options: {
                maintainAspectRatio: false, // 👈 lets the canvas stretch
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Monthly Status Breakdown - ${new Date(month + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}`
                    }
                }
            }
        });

        pieChart.options.onClick = function (evt, elements) {
            if (!elements.length) return;
            const clickedIndex = elements[0].index;
            const status = pieChart.data.labels[clickedIndex];

            // Filter table
            table.search('').draw(); // Clear global search
            table.columns(1).search(status).draw(); // Column 1 = status_value
        };
    }

    // Bar chart for number of records created per month
    async function renderBarChart(sortedMonths, datasets, htmlElement) {
        console.log('barChart',sortedMonths, datasets)
        let barChart
        const monthLabels = sortedMonths.map(m =>
            new Date(m + "-01").toLocaleString("default", { month: "short", year: "numeric" })
        );

        barChart = new Chart(document.getElementById(`monthBarChart${htmlElement}`), {
            type: "bar",
            data: {
                labels: monthLabels,
                datasets: datasets
            },
            options: {
                maintainAspectRatio: false, // 👈 lets the canvas stretch
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "Submittals per Month by Status"
                    },
                    legend: {
                        position: "top"
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: "Month"
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Submittal Count"
                        }
                    }
                }
            }
        });

        barChart.options.onClick = function (evt, elements) {
            if (!elements.length) return;
            const element = elements[0];
            const monthIndex = element.index;
            const datasetIndex = element.datasetIndex;

            const selectedMonth = sortedMonths[monthIndex]; // e.g., "2024-05"
            const selectedStatus = barChart.data.datasets[datasetIndex].label;

            // Custom filter function: match both
            $.fn.dataTable.ext.search = [];
            $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
                const rowStatus = data[1];       // assuming column 1 is status_value
                const rowDate = data[2];         // assuming column 2 is created_at
                return rowStatus === selectedStatus && rowDate.startsWith(selectedMonth);
            });

            table.draw();
        };
    }

    async function generateSubmittalDashboards(params) {

        submittalArrayRaw = await getSubmittalsDetails()
        console.log('submittalArrayRaw', submittalArrayRaw)
        submittalArray = await csvToJsonPapa(submittalArrayRaw, projectId)
        console.log('submittalArray', submittalArray)

        let itemsData = submittalArray.find(file => file.name === "submittalsacc_items.csv");
        let StepsData = submittalArray.find(file => file.name === "submittalsacc_steps.csv");
        let AttachmentsData = submittalArray.find(file => file.name === "submittalsacc_attachments.csv");
        let CommentsData = submittalArray.find(file => file.name === "submittalsacc_comments.csv");
        let TasksData = submittalArray.find(file => file.name === "submittalsacc_tasks.csv");
        let SpecsData = submittalArray.find(file => file.name === "submittalsacc_specs.csv");

        mainArray = await mergeStepsAndItems(StepsData.data,itemsData.data,AttachmentsData.data,CommentsData.data,TasksData.data,SpecsData.data)
        mainArray = mainArray.filter(item => item.state_id !== 'void')
        console.log(mainArray)
        
        if (itemsData && mainArray.length > 0) {
            renderTable(mainArray);
        } else {
            console.log("No matching data found.");
        }
        $(document).ready(function () {
            table = $('#itemsTable').DataTable({
                pageLength: 25, // 👈 Set your default number of rows here
                order: [[1, 'desc']], // sort by column 1 ('custom_identifier') descending
                lengthMenu: [ [10, 25, 50, 100,200], [10, 25, 50, 100,200] ] // [values], [labels]
            });
        });
        // Handle row click
        $('#itemsTable tbody').on('click', 'tr', function () {
            const rowData = table.row(this).data();
            if (!rowData) return;

            // Create a table of details
            const detailHtml = `
                <table class="table table-bordered">
                <tr><th>ID</th><td>${rowData["Submittal ID"]}</td></tr>
                <tr><th>Project ID</th><td>${rowData['Title']}</td></tr>
                </table>
            `;

            $('#modalContent').html(detailHtml);
            const modal = new bootstrap.Modal(document.getElementById('infoModal'));
            modal.show();
        });

        
        overviewArray = mainArray
        detailedArray = mainArray.filter(item => item.spec_value.includes('Design - Detailed')) || []
        feasibilityArray = mainArray.filter(item => item.spec_value.includes('Design - Feasibility')) || []


        monthMap = {}
        overviewArray.forEach(item => {
            const month = item.created_at.slice(0, 7); // "YYYY-MM"
            if (!monthMap[month]) monthMap[month] = [];
            monthMap[month].push(item);
        });

        const months = Object.keys(monthMap).sort(); // Sorted YYYY-MM list

        // Populate dropdown
        const select = document.getElementById(`monthSelect`);
        months.forEach(m => {
            const option = document.createElement("option");
            option.value = m;
            option.textContent = new Date(m + "-01").toLocaleString('default', { month: 'long', year: 'numeric' });

            select.appendChild(option);
        });
        const monthLength = select.options.length - 1;
        select.selectedIndex = monthLength;
        
        // Dropdown change handler
        select.addEventListener("change", (e) => {
            renderPieChart(e.target.value);
        });

        chartSections = [
          { name: "Overview", array: overviewArray, chartContainer:'overviewChartContainer',loadingSpinner:'overviewChartLoadingSpinner'},
          { name: "Detailed", array: detailedArray, chartContainer:'detailedChartContainer',loadingSpinner:'detailedLoadingSpinner' },
          { name: "Feasibility", array: feasibilityArray, chartContainer:'feasibilityChartContainer',loadingSpinner:'feasibilityLoadingSpinner' },
        ];
        chartSections.forEach(async element => {
            console.log(element)
            if(element.array.length == 0){
                document.getElementById(`notData${element.name}`).style.display = 'block'
                document.getElementById(element.loadingSpinner).style.display = 'none'
            }else{
                const data = await groupDataByMonth(element.array,element.name,months[monthLength])
                await renderBarChart(data.sortedMonths, data.datasets,element.name);
                document.getElementById(element.chartContainer).style.removeProperty('display');
                document.getElementById(element.loadingSpinner).style.display = 'none'
            }
        });

        await renderOverallPieChart(overviewArray,'Overview')
        await generatePercentages(mainArray)
    }

async function groupDataByMonth(array,htmlElement,monthsArray) {


        // Initial render
        await renderPieChart(monthsArray,htmlElement);

        const monthStatusMap = {}; // { "Open": { "2024-04": 1, "2024-05": 2 }, ... }
        const allMonths = new Set();

        array.forEach(item => {
            const month = item.created_at.slice(0, 7); // "YYYY-MM"
            const status = item.status_value;

            if (!monthStatusMap[status]) monthStatusMap[status] = {};
            if (!monthStatusMap[status][month]) monthStatusMap[status][month] = 0;

            monthStatusMap[status][month]++;
            allMonths.add(month);
        });

        const sortedMonths = [...allMonths].sort();

        const statusColors = {
            Void: "#4e79a7",
            Closed: "#f28e2b",
            Pending: "#e15759",
            Required: '#76b7b2',
            Open: '#59a14f'
        };

        const datasets = Object.keys(monthStatusMap).map(status => {
            return {
                label: status,
                data: sortedMonths.map(month => monthStatusMap[status][month] || 0),
                backgroundColor: statusColors[status] || "#999"
            };
        });

        const returnData = {
            datasets: datasets,
            sortedMonths: sortedMonths
        }

        return returnData
}

    function renderTable(dataArray) {
        const table = document.getElementById('itemsTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        const toggleContainer = document.getElementById('columnToggles');

        thead.innerHTML = '';
        tbody.innerHTML = '';
        toggleContainer.innerHTML = '';

        let headers = orderedColumns.filter(h => h in dataArray[0]);
        headers = headers.filter(h => allowedColumns.includes(h));

        // Toggle controls
        const showAllBtn = document.createElement('button');
        showAllBtn.textContent = "Show All";
        showAllBtn.onclick = () => toggleAllColumns(true);
        toggleContainer.appendChild(showAllBtn);

        const hideAllBtn = document.createElement('button');
        hideAllBtn.textContent = "Hide All";
        hideAllBtn.onclick = () => toggleAllColumns(false);
        toggleContainer.appendChild(hideAllBtn);

        toggleContainer.appendChild(document.createElement('hr'));

        headers.forEach((header, index) => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.colIndex = index;

            checkbox.addEventListener('change', function () {
                toggleColumn(index, this.checked);
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + headerLabels[header] || header ))// Use friendly label or fallback));
            toggleContainer.appendChild(label);
        });

        // Render headers
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = headerLabels[header] || header; // Use friendly label or fallback
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Render rows
        dataArray.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(h => {
                const td = document.createElement('td');
                if(h === 'url'){
                td.innerHTML = `<a href="${row[h]}" target="_blank">🔗</a>`;
                tr.appendChild(td);
                }else{
                    td.textContent = row[h];
                    tr.appendChild(td);
                }

            });
            tbody.appendChild(tr);
        });
    }

    function toggleColumn(colIndex, show) {
        const table = document.getElementById('itemsTable');
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cell = row.children[colIndex];
            if (cell) {
                cell.style.display = show ? '' : 'none';
            }
        });
    }

    function toggleAllColumns(show) {
        document.querySelectorAll('#columnToggles input[type=checkbox]').forEach(checkbox => {
            checkbox.checked = show;
            toggleColumn(Number(checkbox.dataset.colIndex), show);
        });
    }

    function toggleDropdown() {
        document.querySelector('.submittals-dropdown').classList.toggle('show');
    }

async function mergeStepsAndItems(steps,items,attachments,comments,tasks,specs) {
    // Step 1: Create a lookup map from details
    const stepsMap = new Map(steps.map(d => [d.item_id, d]));
    const tasksMap = new Map(tasks.map(d => [d.item_id, d]));


    // Step 2: Merge items with matching detail
    const merged = items.map(item => {
    const attachmentsMap = attachments.filter(file => file.item_id === item.id);
    const commentsMap = comments.filter(file => file.item_id === item.id);
    const specsMap = specs.find(spec => spec.id === item.spec_id )
        return {
    ...item,
    ...stepsMap.get(item.id), // merge detail if found
    ...tasksMap.get(item.id),
    // ...specsMap.get(item.spec_id),
    comments: commentsMap,
    files: attachmentsMap,
    url:`https://acc.autodesk.eu/build/submittals/projects/2e6449f9-ce25-4a9c-8835-444cb5ea03bf/items/${item.id}`,
    spec_value: specsMap.title
    }
    }
        );
    return merged
}
    async function csvToJsonPapa(response, projectId) {
        const parsedData = response.data.map(fileObj => {
            const parsed = Papa.parse(fileObj.array, {
                header: true,
                skipEmptyLines: true
            });

            const filteredRows = parsed.data.filter(row => row.bim360_project_id === projectId && !(row.title?.toLowerCase().includes('test')));

            return {
                name: fileObj.name,
                data: filteredRows
            };
        });

        // console.log(parsedData);
        return parsedData
    }

    async function getSubmittalsDetails() {

        const headers = {
            'Content-Type': 'application/json'
        };

        const requestOptions = {
            method: 'GET',
            headers: headers,
        };

        const apiUrl = "https://prod-26.uksouth.logic.azure.com:443/workflows/323b160533c5421ca0d3283f66331f5c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bQtQ3OqlFhBAxxIhdtLmktt5luhoF7e97NJRD2z6r_8";
        //console.log(apiUrl)
        //console.log(requestOptions)
        responseData = await fetch(apiUrl, requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
                return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
        return responseData
    }
