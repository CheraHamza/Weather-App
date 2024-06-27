import "../css/main.css";

async function getForcastInfoForCity(city) {
	city = city.toLowerCase();
	try {
		const response = await fetch(
			`https://api.weatherapi.com/v1/forecast.json?key=52b1149f972d4a12843142300242606 &q=${city}&days=3`,
			{ mode: "cors" }
		);

		if (response.ok) {
			return await response.json();
		}
	} catch (error) {
		return error;
	}
}

async function processForcastInfo() {
	const forcastInfoJson = await getForcastInfoForCity(
		prompt("choose city?", "jijel")
	);

	console.log(forcastInfoJson);
}

// demo ui

const fetchDataButton = document.querySelector("button");

fetchDataButton.addEventListener("click", () => {
	processForcastInfo();
});
