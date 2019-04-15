const PC_KEY = "star-finder-character";

function AttachListeners() {
	var inputs = document.getElementsByTagName("input");
	var areas = document.getElementsByTagName("textarea");
	var selects = document.getElementsByTagName("select");
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("change", UpdateDLLink);
	}

	for (var i = 0; i < areas.length; i++) {
		areas[i].addEventListener("change", UpdateDLLink);
	}

	for (var i = 0; i < selects.length; i++) {
		selects[i].addEventListener("change", UpdateDLLink);
	}
}

function ModCapacity(boxnumber) {
	var boxname = "AmmoCapacity" + boxnumber;
	var capacity = document.getElementById(boxname).value;

	if (isNaN(capacity)) capacity = 20;

	for (var i = 1; i <= 100; i++) {
		box = document.getElementById("AmmoUsed" + boxnumber + "_" + i + "o");
		if (i <= capacity) box.classList.remove("invisible");
		else box.classList.add("invisible");
	}
}

function PopulateNameAndID() {
	var charname = document.getElementById("Charname").value;
	var SFSID = document.getElementById("SFSID").value;

	document.getElementById("Charname2").value = charname;
	document.getElementById("Charname3").value = charname;
	document.getElementById("Charname4").value = charname;

	document.getElementById("SFSID2").value = SFSID;
	document.getElementById("SFSID3").value = SFSID;
	document.getElementById("SFSID4").value = SFSID;
}

function ClearInputs() {
	var charvars = document.querySelectorAll("input[type=text]");
	var longvars = document.getElementsByTagName("textarea");
	var boolvars = document.querySelectorAll("input[type=checkbox]");

	for (var i = 0; i < charvars.length; i++) {
		charvars[i].value = "";
	}

	for (var i = 0; i < longvars.length; i++) {
		longvars[i].value = "";
	}

	for (var i = 0; i < boolvars.length; i++) {
		boolvars[i].checked = false;
	}

	document.getElementById("alwaystrue").checked = true;
	document.getElementById("AmmoCapacity1").value = 20;
	document.getElementById("AmmoCapacity2").value = 20;
	document.getElementById("AmmoCapacity3").value = 20;
	document.getElementById("AmmoCapacity4").value = 20;
	document.getElementById("AmmoCapacity5").value = 20;
	document.getElementById("Faction1").value = "Acquisitives";
	document.getElementById("Faction2").value = "Dataphiles";
	document.getElementById("Faction3").value = "Exo-guardians";
	document.getElementById("Faction4").value = "Second Seekers ( )";
	document.getElementById("Faction5").value = "Wayfinders";
	document.getElementById("Faction6").value = "Other";
	document.getElementById("Faction7").value = "Other";

	document.getElementById("BackPack").value = 0;
}

function LoadJSON(jstring) {
	var contents = JSON.parse(jstring);
	for (const [key, value] of Object.entries(contents)) {
		thing = document.getElementById(key);
		if (thing) {
			if (thing.type && thing.type == "checkbox" && value == true)
				thing.checked = true;
			else thing.value = value;
		} else {
			if (key.startsWith("AbilityText"))
				document.getElementById("AbilityTextArea").value += value + "\n";
			if (key.startsWith("FeatText"))
				document.getElementById("FeatTextArea").value += value + "\n";
			if (key.startsWith("LanguagesText"))
				document.getElementById("LanguagesTextArea").value += value + "\n";
		}
	}
	PopulateNameAndID();
	UpdateDLLink();
	ModCapacity(1);
	ModCapacity(2);
	ModCapacity(3);
	ModCapacity(4);
	ModCapacity(5);
}

function CrashRecovery() {
	var jstring = localStorage.getItem("SFSheetCrashRecovery");
	if (jstring) {
		ClearInputs();
		LoadJSON(jstring);
	}
}

function LoadFile() {
	loadbox = document.getElementById("inputfile");
	var file = loadbox.files[0];
	if (!file) {
		return;
	}
	ClearInputs();
	var reader = new FileReader();
	reader.onloadend = function(e) {
		LoadJSON(e.target.result);
	};
	reader.readAsText(file);
}

function UpdateDLLink() {
	const cjson = getCharacterAsJson();
	var cstring = JSON.stringify(cjson);
	var charblob = new Blob([cstring], { type: "application/json" });
	var url = URL.createObjectURL(charblob);

	var button = document.createElement("button");
	button.textContent = "Save";
	button.onclick = () => {
		saveCharacter();
	};
	document.getElementById("DownloadLink").innerHTML = "";
	document.getElementById("DownloadLink").appendChild(button);

	localStorage.setItem("SFSheetCrashRecovery", cstring);
}

