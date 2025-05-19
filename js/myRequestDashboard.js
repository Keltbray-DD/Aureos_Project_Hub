document.addEventListener("DOMContentLoaded", async function () {

    gallery = document.getElementById('projectGallery');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    userEmail = sessionStorage.getItem('userEmail')
    userProjectList = await getProjectList('user')
    console.log(userProjectList)

    // Event listeners
    searchInput.addEventListener('input', filterProjects);
    statusFilter.addEventListener('change', filterProjects);
    const initialProjectList = userProjectList.data.filter(item => item.status !== 'Active')
    // Initial render
    renderGallery(initialProjectList);
})

function renderGallery(filteredProjects) {
  gallery.innerHTML = "";
  if (filteredProjects.length === 0) {
    gallery.innerHTML = "<p>No matching projects found.</p>";
    return;
  }
  filteredProjects.sort((a, b) => a.projectCode.localeCompare(b.projectCode))
  filteredProjects.forEach(project => {
    const card = document.createElement('div');
      // Make card clickable
    card.onclick = () => {
      nagivateToDashboard(project.projectCode)
    };
    card.value = project.projectCode
    card.className = 'gallery-card';
    switch (project.status) {
      case 'Pre-con':
        card.innerHTML = `
        <h3>${project.projectName}</h3>
        <p><strong>Code:</strong> ${project.projectCode}</p>
        <p class="gallery-status blue"><strong>Status:</strong> ${project.status}</p>
      `;
        break;
        case 'Mobilisation':
          card.innerHTML = `
          <h3>${project.projectName}</h3>
          <p><strong>Code:</strong> ${project.projectCode}</p>
          <p class="gallery-status orange"><strong>Status:</strong> ${project.status}</p>
        `;
          break;
          case 'Active':
            card.innerHTML = `
            <h3>${project.projectName}</h3>
            <p><strong>Code:</strong> ${project.projectCode}</p>
            <p class="gallery-status green"><strong>Status:</strong> ${project.status}</p>
          `;
            break;
      default:
        break;
    }
    // card.innerHTML = `
    //   <h3>${project.projectName}</h3>
    //   <p><strong>Code:</strong> ${project.projectCode}</p>
    //   <p class="gallery-status"><strong>Status:</strong> ${project.status}</p>
    // `;
    gallery.appendChild(card);
  });
}
function nagivateToDashboard(code) {
  sessionStorage.setItem('projectCode',code)
  window.location.href = './requestDashboard.html';
}

function filterProjects() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;

  const filtered = userProjectList.data.filter(p => {
    const matchesSearch = p.projectName.toLowerCase().includes(searchTerm) || 
                          p.projectCode.toLowerCase().includes(searchTerm);
    const matchesStatus = statusValue === "" || p.status === statusValue;
    return matchesSearch && matchesStatus;
  });

  renderGallery(filtered);
}

async function generateGallery(projects) {
    const gallery = document.getElementById('projectGallery');

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      card.innerHTML = `
        <h3>${project.projectName}</h3>
        <p><strong>Code:</strong> ${project.projectCode}</p>
        <p class="gallery-status"><strong>Status:</strong> ${project.status}</p>
      `;

      gallery.appendChild(card);
    });
}