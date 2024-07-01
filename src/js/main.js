import "../css/main.css";
import { format, formatRelative } from "date-fns";
import fahrenheitIcon from "../assets/fahrenheit.svg";
import celciusIcon from "../assets/celcius.svg";

let weather;

async function saveProcessedForecastInfo() {
	weather = await processForecastInfo();
}

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
		"feelslike_c",
		"feelslike_f",
		"uv",
		"time",
		"name",
		"region",
		"country",
		"localtime",
	];

	let currentLocationAndTime = responseJson.location;
	filterObjectForProperties(currentLocationAndTime, releventData);

	let currentWeather = responseJson.current;
	filterObjectForProperties(currentWeather, releventData);

	let threeDaysForecastPerHour = [];
	responseJson.forecast.forecastday.forEach((day) => {
		threeDaysForecastPerHour.push([day.date, day.hour]);
	});
	threeDaysForecastPerHour.forEach((day) => {
		day[1].forEach((hour) => {
			hour = filterObjectForProperties(hour, releventData);
		});
	});

	return {
		current: currentWeather,
		forecast: threeDaysForecastPerHour,
		timeAndLocation: currentLocationAndTime,
	};
}

function filterObjectForProperties(object, properties) {
	Object.keys(object).forEach((property) => {
		if (!properties.includes(property)) {
			delete object[property];
		}
	});
	return object;
}

const celciusData = {
	name: "celcius",
	symbol: "° C",
	tempSource: "temp_c",
	feelsLikeSource: "feelslike_c",
	icon: celciusIcon,
};

const fahrenheitData = {
	name: "fahrenheit",
	symbol: "° F",
	tempSource: "temp_f",
	feelsLikeSource: "feelslike_f",
	icon: fahrenheitIcon,
};

let unitInUse = celciusData;

const tempUnitIcon = document.querySelector("#temp-unit");
tempUnitIcon.addEventListener("click", () => {
	tempUnitIcon.src = unitInUse.icon;
	unitInUse = unitInUse == celciusData ? fahrenheitData : celciusData;
	searchBtn.click();
});

let location = "Jijel";
const locationInput = document.querySelector("#location");
const searchBtn = document.querySelector("#search");

searchBtn.addEventListener("click", (e) => {
	e.preventDefault();
	searchAndUpdateWeatherInfo();
});

function searchAndUpdateWeatherInfo() {
	if (locationInput.value != "") {
		location = locationInput.value;
	}

	displayTimeAndLocationInfo();
	displayCurrentWeather();
	displayThreeDaysForecast();
}

function displayTimeAndLocationInfo() {
	saveProcessedForecastInfo().then(() => {
		const timeAndLocation = weather.timeAndLocation;

		const timeTxt = document.querySelector(".time");
		timeTxt.textContent = format(timeAndLocation.localtime, "EEEE HH:mm");

		const locationTxt = document.querySelector(".location>.text");
		locationTxt.textContent = `${timeAndLocation.region}, ${timeAndLocation.country}`;
	});
}

function displayCurrentWeather() {
	saveProcessedForecastInfo().then(() => {
		const currentWeatherData = weather.current;

		const conditionImg = document.querySelector(".condition>.condition-img");
		conditionImg.src = currentWeatherData.condition.icon;

		const conditionTxt = document.querySelector(".condition>.condition-text");
		conditionTxt.textContent = currentWeatherData.condition.text;

		const tempertureTxt = document.querySelector(
			".temperature>.temperature-text"
		);
		tempertureTxt.textContent =
			Math.round(currentWeatherData[unitInUse.tempSource]) + unitInUse.symbol;

		const feelsLikeTxt = document.querySelector(".feels-like>.feels-like-text");
		feelsLikeTxt.textContent = `Feels like ${Math.round(
			currentWeatherData[unitInUse.feelsLikeSource]
		)} ${unitInUse.symbol}`;
	});
}

function displayThreeDaysForecast() {
	const forecastContainer = document.querySelector(".forecast-container");
	forecastContainer.textContent = "";

	saveProcessedForecastInfo().then(() => {
		const threeDaysForecastData = weather.forecast;
		threeDaysForecastData.forEach((day) => {
			displayDayForecast(day);
		});
	});
}

function displayDayForecast(dayForecast) {
	const forecastContainer = document.querySelector(".forecast-container");

	const forecastItemContainer = document.createElement("div");
	forecastItemContainer.className = "forecast-item";

	forecastContainer.appendChild(forecastItemContainer);

	const nameOfDay = document.createElement("p");
	nameOfDay.className = "day";
	nameOfDay.textContent = formatRelative(dayForecast[0], new Date())
		.split("at")[0]
		.toUpperCase();

	forecastItemContainer.appendChild(nameOfDay);

	const hourlyForecastContainer = document.createElement("div");
	hourlyForecastContainer.className = "hourly-forecast-container";

	forecastItemContainer.appendChild(hourlyForecastContainer);

	dayForecast[1].forEach((hour) => {
		const hourlyForecastItem = document.createElement("div");
		hourlyForecastItem.className = "hourly-forecast-item";

		hourlyForecastContainer.appendChild(hourlyForecastItem);

		const hourTxt = document.createElement("p");
		hourTxt.className = "hour";
		hourTxt.textContent = format(new Date(hour.time), "HH:mm");

		hourlyForecastItem.appendChild(hourTxt);

		const hourlyConditionContainer = document.createElement("div");
		hourlyConditionContainer.className = "hourly-condition-container";

		hourlyForecastItem.appendChild(hourlyConditionContainer);

		const conditionImg = document.createElement("img");
		conditionImg.className = "condition-img";
		conditionImg.src = hour.condition.icon;

		hourlyConditionContainer.appendChild(conditionImg);

		const hourlyConditionTxt = document.createElement("div");
		hourlyConditionTxt.className = "hourly-condition-text";

		hourlyConditionContainer.appendChild(hourlyConditionTxt);

		const temperatureTxt = document.createElement("p");
		temperatureTxt.className = "temperature";
		temperatureTxt.textContent = `${Math.round(hour[unitInUse.tempSource])}${
			unitInUse.symbol
		}`;

		hourlyConditionTxt.appendChild(temperatureTxt);

		const conditionTxt = document.createElement("p");
		conditionTxt.className = "condition";
		conditionTxt.textContent = hour.condition.text;

		hourlyConditionTxt.appendChild(conditionTxt);
	});
}

searchAndUpdateWeatherInfo();