function PopulateAbModFromScore(score, fallbackmod, prefmod, fieldclass) {
	const _score = document.getElementById(score).value;
	const mod = Math.floor((_score - 10) / 2);
	console.log(mod);
	document.getElementById(fallbackmod).value = mod;
	PopulateAbMod(fallbackmod, prefmod, fieldclass);
}

function PopulateAbMod(fallbackmod, prefmod, fieldclass) {
	var modifier = document.getElementById(prefmod).value;
	if (modifier == "") {
		modifier = document.getElementById(fallbackmod).value;
	}
	var fields = document.getElementsByClassName(fieldclass);
	for (var i = 0; i < fields.length; i++) {
		fields[i].value = modifier;
	}
	UpdateDLLink();
}

function PopulateAll() {
	PopulateAbModFromScore("StrScore", "StrMod", "StrUpMod", "UseStrMod");
	PopulateAbModFromScore("DexScore", "DexMod", "DexUpMod", "UseDexMod");
	PopulateAbModFromScore("ConScore", "ConMod", "ConUpMod", "UseConMod");
	PopulateAbModFromScore("IntScore", "IntMod", "IntUpMod", "UseIntMod");
	PopulateAbModFromScore("WisScore", "WisMod", "WisUpMod", "UseWisMod");
	PopulateAbModFromScore("ChaScore", "ChaMod", "ChaUpMod", "UseChaMod");
}

function CalculateCarry() {
	var sStrMod = document.getElementById("StrUpScore").value;
	if (sStrMod == "") {
		sStrMod = document.getElementById("StrScore").value;
	}
	var eStrMod = parseInt(sStrMod);
	if (!isNaN(eStrMod)) {
		eStrMod += parseInt(document.getElementById("BackPack").value);
		if (document.getElementById("Mercenary6").checked) {
			eStrMod += 1;
		}
		var uBulk = Math.trunc(eStrMod / 2);
		document.getElementById("CapacityU").value = "" + uBulk;
		document.getElementById("CapacityE").value = uBulk + 1 + "-" + eStrMod;
		document.getElementById("CapacityO").value = eStrMod + 1;
		UpdateDLLink();
	}
}

function CalculateBulk() {
	var totalbulk = 0;
	for (var i = 1; i <= 40; i++) {
		box = document.getElementById("ItemBulk" + i);
		if (box.value == "L") totalbulk += 1;
		else if (!isNaN(box.value)) totalbulk += box.value * 10;
	}

	document.getElementById("CapacityC").value = Math.trunc(totalbulk / 10);
	UpdateDLLink();
}

function AddEight(dstfield, srcfield) {
	var total = 8;
	field = document.getElementById(srcfield);
	if (field) {
		var ival = parseInt(field.value);
		if (!isNaN(ival)) {
			total += ival;
		}
	}
	document.getElementById(dstfield).value = total;
	UpdateDLLink();
}

function SumUp(dstfield, srcfields) {
	var total = 0;
	for (var i = 0; i < srcfields.length; i++) {
		field = document.getElementById(srcfields[i]);
		if (field) {
			var ival = parseInt(field.value);
			if (!isNaN(ival)) {
				total += ival;
			}
		}
	}

	document.getElementById(dstfield).value = total;
	UpdateDLLink();
}

function SumPlusTen(dstfield, srcfields) {
	var total = 10;
	for (var i = 0; i < srcfields.length; i++) {
		field = document.getElementById(srcfields[i]);
		if (field) {
			var ival = parseInt(field.value);
			if (!isNaN(ival)) {
				total += ival;
			}
		}
	}

	document.getElementById(dstfield).value = total;
	UpdateDLLink();
}

function SumUpSkill(skill, trainedonly, applyACP) {
	var SkillTotal = skill + "Total";
	var SkillRanks = skill + "Ranks";
	var SkillClassB = skill + "ClassB";
	var SkillAbility = skill + "Ability";
	var SkillIns = skill + "Ins";
	var SkillMisc = skill + "Misc";
	var ACP = "ACP";
	if (applyACP)
		SumUp(SkillTotal, [
			SkillRanks,
			SkillClassB,
			SkillIns,
			SkillAbility,
			SkillMisc,
			ACP
		]);
	else
		SumUp(SkillTotal, [
			SkillRanks,
			SkillClassB,
			SkillIns,
			SkillAbility,
			SkillMisc
		]);

	if (trainedonly) {
		var ranksvalue = document.getElementById(SkillRanks).value;
		if (ranksvalue == "" || isNaN(ranksvalue) || parseInt(ranksvalue) == 0) {
			document.getElementById(SkillTotal).value = "-";
		}
	}
	UpdateDLLink();
}

