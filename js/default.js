document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("appInfo").textContent = `${appName} ${appVersion}`;
    inProjectArea = sessionStorage.getItem('inProjectArea')
    generateMenu()

    // Feeback Button
document.getElementById('feedbackBtn').onclick = function(event) {
    event.preventDefault(); // prevent the jump
    document.getElementById('feedbackModal').style.display = "block";
};

document.getElementById('closeModal').onclick = function(event) {
    event.preventDefault(); // prevent the jump
    document.getElementById('feedbackModal').style.display = "none";
};

document.getElementById('feedbackForm').onsubmit = async function(event) {
    event.preventDefault();

    const type = document.getElementById('type').value;
    const description = document.getElementById('description').value;
    const userEmail = document.getElementById('userFeedbackEmail').value;
    const screenshotInput = document.getElementById('screenshot');

    let screenshotBase64 = null;

    if (screenshotInput.files.length > 0) {
        const file = screenshotInput.files[0];
        screenshotBase64 = await toBase64(file);
    }

    const data = {
        tool: appName,
        type: type,
        description: description,
        userEmail: userEmail,
        screenshotBase64: screenshotBase64
    };

    try {
        const response = await fetch('https://prod-07.uksouth.logic.azure.com:443/workflows/9c87a5536bdb4693a934559d0ce9d483/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=B29hnHMorKKwLVyZquwnJLNth1wSAnL2VAhPd779XzY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Report submitted!');
            document.getElementById('feedbackModal').style.display = "none";
            document.getElementById('feedbackForm').reset();
        } else {
            alert('Failed to submit.');
        }
    } catch (error) {
        console.error('Error submitting:', error);
        alert('An error occurred.');
    }
};

// Helper function to convert file to base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

})

async function generateMenu(params) {
    const sideBarOptions = document.getElementById('side-menu')
    sideBarOptions.innerHTML = ''
    menuOptions = [
       {title:'Home',link:'./index.html'},
       {title:'Request Mobilisation',link:'./requestHome.html'},
       {title:'Overview Dashboards',link:'./overviewDashboards.html'},
    ]
    const heading = document.createElement('h3')
    heading.innerText = `Main Menu`
    sideBarOptions.appendChild(heading)
    menuOptions.forEach(element => {
       const menuOption = document.createElement('a')
       menuOption.href = element.link
       menuOption.textContent = element.title
       sideBarOptions.appendChild(menuOption)
    });

    if(inProjectArea === true){
        const heading = document.createElement('h3')
        heading.innerText = `Project Menu`
        sideBarOptions.appendChild(heading)

        projectMenuOptions = [
            {title:'Project Home',link:`./projectDashboard.html?id=${projectId}`},
            {title:'Docs Dashboard',link:`https://keltbray-dd.github.io/Project_Dashboards/index.html`},
            {title:'Training Dashboards',link:`./training_dashboard.html?id=${projectId}`},
            {title:'Health Check',link:`./health_check.html?id=${projectId}`},
            {title:'Submittals Tracker',link:`./submittals_dashboard.html?id=${projectId}`},
            {title:'Transmittals Tracker',link:`./transmittals_dashboard.html?id=${projectId}`},
            {title:'Project Access Requests',link:`./project_access_requests.html?id=${projectId}`},
        ]

        projectMenuOptions.forEach(element => {
            const menuOption = document.createElement('a')
            menuOption.href = element.link
            menuOption.textContent = element.title
            sideBarOptions.appendChild(menuOption)
        });
    }
}

async function getAccessToken(scopeInput){

  const bodyData = {
      scope: scopeInput,
      };

  const headers = {
      'Content-Type':'application/json'
  };

  const requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(bodyData)
  };

  const apiUrl = "https://prod-30.uksouth.logic.azure.com:443/workflows/df0aebc4d2324e98bcfa94699154481f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jHsW0eISklveK7XAJcG0nhfEnffX62AP0mLqJrtLq9c";
  //console.log(apiUrl)
  //console.log(requestOptions)
  signedURLData = await fetch(apiUrl,requestOptions)
      .then(response => response.json())
      .then(data => {
          const JSONdata = data

      //console.log(JSONdata)

      return JSONdata.access_token
      })
      .catch(error => console.error('Error fetching data:', error));


  return signedURLData
  }

  async function projectIdCheck() {
    const currentPath = window.location.pathname;
    console.log(currentPath)
    console.log(allowedPages)
    if (allowedPages.includes(currentPath)){
        const projectId = sessionStorage.getItem('projectId')
        if(!projectId){
            const url = new URL(window.location.href);

            // Use URLSearchParams to get the value of 'id'
            const id = url.searchParams.get('id');
            sessionStorage.setItem('projectId',id)
            console.log('ID:', id); // Output: 12345
        }
    }
  }

 async function getProjectDetails() {
    const bodyData = {
        "ACC_ID":projectId,
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
        "https://prod-45.uksouth.logic.azure.com:443/workflows/20aa74b0d830478484123e920da2b2ec/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=BhfQ88cRURSqoh3SUUuUlx5qpJoA9dX2iRIgoU3IPvs";
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

  async function showLoadingSpinner(element) {
    const loadingSpinner = document.getElementById('loading');
  
    // Show the loading spinner

    loadingSpinner.style.display = 'block';
  }
  
  async function hideLoadingSpinner(element) {
    const loadingSpinner = document.getElementById('loading');
  
    // Show the loading spinner
    loadingSpinner.style.display = 'none';

  }