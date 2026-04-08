const STORAGE_KEYS = {
  saved: "jobboard_saved_v1",
  applied: "jobboard_applied_v1",
  custom: "jobboard_custom_v1"
};

const defaultJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechSpark",
    location: "Remote",
    type: "Full-time",
    salary: 90000,
    description: "Build modern UI features for our SaaS platform."
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "DataFlow",
    location: "New York",
    type: "Full-time",
    salary: 120000,
    description: "Design APIs and data pipelines for analytics products."
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Creative Hub",
    location: "Remote",
    type: "Contract",
    salary: 85000,
    description: "Create high-conversion product experiences and flows."
  },
  {
    id: 4,
    title: "Product Manager",
    company: "ScaleUp",
    location: "San Francisco",
    type: "Part-time",
    salary: 110000,
    description: "Lead roadmap, metrics, and execution across teams."
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "MetaAnalytics",
    location: "New York",
    type: "Full-time",
    salary: 130000,
    description: "Build predictive models and production ML insights."
  }
];

const state = {
  tab: "all",
  search: "",
  location: "All",
  type: "All",
  sortBy: "recent",
  saved: new Set(readStore(STORAGE_KEYS.saved, [])),
  applied: readStore(STORAGE_KEYS.applied, {}),
  customJobs: readStore(STORAGE_KEYS.custom, []),
  applyJobId: null
};

const tabBar = document.getElementById("tabBar");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const typeFilter = document.getElementById("typeFilter");
const sortBy = document.getElementById("sortBy");
const jobGrid = document.getElementById("jobGrid");
const jobCardTemplate = document.getElementById("jobCardTemplate");
const addJobForm = document.getElementById("addJobForm");
const applyModal = document.getElementById("applyModal");
const applyForm = document.getElementById("applyForm");
const applyTitle = document.getElementById("applyTitle");

init();

function init() {
  hydrateFilters();
  bindEvents();
  render();
}

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (_) {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function allJobs() {
  return [...defaultJobs, ...state.customJobs];
}

function hydrateFilters() {
  const jobs = allJobs();
  const uniqueLocations = ["All", ...new Set(jobs.map((job) => job.location).sort())];
  const uniqueTypes = ["All", ...new Set(jobs.map((job) => job.type).sort())];

  locationFilter.innerHTML = uniqueLocations.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  typeFilter.innerHTML = uniqueTypes.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");

  locationFilter.value = uniqueLocations.includes(state.location) ? state.location : "All";
  typeFilter.value = uniqueTypes.includes(state.type) ? state.type : "All";
}

function bindEvents() {
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    render();
  });

  locationFilter.addEventListener("change", (event) => {
    state.location = event.target.value;
    render();
  });

  typeFilter.addEventListener("change", (event) => {
    state.type = event.target.value;
    render();
  });

  sortBy.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    render();
  });

  tabBar.addEventListener("click", (event) => {
    const tab = event.target?.dataset?.tab;
    if (!tab) {
      return;
    }
    state.tab = tab;
    render();
  });

  jobGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const jobId = Number(button.dataset.jobId);
    const job = allJobs().find((entry) => entry.id === jobId);

    if (!job) {
      return;
    }

    if (action === "save") {
      toggleSave(jobId);
      return;
    }

    if (action === "apply") {
      openApply(job);
    }
  });

  addJobForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(addJobForm);

    const nextJob = {
      id: Date.now(),
      title: data.get("title").toString().trim(),
      company: data.get("company").toString().trim(),
      location: data.get("location").toString().trim(),
      type: data.get("type").toString().trim(),
      salary: toSalary(data.get("salary").toString()),
      description: data.get("description").toString().trim()
    };

    if (!nextJob.salary) {
      alert("Please add a valid numeric salary.");
      return;
    }

    state.customJobs.unshift(nextJob);
    writeStore(STORAGE_KEYS.custom, state.customJobs);
    addJobForm.reset();
    hydrateFilters();
    render();
  });

  applyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (state.applyJobId === null) {
      return;
    }

    const data = new FormData(applyForm);
    state.applied[state.applyJobId] = {
      name: data.get("name").toString().trim(),
      email: data.get("email").toString().trim(),
      portfolio: data.get("portfolio").toString().trim(),
      coverLetter: data.get("coverLetter").toString().trim(),
      appliedAt: new Date().toISOString()
    };

    writeStore(STORAGE_KEYS.applied, state.applied);
    applyModal.close();
    applyForm.reset();
    render();
  });
}

