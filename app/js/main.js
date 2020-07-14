const fs = require('fs');
const { ipcRenderer } = require('electron');

//Fields.
const file = document.getElementById('file');
const lastName = document.getElementById('last_name');
const firstName = document.getElementById('first_name');
const autocompleteTreatments = document.getElementById('treatments');
const autocompleteBody = document.getElementById('body');
const treatmentDate = document.getElementById('treatment_date');
const providerInitals = document.getElementById('provider_initals');

// Treatment Date Picker.
const today = new Date();
treatmentDate.value =
  today.getFullYear().toString() +
  '-' +
  (today.getMonth() + 1).toString().padStart(2, 0) +
  '-' +
  today.getDate().toString().padStart(2, 0);

// Selects.
var selectElems = document.querySelectorAll('select');
var selectInstances = M.FormSelect.init(selectElems);

// Autocomplete Treatments.
const treatmentData = JSON.parse(fs.readFileSync(`${__dirname}/data/treatments.json`, 'utf-8'));
const treatmentArray = {};
treatmentData.forEach((element) => {
  treatmentArray[element.treatments] = element.type;
});

const autocompleteTreatmentOptions = {
  data: treatmentArray
};
const autocompleteTreatmentInstances = M.Autocomplete.init(autocompleteTreatments, autocompleteTreatmentOptions);

// Autocomplete Body.
const bodyAreaData = JSON.parse(fs.readFileSync(`${__dirname}/data/bodyAreas.json`, 'utf-8'));
const bodyAreaArray = {};
bodyAreaData.forEach((element) => {
  bodyAreaArray[element.bodyAreas] = element.type;
});
const autocompleteBodyOptions = {
  data: bodyAreaArray
};
const autocompleteBodyInstances = M.Autocomplete.init(autocompleteBody, autocompleteBodyOptions);

// Form.
document.getElementById('hms_form').addEventListener('submit', (e) => {
  e.preventDefault();
  const filePath = file.files[0].path;
  const lastNameValue = lastName.value;
  const firstNameValue = firstName.value;
  const dobValue = document.getElementById('dob').value ? getDefaultDate(document.getElementById('dob').value) : '';
  const autocompleteTreatmentsValue = autocompleteTreatments.value;
  const autocompleteBodyValue = autocompleteBody.value;
  const treatmentDateValue = document.getElementById('treatment_date').value
    ? getDefaultDate(document.getElementById('treatment_date').value)
    : '';
  const providerInitalsValue = providerInitals.value;
  ipcRenderer.send('file:rename', {
    filePath,
    lastNameValue,
    firstNameValue,
    dobValue,
    autocompleteTreatmentsValue,
    autocompleteBodyValue,
    treatmentDateValue,
    providerInitalsValue
  });
});

function getDefaultDate(curDate) {
  var dt = new Date(curDate);
  var date = (dt.getDate() + 1).toString().padStart(2, '0');
  var month = (dt.getMonth() + 1).toString().padStart(2, '0');
  var year = dt.getFullYear();
  return month.toString() + date.toString() + year.toString();
}

// Rename done.
ipcRenderer.on('rename:done', (newFileName) => {
  document.getElementById('hms_form').reset();
  treatmentDate.value =
    today.getFullYear().toString() +
    '-' +
    (today.getMonth() + 1).toString().padStart(2, 0) +
    '-' +
    today.getDate().toString().padStart(2, 0);
  M.toast({
    html: `File renamed`
  });
});
