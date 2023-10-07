import axios from 'axios';

export const fetchGeneratedText = async (prompt) => {
    const API_KEY = process.env.REACT_APP_OPEN_AI_API_KEY;
    console.log("API Key:", API_KEY);

    const config = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        }
    };

    console.log("Headers:", config.headers);
    
    const payload = {
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a helpful writing assistant called Kairos." },
            { role: "user", content: prompt }
        ],
        max_tokens: 4096
    };

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, config);
        console.log('API Response:', response.data);
        console.log('Full Choices Array:', JSON.stringify(response.data.choices, null, 2));

        if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && typeof response.data.choices[0].message.content === 'string') {
            console.log('Choices 0:', response.data.choices[0]);
            return response.data.choices[0].message.content.trim();
        } else {
            console.error("Unexpected API response format");
            return null;
        }
    } catch (error) {
        console.error("OpenAI API Error: ", error);
        console.log("Error details:", error.response);
        return null;
    }
};
