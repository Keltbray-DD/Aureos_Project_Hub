document.addEventListener("DOMContentLoaded", async function () {
  // Fetch data and update the UI
  projectCode = sessionStorage.getItem('projectCode')
  projectUnit
  await updateMenuButtons()   
  showLoadingSpinner()    
  await runGetRoles()
  await runGetCompanies()
  hideLoadingSpinner()


  const addRowBtn = document.getElementById('addRowBtn');
  addRowBtn.addEventListener('click', () => createEmailRow());
  document.getElementById('projectDetailsForm').addEventListener('submit', e => {
    e.preventDefault();
    prepDetailsData(e)
  });    
  document.getElementById('projectTeamForm').addEventListener('submit', e => {
    e.preventDefault();
    prepTeamData(e)
  });    
  document.getElementById('ACCSetupForm').addEventListener('submit', e => {
    e.preventDefault();
    prepSetupData(e)
  });
  document.getElementById('TrainingForm').addEventListener('submit', e => {
    e.preventDefault();
    prepTrainingData(e)
  });
  document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('csvUpload').click();
  });
  
  document.getElementById('csvUpload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const emails = extractEmailsFromCSV(text);
  
      // Ask user which role to assign to
      // const role = prompt("Assign these emails to which role? (projectManager, documentController, accessApprover)");
  
      // if (!emailFields[role]) {
      //   alert("Invalid role.");
      //   return;
      // }
  
      emails.forEach(email => createEmailRow(email));
    };
  
    reader.readAsText(file);
  });
  
  
  function extractEmailsFromCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const emails = [];
  
    lines.forEach(line => {
      const parts = line.split(','); // supports comma-separated or one per line
      parts.forEach(item => {
        const trimmed = item.trim();
        if (validateEmail(trimmed)) {
          emails.push(trimmed);
        }
      });
    });
  
    return emails;
  }
  
});

  const steps = [
    { id: 0, key: "ProjectDetailsComplete", label: "projectDetails", statusId: "statusProjectDetails",container:"formContainer_projectDetails",form:"projectDetailsForm" ,data:"details"},
    { id: 1, key: "ProjectTeamComplete", label: "projectTeam", statusId: "statusProjectTeam",container:"formContainer_projectTeam",form:"projectTeamForm",data:"team"},
    { id: 2, key: "ACCSetupComplete", label: "accSetup", statusId: "statusAccSetup",container:"formContainer_ACCSetup",form:"ACCSetupForm",data:"setup"},
    { id: 3, key: "TrainingComplete", label: "training", statusId: "statusTraining",container:"formContainer_Training",form:"TrainingForm",data:"training"},
    { id: 4, key: "sentMobilisedComplete", label: "fullyMobilised", statusId: "statusFullyMobilised",container:"formContainer_Mobilised"  },
    { id: 5, key: "FullyMobilisedComplete", label: "fullyMobilised", statusId: "statusFullyMobilised",container:"formContainer_Mobilised"  }
  ];

 async function extractCompletionStatusFields(data) {
  statusFields = [
    { id: 0, status: determineStatus(data[0].ProjectDetailsComplete,0), "complete": data[0].ProjectDetailsComplete || false},   // Project Details
    { id: 1, status: determineStatus(data[0].ProjectTeamComplete,1), "complete": data[0].ProjectTeamComplete || false},     // Project Team
    { id: 2, status: determineStatus(data[0].ACCSetupComplete,2), "complete": data[0].ACCSetupComplete || false},     // ACC Setup
    { id: 3, status: determineStatus(data[0].TrainingComplete,3), "complete": data[0].TrainingComplete || false},     // Training
    { id: 4, status: determineStatus(data[0].Sendforprojectcreation,4), "complete": data[0].Sendforprojectcreation || false},     // Sent for Mobilisation
    { id: 5, status: determineStatus(data[0].ProjectCreatedonACC,5), "complete": data[0].ProjectCreatedonACC || false}, // Fully Mobilised
  ]
  statusFields.forEach(element => {
    setCurrentStatus(element.id)
  });
  return statusFields;
}

