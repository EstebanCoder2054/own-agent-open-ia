export async function getCurrentWeather() {
    const weather = {
        temperature: "26",
        unit: "C",
        forecast: "cloudy"
    }
    return JSON.stringify(weather)
}

export async function getLocation() {
    return "Medellin, Colombia"
}
