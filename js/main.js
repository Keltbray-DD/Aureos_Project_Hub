document.addEventListener("DOMContentLoaded", async function () {


})

async function getAppPermissions() {
      
  const headers = {
    "Content-Type": "application/json",
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    //body: JSON.stringify(bodyData),
  };

  const apiUrl =
    "https://prod-52.uksouth.logic.azure.com:443/workflows/50dcd03120e14b98ba8db06ab121b893/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mTDN3uVmEjje1qSZqGTSIoxApa9CDJsBFKc2p-WbLB4";
  //console.log(apiUrl)
  //console.log(requestOptions)
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

async function getProjectList(type) {
    let bodyData
    if(type == 'user'){
      bodyData = {
        type:'user',
        email:userEmail
      };
    }else{
      bodyData = {
        type:'all'
      };
    }

    const headers = {
      "Content-Type": "application/json",
    };
  
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(bodyData),
    };
  
    const apiUrl =
      "https://prod-32.uksouth.logic.azure.com:443/workflows/ca69fb51757b42f2a691f48304cf70ae/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AUPlykLromoOz0gCoBLl3cTXNPtL2Y2DyT641sevLtI";
    //console.log(apiUrl)
    // console.log(requestOptions)
    responseData = await fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const JSONdata = data;
        // console.log(JSONdata);
        //console.log(JSONdata.uploadKey)
        //console.log(JSONdata.urls)
        return JSONdata;
      })
      .catch((error) => console.error("Error fetching data:", error));
    return responseData;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

