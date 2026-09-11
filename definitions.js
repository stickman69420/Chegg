function imageLoaded(e,r,t) {
	loadedc++
	loadBar.value = loadedc/maxload
	if (loadedc == maxload) imagesLoaded()
}	
function imagesLoaded() {
	loadBarDiv.remove()
	allDone()
}

const unitnames = ["villager","zombie","creeper","pig","rabbit","pufferfish","iron_golem","frog","skeleton","blaze","phantom","enderman","slime","shulker","cat","sniffer","wither"]
let loadedc = 0
let units = []
loaded = [[],[],[]]
let unitimgs = []
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

function loadUnits() {
	unitnames.forEach((e,ee) => {
		loadJSON("./units/"+e+".json",function (e,i) {
			units[i] = (e)
			unitimgs[i] = new Image()
			unitimgs[i].loadid = units[i].img
			unitimgs[i].src = "./images/units/"+units[i].img+".png"
			unitimgs[i].onload = imageLoaded
			//unitimgs[i].addEventListener("error",function (e) {imageerror(e)})
		},ee)
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