function imageLoaded(filt) {
	loadedc++
	loadBar.value = loadedc/maxload
	if (loadedc == maxload) imagesLoaded(filt)
}	
function imagesLoaded(filt) {
	loadBarDiv.remove()
	/*alert(JSON.stringify(unitimgs.map(i => i.src.split("/").at(-1))))
	alert(JSON.stringify(units))*/
	const unsort = units//JSON.parse(JSON.stringify(units))
	units = {}
	Object.keys(unsort).sort((a,b)=>((unsort[a].cost ?? 0) - (unsort[b].cost ?? 0) || -a.localeCompare(b))).forEach((e) => {
		units[e] = unsort[e]
	})
	if (filt ?? true) {
		deck = deck.filter(u => units[u] != undefined)
		deck2 = deck2.filter(u => units[u] != undefined)
	}
	allDone()
}

let unitnames = ["villager","zombie","creeper","pig","rabbit","pufferfish","iron_golem","frog","skeleton","blaze","phantom","enderman","slime","shulker","cat","sniffer","wither"]
let moddednames = []
let modunits = []
let unitImageNames = []
let overlap = 0

let addonsLoad = false

loadAddons()
async function loadAddons() {
	try {
		const allAddons = await getEverything()
		//alert(JSON.stringify(allAddons))
		for (const [key,value] of Object.entries(allAddons)) {
			if (localStorage.getItem(key.replace(/[^\w]/gi, '_')) == "true") {
				value.filter(f => f.fileName && f.fileName.endsWith(".json") && f.fileName != "manifest.json").forEach((e) => {
					const newName = e.fileName.toLowerCase().replaceAll(" ","_").slice(0,-5) 
					if (!moddednames.includes(newName)) {
						moddednames.push(newName)
						modunits[newName] = e
						if (unitnames.includes(e.fileName)) overlap++
						else unitnames.push(newName)
					}
				})
			}
		}
	} catch (err) {
		alert(err.line+": "+err.message)
	}
	addonsLoad = true
}

function addonsLoaded(interval) {
	return new Promise((resolve,reject) => {
		if (addonsLoad) resolve();
		const timer = setInterval(() => {
			if (addonsLoad) {
				clearInterval(timer);
				resolve();
			}
		}, interval ?? 16)
	})
}

let loadedc = 0
let units = {}
loaded = [[],[],[]]
let unitimgs = {}
let deck = localStorage.getItem("deck") ? JSON.parse(localStorage.getItem("deck")) : []
let deck2 = localStorage.getItem("deck2") ? JSON.parse(localStorage.getItem("deck2")) : []
let map = localStorage.getItem("map") ? JSON.parse(localStorage.getItem("map")) : Array(8).fill(0).map(m => Array(10).fill(0).map((n,nn) => ({"type":nn <= 1 ? 1 : (nn >= 8 ? 2 : 0),"p2spawn":nn <= 1,"p1spawn":nn >= 8})))
			
async function loadJSON(url,func) {
	try {
		const request = new Request(url);
		const response = await fetch(request);
		const done = await response.json()
		let args = []
		for (let i = 0; i < arguments.length; ++i) args[i] = arguments[i]
		args.splice(0,2)
		func(done,...args)
		imageLoaded()
		return(done)
	} catch (err) {
		alert(err)
	}
}

async function loadUnits(filt) {
	await addonsLoaded()
	maxload += moddednames.length-overlap
	unitnames.forEach(async (e,ee) => {
		//alert(JSON.stringify(moddednames)+","+e+","+moddednames.includes(e))
		if (moddednames.includes(e)) {
			units[e] = modunits[e]
			unitimgs[e] = new Image()
			unitimgs[e].loadid = units[e].img
			unitimgs[e].src = "./images/units/"+units[e].img+".png"
			unitimgs[e].onload = imageLoaded.bind(null,filt)
			unitImageNames[ee] = units[e].img
		} else {
			loadJSON("./units/"+e+".json",function (e,i,r) {
				units[i] = (e)
				unitimgs[i] = new Image()
				unitimgs[i].loadid = units[i].img
				unitimgs[i].src = "./images/units/"+units[i].img+".png"
				unitimgs[i].onload = imageLoaded.bind(null,filt)
				unitImageNames[r] = units[i].img
				//unitimgs[i].addEventListener("error",function (e) {imageerror(e)})
			},e,ee)
		}
	})
}

// Source - https://stackoverflow.com/a/65939108
// Posted by MSOACC, modified by community. See post 'Timeline' for change history
// Retrieved 2026-07-17, License - CC BY-SA 4.0

const saveTemplateAsFile = (filename, dataObjToWrite) => {
    const blob = new Blob([JSON.stringify(dataObjToWrite,null,"\t")], { type: "text/json" });
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove()

	//My additions
	document.body.insertAdjacentHTML("beforeend","<button id='fallbackCopy' style='position:fixed;left:20%;top:20vh;width:60%;height:60vh;' onclick='copySave("+JSON.stringify(dataObjToWrite,null,"\t")+")'>If the download failed click here<button id='closer' style='position:fixed;left:25%;top:60vh;width:50%;height:20vh;' onclick='fallbackCopy.remove();closer.remove()'>Close this window</button></button>")
};

function copySave(data) {
	navigator.clipboard.writeText(JSON.stringify(data,null,"\t")).then(
		() => {
			alert("Saved to clipboard")
			fallbackCopy.remove();closer.remove()
		},
		() => {
			alert("Copy failed\nattempting alternate solution")
			fallbackCopy.innerHTML = data
			fallbackCopy.select();
			document.execCommand("copy");
		},
	)
}

//IndexedDB is Not Nice
async function getEverything() {
	const results = {};
	try {
		const db = await new Promise((resolve, reject) => {
			const request = indexedDB.open("mods");
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const stores = Array.from(db.objectStoreNames);
		if (stores.length == 0) {
			db.close()
			return {}
		}
		const tx = db.transaction(stores, "readonly");
		tx.oncomplete = (event) => {
			db.close()
		}
		for (const name of stores) {
			const store = tx.objectStore(name);
			results[name] = await new Promise((resolve, reject) => {
				const request = store.getAll();
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
					});
		}
	} catch (err) {
		alert(err.line+": "+err.message)
		return {}
	}
	return(results)
	//console.log(results);
}