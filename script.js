// Global variables
let jsonData = null;
let filteredData = null;

// DOM elements
const fileInput = document.getElementById("fileInput");
const jsonContent = document.getElementById("jsonContent");
const fieldsContainer = document.getElementById("fields");
const filteredJsonContent = document.getElementById("filteredJsonContent");
const downloadButton = document.getElementById("downloadButton");
const applyFilterButton = document.getElementById("applyFilterButton");

// Event listeners
fileInput.addEventListener("change", handleFileUpload);
applyFilterButton.addEventListener("click", filterJSONData);
downloadButton.addEventListener("click", downloadJSON);

// File upload handler
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file.type !== "application/json") {
    alert("Only JSON files are allowed.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      jsonData = JSON.parse(e.target.result);
      jsonContent.value = JSON.stringify(jsonData, null, 2);
      applyFilterButton.disabled = false;
    } catch (error) {
      alert("Error parsing JSON file: " + error.message);
      jsonData = null;
      jsonContent.value = "";
      applyFilterButton.disabled = true;
    }
  };
  reader.readAsText(file);
}

// Add new field input
function addField() {
  const newField = document.createElement("div");
  newField.className = "field";
  newField.innerHTML = `
    <input type="text" placeholder="Enter field (e.g., object.field1.field2)">
    <button onclick="removeField(this)">Remove</button>
  `;
  fieldsContainer.appendChild(newField);
}

// Remove field input
function removeField(button) {
  button.parentElement.remove();
}

// Filter JSON data
function filterJSON(data, allowedFields) {
  if (Array.isArray(data)) {
    return data.map((item) => filterJSON(item, allowedFields));
  } else if (typeof data === "object" && data !== null) {
    return Object.keys(data)
      .filter((key) =>
        allowedFields.some(
          (field) => field === key || field.startsWith(key + ".")
        )
      )
      .reduce((obj, key) => {
        if (allowedFields.includes(key)) {
          obj[key] = data[key];
        } else {
          obj[key] = filterJSON(
            data[key],
            allowedFields
              .filter((field) => field.startsWith(key + "."))
              .map((field) => field.slice(key.length + 1))
          );
        }
        return obj;
      }, {});
  }
  return data;
}

// Apply filter to JSON data
function filterJSONData() {
  if (!jsonData) {
    alert("Please upload a JSON file first.");
    return;
  }

  const fields = Array.from(document.querySelectorAll(".field input"))
    .map((input) => input.value.trim())
    .filter((field) => field !== "");

  if (fields.length === 0) {
    alert("Please enter at least one field to filter.");
    return;
  }

  try {
    filteredData = filterJSON(jsonData, fields);
    filteredJsonContent.value = JSON.stringify(filteredData, null, 2);
    downloadButton.style.display = "inline-block";
  } catch (error) {
    alert("Error filtering JSON: " + error.message);
    filteredJsonContent.value = "";
    downloadButton.style.display = "none";
  }
}

// Download filtered JSON
function downloadJSON() {
  if (!filteredData) {
    alert("No filtered data to download.");
    return;
  }

  const filteredJSON = JSON.stringify(filteredData, null, 2);
  const blob = new Blob([filteredJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "filtered.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
