"use strict";

var data = {};
data.npcData = {};

let currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

const NPC_ARRAY = 0;
const NPC_TYPE = 1;
const NPC_GRAFTS = 2;
const NPC_ABILITIES = 3;

let typeDropdown = $("#type-dropdown");
let subtypeDropdown = $("#subtype-dropdown");
let classGraftDropdown = $("#class-graft-dropdown");
let templateGraftDropdown = $("#template-graft-dropdown");
let whichGraftDropdown = $("#which-template-dropdown");
let whichAbilitiesDropdown = $("#which-special-abilities-dropdown");

function debugLog(text) {
    console.log(text);
}

function showTab(n) {
    let x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    if (n !== (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Next";
    } else {
        document.getElementById("nextBtn").style.display = "none";
    }
    fixStepIndicator(n);
    document.getElementById("debug").innerText = JSON.stringify(data.npcData);
}

/// Next Button Code. Triggers logic processing.
function nextPrev(n) {
    let x = document.getElementsByClassName("tab");
    // Leaving FIRST TAB
    if (currentTab === NPC_ARRAY) {
        getStats(data.npcData.npcArray, data.npcData.npcCR);
        updateAbilityScores();
        $.getJSON("json/types.json", function (data) {
            let items = [];
            $.each(data, function (key) {
                items.push("<option id='" + key + "'>" + key + "</option>");
            });
            typeDropdown.append(items);
        });
        $.getJSON("json/subtypes.json", function (data) {
            let items = [];
            $.each(data, function (key) {
                items.push("<option id='" + key + "'>" + key + "</option>");
            });
            subtypeDropdown.append(items);
        });
        // LEAVING SECOND TAB
    } else if (currentTab === NPC_TYPE) {
        $.getJSON("json/classes.json", function (data) {
            let items = [];
            $.each(data, function (key) {
                items.push("<option id='" + key + "'>" + key + "</option>");
            });
            classGraftDropdown.append(items);
        });

        data.npcData.npcType = typeDropdown.val();
        data.npcData.npcSubtype = subtypeDropdown.val();
        parseData("json/types.json", typeDropdown.val(), "npcTypeDetails");
        parseData("json/subtypes.json", subtypeDropdown.val(), "npcSubtypeDetails");
        typeDropdown.empty();
        subtypeDropdown.empty();
        // LEAVING THIRD TAB
    } else if (currentTab === NPC_GRAFTS) {
        $.getJSON("json/abilities.json", function (data) {
            let items = [];
            $.each(data, function (key, element) {
                items.push("<option id='" + key + "'>" + key + "</option>");
            });
            whichAbilitiesDropdown.append(items);
        });

        if (!classGraftDropdown.val().includes("optional")) {
            parseData("json/classes.json", classGraftDropdown.val(), "npcClassDetails");
        }
        classGraftDropdown.empty();
        if (whichGraftDropdown.val().includes("Elemental")) {
            parseData("json/elementalGrafts.json", templateGraftDropdown.val(), "npcGraftDetails");
        } else if (whichGraftDropdown.val().includes("Environmental")) {
            parseData("json/envGrafts.json", templateGraftDropdown.val(), "npcGraftDetails");
        } else if (whichGraftDropdown.val().includes("Occult")) {
            parseData("json/occultGrafts.json", templateGraftDropdown.val(), "npcGraftDetails");
        } else if (whichGraftDropdown.val().includes("Simple")) {
            parseData("json/otherGrafts.json", templateGraftDropdown.val(), "npcGraftDetails");
        } else if (whichGraftDropdown.val().includes("Summoning")) {
            parseData("json/summoningGrafts.json", templateGraftDropdown.val(), "npcGraftDetails");
        }
        templateGraftDropdown.empty();
    } else if (currentTab === NPC_ABILITIES) {

        //whichGraftDropdown.empty();
    }

    x[currentTab].style.display = "none";
    currentTab = currentTab + n;
    showTab(currentTab);
}

function loadGrafts() {
    let expression = parseFloat(whichGraftDropdown.find('option:selected').attr('id'));
    templateGraftDropdown.empty();
    let template = "";
    debugLog("Load Grafts called = " + expression);
    switch (expression) {
        case 4:
            template = "json/templateGrafts.json";
            break;
        case 1:
            template = "json/elementalGrafts.json";
            break;
        case 2:
            template = "json/envGrafts.json";
            break;
        case 3:
            template = "json/occultGrafts.json";
            break;
        case 5:
            template = "json/summoningGrafts.json";
            break;
        default:
            return;
    }

    $.getJSON(template, function (data) {
        let items = [];
        $.each(data, function (key) {
            console.log(key);
            items.push("<option id='" + key + "'>" + key + "</option>");
        });
        templateGraftDropdown.append(items);
    });
}

function parseData(filename, graftName, details) {
    $.getJSON(filename, function (data) {
        console.log(data);
        genericUpdateData(data[graftName], details);
    });
}

function fixStepIndicator(n) {
    let i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }

    if (x[n].className === undefined) {
        x[n].className = "";
    }
    x[n].className += " active";
}

