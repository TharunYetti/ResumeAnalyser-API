require("dotenv").config();
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Converts local file to base64 format
function fileToBase64(filePath) {
  return fs.readFileSync(filePath, { encoding: "base64" });
}

// Function to analyze the heatmap image using OpenAI's GPT-4-Turbo Vision
async function analyzeImage() {
  try {
    // Define the structured prompt
    const prompt = `Analyze the provided heatmap, which depicts the status of various data capabilities within a UK-based retail banking organization that offers savings and loans. The capabilities are grouped based on functional similarity, with each group having a title in a teal-colored box. The status of each capability is represented using color codes:

Maroon/Deep Red: Capability is completely missing but required.

Red: Capability exists but is not functioning as intended.

Amber: Capability exists but requires significant improvement.

Green: Capability is fit for purpose and functioning well.

Instructions:

Summary: Provide a high-level overview of the current state of data capabilities in the organization based on the heatmap.

Group-Level Analysis: For each functional group, analyze:

The distribution of statuses (missing, not working, needs improvement, or functioning well).

Key observations based on the color patterns.

Implications of the current state for the organization’s data strategy and operational efficiency.

Recommendations to improve data maturity within each capability group.

Conclusion: Summarize critical insights and provide strategic recommendations for the organization to enhance its data capabilities effectively.

Ensure the analysis is structured, insightful, and actionable.`;

    // Read the image from the public folder
    const imagePath = path.join(__dirname, "../../public/6.png");
    const base64Image = fileToBase64(imagePath);

    // OpenAI API request to GPT-4-Turbo Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Updated model
      messages: [
        { role: "system", content: "You are an expert in data analysis and enterprise architecture." },
        { role: "user", content: prompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Here is the heatmap image to analyze:" },
            { 
              type: "image_url", 
              image_url: { url: `data:image/png;base64,${base64Image}` } // Corrected format
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const analysis = response.choices[0]?.message?.content;
    console.log(analysis);

    return analysis;
  } catch (error) {
    console.error("Error analyzing the image:", error);
    throw error;
  }
}

module.exports = { analyzeImage };