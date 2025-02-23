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
        const objResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago`);
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

    document.querySelector('#hCity').innerHTML = strCity
    document.querySelector('#hTemp').innerHTML = `${objData.hourly.temperature_2m[0]}° Feels like: ${objData.hourly.apparent_temperature[0]}°`
    document.querySelector('#hLow').innerHTML = `L: ${objData.daily.temperature_2m_min[0]}°`
    document.querySelector('#hHigh').innerHTML = `H: ${objData.daily.temperature_2m_max[0]}°`
} 

main();