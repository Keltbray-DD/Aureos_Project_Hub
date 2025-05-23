const appName = "Aureos Project Hub";
const appVersion = "v0.1.3 ALPHA";

const account_id = "24d2d632-e01b-4ca0-b988-385be827cb04"
const default_project_id = "bc44c453-d23a-46ce-8b83-6bea9e90c4b9"
let accessToken

let devMode = false
let appPermissions
let userEmail

// Project Dashboard Variables

let projectId
let projectName
let inProjectArea = false

let projectDataDash
let projectFileData

let accLink
let helixLink
let prosapienLink

let docsDashboardLink
let trainingDashboardLink
let healthCheckLink
let submittalsDashboardLink
let transmittalsDashboardLink
let parDashboardLink
let scorecardLink
let riskDashboardLink

// Health Check Variables

let revisionCheck_correct = 0, revisionCheck_failed = 0;
let fileDescriptionCheck_correct = 0, fileDescriptionCheck_failed = 0;
let titleLineCheck_correct = 0, titleLineCheck_failed = 0;
let statusCheck_correct = 0, statusCheck_failed = 0;

let filesLength = 0
let failedFilesLength = 0

let failedFiles = [];
let singleFileList = []
let metadataCompliance
let healthData
let uniqueUploaders
let nonCompliantFiles = []

// Training Variables

let trainingData
let projectMembersList
let membersList

// Submittals Variables

let submittalArray = []
let submittalArrayRaw
let mainArray
let table

let overviewArray 
let detailedArray 
let feasibilityArray

let chartSections

const allowedColumns = ["status_value", "created_at", "custom_identifier","response_value", "title", "description", "spec_value","url"]; // choose the ones you want
const orderedColumns = ["url","custom_identifier", "status_value","response_value", "created_at", "title", , "description", "spec_value"];
const headerLabels = {
    id: "ID",
    bim360_project_id: "Project ID",
    title: "Title",
    created_at: "Created Date",
    status_value: "Status",
    custom_identifier: "Submittal ID",
    description: "Description",
    spec_value: "Type",
    response_value: "Response",
    url:" "
    // Add more fields here as needed
};

// let pieChart
let pieChartOverall
// let barChart
let monthMap = {}; // e.g. { '2024-04': [...], '2024-05': [...] }

// PAR Variables

let accessData;
let filteredAccessData

// Overview Dashboards

let overviewData
let overviewFileData = []
let accountUserList

// General Arrays

let projectList
let userProjectList
let contractList
let selectedProject

const allowedPages = [
  '/submittals_dashboard.html',
  '/training_dashboard.html',
  '/transmittals_dashboard.html',
  '/projectDashboard.html',
  '/health_check.html'
];

// Request Creation Variables

let searchInput
let dropdown
let modal
let modalMessage
let manualModal

//// Request Dashboard page

let projectCode
let projectData
let projectUnit
let coordsDisplay
let coords = { lat: null, lng: null };
let statusFields
let statusData

let rolesData
let accRoles
let rolesDataExcel =[]
let companiesList =[]
let companiesListExcel = []
let accTemplates = []
let trainingDates

let roleOptions = ["Viewer", "Editor", "Admin"];

const emailRoles = ['projectManager', 'documentController', 'accessApprover'];

let emailFields = {};

//// Home page variables

let cardData = [
    { title: "Request Project Mobilisation", description:"This is where you request an ACC project to be created", action: "requestProjectMobilisation.html" },
    { title: "View Requested Mobilisations", description:"This is where you can view already raised Mobilisations", action: "myRequestDashboard.html" },
    { title: "View All Requests", description:"To view all project Mobilisation requests", action: "under_construction.html" , display:"view_all_requests"},
    { title: "View Mobilisation Dashboard", description:"To view dashboard of ACC project uptake", action: "under_construction.html", display:"view_overview_dashboards" },
  ];

// let userProjects = [
//     { projectName: "Sky Tower", projectCode: "ST001", status: "In Progress" },
//     { projectName: "River Bridge", projectCode: "RB402", status: "Completed" },
//     { projectName: "City Park", projectCode: "CP882", status: "Pending" },
//   ];

let menuOptions = [
    {title:'Home',link:'./index.html'},
    {title:'My Requests',link:'./myRequestDashboard.html'},
 ]

// Login Variables

let userDetails
let userAccessToken
let toolURL
let fullURL