function determineStatus(status,index) {
  if (status == false || status == null) {
    if(index == 0 ){
      return "in-progress"
    }
      return "locked"
  } else {
    if(status == true && index == 4){
      return "Sent for Mobilisation"
    }
      return "complete"
  }
}

async function setCurrentStatus(index) {
  const preIndex = index-1
  // console.log(preIndex)
  if(statusFields[preIndex].complete == true){
    statusFields[index].status = "in-progress"
    return 
  }
}

async function prepDetailsData(event) {
  const formData = {
    "formUpdated":'details',
    "spId":projectData.details[0].spId,
    "spIdStatus":projectData.status[0].spId,
    "projectCode":projectCode,
    projectName: event.target.projectName.value,
    unit: event.target.unit.value,
    startDate: event.target.startDate.value,
    endDate: event.target.endDate.value,
    postcode: event.target.location.value,
    lat:coords.lat,
    lon:coords.lng,
    clientName: event.target.clientName.value,
    clientCode: event.target.clientNumber.value,
  };

  await postProjectData(formData)
  showPopup(
    `Project Details Updated`,
    `Fields has been updated for project ${projectCode}`
  );
  await delay(1000)
  await updateMenuButtons()   
}

async function prepTeamData(event) {

  const formData = {
    "formUpdated":'team',
    "spId":projectData.team[0].spId,
    "spIdStatus":projectData.status[0].spId,
    "projectCode":projectCode,
    projectManager: emailFields.projectManager.getEmails(),
    documentController: emailFields.documentController.getEmails(),
    accessApprover: emailFields.accessApprover.getEmails(),
    memberList: []
  };
  const emailGallery = document.getElementById('emailGallery');
  const rows = emailGallery.querySelectorAll('.row');
  rows.forEach(row => {
    console.log(row)
    const email = row.querySelector('input[type="email"]').value;
    const company = row.querySelector('.company-tag').value;
    const role = row.querySelector('.role-tag').value;
    if (email) {
      const item = { email, role, company }
      console.log(item)
      formData.memberList.push(item);
    }
  });

  console.log("Form Data to Submit:", formData);
  //alert("Form submitted! Check the console for payload.");

  await postProjectData(formData)
  showPopup(
    `Project Team Updated`,
    `Fields has been updated for project ${projectCode}`
  );
  await delay(1000)
  await updateMenuButtons()   
}

async function prepSetupData(event) {
  const tempId = event.target.templateType.value
  console.log(tempId)
  const accCat = accTemplates.find(item => item.templateId === tempId)
  console.log(accCat)
  const formData = {
    "formUpdated":'setup',
    "spId":projectData.setup[0].spId,
    "spIdDetails":projectData.details[0].spId,
    "spIdStatus":projectData.status[0].spId,
    "projectCode":projectCode,
    templateId: tempId,
    templateName: accCat.name,
    acc_cateogry: accCat.acc_cateogry,
    namingStandardOption:event.target.namingStandardOption.value
  };

  await postProjectData(formData)
  showPopup(
    `ACC Setup Config Updated`,
    `Fields has been updated for project ${projectCode}`
  );
  await delay(1000)
  await updateMenuButtons()   
}

async function prepTrainingData(event) {
  const level1date = trainingDates.Level1.find(item => item.start === event.target.level1Training.value)
  const level2date = trainingDates.Level2.find(item => item.start === event.target.level2Training.value)
  const formData = {
    "formUpdated":'training',
    "spId":projectData.training[0].spId,
    "spIdStatus":projectData.status[0].spId,
    "projectCode":projectCode,
    level1eventid: level1date.id,
    level2eventid: level2date.id,
    level1date: level1date.start,
    level2date: level2date.start,
  };

  await postProjectData(formData)
  showPopup(
    `Project Training Updated`,
    `Fields has been updated for project ${projectCode}`
  );
  await delay(1000)
  await updateMenuButtons()   
}

