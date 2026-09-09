function imageLoaded() {
	loadedc++
	loadBar.value = loadedc/maxload
	if (loadedc == maxload) imagesLoaded()
}	
function imagesLoaded() {
	loadBarDiv.remove()
	loaded = true
	allDone()
}

const unitnames = ["villager","zombie","creeper","pig","rabbit","pufferfish","iron_golem","frog","skeleton","blaze","phantom","enderman","slime","shulker","cat","sniffer","wither"]
let loadedc = 0
let loaded = false
let units = []
let unitimgs = []
let deck = localStorage.getItem("deck") ? JSON.parse(localStorage.getItem("deck")) : []
let deck2 = localStorage.getItem("deck2") ? JSON.parse(localStorage.getItem("deck2")) : []
			
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

function loadUnits() {
	unitnames.forEach((e,ee) => {
		loadJSON("./units/"+e+".json",function (e,i) {
			units[i] = (e)
			unitimgs[i] = new Image()
			unitimgs[i].src = "./images/units/"+units[i].img+".png"
			unitimgs[i].onload = imageLoaded
		},ee)
	})
}