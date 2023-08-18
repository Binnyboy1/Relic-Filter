// Function to fetch and display JSON data
function fetchJSONData() {
    fetch('HSRScanData_20230814_154944.json')
        .then(response => response.json())
        .then(data => {
            displayJSONData(data);
            updateDataGrid(data.relics) // Call updateDataGrid with the data.relics parameter
            setupFilterButtons(data); // Call setupFilterButtons with the data parameter
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

// Function to display JSON data on the webpage
function displayJSONData(data) {
    const jsonContainer = document.getElementById('json-container');
    jsonContainer.innerHTML = JSON.stringify(data, null, 2);
}

// Function to filter JSON data based on selected keyword
function filterData(data, mainStatFilter, subStatFilter) {
    return data.filter(item => {
        const matchesMainStat = mainStatFilter.length === 0 || mainStatFilter.includes(item.mainStatKey);

        // Retrieve the relic's substats 
        const availableSubStats = item.subStats.map(subStat => subStat.key);

        // Check how many the relic's substats match the filtered substats
        const matchingSubStats = availableSubStats.filter(subStat =>
            subStatFilter.includes(subStat)
        );

        // Returns true if the relic meets the restrictions and filters we set
        if (availableSubStats.length === 3) {
            if (matchingSubStats.length + leniency - strict >= Math.min(availableSubStats.length, subStatFilter.length)) {
                return true;
            }
        } else {
            if (matchingSubStats.length + leniency >= Math.min(availableSubStats.length, subStatFilter.length)) {
                return true;
            }
        }
        return false;
    });
}

// Function to update the data grid with filtered data
function updateDataGrid(data) {
    const dataGrid = document.getElementById('data-grid');
    const dataPointsCountElement = document.getElementById('data-points-count');
    dataGrid.innerHTML = ''; // Clear the existing content

    let dataPointsCount = 0; // Initialize the count
    
    data.forEach(item => {
        const dataPointDiv = document.createElement('div');
        dataPointDiv.classList.add('data-point'); // You can style this class in your CSS
        
        const mainStatDiv = document.createElement('div');
        mainStatDiv.classList.add('data-point-mainstat');
        mainStatDiv.textContent = `${item.mainStatKey}`;
        
        const subStatsDiv = document.createElement('div');
        // subStatsDiv.textContent = 'Sub Stats:';
        
        item.subStats.forEach(subStat => {
            const subStatDiv = document.createElement('div');
            const subStatName = statKeyToName[subStat.key] || subStat.key; // Use the mapping or fallback to key
            subStatDiv.textContent = `${subStatName}: ${subStat.value}`;
            subStatsDiv.appendChild(subStatDiv);
        });
        
        dataPointDiv.appendChild(mainStatDiv);
        dataPointDiv.appendChild(subStatsDiv);
        
        dataGrid.appendChild(dataPointDiv);

        dataPointsCount++; // Increment the count for each data point
    });

    // Update the count in the UI
    dataPointsCountElement.textContent = dataPointsCount;
}

// Responsible for dynamically updating the JSON display with the filters given
function updateFilterButtons(data) {
    const selectedMainStats = Array.from(mainStatButtons.querySelectorAll('button.active')).map(button => button.value);
    const selectedSubStats = Array.from(subStatButtons.querySelectorAll('button.active')).map(button => button.value);

    const filteredData = filterData(data.relics, selectedMainStats, selectedSubStats);
    displayJSONData(filteredData);
    updateDataGrid(filteredData); // Update the data grid and count
}

function createToggleButtons(containerId, options, onClickHandler, data) {
    const container = document.getElementById(containerId);

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.value = option; // !!! change this to be user-friendly later on !!!
        
        // Attach a click event listener to the button
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            onClickHandler(data); // Pass the data parameter to onClickHandler
        });
        
        container.appendChild(button);
    });
}

function createButtonFunctionality(buttonId, data) {
    const button = document.getElementById(buttonId);

    // Function to update the leniency value in the UI
    function updateLeniencyValue(data) {
        const leniencyValueElement = document.getElementById('leniency-value');
        leniencyValueElement.textContent = leniency.toString();
        updateFilterButtons(data); // Updates the filtering when the leniency changes
    }

    if (buttonId === 'increase-leniency') {
        // Event listener for the "Increase" button
        button.addEventListener('click', () => {
            leniency++;
            updateLeniencyValue(data);
        });
    } else if (buttonId === 'decrease-leniency') {
        // Event listener for the "Decrease" button
        button.addEventListener('click', () => {
            if (leniency > 0) {
                leniency--;
                updateLeniencyValue(data);
            }
        });
    } else if (buttonId === 'toggle-strict') {
        // Event listener for the toggle button
        button.addEventListener('click', () => {
            strict = 1 - strict; // Toggle between 0 and 1
            button.classList.toggle('active');
            updateFilterButtons(data); // Update the filtering when the 3-liner leniency is toggled
        });
    } else {
        console.log("Button not working");
    }
}

function setupFilterButtons(data) {
    createToggleButtons('main-stat-buttons', mainStatOptions, updateFilterButtons, data);
    createToggleButtons('sub-stat-buttons', subStatOptions, updateFilterButtons, data);
    createButtonFunctionality('increase-leniency', data);
    createButtonFunctionality('decrease-leniency', data);
    createButtonFunctionality('toggle-strict', data);
}

const mainStatOptions = [
    "HP",
    "HP_",
    "ATK",
    "ATK_",
    "DEF_",
    "SPD",
    "CRIT Rate_",
    "CRIT DMG_",
    "Break Effect_",
    "Outgoing Healing Boost",
    "Energy Regeneration Rate",
    "Effect Hit Rate_",
    "Physical DMG Boost",
    "Fire DMG Boost",
    "Ice DMG Boost",
    "Lightning DMG Boost",
    "Wind DMG Boost",
    "Quantum DMG Boost",
    "Imaginary DMG Boost"
];

const subStatOptions = [
    "HP",
    "HP_",
    "ATK",
    "ATK_",
    "DEF",
    "DEF_",
    "SPD",
    "CRIT Rate_",
    "CRIT DMG_",
    "Break Effect_",
    "Effect Hit Rate_",
    "Effect RES_"
];

const statKeyToName = {
    "HP": "HP",
    "HP_": "HP",
    "ATK": "ATK",
    "ATK_": "ATK",
    "DEF": "DEF",
    "DEF_": "DEF",
    "SPD": "SPD",
    "CRIT Rate_": "cRate",
    "CRIT DMG_": "cDMG",
    "Break Effect_": "Break",
    "Effect Hit Rate_": "EHR",
    "Effect RES_": "RES",
    "Outgoing Healing Boost": "Heal",
    "Energy Regeneration Rate": "ERR",
    "Physical DMG Boost": "Physical",
    "Fire DMG Boost": "Fire",
    "Ice DMG Boost": "Ice",
    "Lightning DMG Boost": "Lightning",
    "Wind DMG Boost": "Wind",
    "Quantum DMG Boost": "Quantum",
    "Imaginary DMG Boost": "Imaginary"
};

const mainStatButtons = document.getElementById('main-stat-buttons');
const subStatButtons = document.getElementById('sub-stat-buttons');
let leniency = 0;
let strict = 0;

// Call the function when the page loads
window.onload = () => {
    fetchJSONData();
};