function CalcAllSkills() {
	SumUpSkill("Acrobatics", false, true);
	SumUpSkill("Athletics", false, true);
	SumUpSkill("Bluff", false, false);
	SumUpSkill("Computers", true, false);
	SumUpSkill("Culture", true, false);
	SumUpSkill("Diplomacy", false, false);
	SumUpSkill("Disguise", false, false);
	SumUpSkill("Engineering", true, false);
	SumUpSkill("Intimidate", false, false);
	SumUpSkill("LifeSci", true, false);
	SumUpSkill("Medicine", true, false);
	SumUpSkill("Mysticism", true, false);
	SumUpSkill("Perception", false, false);
	SumUpSkill("PhysSci", true, false);
	SumUpSkill("Pilot", false, false);
	SumUpSkill("Profession1", true, false);
	SumUpSkill("Profession2", true, false);
	SumUpSkill("Sense", false, false);
	SumUpSkill("Sleight", true, true);
	SumUpSkill("Stealth", false, true);
	SumUpSkill("Survival", false, false);

	SumUp("TotalSkillSpent", [
		"AcrobaticsRanks",
		"AthleticsRanks",
		"BluffRanks",
		"ComputersRanks",
		"CultureRanks",
		"DiplomacyRanks",
		"DisguiseRanks",
		"EngineeringRanks",
		"IntimidateRanks",
		"LifeSciRanks",
		"MedicineRanks",
		"MysticismRanks",
		"PerceptionRanks",
		"PhysSciRanks",
		"PilotRanks",
		"Profession1Ranks",
		"Profession2Ranks",
		"SenseRanks",
		"SleightRanks",
		"StealthRanks",
		"SurvivalRanks"
	]);
}

const loadCharactersFromLocalStorage = () => {
	const pcs = [];
	for (var key in localStorage) {
		console.log(key);
		const _key = key.split("|");
		if (_key[0] === PC_KEY) {
			pcs.push({ key, data: localStorage[key] });
		}
	}
	const _options = pcs.map(pc => {
		const _el = document.createElement("option");
		_el.textContent = pc.key.split("|")[1];
		_el.setAttribute("value", pc.key);
		return _el;
	});
	console.log(_options);
	const select = document.querySelector("#allcharacters");
	var length = select.options.length;
	for (i = 1; i < length; i++) {
		select.options[i] = null;
	}
	if (_options.length > 0) {
		_options.forEach(_o => {
			console.log(document.querySelector("#allcharacters"));
			document.querySelector("#allcharacters").appendChild(_o);
		});
	} else {
		const _dropdown = document.querySelector("#allcharacters");
		if (_dropdown && _dropdown.css) {
			_dropdown.css("display", "none");
		}
	}
};

const saveCharacterToLocalStorage = json => {
	const jsonString = JSON.stringify(json);
	localStorage.setItem(PC_KEY + "|" + json.Charname, jsonString);
};

const getCharacterAsJson = () => {
	var cjson = {};
	var charname = document.getElementById("Charname").value;
	var charvars = document.querySelectorAll("input[type=text]");
	var longvars = document.getElementsByTagName("textarea");
	var boolvars = document.querySelectorAll("input[type=checkbox]");
	var allowrecoverysave = false;

	if (charname == "") charname = "Unnamed Character";
	else allowrecoverysave = true;

	for (var i = 0; i < charvars.length; i++) {
		cjson[charvars[i].id] = charvars[i].value;
	}

	for (var i = 0; i < longvars.length; i++) {
		cjson[longvars[i].id] = longvars[i].value;
	}

	for (var i = 0; i < boolvars.length; i++) {
		if (boolvars[i].checked) {
			cjson[boolvars[i].id] = true;
		}
	}

	cjson["BackPack"] = document.getElementById("BackPack").value;
	return cjson;
};

const saveCharacter = () => {
	const cjson = getCharacterAsJson();
	saveCharacterToLocalStorage(cjson);
	loadCharactersFromLocalStorage();
};

const updateCharacterSheet = e => {
	var key = document.querySelector("#allcharacters").selectedOptions[0].value;
	LoadJSON(localStorage.getItem(key));
};

const addEvents = () => {
	console.log("add evetms");
	document.querySelector("#allcharacters").onchange = updateCharacterSheet;
	document.querySelectorAll("input").forEach(input => {
		input.onchange = () => {
			console.log("save character");
			UpdateDLLink();
			saveCharacter();
		};
	});
};