function getStats(array, cx) {
    if (array === undefined || cx === undefined) {
        return;
    } else {
        debugLog("NPC Array = " + array);
        debugLog("Challenge Rating = " + cx);
    }
    let cr = String(cx);
    for (let i in data.npcData) {
        if (arrays[array][cr][i] !== undefined) {
            data.npcData[i] = arrays[array][cr][i];
            debugLog("npcData[i] =" + data.npcData[i]);
        }
    }
    data.npcData.npcXP = xp[cr].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //XP from CR
    data.npcData.npcPerception = arrays[array][cr].npcGoodSkill; //Perception is a "Good" skill by default
    debugLog("XP = " + data.npcData.npcXP);
    debugLog("Perception = " + data.npcData.npcPerception);
}

function updateAbilityScores() {
    let list = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];
    for (let i in list) {
        debugLog("Attribute = " + i);
        if (data.npcData.npcAbilityScore1Assigned === list[i]) {
            data.npcData["npc" + list[i]] = data.npcData.npcAbilityScore1;
        } else if (data.npcData.npcAbilityScore2Assigned === list[i]) {
            data.npcData["npc" + list[i]] = data.npcData.npcAbilityScore2;
        } else if (data.npcData.npcAbilityScore3Assigned === list[i]) {
            data.npcData["npc" + list[i]] = data.npcData.npcAbilityScore3;
        } else {
            data.npcData["npc" + list[i]] = 0;
        }
    }
    data.npcData.npcInitiative = data.npcData.npcDex;

    debugLog("Initiative = " + data.npcData.npcInitiative);
    debugLog("Ability Score 1 = " + data.npcData.npcAbilityScore1);
    debugLog("Ability Score 2 = " + data.npcData.npcAbilityScore2);
    debugLog("Ability Score 3 = " + data.npcData.npcAbilityScore3);
}

function genericUpdateData(details, fullData) {
    debugLog("Details = " + details + " : fullData = " + fullData);

    data.npcData[fullData] = details;
    if (details.adjustment === undefined) {
        return;
    }

    for (let i in details.adjustment) {
        debugLog("adjustment = " + details.adjustment);
        let stat = Object.getOwnPropertyNames(details.adjustment[i])[0];
        debugLog("stat = " + stat);
        debugLog("details.adjustment = " + details.adjustment[i][stat]);
        if (data.npcData[stat] !== undefined) {
            if (String(data.npcData[stat]).trim() !== "") {
                data.npcData[stat] += ",";
            }
        } else {
            data.npcData[stat] = "";
        }
        data.npcData[stat] += details.adjustment[i][stat];
    }
    for (let i in details.trait) {
        debugLog("Trait = " + details.trait);
        let stat = Object.getOwnPropertyNames(details.trait[i])[0];
        data.npcData[stat] = details.trait[i][stat];
    }
    for (let i in details.specials) {
        debugLog("Specials = " + details.specials);
        data.npcData.npcSpecialsTemp = {};
        let stat = Object.getOwnPropertyNames(
            details.specials[i].npcSpecialsTemp)[0];
        data.npcData.npcSpecialsTemp.name = stat;
        data.npcData.npcSpecialsTemp.description = details.specials[i].npcSpecialsTemp[stat];
        debugLog("stat = " + stat + "npcSpecialsTemp = " + data.npcData.npcSpecialsTemp.description);
        addAbility();
    }
    if (data.npcData.npcTypeAttackMod !== 0) {
        data.npcData.npcAttackHigh += data.npcData.npcTypeAttackMod;
        data.npcData.npcAttackLow += data.npcData.npcTypeAttackMod;
    }
    for (let i in details.masterSkills) {
        let stat = details.masterSkills[i];
        data.npcData[stat] += data.npcData.npcMasterSkill;
        debugLog("npcMasterSkill = " + data.npcData.npcMasterSkill);
    }
    for (let i in details.goodSkills) {
        let stat = details.goodSkills[i];
        data.npcData[stat] += data.npcData.npcGoodSkill;
        debugLog("npcGoodSkill = " + data.npcData.npcGoodSkill);

    }
}

function addAbility() {
    if(data.npcData.npcSpecials === undefined) {
        data.npcData.npcSpecials = [];
    }

    if (data.npcData.npcSpecialsTemp.name !== "" &&
        data.npcData.npcSpecialsTemp.description !== "") {
        data.npcData.npcSpecials.push({
            name: data.npcData.npcSpecialsTemp.name,
            description: data.npcData.npcSpecialsTemp.description
        });
        data.npcData.npcSpecialsTemp.name = "";
        data.npcData.npcSpecialsTemp.description = "";
    }
}