async function prepMobiliseData(event) {
document.getElementById('requestMobilisation_button').disabled = true
  const formData = {
    "formUpdated":'mobilise',
    "spIdSetup":projectData.setup[0].spId,
    "spIdStatus":projectData.status[0].spId,
    "spIdDetails":projectData.details[0].spId,
    "spIdTeam":projectData.team[0].spId,
    "spIdTraining":projectData.training[0].spId,
    "projectCode":projectCode,
  };

  await postProjectData(formData)
  showPopup(
    `Project Mobilisation Request Sent`,
    `Your project has been sent to mobilisation to the ACC Support Team`
  );
  await delay(1000)
  await updateMenuButtons()   
}

async function postProjectData(bodyData) {

  const headers = {
    "Content-Type": "application/json",
  };

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(bodyData),
  };

  const apiUrl =
    "https://prod-60.uksouth.logic.azure.com:443/workflows/811721c953294730ae1caf2a276da5e0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=IBJG4a9ZLkqabEkh9vkRHeiURBy3nlUDiHlNSFIhNbA";
  //console.log(apiUrl)
  console.log(requestOptions)
  responseData = await fetch(apiUrl, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      const JSONdata = data;

      //console.log(JSONdata)

      return JSONdata;
    })
    .catch((error) => console.error("Error fetching data:", error));

  return responseData;
}

async function runGetRoles() {
  accessToken = await getAccessToken("account:read data:read")
  rolesData = await getProjectRoles()
  rolesData.sort((a, b) => a.role.localeCompare(b.role))
  console.log("Aureos Roles",rolesData);

  accRoles = await getACCRoles()
  console.log("ACC Roles",accRoles);
  console.log("Aureos Roles",rolesData);

  rolesData.forEach(element => {
    rolesDataExcel.push(element.name)
  });
}

async function runGetACCTemplates() {
  projectUnit = projectData.details[0].unit
  const accTemplatesRaw = await getACCTemplates()
  accTemplates = accTemplatesRaw.data.sort((a, b) => a.name.localeCompare(b.name))
  accTemplates = accTemplates.filter(template => 
    template.bu.some(buItem => buItem.Value === projectUnit)
  );
  console.log(accTemplates)
  const templateDropdown = document.getElementById('templateType')
  templateDropdown.innerHTML = '<option value="" disabled selected hidden>Please select...</option>'
  accTemplates.forEach(element => {
    const option = document.createElement('option')
    option.textContent = element.name
    option.value = element.templateId
    templateDropdown.appendChild(option)
  });
}

async function runGetCompanies() {
  let companiesListRaw = await getCompnaies(accessToken)
  companiesListRaw = companiesListRaw.sort((a, b) => a.name.localeCompare(b.name))
  companiesListRaw.forEach(element => {
    companiesList.push({'value':element.name, 'id':element.id})
    companiesListExcel.push(element.name)
  });
  console.log(companiesList)
}

async function getCompnaies(AccessToken){

  const bodyData = {

      };

  const headers = {
      'Authorization':"Bearer "+AccessToken,
      //'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'GET',
      headers: headers,
      //body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://developer.api.autodesk.com/hq/v1/regions/eu/accounts/"+account_id+"/companies?limit=100";
  //console.log(apiUrl)
  //console.log(requestOptions)
  repsonseData = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
          const JSONdata = data
          // console.log(JSONdata)
      return JSONdata
      })
      .catch(error => console.error('Error fetching data:', error));

  return repsonseData
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

async function getACCRoles(){
 
  const headers = {
    'Authorization':"Bearer "+accessToken,
    'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'GET',
      headers: headers,
      //body: JSON.stringify(bodyData)
  };

  const apiUrl = `https://developer.api.autodesk.com/hq/v2/regions/eu/accounts/${account_id}/projects/${default_project_id}/industry_roles`;
  //console.log(apiUrl)
  //console.log(requestOptions)
  responseData = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
          const JSONdata = data

      //console.log(JSONdata)

      return JSONdata
      })
      .catch(error => console.error('Error fetching data:', error));


  return responseData
  }

  async function getACCTemplates(){
 
    const headers = {
      'Content-Type':'application/json'
    };
  
    const requestOptions = {
        method: 'GET',
        headers: headers,
        //body: JSON.stringify(bodyData)
    };
  
    const apiUrl = `https://prod-45.uksouth.logic.azure.com:443/workflows/5c97201443414a37a31f4f17bc1a0c7f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5tSqeBbKPcFh8lOPa31tRrGy6iScK8dMwlYE3eOzAhs`;
    //console.log(apiUrl)
    //console.log(requestOptions)
    responseData = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
  
        //console.log(JSONdata)
  
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
  
  
    return responseData
    }

