document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("appInfo").textContent = `${appName} ${appVersion}`;
    projectList = await getProjectList('all')
    // const postcodes = await getCoordinates(projectList)
    // await generateMap(postcodes)
    appPermissions = await getAppPermissions()
    await filtermenuButtons(appPermissions)
    await generateMyProjects(projectList.data)

    document.getElementById('myProjectGallerySearchBar').addEventListener('input', function () {
      const query = this.value.toLowerCase();
      const filteredProjects = projectList.data.filter(project =>
        project.projectName.toLowerCase().includes(query) ||
        project.projectCode.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
      );
      generateMyProjects(filteredProjects);
    });
    const scrollContainer = document.querySelector('.scroll-x');

    scrollContainer.addEventListener('wheel', function (e) {
      e.preventDefault(); // prevent vertical scrolling
      scrollContainer.scrollLeft += e.deltaY*5;
    });

    document.getElementById('requestMobilisation').addEventListener('click', function (){
      location.href='./requestHome.html'
    })
})

async function generateMyProjects(projectArray) {
  const gallery = document.getElementById('myProjectsCarousel');
  gallery.innerHTML = ''; // Clear current cards
console.log(projectArray)
  projectArray.forEach(element => {
    const card = document.createElement('div');
    card.setAttribute('data-project-id', element.id); // <- Embed projectId here
        card.setAttribute('data-project-name', element.projectName); // <- Embed projectId here
    card.innerHTML = `
      <div class="project-card">
        <div class="project-image">
          <span class="status-tag">${element.status}</span>
        </div>
        <div class="project-details">
          <h3>${element.projectName}</h3>
          <p><strong>Code:</strong> ${element.projectCode}</p>
          <p><strong>Status:</strong> ${element.status}</p>
          <button class="open-btn">Open Project</button>
        </div>
      </div>
    `;
    card.addEventListener('click', setProjectId)
    gallery.appendChild(card);
  });
}

// Function to handle click
function setProjectId(event) {
  projectId = event.currentTarget.getAttribute('data-project-id');
  sessionStorage.setItem('projectId',projectId)
  projectName = event.currentTarget.getAttribute('data-project-name');
  sessionStorage.setItem('projectName',projectName)
  console.log("Selected Project ID:", projectId);
  location.href=`./projectDashboard.html?id=${projectId}`
}

async function filtermenuButtons(allPermissions) {
    const currentUserEmail = userEmail;
    const userPermissions = allPermissions.find(p => p.email === currentUserEmail);
    
    const filteredCards = cardData.filter(card => {
      if (card.display) {
        return userPermissions?.[card.display] === true;
      }
      return true;
    });

      // loadMenuButtons(filteredCards)
}

// async function loadMenuButtons(cardData) {
//       const grid = document.getElementById('cardGrid');
  
//       cardData.forEach(({ title,description, action }) => {
//         const card = document.createElement('div');
//         card.className = 'cardMain fade-in';
  
//         const heading = document.createElement('h2');
//         heading.textContent = title;

//         const descriptionE = document.createElement('p');
//         descriptionE.textContent = description;
  
//         const button = document.createElement('button');
//         button.textContent = 'Click Me';
//         button.addEventListener('click', () => location.href=action);
  
//         card.appendChild(heading);
//         card.appendChild(descriptionE);
//         card.appendChild(button);
  
//         grid.appendChild(card);
//       });
// }