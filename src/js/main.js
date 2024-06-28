import "../css/main.css";

async function getForecastInfoForCity(city) {
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

async function processForecastInfo() {
	const responseJson = await getForecastInfoForCity(
		prompt("choose city?", "jijel")
	);

	console.log(filterJsonForReleventData(responseJson));
}

function filterJsonForReleventData(responseJson) {
	const releventData = [
		"temp_c",
		"temp_f",
		"condition",
		"precip_mm",
		"precip_in",
		"humidity",
		"feelslike_c",
		"feelslike_f",
		"uv",
		"will_it_rain",
		"chance_of_rain",
		"will_it_snow",
		"chance_of_snow",
		"snow_cm",
	];

	let currentWeather = responseJson.current;
	let threeDaysForecastPerHour = [];

	responseJson.forecast.forecastday.forEach((day) => {
		threeDaysForecastPerHour.push(day.hour);
	});

	filterObjectForProperties(currentWeather, releventData);

	threeDaysForecastPerHour.forEach((day) => {
		day.forEach((hour) => {
			hour = filterObjectForProperties(hour, releventData);
		});
	});

	return { current: currentWeather, forecast: threeDaysForecastPerHour };
}

function filterObjectForProperties(object, properties) {
	Object.keys(object).forEach((property) => {
		if (!properties.includes(property)) {
			delete object[property];
		}
	});
	return object;
}

// demo ui
const fetchDataButton = document.querySelector("button");
fetchDataButton.addEventListener("click", () => {
	processForecastInfo();
});
