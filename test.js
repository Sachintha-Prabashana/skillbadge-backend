const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDoiky3QS84W2dFlAjpIpc7oowLJJUS1K4");

async function listModels() {
    try {
        console.log(" Checking available models...");
        const modelResponse = await genAI.getGenerativeModelFactory().listModels();

        console.log("\n Available Models for you:");
        console.log("--------------------------------");

        let found = false;
    } catch (error) {
        console.log(" SDK Error listing models. Let's try direct Fetch...");
        await listModelsDirectly();
    }
}

async function listModelsDirectly() {
    const key = "AIzaSyDoiky3QS84W2dFlAjpIpc7oowLJJUS1K4";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n AVAILABLE MODELS (Direct API):");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(` ${m.name.replace("models/", "")}`);
                }
            });
        } else {
            console.log(" Error:", data);
        }
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

listModelsDirectly();