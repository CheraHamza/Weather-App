import "../css/main.css";

let location = "Jijel";

async function processForecastInfo() {
	const responseJson = await getForecastInfoForLocation(location);
	return filterJsonForReleventData(responseJson);
}

async function getForecastInfoForLocation(city) {
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
	filterObjectForProperties(currentWeather, releventData);

	let threeDaysForecastPerHour = [];
	responseJson.forecast.forecastday.forEach((day) => {
		threeDaysForecastPerHour.push(day.hour);
	});
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
const locationInput = document.querySelector("#location");
const searchBtn = document.querySelector("#search");

searchBtn.addEventListener("click", (e) => {
	e.preventDefault();
	location = locationInput.value;
	processForecastInfo().then((info) => {
		console.log(info);
	});
});