function openApply(job) {
  state.applyJobId = job.id;
  applyTitle.textContent = `Apply for ${job.title} at ${job.company}`;
  applyModal.showModal();
}

function toggleSave(jobId) {
  if (state.saved.has(jobId)) {
    state.saved.delete(jobId);
  } else {
    state.saved.add(jobId);
  }

  writeStore(STORAGE_KEYS.saved, [...state.saved]);
  render();
}

function computeVisibleJobs() {
  const search = state.search.toLowerCase();

  let items = allJobs().filter((job) => {
    const matchesText = [job.title, job.company, job.description].join(" ").toLowerCase().includes(search);
    const matchesLocation = state.location === "All" || job.location === state.location;
    const matchesType = state.type === "All" || job.type === state.type;
    return matchesText && matchesLocation && matchesType;
  });

  if (state.tab === "saved") {
    items = items.filter((job) => state.saved.has(job.id));
  }

  if (state.tab === "applied") {
    items = items.filter((job) => Boolean(state.applied[job.id]));
  }

  switch (state.sortBy) {
    case "salaryHigh":
      items.sort((a, b) => b.salary - a.salary);
      break;
    case "salaryLow":
      items.sort((a, b) => a.salary - b.salary);
      break;
    case "company":
      items.sort((a, b) => a.company.localeCompare(b.company));
      break;
    default:
      items.sort((a, b) => b.id - a.id);
      break;
  }

  return items;
}

function render() {
  renderTabs();

  const jobs = computeVisibleJobs();
  jobGrid.innerHTML = "";

  if (!jobs.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No jobs found for this view and filter selection.";
    jobGrid.append(empty);
    return;
  }

  jobs.forEach((job) => {
    const fragment = jobCardTemplate.content.cloneNode(true);

    fill(fragment, "title", job.title);
    fill(fragment, "company", job.company);
    fill(fragment, "location", job.location);
    fill(fragment, "type", job.type);
    fill(fragment, "salary", formatCurrency(job.salary));
    fill(fragment, "description", job.description);

    const saveButton = fragment.querySelector('[data-action="save"]');
    const applyButton = fragment.querySelector('[data-action="apply"]');

    saveButton.dataset.jobId = String(job.id);
    applyButton.dataset.jobId = String(job.id);

    if (state.saved.has(job.id)) {
      saveButton.textContent = "Unsave";
    } else {
      saveButton.textContent = "Save";
    }

    if (state.applied[job.id]) {
      applyButton.textContent = "Applied";
      applyButton.disabled = true;
    }

    jobGrid.append(fragment);
  });
}

function renderTabs() {
  const counts = {
    all: allJobs().length,
    saved: [...state.saved].filter((id) => allJobs().some((job) => job.id === id)).length,
    applied: Object.keys(state.applied).filter((id) => allJobs().some((job) => job.id === Number(id))).length
  };

  const labels = {
    all: `Browse Jobs (${counts.all})`,
    saved: `Saved (${counts.saved})`,
    applied: `Applied (${counts.applied})`
  };

  tabBar.innerHTML = ["all", "saved", "applied"]
    .map((tab) => {
      const activeClass = state.tab === tab ? "tab active" : "tab";
      return `<button class="${activeClass}" data-tab="${tab}">${labels[tab]}</button>`;
    })
    .join("");
}

function fill(root, field, value) {
  const element = root.querySelector(`[data-field="${field}"]`);
  if (element) {
    element.textContent = value;
  }
}

function toSalary(rawValue) {
  const numeric = Number(rawValue.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : 0;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
