import "../css/main.css";
import { format, formatRelative } from "date-fns";
import fahrenheitIcon from "../assets/fahrenheit.svg";
import celciusIcon from "../assets/celcius.svg";

let weather;

async function saveProcessedForecastInfo() {
	try {
		const processedInfo = await processForecastInfo();
		if (processedInfo) {
			weather = processedInfo;
		} else {
			const errorMessage = "An error occurred while saving weather data.";
			throw new Error(errorMessage);
		}
	} catch (error) {
		console.error("Error saving weather data:", error);
	}
}

async function processForecastInfo() {
	try {
		const responseJson = await getForecastInfoForLocation(location);
		if (responseJson) {
			return filterJsonForReleventData(responseJson);
		} else {
			const errorMessage = "An error occurred while processing weather data.";
			throw new Error(errorMessage);
		}
	} catch (error) {
		console.error("Error processing weather data:", error);
	}
}

async function getForecastInfoForLocation(city) {
	try {
		const response = await fetch(
			`https://api.weatherapi.com/v1/forecast.json?key=52b1149f972d4a12843142300242606 &q=${city}&days=3`,
			{ mode: "cors" }
		);

		if (response.ok) {
			return await response.json();
		} else {
			const errorData = await response.json();
			const errorMessage =
				errorData.error?.message ||
				"An error occurred while fetching weather data.";
			throw new Error(errorMessage);
		}
	} catch (error) {
		console.error("Error fetching weather data:", error);
		displayErrorMessage(`Error: ${error.message}`);
	}
}

function displayErrorMessage(errorMessage) {
	const weatherContainer = document.querySelector(".weather-container");

	const errorPanel = document.createElement("div");
	errorPanel.className = "error";
	weatherContainer.appendChild(errorPanel);

	const errorFace = document.createElement("div");
	errorFace.textContent = "( ● _ ●  )";
	errorPanel.appendChild(errorFace);

	const errorTxt = document.createElement("div");
	errorTxt.className = "error-text";
	errorTxt.textContent = errorMessage;
	errorPanel.appendChild(errorTxt);
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

	removeErrorMessage();

	saveProcessedForecastInfo()
		.then(() => {
			if (weather) {
				displayTimeAndLocationInfo();
				displayCurrentWeather();
				displayThreeDaysForecast();
			}
		})
		.catch((error) => {
			console.error(error);
		});
}

function removeErrorMessage() {
	const errorPanel = document.querySelector(".error");
	if (errorPanel) {
		errorPanel.remove();
	}
}

function displayTimeAndLocationInfo() {
	const timeAndLocation = weather.timeAndLocation;

	const timeTxt = document.querySelector(".time");
	timeTxt.textContent = format(timeAndLocation.localtime, "EEEE HH:mm");

	const locationTxt = document.querySelector(".location>.text");
	locationTxt.textContent = `${timeAndLocation.name}, ${timeAndLocation.country}`;
}

function displayCurrentWeather() {
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
}

function displayThreeDaysForecast() {
	const forecastContainer = document.querySelector(".forecast-container");
	forecastContainer.textContent = "";
	const threeDaysForecastData = weather.forecast;
	threeDaysForecastData.forEach((day) => {
		displayDayForecast(day);
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
