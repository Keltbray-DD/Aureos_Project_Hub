document.addEventListener("DOMContentLoaded", async function () {
    searchInput = document.getElementById("searchInput");
    noResults = document.getElementById("noResults");
    dropdown = document.getElementById("dropdownMenu");
    modal = document.getElementById("confirmationModal");
    manualModal = document.getElementById("manualEntryModal");
    modalMessage = document.getElementById("modalMessage");
    await showLoadingSpinner()
        contractList = await getContractList();
        await getExisitngProjectList();
        await contractSeachBarLoad(contractList);
    await hideLoadingSpinner()
});



async function contractSeachBarLoad(data) {

  selectedProject = "";

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();
    dropdown.innerHTML = "";

    if (!value) {
      dropdown.style.display = "none";
      return;
    }

    const filtered = data.filter((p) =>
      p.contractCodeName.toLowerCase().includes(value)
    );
    console.log(filtered)
    filtered.forEach((project) => {
      const div = document.createElement("div");
      if(project)
      div.textContent = project.contractCodeName;
      div.addEventListener("click", () => {
        selectedProject = project;
        showModal(project);
        console.log(selectedProject)
      });
      dropdown.appendChild(div);
    });

    dropdown.style.display = filtered.length > 0 ? "block" : "none";
    noResults.style.display = filtered.length > 0 ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      dropdown.style.display = "none";
    }
  });
}

function showManualEntryModal(){
    manualModal.style.display = "flex";
}

function showModal(project) {
  modalMessage.textContent = `Please click 'Create' to confirm the creation of a mobilisation request for ${project.contractCodeName}`;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

function convertSerialDate(serial) {
    if (!serial) {
      // If blank, return one year from today
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      return oneYearLater.toISOString().split("T")[0];
    }
  
    const baseDate = new Date("1900-01-01T00:00:00Z");
    const correctedSerial = parseInt(serial, 10) - 2; // Adjust Excel-style offset
    baseDate.setDate(baseDate.getDate() + correctedSerial);
  
    return baseDate.toISOString().split("T")[0];
  }
  

function getBusinessUnit(contractLocation) {
    const parts = contractLocation.split("-");
    const company = parts[parts.length - 1].trim(); // Last part, trimmed
  
    switch (company) {
      case "Keltbray Rail Ltd":
        return "Rail";
      case "Wentworth House Rail Systems":
        return "ATS";
      case "Distribution & Transmission":
        return "D&T";
      case "Electricityworx":
        return "Elec";
      case "Keltbray Highways":
        return "Highways";
      case "Keltbray IDEC Ltd":
        return "IDEC";
      case "Keltbray Renewables":
        return "Renewables";
      case "Energy":
        return "Energy";
      default:
        return "Unknown";
    }
  }

async function confirmSelection() {
  modal.style.display = "none";
  console.log("Sending request for:", selectedProject.contractCodeName);
    unit = getBusinessUnit(selectedProject.ContractLocation)
    const bodyData = {
        "contractCodeName":selectedProject.contractCodeName,
        "contractCode":selectedProject['Contract Number'],
        "contractName":selectedProject.Name,
        "contractClientCode":selectedProject.contractClientNo,
        "requestorEmail":userEmail,
        "location":selectedProject.Location,
        "postcode":selectedProject.Postcode,
        "startDate":convertSerialDate(selectedProject.startDate),
        "endDate":convertSerialDate(selectedProject.endDate),
        "customerName":selectedProject.CustomerName,
        "unit":unit
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
        "https://prod-59.uksouth.logic.azure.com:443/workflows/6556ff3879d446cfaa94afcdea16ca4a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=GUI3SIu5eCJrVqiZdIWA1XjW5PBp49cw4ePhGLUpGvA";
      //console.log(apiUrl)
      console.log(requestOptions)
      responseData = await fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          window.location.href = 'successfulCreation.html';
          return;
        })
        .catch((error) => console.error("Error fetching data:", error));
      return responseData;
}
async function getContractList() {
  const headers = {
    "Content-Type": "application/json",
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    //body: JSON.stringify(bodyData),
  };

  const apiUrl =
    "https://prod-20.uksouth.logic.azure.com:443/workflows/342a4469a494462ca9832d44ce39cdad/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=E9ZaVSYoiKT-K2PkLOJS9q2rMHk2EDkQ_Bh_pdSLtSE";
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

async function getExisitngProjectList() {
  const headers = {
    "Content-Type": "application/json",
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    //body: JSON.stringify(bodyData),
  };

  const apiUrl =
    "https://prod-28.uksouth.logic.azure.com:443/workflows/5954b5a505f4475aa97b70e76d61bd87/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7QIDLIoScBLDKzpS2TXErLWp9OJ5fr4uc-Jkr1yn71I";
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