function createEmailRow(email, role = '',company) {
  const row = document.createElement('div');
  row.className = 'row';
  if(!email){
    email = ''
  }
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'user@example.com';
  emailInput.value = email;

  const companySelect = document.createElement('select');
  companySelect.className = 'company-tag';
  companiesList.forEach(opt => {
    const option = document.createElement('option');
    
    option.value = opt.value;
    option.textContent = opt.value;
    if (opt.value === company) option.selected = true;
    companySelect.appendChild(option);
  });

  const roleSelect = document.createElement('select');
  roleSelect.className = 'role-tag';
  rolesData.forEach(opt => {
    const option = document.createElement('option');

    option.value = opt.role;
    option.textContent = opt.role;
    if (opt.role === role) option.selected = true;
    roleSelect.appendChild(option);
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '×';
  removeBtn.onclick = () => emailGallery.removeChild(row);

  row.appendChild(emailInput);
  row.appendChild(companySelect);
  row.appendChild(roleSelect);
  row.appendChild(removeBtn);
  emailGallery.appendChild(row);
}

async function updateMenuButtons() {
  showLoadingSpinner()
  projectData = await fetchStatusData()
  statusData = await extractCompletionStatusFields(projectData.status)
  document.getElementById('projectTitle').textContent = `${projectData.details[0].projectCode} - ${projectData.details[0].projectName}`
  if (projectData.status[0].Sendforprojectcreation == true) {
    makeReadOnly()
  }
  await updateMenu(statusData)  
  hideLoadingSpinner()
}

async function makeReadOnly() {
  let formArray = ['projectDetailsForm','projectTeamForm','ACCSetupForm','TrainingForm']
  formArray.forEach(element => {
    makeFormReadOnly(element)
 });
 document.getElementById(`requestMobilisation_button`).disabled = true

}

function makeFormReadOnly(formId) {
  document.querySelectorAll(`#${formId} input, #${formId} textarea`).forEach(el => el.disabled = true);
  document.querySelectorAll(`#${formId} select`).forEach(el => el.disabled = true);
  document.getElementById(`${formId}_button`).disabled = true
}

async function generateSummary() {
  // document.getElementById('detailsSection').innerHTML = ''
  // document.getElementById('teamList').innerHTML = ''
  // document.getElementById('setupSection').innerHTML = ''
  // document.getElementById('trainingSection').innerHTML = ''

  function formatLabel(label) {
    return label
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase());
  }

  // Populate Details
  const details = projectData.details[0];
  const detailsList = document.querySelector('#detailsSection ul');
  detailsList.innerHTML = ''
  for (const key in details) {
    if (details[key] !== null && key !== 'spId') {
      const li = document.createElement('li');
      li.innerHTML = `<span class="label">${formatLabel(key)}:</span> ${details[key]}`;
      detailsList.appendChild(li);
    }
  }

  // Populate Team (general info)
  const team = projectData.team[0];
  const teamList = document.getElementById('teamList');
  teamList.innerHTML = '';
  ['documentController', 'accessApprover', 'projectManager'].forEach(field => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="label">${formatLabel(field)}:</span> ${team[field]}`;
    teamList.appendChild(li);
  });

  // Team members toggle list
  const members = JSON.parse(team.memberList);
  const teamToggle = document.getElementById('teamToggle');
  const teamMembersList = document.getElementById('teamMembersList');

  teamToggle.textContent = `Show Team Members (${members.length})`;

  members.forEach(member => {
    const subLi = document.createElement('li');
    subLi.className = "team-member";
    subLi.textContent = `${member.role} - ${member.email} (${member.company})`;
    teamMembersList.appendChild(subLi);
  });

  let membersVisible = false;
  teamToggle.addEventListener('click', () => {
    membersVisible = !membersVisible;
    teamMembersList.style.display = membersVisible ? 'block' : 'none';
    teamToggle.textContent = `${membersVisible ? 'Hide' : 'Show'} Team Members (${members.length})`;
  });

  // Populate Setup
  const setup = projectData.setup[0];
  const setupList = document.querySelector('#setupSection ul');
  setupList.innerHTML = '';
  for (const key in setup) {
    if (setup[key] !== null && !['spId', 'ProjectCode', 'templateId'].includes(key)) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="label">${formatLabel(key)}:</span> ${setup[key]}`;
      setupList.appendChild(li);
    }
  }

  // Populate Training
  const training = projectData.training[0];
  const trainingList = document.querySelector('#trainingSection ul');
  trainingList.innerHTML = '';
  ['level1', 'level2'].forEach(level => {
    const date = new Date(training[level]);
    const li = document.createElement('li');
    li.innerHTML = `<span class="label">${formatLabel(level)}:</span> ${date.toLocaleString()}`;
    trainingList.appendChild(li);
  });
  
}

