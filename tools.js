// Called by the model when it needs weather for a city; `location` comes from the model's tool arguments
export async function getCurrentWeather({ location }) {
    try {
        const weatherUrl = new URL("https://apis.scrimba.com/openweathermap/data/2.5/weather")
        weatherUrl.searchParams.append("q", location)
        weatherUrl.searchParams.append("units", "imperial")
        const res = await fetch(weatherUrl)
        const data = await res.json()
        // Tool results must be strings so the model can read them in the next turn
        return JSON.stringify(data)
    } catch(err) {
        console.error(err.message)
    }
}

// Called by the model when it needs the user's approximate location (from IP)
export async function getLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/')
        const text = await response.json()
        return JSON.stringify(text)
    } catch (err) {
        console.error(err.message)
    }
}

// Config for openai.beta.chat.completions.runFunctions — each entry is one callable tool
export const functions = [
    {
        function: getCurrentWeather, // JS function run when the model invokes this tool
        parse: JSON.parse,           // Turns the model's JSON argument string into an object ({ location })
        parameters: {
            // JSON Schema: tells the model what arguments it may pass
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The name of the city from where to get the weather"
                }
            },
            required: ["location"] // Model must supply `location` when calling this tool
        }
    },
    {
        function: getLocation, // No arguments; model calls this to get IP-based location data
        parameters: {
            type: "object",
            properties: {} // Empty object = tool takes no parameters
        }
    },
]