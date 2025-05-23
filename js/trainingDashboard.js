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
    trainingData = await getTrainingRecords()
    console.log(trainingData)
    await projectMembers()
    rolesData = await getProjectRoles()
    console.log(rolesData)
    generateMembersTable()
    generateStatusBar()

    inProjectArea = true
    console.log('inProjectArea',inProjectArea)
    generateMenu()
})

async function generateStatusBar() {
    console.log(membersList)
    
    const progress = calculateTrainingProgress(membersList);

  const total = membersList.length;

  const percentTrained = (progress.fullyTrained / total) * 100;
  const percentPartial = (progress.partiallyTrained / total) * 100;
  const percentUntrained = (progress.untrained / total) * 100;

  // Apply widths and labels
  document.querySelector(".bar-trained").style.width = `${percentTrained}%`;
  document.querySelector(".bar-trained").textContent = `${progress.fullyTrained} Fully Trained`;

  document.querySelector(".bar-partial").style.width = `${percentPartial}%`;
  document.querySelector(".bar-partial").textContent = `${progress.partiallyTrained} Partial Trained`;

  document.querySelector(".bar-untrained").style.width = `${percentUntrained}%`;
  document.querySelector(".bar-untrained").textContent = `${progress.untrained} Untrained`;
}

function calculateTrainingProgress(membersList) {
  let fullyTrained = 0;
  let partiallyTrained = 0;
  let untrained = 0;

  membersList.forEach(member => {
    const completed = member.trainingCompleted || []; // safeguard
    const required = member.trainingRequired[0];

    if (!Array.isArray(completed) || completed.length === 0) {
      untrained++;
    } else if (completed.includes(required)) {
      fullyTrained++;
    } else {
      partiallyTrained++;
    }
  });

  return {
    fullyTrained,
    partiallyTrained,
    untrained,
    total: fullyTrained + partiallyTrained + untrained
  };
}

async function generateMembersTable() {
    const tempMembersList = projectMembersList.results
    tempMembersList.forEach(member => {
        const levelMap = { L1: "Level 1", L2: "Level 2", L3: "Level 3" };

        const userTraining = trainingData.data
        .filter(record => record.email.toLowerCase().split('@')[0] === member.email.toLowerCase().split('@')[0])
        .map(record => levelMap[record.level] || record.level); // fallback to raw if not matched

        // Optional: deduplicate if needed
        member.trainingCompleted = [...new Set(userTraining)];
        const filteredRoles = member.roles
        .filter(role => !role.name.includes("PA_") && !role.name.includes("OCRA"))
        .map(role => role.name);
        member.localRole = filteredRoles.flat()

        const compareRole = filteredRoles[0]
        const userRoleTraining = rolesData
        .filter(role => role.role === compareRole)
        .map(role => role.trainingLevel);

        member.trainingRequired = userRoleTraining.flat()
    });
    
    membersList = tempMembersList.filter(member => !member.localRole.includes("System Administrator"));   
    populateTrainingTable(membersList)
}

  // Populate Non-Compliant Files table
function populateTrainingTable(data) {
    const tbody = document.getElementById('membersTableBody');
    data.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.name.toUpperCase()}</td>
        <td>${user.localRole}</td>
        <td>${user.trainingCompleted}</td>
        <td>${user.trainingRequired}</td>
      `;
      tbody.appendChild(row);
    });
}

async function projectMembers() {
    accessToken = await getAccessToken('account:read')
    projectMembersList = await getProjectMemebers()
    console.log(projectMembersList)
}

 async function getProjectMemebers() {
    const bodyData = {

    };
    const headers = {
        'Authorization': "Bearer " + accessToken,
        "Content-Type": "application/json",
      };
    
      const requestOptions = {
        method: "GET",
        headers: headers,
        // body: JSON.stringify(bodyData),
      };
    
      const apiUrl =
        `https://developer.api.autodesk.com/construction/admin/v1/projects/${projectId}/users?limit=200`;
      //console.log(apiUrl)
      console.log(requestOptions)
      responseData = await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then((data) => {
            const JSONdata = data;
            // console.log(JSONdata);
            return JSONdata;
        })
        .catch((error) => console.error("Error fetching data:", error));
      return responseData;
}

 async function getTrainingRecords() {
    const bodyData = {

    };
    const headers = {
        "Content-Type": "application/json",
      };
    
      const requestOptions = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(bodyData),
      };
    
      const apiUrl =
        "https://prod-24.uksouth.logic.azure.com:443/workflows/cd32c3e36f734b0e8a6f011fd6374cab/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uASHGes9iHthtWsldDeXua3XyoyC9Zw4sZDmfIznAfc";
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

async function getProjectRoles(){
  var apiUrl_getProjectRoles = 'https://prod-07.uksouth.logic.azure.com:443/workflows/38dde2d38944467ead65e2349ef9867d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fdBObPGteUBN6_WeI3A1eQMkhGaGrjh1RkydvSYkHQQ';
  data = fetch(apiUrl_getProjectRoles)
    .then(response => response.json())
    .then(data => {
        return data
    })
    .catch(error => console.error('Error fetching data:', error));
    return data
}