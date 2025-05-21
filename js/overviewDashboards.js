document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("appInfo").textContent = `${appName} ${appVersion}`;
    showLoadingSpinner() 
    overviewData = await getOverviewData()
    // console.log(overviewData.fileData)
    overviewFileData = await mergeFileData(overviewData.fileData)
    console.log('overviewFileData',overviewFileData)
    accessToken = await getAccessToken('account:read')
    accountUserList = await getAllUsers(accessToken)
    console.log('accountUserList',accountUserList)
    await processFileData(overviewFileData)
    generateHealthCheckTables()
    generateSummaryCards()
    generateTrainingTable(overviewData.trainingRecords)
    hideLoadingSpinner()
});

async function generateTrainingTable(data) {
  const legacyData = data.legacy
  const newData = data.new

  // Get distinct titles using Set and map
  const distinctLegacyData = [...new Set(legacyData.map(item => item.Title))];
  const distinctNewData = [...new Set(newData.map(item => item.email))];
  console.log('distinctLegacyData',distinctLegacyData,'distinctNewData',distinctNewData)
  const totalUsersTrained = distinctLegacyData.length + distinctNewData.length
  console.log('totalUsersTrained',totalUsersTrained)

// Legacy metrics
    const legacyF2F = legacyData.filter(u => u.Training_type === "F2F").length;
    const legacyVirtual = legacyData.filter(u => u.Training_type === "Virtual").length;

    // Step 1: Group by user
    const userTrainingMap = {};

    newData.forEach(entry => {
      const name = entry.name;
      if (!userTrainingMap[name]) {
        userTrainingMap[name] = new Set();
      }
      userTrainingMap[name].add(entry.level);
    });

    // Step 2: Count metrics
    let level1Only = 0;
    let level2Only = 0;
    let bothLevels = 0;

    for (const levels of Object.values(userTrainingMap)) {
      const hasL1 = levels.has("L1");
      const hasL2 = levels.has("L2");

      if (hasL1 && hasL2) {
        bothLevels++;
      } else if (hasL1) {
        level1Only++;
      } else if (hasL2) {
        level2Only++;
      }
    }

    const metrics = {
      total: distinctLegacyData.length + distinctNewData.length,
      legacyF2F: legacyF2F,
      legacyVirtual: legacyVirtual,
      newLevel1: level1Only,
      newLevel2: level2Only,
      newBoth: bothLevels
    };

    // Calculate percentages
    const pct = (count) => ((count / metrics.total) * 100).toFixed(1) + '%';
    const totalUsers = accountUserList.length
    const dataCards = [
      { title: "Total Users Trained", value: `${metrics.total} / ${totalUsers}`, cssClass: "" },
      { title: "Legacy Training - F2F", value: metrics.legacyF2F, percentage: pct(metrics.legacyF2F), cssClass: "legacy" },
      { title: "Legacy Training - Virtual", value: metrics.legacyVirtual, percentage: pct(metrics.legacyVirtual), cssClass: "legacy" },
      { title: "New Training - Level 1", value: metrics.newLevel1, percentage: pct(metrics.newLevel1), cssClass: "new" },
      { title: "New Training - Level 2", value: metrics.newLevel2, percentage: pct(metrics.newLevel2), cssClass: "new" },
      { title: "New Training - Both Levels", value: metrics.newBoth, percentage: pct(metrics.newBoth), cssClass: "new" },
    ];

    const dashboard = document.getElementById('dashboard');

    dataCards.forEach(card => {
      const div = document.createElement('div');
      div.className = `training-card ${card.cssClass}`;
      div.innerHTML = `
        <h3>${card.title}</h3>
        <p>${card.value}</p>
        ${card.percentage ? `<small>${card.percentage}</small>` : ''}
      `;
      dashboard.appendChild(div);
    });

    // Chart
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Legacy - F2F', 'Legacy - Virtual', 'New - Level 1', 'New - Level 2', 'New - Both'],
        datasets: [{
          label: 'Users',
          data: [legacyF2F, legacyVirtual, level1Only, level2Only, bothLevels],
          backgroundColor: ['gray', 'lightgray', 'blue', 'lightblue', 'navy']
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
}

async function mergeFileData(array) {
    let allFileData = [];

    for (const element of array) {
        if (element?.fileData) {
            const tempFileData = JSON.parse(element.fileData);
            if (tempFileData) {
                allFileData.push(tempFileData);
                // console.log(allFileData)
            }
        }
    }

    const mergedData = allFileData.flat(Infinity);
    return mergedData;
}

async function getAllUsers(accessToken) {
      const limit = 100;
      let offset = 0;
      let allUsers = [];
      let keepGoing = true;

      while (keepGoing) {
        const url = `https://developer.api.autodesk.com/hq/v1/accounts/${account_id}/users?limit=${limit}&offset=${offset}&status=active`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`);
        }

        const users = await response.json();
        allUsers = allUsers.concat(users);

        if (users.length < limit) {
          keepGoing = false;
        } else {
          offset += limit;
        }
      }

      return allUsers;
    }

async function processFileData(fileData) {
    const groupedFileData = await groupItemData(fileData)
    console.log('groupedFileData',groupedFileData)
    Object.entries(groupedFileData).forEach(element => {
        const object = element[1];
        const file = object[0];

        let hasFailed = false; // track if any check fails
        let localWhatsFailed = []
        if (file.revision) {
            revisionCheck_correct++;
        } else {
            revisionCheck_failed++;
            hasFailed = true;
            localWhatsFailed.push('Revision')
        }

        if (file.file_description) {
            fileDescriptionCheck_correct++;
        } else {
            fileDescriptionCheck_failed++;
            hasFailed = true;
            localWhatsFailed.push('File Description')
        }

        if (file.title_line_1) {
            titleLineCheck_correct++;
        } else {
            titleLineCheck_failed++;
            hasFailed = true;
            localWhatsFailed.push('Title Line 1')
        }

        if (file.status) {
            statusCheck_correct++;
        } else {
            statusCheck_failed++;
            hasFailed = true;
            localWhatsFailed.push('Status')
        }

        // Add to failedFiles if any field failed
        if (hasFailed) {
            file.failed = localWhatsFailed
            failedFiles.push(file);
        }

        singleFileList.push(file);
    });
    console.log('failedFiles',failedFiles)
    console.log('singleFileList',singleFileList)
    filesLength = singleFileList.length
    failedFilesLength = failedFiles.length
    uniqueUploaders = [...new Set(singleFileList.map(file => file.created_by))];
}

async function convertToPercentage(count, total) {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
}

function formatDate(isoDate) {
  const date = new Date(isoDate);

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  return date.toLocaleString("en-GB", options);
}

async function generateSummaryCards() {

    totalCompliance = await convertToPercentage(revisionCheck_correct+fileDescriptionCheck_correct+titleLineCheck_correct+statusCheck_correct, (filesLength*4))
    totalMissingFields = revisionCheck_failed+fileDescriptionCheck_failed+titleLineCheck_failed+statusCheck_failed
    healthData = {
        compliantPercent: totalCompliance,
        missingFields: totalMissingFields,
        nonCompliantFiles: failedFilesLength,
        uploaders: uniqueUploaders.length
    };
    console.log(healthData)
    // Call the function with your data
    updateSummaryCards(healthData);
}

async function generateHealthCheckTables() {
    metadataCompliance = [
        { field: "Revision", completion: await convertToPercentage(revisionCheck_correct,filesLength), missing: revisionCheck_failed },
        { field: "File Description", completion: await convertToPercentage(fileDescriptionCheck_correct,filesLength), missing: fileDescriptionCheck_failed },
        { field: "Title Line 1", completion: await convertToPercentage(titleLineCheck_correct,filesLength), missing: titleLineCheck_failed },
        { field: "Status", completion: await convertToPercentage(statusCheck_correct,filesLength), missing: statusCheck_failed }
        ]
    console.log('metadataCompliance',metadataCompliance)


    console.log('uniqueUploaders',uniqueUploaders); // ["John Smith", "Alice Johnson"]
    const uploaderStats = uniqueUploaders.map(uploader => {
        const filesByUser = singleFileList.filter(file => file.created_by === uploader);
        const userFailedFiles = failedFiles.filter(file => file.created_by === uploader);
        return {
            name: uploader,
            total: filesByUser.length,
            nonCompliant: userFailedFiles.length
        };
    });
    console.log('uploaderStats',uploaderStats)

    failedFiles.forEach(element => {
        nonCompliantFiles.push({ 'file': element.name, 'missing': element.failed.flat(), 'uploader': element.created_by || 'ACC System', 'date': formatDate(element.last_modified_date),file_url:element.file_url, folder:element.folder_path, updated_by:element.last_modified_user || 'ACC System'})
    });

    // const nonCompliantFiles = [
    //     { file: "Drawing-A1.pdf", missing: "Discipline, Zone", uploader: "John Smith", date: "12-May-2025" },
    //     { file: "Spec-M2.docx", missing: "Purpose of Issue", uploader: "Shared Account", date: "09-May-2025" }
    // ];

    // Run all population functions
    populateMetadataTable(metadataCompliance);
    populateUploaderTable(uploaderStats);
    populateNonCompliantTable(nonCompliantFiles);
}

  // Function to populate summary cards
  function updateSummaryCards(data) {
    document.getElementById('compliantPercent').textContent = `${data.compliantPercent}%`;
    document.getElementById('missingFields').textContent = data.missingFields;
    document.getElementById('nonCompliantFiles').textContent = `${data.nonCompliantFiles} / ${filesLength}`;
    document.getElementById('uploaders').textContent = data.uploaders;
  }

  

  // Utility to get badge class based on compliance %
  function getStatusClass(percent) {
    if (percent >= 75) return 'green';
    if (percent >= 50) return 'yellow';
    return 'red';
  }

  // Populate Metadata Compliance table
  function populateMetadataTable(data) {
    const tbody = document.getElementById('metadataTableBody');
    data.forEach(item => {
      const row = document.createElement('tr');
      const statusClass = getStatusClass(item.completion);
      row.innerHTML = `
        <td>${item.field}</td>
        <td>${item.completion}%</td>
        <td>${item.missing} / ${filesLength}</td>
        <td><span class="badge ${statusClass}">${statusClass[0].toUpperCase() + statusClass.slice(1)}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Populate Uploader Breakdown table
  function populateUploaderTable(data) {
    const tbody = document.getElementById('uploaderTableBody');
    data.forEach(uploader => {
      const compliantPercent = Math.round(((uploader.total - uploader.nonCompliant) / uploader.total) * 100);
      const statusClass = getStatusClass(compliantPercent);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${uploader.name || 'ACC System'}</td>
        <td>${uploader.total}</td>
        <td>${uploader.nonCompliant}</td>
        <td>${compliantPercent}%</td>
        <td><span class="badge ${statusClass}">${statusClass[0].toUpperCase() + statusClass.slice(1)}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Populate Non-Compliant Files table
  function populateNonCompliantTable(data) {
    const tbody = document.getElementById('nonCompliantTableBody');
    data.forEach(file => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><a href="${file.file_url}" target="_blank">🔗</a></td>
        <td>${file.file}</td>
        <td>${file.missing}</td>
        <td>${file.folder}</td>
        <td>${file.uploader}</td>
        <td>${file.updated_by}</td>
        <td>${file.date}</td>
      `;
      tbody.appendChild(row);
    });
  }

async function groupItemData(data) {
  const groupedData = data.reduce((acc, item) => {
    // console.log(item)
    // Extract the id without the version part
    const itemIdNoVersion = item.id.split("?")[0];

    // Initialize the group if it doesn't exist
    acc[itemIdNoVersion] = acc[itemIdNoVersion] || [];

    // Push the current item into the group
    acc[itemIdNoVersion].push(item);

    // Optionally sort the items by accversion in descending order within the group
    acc[itemIdNoVersion].sort((a, b) => b.accversion - a.accversion);

    return acc;
  }, {});

  return groupedData;
}

function renderComplianceBar(container, percent) {
  const status = getStatusClass(percent);
  container.innerHTML = `
    <div class="compliance-bar">
      <div class="bar-fill" style="width: ${percent}%;" data-status="${status}"></div>
    </div>
  `;
}

function toggleTab(containerId,type) {
  const allTabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-button');

  allTabs.forEach(tab => {
    tab.classList.remove('active');
  });

  buttons.forEach(btn => {
    btn.classList.remove('active');
  });
  addType = type
  document.getElementById(containerId).classList.add('active');
  document.getElementById(type).classList.add('active');
}

 async function getOverviewData() {
    const bodyData = {

    };
    const headers = {
        "Content-Type": "application/json",
      };
    
      const requestOptions = {
        method: "GET",
        headers: headers,
        // body: JSON.stringify(bodyData),
      };
    
      const apiUrl =
        "https://prod-57.uksouth.logic.azure.com:443/workflows/68a5090532a9407b9f2948b7279f32dd/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YZbaXed8ey16sHRBE9piO43skmbarxOARgrY-LJlGuM";
      //console.log(apiUrl)
      console.log(requestOptions)
      responseData = await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then((data) => {
            const JSONdata = data;
            console.log(JSONdata);
            return JSONdata;
        })
        .catch((error) => console.error("Error fetching data:", error));
      return responseData;
}