async function preTeamForm() {
  const raw = projectData.team[0]; // assuming we only need the first project
  const initialEmails = {
    projectManager: raw.projectManager ? raw.projectManager.split('; ') : [],
    documentController: raw.documentController ? raw.documentController.split('; ') : [],
    accessApprover: raw.accessApprover ? raw.accessApprover.split('; ') : []
  };
  
  const exisitngMembers = JSON.parse(raw.memberList)
  if(exisitngMembers){
    exisitngMembers.forEach(user => createEmailRow(user.email,user.role,user.company));
  }

  emailRoles.forEach(role => {
    const field = createEmailField(role);
    emailFields[role] = field;
  
    // Pre-populate from initialEmails if available
    if (initialEmails[role]) {
      initialEmails[role].forEach(email => field.addEmail(email));
    }
  });
  

    function createEmailField(containerId) {
      const container = document.getElementById(containerId);
      const existing = container.querySelector('input');

      if (existing) {
        console.log('Container already exists!');
        return
      } else {
        console.log('Container does NOT exist yet.');
      }
      const input = document.createElement('input');
      container.appendChild(input);
      const emails = new Set();

      function addEmail(email) {
        if (!validateEmail(email) || emails.has(email)) return;

        emails.add(email);
        const tag = document.createElement('span');
        tag.className = 'email-tag';
        tag.textContent = email;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
          emails.delete(email);
          container.removeChild(tag);
        };

        tag.appendChild(removeBtn);
        container.insertBefore(tag, input);
        input.value = '';
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
          e.preventDefault();
          const email = input.value.trim().replace(',', '');
          addEmail(email);
        }
      });

      return {
        getEmails: () => Array.from(emails).join('; '),
        addEmail
      };
      
    }




}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
  // Simulate HTTP Request (Replace with real HTTP logic)
 async function fetchStatusData() {
    const bodyData = {
        "projectCode":projectCode,
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
        "https://prod-54.uksouth.logic.azure.com:443/workflows/82a9651c64de49168cae3d5c20b43c46/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yqHmTQTOS7lk0cWsGDQiVNyg9gCENoH6eJR1TiefFjQ";
      //console.log(apiUrl)
      console.log(requestOptions)
      responseData = await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then((data) => {
            const JSONdata = data;
            console.log(JSONdata);
            //console.log(JSONdata.uploadKey)
            //console.log(JSONdata.urls)
            return JSONdata;
        })
        .catch((error) => console.error("Error fetching data:", error));
      return responseData;
  }
  async function updateMenu(statusObj) {
    console.log(statusObj)
    let previousComplete = true;
  
    steps.forEach((step, index) => {
      const statusid = step.id
      console.log(statusid)
      const complete = statusObj[index].complete || false; // Convert to boolean
      console.log(complete)
      const card = document.getElementById(step.label);
      const statusText = document.getElementById(step.statusId);
  
      if (previousComplete) {
        if (complete) {
          card.className = "menu-card complete";
          statusText.textContent = "Complete";
        } else {
          card.className = "menu-card in-progress";
          statusText.textContent = "In Progress";
          previousComplete = false;
        }
      } else {
        card.className = "menu-card locked";
        statusText.textContent = "Locked";
      }
    });
  }
  

  async function handleCardClick(id) {
    showLoadingSpinner()
    document.getElementById('startForm').style.display = 'none'
    steps.forEach(element => {
      document.getElementById(element.container).style.display = 'none'
    });
    
    if (statusData[id].status === 'locked') {
      alert('This card is locked. Complete previous steps first.');
      return;
    }

    const container = steps[id].container
    const form = steps[id].form
    // console.log(container)
    document.getElementById(container).style.display = "block";


    // Fetch lat/lng when postcode is entered
    
    if(id == 0){
      const formElement = document.getElementById(form);
      const data = projectData[`${steps[id].data}`]
      console.log(data)
      populateForm(data[0],formElement)
      formElement.elements.location.addEventListener('blur', async () => {
        const postcode = formElement.elements.location.value;
        coordsDisplay = document.getElementById('coordsDisplay');
        getCoordinates(postcode,coordsDisplay)
      });
    }
    if(id == 1){
      preTeamForm()
    }
    if(id == 2){
      await runGetACCTemplates()
      const templateDropdown = document.getElementById('templateType');
      const namingStandardDropdown = document.getElementById('namingStandardOption');
      templateDropdown.value = projectData.setup[0].templateId
      namingStandardDropdown.value = projectData.setup[0].namingStandard
    }
    if(id == 3){
      trainingDates = await getEventDetails()
      const level1Dropdown = document.getElementById('level1Training')
      level1Dropdown.innerHTML = ''
      populateTrainingDropdowns(trainingDates.Level1,level1Dropdown)
      const level2Dropdown = document.getElementById('level2Training')
      level2Dropdown.innerHTML = ''
      populateTrainingDropdowns(trainingDates.Level2,level2Dropdown)
      console.log(projectData.training[0].level1)
      console.log(projectData.training[0].level2)
      const level1Date = await convertJustDateTimeZone(projectData.training[0].level1)
      const level2Date = await convertJustDateTimeZone(projectData.training[0].level2)
      console.log(level1Date)
      console.log(level2Date)
      level1Dropdown.value = level1Date
      level2Dropdown.value = level2Date
    }
    if(id == 4){
      await generateSummary()
    }
    hideLoadingSpinner()
  }

async function populateTrainingDropdowns(array,htmlElement) {
  console.log(array)
  const placeholder = document.createElement("option");
  placeholder.disabled = true
  placeholder.selected = true
  // placeholder.hidden = true
  placeholder.value = 'Please select a date...'
  htmlElement.appendChild(placeholder)
  array.forEach(async element => {
    const option = document.createElement("option");
    option.value = element.start;
    //console.log(element.start)
    const date = await convertDateTimeZone(element.start)
    option.textContent = date
    htmlElement.appendChild(option)
    htmlElement.addEventListener("change", async (e) => {
        
    })
});
// htmlElement.disabled = false
}

async function convertDateTimeZone(rawUtcTimeString) {
  let utcTimeString
  // Split at '.' and take the first part
  if(!rawUtcTimeString.includes('Z')){
    utcTimeString = rawUtcTimeString.split('.')[0] + "Z";
  }else{
    utcTimeString = rawUtcTimeString
  }
  
  // (add 'Z' to make sure JavaScript treats it as UTC)
  // Create a Date object from the UTC time
  // console.log(utcTimeString)
  const utcDate = new Date(utcTimeString);

// Check if the date is valid
if (isNaN(utcDate)) {
  console.log('Invalid date format!');
} else {
  // Convert to London time
  const londonTime = utcDate.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return londonTime
}}

async function convertJustDateTimeZone(dateIso) {
  let utcTimeString
  // Split at '.' and take the first part
  if(dateIso.includes('Z')){
    utcTimeString = dateIso.split('Z')[0] + ".0000000";
  }else{
    utcTimeString = rawUtcTimeString
  }

return utcTimeString

}

async function populateForm(data,form) {
      // Populate form
      for (const key in data) {
        const input = form.elements[key];
        if (input) {
          input.value = data[key];
          if(input.name == 'location' && input.value){
            coordsDisplay = document.getElementById('coordsDisplay');
            getCoordinates(input.value,coordsDisplay)
          }
        }
      }
}

async function convertDate(input) {
  // Remove excess precision if needed
  const cleanedInput = input.slice(0, 19); // "2025-03-31T12:00:00"
  const date = new Date(cleanedInput);

  const pad = (num) => num.toString().padStart(2, '0');

  const formatted = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

  return formatted
}

async function getEventDetails(){

  const headers = {
      'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'GET',
      headers: headers
  };

  const apiUrl = "https://prod-44.uksouth.logic.azure.com:443/workflows/2153356072ec47c5846c5870941fccba/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=P8I6QzglKqButVCpAcMxxZeZwwULd8UUhj-OQt8cSFY";
  //console.log(apiUrl)
  //console.log(requestOptions)
  responseData = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
          const JSONdata = data
      //console.log(JSONdata)
      //console.log(JSONdata.uploadKey)
      //console.log(JSONdata.urls)
      return JSONdata
      })
      .catch(error => console.error('Error fetching data:', error));

  return responseData
  }

