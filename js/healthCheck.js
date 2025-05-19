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
  projectFileData = JSON.parse(sessionStorage.getItem('projectFileData'))
  console.log(projectFileData)
  await processFileData(projectFileData)
  generateHealthCheckTables()
  generateSummaryCards()

})

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