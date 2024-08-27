let jsonData;
let filteredData;

document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file.type !== "application/json") {
    alert("Only JSON files are allowed.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    jsonData = JSON.parse(e.target.result);
    document.getElementById("jsonContent").value = JSON.stringify(
      jsonData,
      null,
      2
    );
  };
  reader.readAsText(file);
});

function addField() {
  const fieldsDiv = document.getElementById("fields");
  const newField = document.createElement("div");
  newField.className = "field";
  newField.innerHTML = `
                  <input type="text" placeholder="Enter field (e.g., object.field1.field2)">
                  <button onclick="removeField(this)">Remove</button>
              `;
  fieldsDiv.appendChild(newField);
}

function removeField(button) {
  button.parentElement.remove();
}

function filterJSON() {
  if (!jsonData) {
    alert("Please upload a JSON file first.");
    return;
  }

  const fields = Array.from(document.querySelectorAll(".field input")).map(
    (input) => input.value
  );
  filteredData = {};

  fields.forEach((field) => {
    const keys = field.split(".");
    let value = jsonData;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }
    if (value !== undefined) {
      let target = filteredData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) {
          target[keys[i]] = {};
        }
        target = target[keys[i]];
      }
      target[keys[keys.length - 1]] = value;
    }
  });

  const filteredJSON = JSON.stringify(filteredData, null, 2);
  document.getElementById("filteredJsonContent").value = filteredJSON;
  document.getElementById("downloadButton").style.display = "inline-block";
}

function downloadJSON() {
  const filteredJSON = JSON.stringify(filteredData, null, 2);
  const blob = new Blob([filteredJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "filtered.json";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
