import OpenAI from "openai"
import { getCurrentWeather, getLocation, tools } from "./tools"

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
})

// Available functions for the agent to use
const availableFunctions = {
    getCurrentWeather,
    getLocation
}

// Agent function
async function agent(query) {
    const messages = [
        { role: "system", content: "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers." },
        { role: "user", content: query }
    ]

    const MAX_ITERATIONS = 5

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`Iteration #${i + 1}`)
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages,
            tools
        })

        console.log(response.choices[0])
        // Extract the finish reason and message from the response
        const { finish_reason: finishReason, message } = response.choices[0]
        // Extract the tool calls from the message
        const { tool_calls: toolCalls } = message
        
        // Add the message to the messages array to be used in the next iteration
        messages.push(message)
        
        // If the agent has finished, return the message
        if (finishReason === "stop") {
            console.log(message.content)
            console.log("AGENT ENDING")
            return
        } else if (finishReason === "tool_calls") { // If the agent needs to call a tool, call the tool and add the response to the messages array
            for (const toolCall of toolCalls) {
                const functionName = toolCall.function.name
                const functionToCall = availableFunctions[functionName] // Get the function to call from the available functions
                const functionResponse = await functionToCall() // Call the function and get the response
                console.log(functionResponse)
                messages.push({ // Add the response to the messages array to be used in the next iteration
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: functionResponse
                })
            }
        }
        
    }
}

await agent("What's the current weather in Tokyo and New York City and Oslo?")