async function getCoordinates(postcode,element) {
  console.log(postcode)
  if (!postcode) return;

  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const data = await response.json();

    if (data.status === 200) {
      coords.lat = data.result.latitude;
      coords.lng = data.result.longitude;
      element.textContent = `Lat: ${coords.lat}, Lng: ${coords.lng}`;
    } else {
      coords = { lat: null, lng: null };
      element.textContent = "Invalid postcode.";
    }
  } catch (error) {
    element.textContent = "Error looking up postcode.";
  }
}

async function getTrainingDates() {

  const headers = {
    "Content-Type": "application/json",
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    // body: JSON.stringify(bodyData),
  };

  const apiUrl =
    "https://prod-57.uksouth.logic.azure.com:443/workflows/2f6241f9095846ae81aebfe2394078ba/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=778ai9MhisRVrgnQgEmOWQRmaTojkFE_6w-3AEphW7s";
  //console.log(apiUrl)
  //console.log(requestOptions)
  responseData = await fetch(apiUrl, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      const JSONdata = data;

      //console.log(JSONdata)

      return JSONdata;
    })
    .catch((error) => console.error("Error fetching data:", error));

  return responseData;
}
  
// Function to show popup with fade-in
function showPopup(title, message) {
  const popup = document.getElementById("popup");
  popup.classList.add("show"); // Add 'show' class to make the popup visible
  popup.innerHTML = `<h4>${title}</h4><br><span>${message}</span>`;
  // Hide the popup after 5 seconds with fade-out
  setTimeout(function () {
    popup.classList.remove("show"); // Remove 'show' class to fade it out
  }, 10000);
}

