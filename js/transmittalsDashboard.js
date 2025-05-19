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
})