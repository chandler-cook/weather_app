/*
    NOTE: ChatGPT was used to optimize runtime and help with promises
*/
async function getCoordinates() {
    // Determine if geolocation is available
    if(!("geolocation" in navigator)) {
        throw new Error("Geolocation is not supported by this browser.");
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error)
        );
    })
}

async function getLocation(coords) {
    try {
        // Separate coords parameter into latitude and longitude
        const { latitude, longitude } = coords;

        // Make API call to coordinate lookup and convert output to json
        const objResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=geocodejson`);
        const objData = await objResponse.json();

        // Save city information
        const strCity = objData.features[0].properties.geocoding.city
        // console.log(strCity); //debug statement
        
        // Return city and state
        return strCity;
    } catch(error) {
        console.error("Error fetching location data:", error);
    }
}

async function getWeather(coords) {
    try {
        // Separate coords parameter into latitude and longitude
        const { latitude, longitude } = coords;

        // Make API call to weather site and convert output to json
        const objResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago`);
        const objData = await objResponse.json();
        console.log("Weather Data: ", objData); // debug statement

        // Return weather JSON object
        return objData;
    } catch(error) {
        console.error("error: ", error);
    }
}

async function main() {
    const coords = await getCoordinates();
    const [strCity, objData] = await Promise.all([
        getLocation(coords),
        getWeather(coords)
    ]);
    const intWeatherCode = objData.hourly.weather_code[0];
    const objWeatherConditions = {
        0: { icon: "bi bi-sun", text: "Clear skies" },
        1: { icon: "bi bi-brightness-high", text: "Mostly clear skies" },
        2: { icon: "bi bi-cloud-sun", text: "Partly cloudy" },
        3: { icon: "bi bi-cloudy", text: "Overcast" },
        45: { icon: "bi bi-cloud-fog2", text: "Fog" },
        51: { icon: "bi bi-cloud-drizzle", text: "Light drizzle" },
        53: { icon: "bi bi-cloud-drizzle", text: "Moderate drizzle" },
        55: { icon: "bi bi-cloud-drizzle", text: "Dense drizzle" },
        56: { icon: "bi bi-cloud-hail", text: "Light freezing drizzle" },
        57: { icon: "bi bi-cloud-hail", text: "Dense freezing drizzle" },
        61: { icon: "bi bi-cloud-rain", text: "Light rain" },
        63: { icon: "bi bi-cloud-rain-heavy", text: "Moderate rain" },
        65: { icon: "bi bi-cloud-rain-heavy", text: "Heavy rain" },
        66: { icon: "bi bi-cloud-hail", text: "Light freezing rain" },
        67: { icon: "bi bi-cloud-hail", text: "Heavy freezing rain" },
        71: { icon: "bi bi-cloud-snow", text: "Light snow" },
        73: { icon: "bi bi-cloud-snow", text: "Moderate snow" },
        75: { icon: "bi bi-cloud-snow-fill", text: "Heavy snow" },
        80: { icon: "bi bi-cloud-rain", text: "Light showers" },
        81: { icon: "bi bi-cloud-rain-heavy", text: "Moderate showers" },
        82: { icon: "bi bi-cloud-rain-heavy", text: "Heavy showers" }
    };
    const strConditions = objWeatherConditions[intWeatherCode].text || 'Unknown conditions';
    const iconConditions = objWeatherConditions[intWeatherCode].icon;

    const arrDays = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    let arrNextDays = [];

    for (let i = 1; i <= 5; i++) {
        let strDate = new Date();
        strDate.setDate(strDate.getDate() + i);
        arrNextDays.push(arrDays[strDate.getDay()]);
    }

    document.querySelector('#hCity').innerHTML = strCity
    document.querySelector('#hConditions').innerHTML = `<i class="${iconConditions}"></i> ${strConditions}`;
    document.querySelector('#hTemp').innerHTML = `<i class="bi bi-thermometer-half"></i> ${Math.round(objData.hourly.temperature_2m[0])}°F`;
    document.querySelector('#hLow').innerHTML = `L: ${Math.round(objData.daily.temperature_2m_min[0])}°F`;
    document.querySelector('#hHigh').innerHTML = `H: ${Math.round(objData.daily.temperature_2m_max[0])}°F`;
    document.querySelector('#hHumidity').innerHTML = `<i class="bi bi-droplet"></i> ${objData.hourly.relative_humidity_2m[0]}%`;
    document.querySelector('#hPrecipitation').innerHTML = `<i class="bi bi-water"></i> ${objData.hourly.precipitation_probability[0]}%`;
    
    let strHTML = '';
    for(i = 1; i <= 5; i++) {
        let intWeatherCode = objData.daily.weather_code[i];
        let weather = objWeatherConditions[intWeatherCode];
        strHTML += `
        <div class="d-flex flex-column align-items-center">
            <small>${arrNextDays[i - 1]}</small> 
            <i class="${weather.icon} fs-2"></i>
            <small style="font-size: 10px">${weather.text}</small>
        </div>
    `;
    }
    document.querySelector('#divConditions').innerHTML = strHTML;
} 

main();