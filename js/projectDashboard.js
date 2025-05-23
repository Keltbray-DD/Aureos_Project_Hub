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

    inProjectArea = true
    console.log('inProjectArea',inProjectArea)
    generateMenu()

    accLink = `https://acc.autodesk.eu/docs/files/projects/${projectId}`
    helixLink = projectDataDash.project_details[0].helixLink || null
    prosapienLink = projectDataDash.project_details[0].prosapien_link || null

    docsDashboardLink = `https://keltbray-dd.github.io/Project_Dashboards/index.html`
    trainingDashboardLink = `./training_dashboard.html?id=${projectId}`
    healthCheckLink = `./health_check.html?id=${projectId}`
    submittalsDashboardLink = `./submittals_dashboard.html?id=${projectId}`
    transmittalsDashboardLink = `./transmittals_dashboard.html?id=${projectId}`
    parDashboardLink = `./project_access_requests.html?id=${projectId}`
    scorecardLink = null
    riskDashboardLink = projectDataDash.project_details[0].risk_dashboard_link || null

    generateKeyResources()
    generateProjectoptions()
    
    const jsonData = projectDataDash.project_data[0].all_versions_file_list
    projectFileData = await convertStringToJSON(jsonData)
    console.log(projectFileData)
    sessionStorage.setItem('projectFileData',JSON.stringify(projectFileData))
})

async function convertStringToJSON(JSONdata) {
  convertedData = JSON.parse(JSONdata);
  convertedData = convertedData.flat();
  // Check if each element is a string before parsing
  const fullJsonArray = convertedData
    .map((item) => {
      return typeof item === "string" ? JSON.parse(item) : item;
    })
    .flat();

  //console.log(convertedData)
  return fullJsonArray;
}



async function generateKeyResources(params) {
  const accCard = document.getElementById('accCard')
  const helixCard = document.getElementById('helixCard')
  const prosapienCard = document.getElementById('prosapienCard')

  if(accLink){
    removedDiasbled(accLink,accCard,'new')
  }
  if(helixLink){
    removedDiasbled(helixLink,helixCard,'new')
  }
  if(prosapienLink){
    removedDiasbled(prosapienLink,prosapienCard,'new')
  }

}

function removedDiasbled(url,element,openType) {
    element.classList.remove('disabled')
    if(openType == "new"){
      element.addEventListener('click', function (){
        window.open(url, "_blank"); // opens in a new tab
      })
    }else{
      element.addEventListener('click', function (){
        location.href = url; // ← opens in the same tab
      })
    }

}

async function generateProjectoptions() {
  const docsDashCard = document.getElementById('docsDashCard')
  const trainingDashCard = document.getElementById('trainingDashCard')
  const healthCheckDashCard = document.getElementById('healthCheckDashCard')
  const submittalsDashCard = document.getElementById('submittalsDashCard')
  const transmittalsDashCard = document.getElementById('transmittalsDashCard')
  const parDashCard = document.getElementById('parDashCard')
  const scorecardDashCard = document.getElementById('scorecardDashCard')
  const riskDashCard = document.getElementById('riskDashCard')

  if(docsDashboardLink){
    removedDiasbled(docsDashboardLink,docsDashCard,'new')
  }
  if(trainingDashboardLink){
    removedDiasbled(trainingDashboardLink,trainingDashCard)
  }
  if(healthCheckLink){
    removedDiasbled(healthCheckLink,healthCheckDashCard)
  }
  if(submittalsDashboardLink){
    removedDiasbled(submittalsDashboardLink,submittalsDashCard)
  }
  if(transmittalsDashboardLink){
    removedDiasbled(transmittalsDashboardLink,transmittalsDashCard)
  }
  if(parDashboardLink){
    removedDiasbled(parDashboardLink,parDashCard)
  }
  if(scorecardLink){
    removedDiasbled(scorecardLink,scorecardDashCard)
  }
  if(riskDashboardLink){
    removedDiasbled(riskDashboardLink,riskDashCard)
  }

}