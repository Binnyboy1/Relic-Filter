// Global variables
const setButtons = document.getElementById('set-buttons');
const slotButtons = document.getElementById('slot-buttons');
const mainstatButtons = document.getElementById('main-stat-buttons');
const substatButtons = document.getElementById('sub-stat-buttons');

let selectedSets = Array.from(setButtons.querySelectorAll('button.active')).map(button => button.value);
let selectedSlots = Array.from(slotButtons.querySelectorAll('button.active')).map(button => button.value);
let selectedMainstats = Array.from(mainstatButtons.querySelectorAll('button.active')).map(button => button.value);
let selectedSubstats = Array.from(substatButtons.querySelectorAll('button.active')).map(button => button.value);

let leniency = 0;
let strict = 0;
let minLvl = 0;
let maxLvl = 15;



// Function to fetch and display JSON data
function fetchJSONData() {
    fetch('HSRScanData_20231121_220545.json')
        .then(response => response.json())
        .then(data => {
            updateDataGrid(data.relics); // Call updateDataGrid with the data.relics parameter
            setupFilterButtons(data); // Call setupFilterButtons with the data parameter
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

window.onclick = function(event) {
    const clickedButton = event.target.closest('.select');
    if (clickedButton) {
        const dropdownId = clickedButton.getAttribute('data-dropdown-id');
        const allDropdowns = document.querySelectorAll('.container > [id^="dropdown"]');

        allDropdowns.forEach(dropdown => {
            if (dropdown.id !== dropdownId && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });

        const targetDropdown = document.getElementById(dropdownId);
        if (targetDropdown) {
            targetDropdown.classList.toggle('active');
        }
    } else {
        const allDropdowns = document.querySelectorAll('.container > [id^="dropdown"]');
        allDropdowns.forEach(dropdown => {
            if (dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
};
document.querySelectorAll('.container > [id^="dropdown"]').forEach(dropdown => {
    dropdown.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});


// Function to filter JSON data based on selected keyword
function filterData(data, quickUpdate) {
    if (quickUpdate) {
        const dataGrid = document.getElementById('data-grid');
        const gridItems = dataGrid.children;

        let cnt = 0;
        for (let i = 0; i < gridItems.length; i++) {
            const lvlClass = gridItems[i].classList[1]; // gets lvl that was saved as a div class
            const lvl = parseInt(lvlClass, 10); // converts class into a number

            const withinLvlRange = minLvl <= lvl && maxLvl >= lvl;
            if (!withinLvlRange) {
                gridItems[i].style.display = "none";
            } else {
                gridItems[i].style = "";
                cnt++;
            }
        }

        const dataPointsCountElement = document.getElementById('data-points-count');
        dataPointsCountElement.textContent = cnt;
        return;
    }
    
    return data.filter(item => {

        // Check if set matches
        const matchesSet = selectedSets.length === 0 || selectedSets.includes(item.set);
        if (matchesSet) {

            // Check if slot matches
            const matchesSlot = selectedSlots.length === 0 || selectedSlots.includes(item.slot);
            if (matchesSlot) {

                // Check if main stat matches
                const matchesMainstat = selectedMainstats.length === 0 || selectedMainstats.includes(item.mainstat);
                if (matchesMainstat) {

                    // Check if lvl is within the selected range
                    const withinLvlRange = minLvl <= item.level && maxLvl >= item.level;
                    if (withinLvlRange) {
                        // Retrieve the relic's substats 
                        const availableSubstats = item.substats.map(substats => substats.key);

                        // Check how many the relic's substats match the filtered substats
                        const matchingSubstats = availableSubstats.filter(substat =>
                            selectedSubstats.includes(substat)
                        );

                        // Returns true if the relic meets the restrictions and filters we set
                        if (availableSubstats.length === 3) {
                            if (matchingSubstats.length + leniency - strict >= Math.min(availableSubstats.length, selectedSubstats.length)) {
                                return true;
                            }
                        } else {
                            if (matchingSubstats.length + leniency >= Math.min(availableSubstats.length, selectedSubstats.length)) {
                                return true;
                            }
                        }
                    }
                }
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
        /* Visual

        border -------------- border
        ↳ col.div1 ----------> div
          ↳ col.div1.1 ------>> div
            ↳ col.div1.1.1 -->>> img
          ↳ col.div1.2 ------>> div
            ↳ +text
            ↳ col.div1.2.1 -->>> svg
        ↳ col.div2 ----------> div
          ↳ col.div2.1 ------>> div [x4]
            ↳ col.div2.1.1 -->>> svg + inner <use>
            ↳ col.div2.1.2 -->>> inner text

        */

        // calculate rv
        let subRolls = [];
        let cnt = 0;
        let maxValue = 0;
        item.substats.forEach(substat => { 
            let val = substat.value/substatData[substat.key];
            if (val < 4) {
                subRolls.push(Math.ceil(val));
            } else {
                subRolls.push(val);
                maxValue = cnt;
            }
            cnt++;
        });

        if (maxValue) {
            if (item.level >= 12) {
                let tempArr = subRolls.splice(maxValue, 1);
                let otherRV = tempArr.reduce((sum, val) => sum + val, 0) - 3;
                console.log(otherRV);

                let max = false;
                if (item.level == 15)
                    max = true;
    
                if (subRolls[maxValue] == 4) {
                    subRolls[maxValue] = 4;
                    if (max)
                        subRolls[maxValue] = 5;
                } else if (subRolls[maxValue] > 4 && subRolls[maxValue] <= 5)
                    subRolls[maxValue] = 5;
                else if (subRolls[maxValue] > 5)
                    subRolls[maxValue] = 6;
            }
        }
        // console.log(subRolls);

        const borderDiv = document.createElement('div');                                        // border
        borderDiv.classList.add('v-border');                                                    // ▲

        const columnDiv1 = document.createElement('div');                                           // border.div1
        columnDiv1.classList.add('col-div-upper', 'glow');                                          // ▲

        const columnDiv1_1 = document.createElement('div');                                             // border.div1.div1
        columnDiv1_1.classList.add('col-div-specifics', 'glow-edge');                                   // ▲
        columnDiv1_1.innerHTML = '✦✦✦✦✦';                                                                 // text

        const relicImage = document.createElement('img');                                                   // border.div1.div1.img
        relicImage.classList.add('img-relic');                                                              // ▲
        relicImage.src = `${setImagesData[item.set]}${slotData[item.slot]}.png`;
        relicImage.alt = `${item.set}, ${item.slot}`;
        columnDiv1_1.appendChild(relicImage);                                                               // +border.div1.div1.img
        columnDiv1.appendChild(columnDiv1_1);                                                           // +border.div1.div1

        const columnDiv1_2 = document.createElement('div');                                             // border.div1.div2
        columnDiv1_2.classList.add('v-border-text');                                                    // ▲
        columnDiv1_2.innerHTML = `+${item.level}`;                                                      // text
        borderDiv.classList.add(`${item.level}`);

        if (slotOptions.indexOf(item.slot) > 1) {
            const svgElement1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');              // border.div1.div2.svg
            svgElement1.classList.add('svg-light');                                                         // ▲
            svgElement1.setAttribute('width', '18');
            svgElement1.setAttribute('height', '18');

            const useElement1 = document.createElementNS('http://www.w3.org/2000/svg', 'use');                  // border.div1.div2.use
            useElement1.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${mainstatToSVG[item.mainstat]}`); // ▲

            svgElement1.appendChild(useElement1);                                                               // +border.div1.div2.use
            columnDiv1_2.appendChild(svgElement1);                                                          // +border.div1.div2.svg
        }
        columnDiv1.appendChild(columnDiv1_2);                                                           // +border.div1.div2
        borderDiv.appendChild(columnDiv1);                                                          // +border.div1



        const columnDiv2 = document.createElement('div');                                           // border.div2
        columnDiv2.classList.add('col-div-lower', 'data-point-substat');                            // ▲

        cnt = 0;
        item.substats.forEach(substat => {
            const columnDiv2_1 = document.createElement('div');                                         // border.div2.div
            // const substatName = substatToName[substat.key] || substat.key;

            const svgElement2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');              // border.div2.div.svg
            svgElement2.classList.add('svg-light');                                                         // ▲
            svgElement2.setAttribute('width', '18');
            svgElement2.setAttribute('height', '18');

            const useElement2 = document.createElementNS('http://www.w3.org/2000/svg', 'use');                  // border.div2.div.use
            useElement2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${substatToSVG[substat.key]}`);    // ▲

            svgElement2.appendChild(useElement2);                                                               // +border.div2.div.use
            columnDiv2_1.appendChild(svgElement2);                                                          // +border.div2.div.svg
            /*
            if (substat.key.includes('_')) {
                columnDiv2_1.innerHTML = `${substat.value}%`;
            } else {
                columnDiv2_1.innerHTML = `${substat.value}`;
            }
            */
            columnDiv2_1.innerHTML += '•'.repeat(subRolls[cnt]);                                            // text
            columnDiv2.appendChild(columnDiv2_1);                                                       // +border.div2.div
            cnt++;
        });
        borderDiv.appendChild(columnDiv2);                                                          // +border.div2
        dataGrid.appendChild(borderDiv);                                                        // +border

        dataPointsCount++;
    });

    // Update the count in the UI
    dataPointsCountElement.textContent = dataPointsCount;



//     const values = getAllInnerValues();
//     console.log(values);
}

// Responsible for dynamically updating the JSON display with the filters given
function updateFilterButtons(data) {
    selectedSets = Array.from(setButtons.querySelectorAll('button.active')).map(button => button.value);
    selectedSlots = Array.from(slotButtons.querySelectorAll('button.active')).map(button => button.value);
    selectedMainstats = Array.from(mainstatButtons.querySelectorAll('button.active')).map(button => button.value);
    selectedSubstats = Array.from(substatButtons.querySelectorAll('button.active')).map(button => button.value);

    const filteredData = filterData(data.relics, 0);
    updateDataGrid(filteredData); // Update the data grid and count
    console.log(minLvl, maxLvl);
}

function createToggleButtons(containerId, options, onClickHandler, data) {
    const container = document.getElementById(containerId);

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = displayOptions[option]; // user-friendly
        button.value = option;
        
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
            if (leniency < 4) {
                leniency++;
                updateLeniencyValue(data);
                if (leniency == 4) {
                    const plus = document.getElementById('increase-leniency');
                    plus.classList.add('off');
                } else if (leniency == 1) {
                    const minus = document.getElementById('decrease-leniency');
                    minus.classList.remove('off');
                }
            } 
        });
    } else if (buttonId === 'decrease-leniency') {
        // Event listener for the "Decrease" button
        button.addEventListener('click', () => {
            if (leniency > 0) {
                leniency--;
                updateLeniencyValue(data);
                if (leniency == 3) {
                    const plus = document.getElementById('increase-leniency');
                    plus.classList.remove('off');
                } else if (leniency == 0) {
                    const minus = document.getElementById('decrease-leniency');
                    minus.classList.add('off');
                }
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
    createToggleButtons('set-buttons', setOptions, updateFilterButtons, data);
    createToggleButtons('slot-buttons', slotOptions, updateFilterButtons, data);
    createToggleButtons('main-stat-buttons', mainstatOptions, updateFilterButtons, data);
    createToggleButtons('sub-stat-buttons', substatOptions, updateFilterButtons, data);
    createButtonFunctionality('increase-leniency', data);
    createButtonFunctionality('decrease-leniency', data);
    createButtonFunctionality('toggle-strict', data);
}




// Scrollbar
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minValueElement = document.getElementById('minValue');
const maxValueElement = document.getElementById('maxValue');
const minValue = parseInt(minRange.value);
const maxValue = parseInt(maxRange.value);

function updateMin() {
    const minValue = parseInt(minRange.value);
    const maxValue = parseInt(maxRange.value);

    // Prevent min from exceeding max
    if (minValue > maxValue) {
        minRange.value = maxValue;
    }

    updateSliderBackground(minValue, maxValue, 15);
    updateSliderValue(minRange, minValueElement);
    minLvl = minRange.value;
    filterData(NaN, 1);
    console.log("hi");
}

function updateMax() {
    const minValue = parseInt(minRange.value);
    const maxValue = parseInt(maxRange.value);

    // Prevent max from being less than min
    if (maxValue < minValue) {
        maxRange.value = minValue;
    }

    updateSliderBackground(minValue, maxValue, 15);
    updateSliderValue(maxRange, maxValueElement);
    maxLvl = maxRange.value;
    filterData(NaN, 1);
    console.log("bye");
}

function updateSliderValue(slider, valueDisplay) {
    const value = slider.value;
    valueDisplay.textContent = `+${value}`;
}

function updateSliderBackground(minValue, maxValue, maxRangeValue) {
    // Calculate the percentage positions of the min and max values
    const minPercent = (minValue / maxRangeValue) * 94;
    const maxPercent = (maxValue / maxRangeValue) * 94;

    // Get the slider progress div
    const sliderProgress = document.querySelector('.slider .progress');

    // Update the left and right positions of the progress bar
    sliderProgress.style.left = `${3 + minPercent}%`;
    sliderProgress.style.right = `${97 - maxPercent}%`;
}

// Initialize slider values and positions when the page loads
updateSliderBackground(minValue, maxValue, 15);
updateSliderValue(minRange, minValueElement);
updateSliderValue(maxRange, maxValueElement);




// check for relic lvls to filter by
// function getAllInnerValues() {
//     const elements = document.querySelectorAll('.v-border .col-div-upper .v-border-text');
//     console.log(`Number of elements selected: ${elements.length}`);
    
//     const values = [];
//     elements.forEach((element) => {
//         const innerText = element.innerText.trim();
        
//         // Extracts only the digits
//         const value = innerText.replace(/\D/g, ''); // \D matches any non-digit characters
        
//         if (value) {
//             values.push(parseInt(value, 10));
//         }
//     });
    
//     return values;
// }





// List of piece identifiers
const slotOptions = [
    "Head",
    "Hands",
    "Body",
    "Feet",
    "Planar Sphere",
    "Link Rope"
];

// List of relic set identifiers
const setOptions = [
    "Band of Sizzling Thunder",
    "Champion of Streetwise Boxing",
    "Eagle of Twilight Line",
    "Firesmith of Lava-Forging",
    "Genius of Brilliant Stars",
    "Guard of Wuthering Snow",
    "Hunter of Glacial Forest",
    "Knight of Purity Palace",
    "Longevous Disciple",
    "Messenger Traversing Hackerspace",
    "Musketeer of Wild Wheat",
    "Passerby of Wandering Cloud",
    "Prisoner in Deep Confinement",
    "The Ashblazing Grand Duke",
    "Thief of Shooting Meteor",
    "Wastelander of Banditry Desert",

    "Belobog of the Architects",
    "Broken Keel",
    "Celestial Differentiator",
    "Firmament Frontline: Glamoth",
    "Fleet of the Ageless",
    "Inert Salsotto",
    "Pan-Cosmic Commercial Enterprise",
    "Penacony, Land of the Dreams",
    "Rutilant Arena",
    "Space Sealing Station",
    "Sprightly Vonwacq",
    "Talia: Kingdom of Banditry"
];

const setImagesData = {
    "Passerby of Wandering Cloud":      "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/101_",
    "Musketeer of Wild Wheat":          "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/102_",
    "Knight of Purity Palace":          "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/103_",
    "Hunter of Glacial Forest":         "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/104_",
    "Champion of Streetwise Boxing":    "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/105_",
    "Guard of Wuthering Snow":          "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/106_",
    "Firesmith of Lava-Forging":        "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/107_",
    "Genius of Brilliant Stars":        "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/108_",
    "Band of Sizzling Thunder":         "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/109_",
    "Eagle of Twilight Line":           "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/110_",
    "Thief of Shooting Meteor":         "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/111_",
    "Wastelander of Banditry Desert":   "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/112_",
    "Longevous Disciple":               "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/113_",
    "Messenger Traversing Hackerspace": "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/114_",
    "The Ashblazing Grand Duke":        "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/115_",
    "Prisoner in Deep Confinement":     "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/116_",

    "Space Sealing Station":            "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/301_",
    "Fleet of the Ageless":             "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/302_",
    "Pan-Cosmic Commercial Enterprise": "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/303_",
    "Belobog of the Architects":        "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/304_",
    "Celestial Differentiator":         "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/305_",
    "Inert Salsotto":                   "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/306_",
    "Talia: Kingdom of Banditry":       "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/307_",
    "Sprightly Vonwacq":                "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/308_",
    "Rutilant Arena":                   "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/309_",
    "Broken Keel":                      "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/310_",
    "Firmament Frontline: Glamoth":     "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/311_",
    "Penacony, Land of the Dreams":     "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/relic/312_",
};

const slotData = {
    "Head": "0",
    "Hands": "1",
    "Body": "2",
    "Feet": "3",
    "Planar Sphere": "0",
    "Link Rope": "1"
};

// Pairing stats to their display names
const displayOptions = {
    "Outgoing Healing Boost": "Heal",
    "Energy Regeneration Rate": "ERR",
    "Physical DMG Boost": "Physical",
    "Fire DMG Boost": "Fire",
    "Ice DMG Boost": "Ice",
    "Lightning DMG Boost": "Lightning",
    "Wind DMG Boost": "Wind",
    "Quantum DMG Boost": "Quantum",
    "Imaginary DMG Boost": "Imaginary",
    "HP": "HP",
    "ATK": "ATK",
    "DEF": "DEF",
    "CRIT Rate": "cRate",
    "CRIT DMG": "cDMG",
    "Break Effect": "Break",
    "Effect Hit Rate": "EHR",
    "Effect RES": "RES",
    "SPD": "SPD",

    "HP_": "HP%",
    "ATK_": "ATK%",
    "DEF_": "DEF%",
    "CRIT Rate_": "cRate",
    "CRIT DMG_": "cDMG",
    "Break Effect_": "Break",
    "Effect Hit Rate_": "EHR",
    "Effect RES_": "RES",

    "Band of Sizzling Thunder": "Sizzling",
    "Champion of Streetwise Boxing": "Boxing",
    "Eagle of Twilight Line": "Eagle",
    "Firesmith of Lava-Forging": "Firesmith",
    "Genius of Brilliant Stars": "Genius",
    "Guard of Wuthering Snow": "Guard",
    "Hunter of Glacial Forest": "Glacial",
    "Knight of Purity Palace": "Knight",
    "Longevous Disciple": "Longevous",
    "Messenger Traversing Hackerspace": "Messenger",
    "Musketeer of Wild Wheat": "Musketeer",
    "Passerby of Wandering Cloud": "Passerby",
    "Prisoner in Deep Confinement": "Prisoner",
    "The Ashblazing Grand Duke": "Ashblazing",
    "Thief of Shooting Meteor": "Thief",
    "Wastelander of Banditry Desert": "Wastelander",

    "Belobog of the Architects": "Belobog",
    "Broken Keel": "Keel",
    "Celestial Differentiator": "Celestial",
    "Firmament Frontline: Glamoth": "Glamoth",
    "Fleet of the Ageless": "Fleet",
    "Inert Salsotto": "Salsotto",
    "Pan-Cosmic Commercial Enterprise": "Pan Cosmic",
    "Penacony, Land of the Dreams": "Penacony",
    "Rutilant Arena": "Rutilant",
    "Space Sealing Station": "SSS",
    "Sprightly Vonwacq": "Vonwacq",
    "Talia: Kingdom of Banditry": "Talia",

    "Head": "Head",
    "Hands": "Gloves",
    "Body": "Body",
    "Feet": "Boots",
    "Planar Sphere": "Orb",
    "Link Rope": "Rope"
};

// List of main stat identifiers
const mainstatOptions = [
    "HP",
    "ATK",
    "DEF",
    "SPD",
    "CRIT Rate",
    "CRIT DMG",
    "Break Effect",
    "Outgoing Healing Boost",
    "Energy Regeneration Rate",
    "Effect Hit Rate",
    "Physical DMG Boost",
    "Fire DMG Boost",
    "Ice DMG Boost",
    "Lightning DMG Boost",
    "Wind DMG Boost",
    "Quantum DMG Boost",
    "Imaginary DMG Boost"
];

// List of sub stat identifiers
const substatOptions = [
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

const substatData = {
    "HP": 42.33751,
    "HP_": 4.32,
    "ATK": 21.168754,
    "ATK_": 4.32,
    "DEF": 21.168754,
    "DEF_": 5.4,
    "SPD": 2.6,
    "CRIT Rate_": 3.24,
    "CRIT DMG_": 6.48,
    "Break Effect_": 6.48,
    "Effect Hit Rate_": 4.32,
    "Effect RES_": 4.32
};

// Pairing stats to their icon counterparts (statToImage)  ----- OLD
const mainstatToName = {
    "HP": "HP",
    "ATK": "ATK",
    "DEF": "DEF",
    "CRIT Rate": "cRate",
    "CRIT DMG": "cDMG",
    "Break Effect": "Break",
    "Effect Hit Rate": "EHR",
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

// Pairing stats to their icon counterparts (statToImage) ----- OLD
const substatToName = {
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
    "Effect RES_": "RES"
};

const mainstatToSVG = {
    "HP": "HP",
    "ATK": "ATK",
    "DEF": "DEF",
    "CRIT Rate": "CR",
    "CRIT DMG": "CD",
    "Break Effect": "BE",
    "Effect Hit Rate": "EHR",
    "Outgoing Healing Boost": "HB",
    "Energy Regeneration Rate": "ERR",
    "Physical DMG Boost": "Phys",
    "Fire DMG Boost": "Fire",
    "Ice DMG Boost": "Ice",
    "Lightning DMG Boost": "Lng",
    "Wind DMG Boost": "Wind",
    "Quantum DMG Boost": "Qnt",
    "Imaginary DMG Boost": "Img"
};

const substatToSVG = {
    "HP": "fHP",
    "HP_": "HP",
    "ATK": "fATK",
    "ATK_": "ATK",
    "DEF": "fDEF",
    "DEF_": "DEF",
    "SPD": "SPD",
    "CRIT Rate_": "CR",
    "CRIT DMG_": "CD",
    "Break Effect_": "BE",
    "Effect Hit Rate_": "EHR",
    "Effect RES_": "RES"
};

// Icon images
const statToImage = {
    "HP": "data:image/webp;base64,UklGRkIBAABXRUJQVlA4TDYBAAAvE8AEEJXAzbbtePYukjVcZgQnC6TSGkll284CttpUTirb9m/05nv8xxEBx7a1Y8/6/kojsDEDYwC2bXb+W9tDMPo/SeU6lW2Wdt4JeHk2AYzNiFoCRiYdQN90st/wz2F+X2fXzJ/2YPUxufYapeLxxep9Dz7tegBdhSNNLtfvngxBpcqmJpnZN0VrT69e5nd46lWx0B5kezzZ9HL9VljNLVbPi0e9PVw5gFD0qloTSp3lOYT7v/0vhPU1ZQAWu1eFfVugjdaWD+DKzrYptgW+4FUI9PCgus5PbL8v9v+WYn5ldo3EX/Ui5vd2ipuKQu/4AOD42lzPrw8PuSIAXfPCoBX7nVN9tbLV2nG0u2fVGZPxclMATyWnD96uqz25T6YA6uXmANLKRpfTe60SvtxazzJxXp5G",
    "ATK": "data:image/webp;base64,UklGRhgBAABXRUJQVlA4TAsBAAAvE8AEEJVArrbtePQWEicNpAE14ezShVFEKrCdVU5Wto2xbXsmLmCsdxMBVwAAUlE2Jtuc8B3Nza7RNifbNdcH1Nm+24zJ9uY3Aa8zEhBApJC5LAlfSgLwYHplb7S0vH1weHX1tTYE2EAAKZfugKerE0ANJFGcPD+zPgvoQQBcLd4Bz24sAnYQnuTw4rntDcAP8JPN4Pnb6TMiXn23ioB4waVO65iik9v9c2v27A1vgd19gxZwry+W/TdAqBJJM1T9KTx5CLvJVAANqFOt7X36ggbjxWe1wZcAaGACI9rdOMLyWK0BxOvgORsu7Cxu4NyAih1CJlufqcRY4l49ZeVihnjl4IiIVwC/zkoA",
    "DEF": "data:image/webp;base64,UklGRlABAABXRUJQVlA4TEQBAAAvE8AEEJVArrbtePR2lBKclJB1UkhW2Tkt2HbGtrGy7ZnYyYdRAeaPEwFHAgCCTewHZLM52ZxymfQA+xc2a7v9gN1Otm3b7gS8voQAVDLWMhsFFRtAFALsTCh/fXt1c1F8mIuocSQA1IjOZ4tv413xinBxtPPvcsmiJHCa3o9X3ZnTtcY/c7HtyfLFe4cVgKiYofi0PjHYUv1o/DMMU/1kV/tLL0EjatyXf7bGa18MsvHXVZt7HAqiZKT7s76m8iuq8srmLhRkFEA3OrYmD+ZQu1OL3SeDgES99ttur7pqUT31txdZJwCwUvzNXrbu7qwjdznWdbMjJOAAspI/20lW5W8YpvTIn2ztNAEI96rl5Y7Pd3saxrt+eur/cicGPgBIdZLjkerP1fHFfvX3eFQvAyDRK2CM2o269XqDngMANcO8Pn0=",
    "SPD": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+cIEwIeFpZYbMoAAAFySURBVCjPY2CgPWBmYGdgYWD4jybMgswxZTjNfipU1O77u5tHtY8yvMdQDQMnGQwFL055cf3b+18f787JVGJgRMgxoqhkXO2knvSV5e17WRlN56erY0qOvGLENE+NgYHn/sL///////n55OrDS39+PpiB6jQo+M9QoPXx5v/////////39575zy69P54oeRXTM9yCu4O5FSBsJhYju2u7Jd4z/VREN89C9GrPry//oeDPj4dLKrQYONH8oMHAwHG68s9PmLIfHw5WmIsxMPpjum6C6Zf7/+Hg44MyNwZeBkYpDH8wXij5h1D3/9/fT3fvL1royMCGHuKM6xzfnf73//fPP78Qyr/cXevNwIyIWQYGhmyGksfsR6W/3tt9Y5uYIrswRIpNUFjs+s5zX9oxHMDGwM7ANtnu1WGYmd9fLbGEWY4Ujiq/pBgOMeQe+ZbtF8HI9+/3r88/n71+jC+hMTKwMLAzsDGwMDAyMDxhoBUAAL6FwZEzt10nAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA4LTE5VDAyOjMwOjE3KzAwOjAwliv+8AAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wOC0xOVQwMjozMDoxNyswMDowMOd2RkwAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDgtMTlUMDI6MzA6MjIrMDA6MDBs1E/XAAAAAElFTkSuQmCC",
    "cRate": "data:image/webp;base64,UklGRuwBAABXRUJQVlA4TOABAAAvEwAFEPVI8f9//ZPPPPp2g625u7VFt7QTeNuqS3J3d3d3d3d3wd3hLw9u8LkBifSvZCrpyw6Ak3h8wvcIHABKBNwAAAg2sW0ntW3b9gPp1Mm2bdscbXeybdvmBKC4AETRAQwwIGqJ+GqVmhnjROGOjGKPjpCJwq2em3tPPh49+6uIIukPePb/4v/Npz9x9qIA7WDixb/AD5VCLoyHWjz5EkRdYRJhAB1IJoF3Lm5fLWSLoMw9WxDUnK6tV+UAECE82fmvgHtXDibTSelugBQCiIkCorsXz76IBgud7L48fCwSApojSgDENEVvbNPRYlMp0ZN3F4f5JqLHH5U+gEH0ZiyGaojmej3/Pxi3czpZIlpqt7a+f0NE90+j5RCj9Z9+H8+kRw/nKkoWeV9fb/c46E9XE9HN/RR3QCFGqN09prvXuQEgcjz4uS0CaN7y96+ItiY9df8AEBHgPiZbU/Tse7KtJCXG8TcH0loD0frIR4aI/2Kt18ZmOv7TwXSQ1W9kCmI7U0QrOZ8Q0ZR2NUO3TpqLbx/T7a1YGWRa0udr9K3S7Q1pTJfvw5erBQPZYIOlrGRLJQwH1Eb1u554c1EAc0Tk7zOMc7UBwhhD7LLYqgjRAwRHoRzfZHUCNxzDtwg=",
    "cDMG": "data:image/webp;base64,UklGRuYBAABXRUJQVlA4TNoBAAAvE8AEELVI2bb9/LvnBQzJ7Ex2MuOSbdu2zbpk27ZtW3/ji3l7CU9a/bbPagQc2rZNO9+2/WPb6Gy1dtJbpW3bdsXKZmfbdnImABGQ+IXvBpShuNNHmgtYbYE4nXubg+LROAsj2R7u37fPJpI03xai+ePw98PM8LdzFraHzCRvA5y9/dTQnyfmb7TbwgNob5MXzFTTf7/uKqPzQqiv5WZPY0C/JcGK/vl21l1fHgqqFyssfDvqiOcRca9ZSa9H3GymUqi/wXLHSOqTBRrO5mOcgfyKMEaa8qmidbNLjteOVwkh/78X6/31P19ARMBN5LJA6B/yfLcHKK+ht9WPG/Ly+iAwEZCvAGm775XFVhB46jrpmNIRzQkV2unW5Y5RxsFu1PdL8zWgerN5uZiughhOW0263aLhYh50TyZfWqwC1aN5R3fAIQISMKmh/3+Y/7IoV5/fD9Qn/UsIWajQcfj7vtYJDEAgoARkp3OE0D+zQynJ5sEBYUVxVfnTgz3129PU3/1+hjEgkJ+x2c4Ax9H/hNzsTtaOlI+07y9w68MaFgrKmjRAoj1nMKw+oimsLbDIe6D49/1IWpBVd+B0/tUGDTsF+BxQ+DxD1VsH8IBEQEvxHfWy1b6efSg=",
    "Break": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAI9UExURQAAAP////r5+rW0tUpZSgIAAgAAAAAAAAAAADc3N6urqzc3NwAAACYnJrCwsObm5vr6+ubm5ra2thkYGQAAAI2Mjd/g3/v6+/b29tTU1Pf29+no6VdYV5OVkwAAABQUFL68vvTz9Pr6+tTU1KWkpcnIycnIyayrrJuZm6WmpfDx8L++vwAAADk6Oc/Qz/v6++7u7q6vrsbIxvT09Orr6j0/PZeXl+7u7tDQ0ENEQ9bW1vz8/OLj4peZl93f3f39/fT09NDQ0CsrK83PzaqqquPj40pKSqanpvr6+ufm56alptzd3M7PzrCvsLOzs87OzpOSkwAAADg5OOvr6/Ty9KimqPv7+7Ozs3Nyc/Pz89nZ2cfHx/z8/Orq6sTExHZ1dgAAAAAAAKqqquzs7MXFxdvb2/T09HRzdAAAANvc2/Ly8q2urenp6VtcWwAAADExMYmKiXh5eGNkY97c3tvZ26+vr/n4+bq4uuno6fr6+qKionFxceDe4Pn5+d/f36qoqtPT04+Oj15fXu/v797e3sTFxPT09FlZWczMzMXGxd/e3/Hy8WZoZgAAANPU0/b29qqqqvf39+Tk5EpKSu7u7pqcmvf498fGx9fZ18PDw5ucm/z9/Pf39y4vLubn5vPz86eop97g3vj5+Jqamtvb2/38/S4uLrSztPn5+fLz8r6/vqaopmprasbFxrCvsL6/vgoJCrq6uvDy8P39/fDv8NPT09LS0u/v73l6ec/Nz/Hw8fz8/GNjY7Kysv///4o/TJUAAAC+dFJOUwAAAAAAAAECBh1RHgQaX7v1vVgMDEOt9e228LYpLAsXcuH2t4upqolRVtNyAx6Q99+VqejIKFDdkBqZ/MuEx/zkfiOMj8sbSfPRjMOwko+PRhAbvumN9VAw3b2q99aZQgoIVsyhwN0xEaLokr4jBRtLT0q5mWD1nNXyTjOo77l6qD8q1Meo4kOQqsjVJg2U75Dvv0fTTvCqv5Ry+fAcveiOxu9ytfocXvDnoYdUmpSgEWra/eGsreA1h9T6KlqMnoVOAAAAAWJLR0QB/wIt3gAAAAd0SU1FB+cIEwIdAEmhilgAAAFRSURBVBjTY2CAAjZ2djYGVMDGwcnFxc2BIszDy8cvICAoJMwIE2FkFxEVE5eQlJSSlpGVY2eEiMkrKCopq6iqqWtoamnLg0SZdHT19A0MjYz37TMxNTPXt9DVYWZgs7SytrG1s9+3z8HRydnF1drKjY2Bzd3D08vbx9fPPyAwKDgk1DMsHCgYERkVvS8mNi4+gSExKTklNS0d6LCMzKxspX379uXk5uUXFBYVlwQCbc8rLSuvAApWVlXX1NbVNzTygDzT1NzSChRsa+/Yt6+zq7sH7Pjevv4JE/ftmzR5yr6JE/r7ellAgjpTp02fsW/fzFmz982YPmeqDiQw5s6bv2DhosVLli5cMH/eMmigcCxfsXLV6jVr161fuWI5ByzcNmzctHnL1m3bN2/auAEeemwJO3bu2r17184dCUghysousmfv3j0i7KxoYa+jA1cFAOBFa325LHALAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA4LTE5VDAyOjI4OjU1KzAwOjAwV6d+FwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wOC0xOVQwMjoyODo1NSswMDowMCb6xqsAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDgtMTlUMDI6Mjk6MDArMDA6MDCE9a2JAAAAAElFTkSuQmCC",
    "EHR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+cIEwIbO67wxPoAAAGFSURBVCjPY2CgMdjM8J/hP0MBFhkWBPM/AyPzVJFzwj//rn3J8JHhP27juHdFv9r35f7n24+Wz7ZGNgLN7D1xP97+h4L35yeaMDCEY6p6wRAu/ebIfyRwo5+BW4KTgRGmgglCiTPYS3GrIGsV0K80P9bWaQBTwQST+PH7/29khV//u4cqFCRNnWXNwGKJEJ7DYCj8dD3C4r9/Dix+e+f/////X++pl0INAKaFDh8uQpT9+3Nz09HF//79///xxq5oDc49DAwMzPBQ/G/wRurN/w9Mb9/dOLN9wTpPWwG1b28XlkWuff1TGaHwOQMv+7YAn+ofH6cvePXIxsvBcudeZWUeKaHXJ/b//LUdyWLWTaFfH///////l6c/3v3///f3xgmvrv54fa0pgu8EcuS1q326ghyKj44fXfRkwyJ3Bm5YSEIjiuvf9wcMbND4Zfz3+fx89uc5pze8jPi/AmoYLOSZQ4XlBf4xQoT+/Vz16un3//8ZGbCAgwz/kWAyAzvRSZNcAABkWtd0pNYtjgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wOC0xOVQwMjoyNzo1MiswMDowMGMLGxQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDgtMTlUMDI6Mjc6NTIrMDA6MDASVqOoAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTA4LTE5VDAyOjI3OjU5KzAwOjAwR0TWjQAAAABJRU5ErkJggg==",
    "RES": "data:image/webp;base64,UklGRoYBAABXRUJQVlA4THkBAAAvE8AEENVAzbZt2fL80v/ouEQaQ0AkcrCAQ2UATe5Ocpfm7u7u7u76vPw2wd3o7PEetC9HQMG27djz27Zta7aZ7C0Zjcm2vWUzWcmMttuONb8TAOcnLOEIagsRyqLWBg9XjtY2RusSPCnW/MdadpdfwM3r+T6uH1/B0XaKlxVJTlf3d68teb5yncyi0krrMq9v7t5TA3+wcE9PD7f95ETvKT07vjpbGAxWuIl2lm4eAmSiufrT00Ax4Xem38EHkPL0KFThyz7cnu8jGNOzjvYao5AV9Poj+VQ5Mr2v7oKkrDFyfZowmCyTwrkhEGJtrDWR9WRMFALN6W9AMN8FdGf3F7GupN4kwJ9/fc4eP4sCgDi3gQKWLGl1BxDpvb7z+vX+d3pVlEEIoFSfr2UxiEIiQPjJlo2dqraCysWN9YUQMVCDj4MzAL8jDX/y8ePmRcqdRXcurGwMf/uT4sVaa4otW7M7WzsbiqLsbO6td8daA0IRUUhYglrljAA=",
    "Heal": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+cIEwIZKW9/1zAAAAHgSURBVCjPdVM9b9NQFD33vefICU75ku0G0gGHViKRkBgRHwti5AdU4jdUXZFgZIYFqRP8AJZO/AAYqNROXdwGCkmKpSqhqVQ3aWLH7zLEtZyonDe9e+6V7jnvPCDDMkAQkOkRFiGH/IXc0uuG6UwIKOhu+1UTES4Frd872Y4GURiF8SD4XLPzpMo3GmXDNUopUbGKIPAFKfJTCXFGMOtcGyA8gEAQEBDnBACcsAaYTtMqiMBQv8gprS4ZCwmdk7MMBexs3nBqT9h81rBcCUP3+p8CY6xAbxovPxguMwBVcpj95kpcg11/v0EaIBo2b6299RXIdKy6Kl1sBm1FZgwos1xNZVl2BfsKmBDr6W47m/6P8vj7t/buQedMPXp49ykAsI7FnD033ZXYjFu7S7bnjcm6PudjQZMAABLeYw/AQcfzHqzm5kVhAlbgbrv7RVaYGSjadWWeyREBo5PjpowBQUN/rwWmMoXGnasLxYRO6Xnj3Ua5+vOrdW3xfrD1Yn10JCH14aAfVmMVMqLfPRAYwnJJA1MJcjI+8jtTK27jTyaGAUDOxEpm9WD+rVUqCwCIpP5fevhvf7ivrrAGSAz3Dgf5UMw0fgwW15xKTEAh8VvHoY3e5clVlH0GAarOcP8AeLOw65FdmdkAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDgtMTlUMDI6MjU6MjcrMDA6MDA/A+2XAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTA4LTE5VDAyOjI1OjI3KzAwOjAwTl5VKwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wOC0xOVQwMjoyNTo0MSswMDowMLz0SEkAAAAASUVORK5CYII=",
    "ERR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+cIEwIYCDoN9i8AAADvSURBVCjPtdKxSoJRGMbx3xdKgza0FSXdgNDWEtEUdAeODdUlSIu3UDfQ1EUIXUFDgSAEETQZhJNBpRUSb4Nofp8f1tJzpvM+f/7Dew5/TDJ9iTllIdMVVS3h1a1hrjpGpxqdGMQgOlEdTfKMy/ZtWVHEqkPXLj3nGWsxjFHe4jEihlH7MS5MsaWJ/8IDCkpywXGazq1lh7PgvbqS9d/Anro77668zAf7NlS0HLhJF9mFV5x60tOwOx+kpe3McfpxZ8EvTSeOslgaTNC1Y2+CJflgV0/Ztk+BxEA3bQHBok1l49+W6Gv7SHLA3CT+K98cIU5yLSPWHgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wOC0xOVQwMjoyMzo0MiswMDowMKZKu/AAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDgtMTlUMDI6MjM6NDIrMDA6MDDXFwNMAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTA4LTE5VDAyOjI0OjA4KzAwOjAwQuRoXgAAAABJRU5ErkJggg==",
    "Physical": "data:image/webp;base64,UklGRv4BAABXRUJQVlA4TPIBAAAvE0AEENXAsW3t2PPE6VM5w3GnEbC2bdu2bduobNv8/f8NM4MnbdLaqPOtt47WioACAIAh6Wz78tu2bdu2bdv+T/YnM9lGtm1rJgDPFRBVFtVW/0KF8fR4KNIBCvAcJ/oD4zHf5Z/IUzpc4gX41ZnR33rKzfW7cjZ2T29Orzd3WzPsDFtyGV/NtvwAVRJO/2C8s76TkixVXFQsXWlPjI+LqjhA8wNYrN3pAw9wQVkaYC7zI1nfFO051eWVH+CGatiA88sD7M+qaHcj5gtFfzq+Gai8R0SiTABurt/ySllGQRTtlgdYn0Xlvb2Mu8KwAJ+lpYKAFyUCAch04uE56+vJWwuQCW70Z4r9lVNspgWoMJ2Tm6vryXjEPtuJ5o1N9n9LGjALAzJLD08ozl9n0perPO15c3u8udcGCSFGopszs7PFhezvo7OU7IN9argt2qk0Ot7LT5wQgoioK1heyfqkTg5DNbw1h6pcQo8v2H9lYYBG/gYCtDtqd0/PADD/7ubfQ31F1Z/NMYDmV6W8PTfSGBq+sx5jb6O0Pdnd2dQ81JdXvrdWp8JPH6NOAkSCyskF62dlQkayreHs8fhqdFhBzJDIDxEBFm6wNxPiOFzHeCkOdTQ/PVsZ1mALgQAHQgLPWnmDI6BeM7RWKltlhBESoIg=",
    "Fire": "data:image/webp;base64,UklGRhICAABXRUJQVlA4TAYCAAAvE0AFENXI0bbt2KMnKFOntm3bWEEqG5WtynY6daps27Ztj/nrmB18K/lSD+5RqeOIgAIAgCHpbPsZbdu2bUXb32zbtv0fbSbbtkeB2zZKOjjGXzCfJELIU2pF3DCCIChhAlT3RxcT/gtywla5P97cHukIEUxQb4XL88d3YHWYGD8EIMp9ugDcnQ/mh6p/ZvnBFtu9/gWAh5uGcGLxMyJv9uL11/Lkqw/gLVhuEedleeawMfov3t78jTZYmqX4350DmC0lAs+cHv3j0c22TFsVxZPpEF1H5Z0p4MVLqgFBubIEJklUT4CYYiLD5dioIqyG/M0FsFhAcA5pvK2eFd51AQNZZ1vAcjHhc91ffr79u73aKubCT/TZ41vwBOBgRVYj0+P+DNPt8pqFslwDiXM0D7z9v7/srI0IGe94/Y2hek3TtRZXaUJyIPRkAdBfQ5LVIa//gIk2I5ujFZwtO0txjKAJ6o+3WOj6PpyMp+E6C5ur3bvz3KTbs+udSFVO958Cm9vDd6AmPN/31Xdvmo3K5drFblLUSFtcxO/rtVIhTiK0v8Jy6eFQuedMDFEiucLVnR02Z96B7Tlz6wiNVDb3CxIymL9LluDsN3e5i+3Hm/rUx+vTNR85Pt/3g2FcuK/mnj8WOhCp2PHVx8WsNy/DT5lcjabJMn9YwmYpNpsWcfH/ZIZHDA==",
    "Ice": "data:image/webp;base64,UklGRkwCAABXRUJQVlA4TEACAAAvE0AFEIVc27aOPduxbVYZKXUHSWcntW3bKW3b5m/bqGz7s3mCj3cQIdm2bdOujk9s27adlGzbtlFMybbt5Ats27b1bC5Fbts2zLp1/gKIXgFyRDaMA5hWQB1FGMvXEkFoBepCBgFj11USqBbAvGUZewRKuJgNWp0RaUCCAAEMzI/LCAgIOOfJasCBgwBhR1lix2ZkPzdfz+n1jtJxlP+zcEL2q9vNQbbcaiPhRd3zMGDHwP1tlED+T/brcVWUFf/u2JNGP2POqfyPEiTfeixPgCg1F74nIPi3CdnZOAX8WITcTqoSCAhed4EVKBAgQMH2pvuY7PdCoqcF9+laja/hrxUCAtGHWnNgKiu2qL+tfVDwrPbb3KsRAu793Z5vw7dyX9U9Sgaz6jOBCQIQhmxWIOOSgOBaq7k2uEGBEbgK4OtOjNUfU3/X/mzsFCv//1g9LBbdb7uC/apmG4PKBM/3EQIC8ad0OwcD7uP1Gkifj+2M/DRUbgFa5TXH/OV/j/2YgeyTagLeRbBqkQ33moB9Um4C8kSAIHNLCdLvvJuz2R2hsp8EzwcLAiQf/h9Xp/Ae2CexWifZJfQwbNI5VcdfHKJ/FwneTMT5ck7/H3VkPxhoSOfcstYmFIAAUfkE0MtRCpD9fFgfZpYSyLwk+LUb5Vqh18aj/h8Q/D2rhLuFKVbcK+71fqHo3a/FUGWQQNQCxJ7jjfQQPfaR+F2bDdhHvaTf/8/liGj4X5Cg+iXO27dpggYGxh79C/YjgkB0CiA=",
    "Lightning": "data:image/webp;base64,UklGRkgCAABXRUJQVlA4TDsCAAAvE0AFEPXI0bbt2KMn7tw7dY50aa3advKls207lW3btp2xbcW2dvDsYKqp0s4epvqObxvJW7z1rCFVBBwAAAg0abZt27Zt27ZtXrZt27Zt27YnAK8UgF2EUSiXALCPA2IoLgYgL87XjfKEAHaH0HNRBLj72S/bAB2gR8QZVHoO6o5YRSlNv3Y1nQUIdN6/UYU9B0AqBasNqrwO/udrAO96wvdlB+Cy9DQKOO/a0x3ejuz/c5NxgFKkv/P9qLXVK0aWoZCERqTs7xLHnY9Y3VKTrgSy+9tgyQjsvBOy9/+xDRARRRFjJR6UrF4+r5MhBChe6rdzZNgbUAtV6rwnqv52uAMYAOhMsbLLZUcAe4myBBojvPn0dVWCXAM9XwpICv03X2y5KCLAdAWQ90tPBm99VGZTyWTh/0DOrdsav5Wj92OAjYiUj+j9NCHkfldBLNl6LnapsZ1IlRcZSpgPu0NEvBsI4N4trd1wwc7328n2a6aDq963NU99wAPwCVrK12MFlA1B5NWYjuH67XQlY/LraP9v4zZDF2AAeAJA4sA/Cgy/zvZ/Hw+N5jKma5cfls2tX01tPZXq/8NThwS6or5skZVza5MXzU/7Ivzezvp4LLV8HihiOIUqYj0v5wh5NybApqf5bY9buXQyFSI3Qj4FWUH8++XktivSRm7l8MeGh8nX5fWbNOWb05AF/Je13d5KzD8Wfu3a8wKCMvO3hdW9QuYz8NoATRjBET2JRZccoOmNEUkMaxjmWRcEAA==",
    "Wind": "data:image/webp;base64,UklGRkoCAABXRUJQVlA4TD4CAAAvE8AEEPVI1fb//J/3H8m2/0dg225M/+Zm2zZmq9m2t2bbf9vWGbzSVp1+aXnN6XftPN7zgey6IuAAAECgya7Zumzbtm3btm1ftm3bti/b5gRg7kXBi8ns4VMRWIJIl1YUT0BAADhnWcclmOQ3wWtUHgy17d5s8BBNUTgRts3Jmo5gR1yvFRJmkm+VWt3XI//M7ed9Lzz8/2zBn2+JacexBSuBABDQk7l5l3n4b/D7HzPzybQs44HvBmMBgG+HYrj/9XL7Qs8w3TyLI1nPtpk/1rt93xXxjgCAGnXTZv97liPx5ltuCq22leGVFHqwMPAeoH6ogLcklHMDKBDtuU92KfdoPWDm7ouV9utNN1o7inecvSwKOuFKQGCv5tmyQq+B15H/m+M78u8t89poIjPhuNX7/tbs9qLzSQQC9gll6DXt86NVbVZFhqc73H1zqqp571qPmUKjV9vZiRAhkI2JExn44MMFhJMlv9Y6+MN8ps7P4FpjlPHtro2qAKBL3bTO7Sd7Mw8ll9tGax2OXR/koPOfn+0aShHebwAEy5R8MNR7/3Bz8Pf2iDgzYYJFWo46zqojn7ceJIoRGAABBTpENvTGEl1XfLXFU7BtpekoO/BkXbp/+2nr6nwmTE6UDyb5786UEDkf/RvTI/+3Zh20EyWKyab4ts6o53bo90iCm1jT1ov1Sd1XT1bD+AgyBQEJFSe0Rs+A5dn813qDD42GA+9NM6HUU+C38Hch5XbVHB5CCAlZIbhDtYFiqhkC",
    "Quantum": "data:image/webp;base64,UklGRjwCAABXRUJQVlA4TDACAAAvE4AFENXI0bbt2KMnZdKptp10tm1Utu0sQb3T2bbtsRnb/u0lRN1MVjDH8a1gnnH7HRMBBQAAgs1s27Zu22az1fa0R9tIS3ey1ew/2bbtX4HbNkqOGfKLa64AwGsBwk8zTAEHIALQFrRsBAR/APqsbm0Y8HwBELA2FtbGgMIPAP9uz6X/L08E2HebEjxrgMlyf9RI+cHl2ZiItZEcX2EKyQUpx5uqu3hF+h+uLttHUT4ov2+7PSwABkCOPSSFHwcRcW1laXFnwyz88glxfzvVCaBsADVfhXjxPG8UsXk1cHggbFaTfnSKuDYtxmUVP5XEBzuIzVmAA8LngeNzZQUgowJP75H6VxH1wGqbml284NVXogcB+KWh0xtt5QNQl0YRJ/IAen1NGOrO7/FLmhcBuP9/tFQEYBbzX43idBF74OvGLOJQ5b/7D90nVxpKQgImLdBxf9wyEEGwf7NTT/nBy7eJaiWzV+0nl6oKEoizxbtrXgFAZgPAfyMFtH/E+uKZ1uMzWeXvwULqH+Xr6CTFBWAcH3NTkbg2j82Vo/Vnt6KOY2U40hKcfnR+dJjr853Dzzchbp9hoGCw9vypvOB4f6atuPD5SKJ+Z2OjP5TFpSMKG62cKDt/cfICk1zD5RsuLal6akutMDxUP81a6gJeQwbl++1wYebl29qsrykvz71mfsLWuLPrjXE3DRBq0y4e1/udaNc8AhnN99EqMcifgDSWBqt0sT95OiZ+cq67Bg==",
    "Imaginary": "data:image/webp;base64,UklGRhQCAABXRUJQVlA4TAcCAAAvE8AEEAVc27aNPTsoM9La1gO4stE5qdLatm3btm3btm39RvAGEVAAADAkzeKs+h9tJNu2/R9t27Zto9k2m22bx1Xgto3iY4ZnAPwrAI2Xi5IA8jsT4afj220uvt8ACpWdrieyCcyRUn/xH0nBPgjAUhoZowYSNhIE4I5IwcwAz1qkablYEdhU30xzvSK9aRNAzAlIrvbtTmrk1S7V0VpezM1miipQwIwrpBjzcQGOHl4H0+2VVPUFB9P2Hgmes5Gg0KtA43WXmrYXiNyDxXg/U8uPj+c7BaOsiLMdImdtYr7GRwkoVY762yMZowUCsy5ho3++uSuHyKXf4PkySYGqQmtj6OmW5unKzTkvJCfI3+vz6+5wpJnEfbzeGChVBQAExF3pbv/96W5/Zbg63dv16+vl3sNmMNrNUc+io/h621YOCG1YnmQjoCYE0ayo+xNrm8+P+xNzZSnx2RoyVhzPKcxPYNq0y5OArZZLyH9+XW9CbLn642N94vuvPRgkRsAtBw35gm4odXcW7D1R8vmTl5WaMtD6zZzwA8JABNHGAwLQEX97me/oDIkJXJsgY02VecELbtoE5r8H0c2CwNvvhsj+8NvTQD2BM5gFKiAmoK7nvX/v9EJov/njPdse9L6Yb+Z8KGAmitQh5wZnVX5BiqO4njAIgDhoFpJ2Quwoc4PeAsR0BQAA"
}


// Call the function when the page loads
window.onload = () => {
    fetchJSONData();
};