function generateExcel() {
  const companies = companiesListExcel;
  const roles = rolesDataExcel;

  // Sheet 1: Main table
  const mainSheet = [
    ["email", "company", "role"],
    ["", "", ""],  // Placeholder row with dropdowns
    ["", "", ""]   // Add more rows as needed
  ];

  // Sheet 2: Dropdown data source
  const validationSheet = [
    ["Companies", ...companies],
    ["Roles", ...roles]
  ];

  const wb = XLSX.utils.book_new();
  const mainWS = XLSX.utils.aoa_to_sheet(mainSheet);
  const validationWS = XLSX.utils.aoa_to_sheet(validationSheet);

  // Set data validation for dropdowns
  for (let row = 2; row <= 10; row++) { // Adjust row count as needed
    // Company dropdown (column B)
    mainWS[`B${row}`] = {
      t: "s",
      v: "",
      l: { Target: "", Tooltip: "Choose company" },
      s: {},
      dataValidation: {
        type: "list",
        allowBlank: 1,
        formula1: `'Validation'!$B$1:$E$1`
      }
    };

    // Role dropdown (column C)
    mainWS[`C${row}`] = {
      t: "s",
      v: "",
      dataValidation: {
        type: "list",
        allowBlank: 1,
        formula1: `'Validation'!$B$2:$E$2`
      }
    };
  }

  XLSX.utils.book_append_sheet(wb, mainWS, "Table");
  XLSX.utils.book_append_sheet(wb, validationWS, "Validation");

  XLSX.writeFile(wb, "GeneratedExcel.xlsx");
}