document.addEventListener("DOMContentLoaded", async function () {
    projectName = sessionStorage.getItem('projectName')
    projectId = sessionStorage.getItem('projectId')
    document.getElementById('heroTitle').innerText = `${projectName}`
    accessData = await getAccessRequestList();
    console.log(accessData)
    filteredAccessData = accessData.filter(item => item.acc_id === projectId && item.requestType === 'Access Request Form')
    await renderRequestList(filteredAccessData);
    // Attach event listeners to search input and project dropdown
    document.getElementById("searchInput").addEventListener("input", updateList);
    
    inProjectArea = true
    console.log('inProjectArea',inProjectArea)
    generateMenu()
})

// Replace with your actual API endpoint if needed



// Populate the project dropdown with unique project names from sampleData
function populateProjectDropdown() {
  const projectDropdown = document.getElementById("projectDropdown");
  const projects = [...new Set(accessData.map((request) => request.project))];
  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project;
    option.textContent = project;
    projectDropdown.appendChild(option);
  });
}
// Renders a progress diagram showing the current stage of the request
function renderProgressDiagram(stage) {
  const stages = [
    "Requested",
    "For submitted await project manager approval",
    "Access approved, awaiting access to be granted",
    "User added to ACC project",
  ];
  let diagramHTML = '<div class="progress-container">';
  stages.forEach((s, index) => {
    const isActive = stages.indexOf(stage) >= index;
    diagramHTML += `<div class="progress-step ${isActive ? "active" : ""}">${
      index + 1
    }</div>`;
    if (index < stages.length - 1) {
      const nextIsActive = stages.indexOf(stage) > index;
      diagramHTML += `<div class="progress-bar ${
        nextIsActive ? "active" : ""
      }"></div>`;
    }
  });
  diagramHTML += "</div>";
  return diagramHTML;
}

// Renders the details of the selected request in the right panel
function renderRequestDetails(request) {
  const detailsContainer = document.getElementById("requestDetails");
  detailsContainer.innerHTML = `
                <p><strong>Name:</strong> ${request.name}</p>
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Role:</strong> ${request.role}</p>
                <p><strong>Status:</strong> ${request.stage}</p>
                <p><strong>Project:</strong> ${request.project}</p>
                <p><strong>Assigned Approver:</strong> ${
                  request.assignedApprover
                }</p>
                <p><strong>Requested at:</strong> ${request.requestedOn}</p>
                <h3>Request Stage</h3>
                ${renderProgressDiagram(request.stage)}
                <p>1. Request Submitted</p>
                <p>2. Await approval</p>
                <p>3. Access approved, awaiting for access to be granted</p>
                <p>4. User added to ACC project</p>
            `;
}

// Renders the list of access requests in the left panel
async function renderRequestList(data) {
  const requestList = document.getElementById("requestList");
  requestList.innerHTML = ""; // Clear any existing list items
  data.sort((a, b) => b.id - a.id);
  data.forEach((request) => {
    const li = document.createElement("li");
    li.textContent = `${request.name} (${request.project})`;
    li.addEventListener("click", function () {
      // Remove active class from all list items
      document.querySelectorAll("#requestList li").forEach((item) => {
        item.classList.remove("active");
      });
      li.classList.add("active");
      renderRequestDetails(request);
    });
    requestList.appendChild(li);
  });
}
// Filter function based on search input and project dropdown
function filterRequests(searchTerm, selectedProject) {
  return accessData.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchTerm) ||
      request.project.toLowerCase().includes(searchTerm);
    const matchesProject =
      selectedProject === "" || request.acc_id === selectedProject;
    return matchesSearch && matchesProject;
  });
}

// Update list when either search input or dropdown changes
function updateList() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
//   const selectedProject = document.getElementById("projectDropdown").value;
  const filteredData = filterRequests(searchTerm, projectId);
  renderRequestList(filteredData);
}

// Uncomment below to fetch data from your API
async function getAccessRequestList() {
    const apiEndpoint =
  "https://prod-46.uksouth.logic.azure.com:443/workflows/5e934fa6851d4e5a938fd72af6785118/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jefhHPo2rrrPKH6TXQjOQzPRz0uKGh4btJP_HTayhlo";
  repsonseData = fetch(apiEndpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network error");
      }
      return response.json();
    })
    .then((data) => {
      return data;

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

    return repsonseData
}

// For demonstration, use sampleData

