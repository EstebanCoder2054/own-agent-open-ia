import OpenAI from "openai"
// Tool implementations plus the `functions` array OpenAI uses to know what it can call
import { getCurrentWeather, getLocation, functions } from "./tools"
import { renderNewMessage } from "./dom"

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})

// Maps function names to the actual JS functions (useful if you call tools manually)
const availableFunctions = {
    getCurrentWeather,
    getLocation
}

const messages = [
    {
        role: "system", content: `
You are a helpful AI agent. Transform technical data into engaging, 
conversational responses, but only include the normal information a 
regular person might want unless they explicitly ask for more. Provide 
highly specific answers based on the information you're given. Prefer 
to gather information with the tools provided to you rather than 
giving basic, generic answers.
`
    },
]

async function agent(query) {

    messages.push({ role: "user", content: query })
    renderNewMessage(query, "user")

    // runFunctions runs the agent loop: the model may request a tool, we execute it,
    // send the result back, and repeat until the model returns a normal text reply
    const runner = openai.beta.chat.completions.runFunctions({
        model: "gpt-4-1106-preview", // Model that supports function / tool calling
        messages,                   // Full conversation history (system + user + prior turns)
        functions                   // Tool definitions from tools.js (name, params, handler)
    }).on("message", (message) => console.log(message)) // Log each step (tool calls, tool results, assistant text)

    // Resolves when the model is done calling tools and has a final answer string
    const finalContent = await runner.finalContent()
    messages.push({ role: "system", content: finalContent })
    renderNewMessage(finalContent, "assistant")
}

document.getElementById("form").addEventListener("submit", async function (event) {
    event.preventDefault()
    const inputElement = document.getElementById("user-input")
    inputElement.focus()
    const formData = new FormData(event.target)
    const query = formData.get("user-input")
    event.target.reset()
    await agent(query)
})