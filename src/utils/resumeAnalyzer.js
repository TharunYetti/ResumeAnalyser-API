const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Function to extract text from a resume (PDF or DOCX)
async function extractTextFromResume(fileBuffer, mimeType) {
  try {
    if (mimeType === "application/pdf") {
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const docData = await mammoth.extractRawText({ buffer: fileBuffer });
      return docData.value;
    } else {
      throw new Error("Unsupported file format. Please upload a PDF or DOCX.");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

// Function to analyze resume using Google Gemini AI
async function analyzeResume(fileBuffer, mimeType, jobRole) {
  try {
    // Extract text from the uploaded resume
    const resumeText = await extractTextFromResume(fileBuffer, mimeType);
    console.log("Extracted Resume Text:", resumeText);

    // Define a structured prompt
    const prompt = `
    Analyze the following resume and provide insights:
    - Matching jobs for the given resume
    - Missing skills for different matching jobs
    - Suggested jobs for the given resume
    - Readability score for the given resume (always above 50)
    - ATS (Applicant Tracking System) compatibility
    - Exclusive skill comparison for the given resume with the job role: '${jobRole}' without any table, just pointers
    - No additional text or explanation—return **only** valid JSON
  
    Return the JSON response with the following exact fields and structure:
  
    {
      "score": number,                  // ATS score
      "missingKeywords": [string],     // Keywords missing in the resume
      "suggestedJobs": [string],       // List of suitable job titles
      "readabilityScore": number,      // Readability score (above 50)
      "grammarIssues": string,         // Short description of grammar issues if any
      "atsFriendly": "true" | "false", // ATS compatibility
      "detailedDescription": string,   // End-to-end summary of the resume
  
      "personalInfo": {
        "name": string | null,
        "email": string | null,
        "phone": string | null,
        "location": string | null
      },
  
      "education": [
        {
          "degree": string | null,
          "branch": string | null,
          "university": string | null,
          "year": string | null,
          "cgpa": string | null
        }
      ],
  
      "experience": [
        {
          "role": string,
          "company": string,
          "description": string
        }
      ],
  
      "skills": {
        "technicalSkills": [string],
        "softSkills": [string],
        "tools": [string]
      },
  
      "sectionWiseScore": {
        "Education": number,
        "Experience": number,
        "Skills": number,
        "Projects": number,
        "Achievements": number,
        "Other": number
      }
    }
  
    Resume:
    """${resumeText}"""
  `;
  

    // Dynamically import Google Generative AI
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = await model.generateContent([prompt]);
    const analysis = result.response.text();
    // console.log(analysis);

    // Create a duplicate for parsing

    let sectionScores = {};
    let final_analysis = analysis;
    try {
      // Create a duplicate variable for parsing
      const duplicateResponse = analysis.replace(/```json|```/g, "").trim();

      // Extract JSON content from the duplicate response
      const parsedData = JSON.parse(duplicateResponse);

      // Extract sectionScores safely
      sectionScores = parsedData.sectionWiseScore || {};
      console.log(parsedData);
      final_analysis = parsedData;
    } catch (error) {
      console.error("Error parsing section scores:", error);
    }

    // Extract section-wise scores

    return {
      score: final_analysis.score || 0,
      missingKeywords: final_analysis.missingKeywords || [],
      suggestedJobs: final_analysis.suggestedJobs || [],
      readabilityScore: final_analysis.readabilityScore || 50,
      grammarIssues: final_analysis.grammarIssues || "",
      atsFriendly: final_analysis.atsFriendly === "true" ? "true" : "false",
      detailedDescription: final_analysis.detailedDescription || "",

      personalInfo: {
        name: final_analysis.personalInfo?.name || null,
        email: final_analysis.personalInfo?.email || null,
        phone: final_analysis.personalInfo?.phone || null,
        location: final_analysis.personalInfo?.location || null,
      },

      education: Array.isArray(final_analysis.education)
        ? final_analysis.education.map((edu) => ({
            degree: edu.degree || null,
            branch: edu.branch || null,
            university: edu.university || null,
            year: edu.year || null,
            cgpa: edu.cgpa || null,
          }))
        : [],

      experience: Array.isArray(final_analysis.experience)
        ? final_analysis.experience.map((exp) => ({
            role: exp.role || "",
            company: exp.company || "",
            description: exp.description || "",
          }))
        : [],

      skills: {
        technicalSkills: Array.isArray(final_analysis.skills?.technicalSkills)
          ? final_analysis.skills.technicalSkills
          : [],
        softSkills: Array.isArray(final_analysis.skills?.softSkills)
          ? final_analysis.skills.softSkills
          : [],
        tools: Array.isArray(final_analysis.skills?.tools)
          ? final_analysis.skills.tools
          : [],
      },

      sectionWiseScore: {
        Education: final_analysis.sectionWiseScore?.Education || 0,
        Experience: final_analysis.sectionWiseScore?.Experience || 0,
        Skills: final_analysis.sectionWiseScore?.Skills || 0,
        Projects: final_analysis.sectionWiseScore?.Projects || 0,
        Achievements: final_analysis.sectionWiseScore?.Achievements || 0,
        Other: final_analysis.sectionWiseScore?.Other || 0,
      },
    };
  } catch (error) {
    console.error("Error analyzing resume at resumeAnalyzer.js:", error);
    throw error;
  }
}

module.exports = { analyzeResume };
