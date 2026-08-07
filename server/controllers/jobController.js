import JobApplication from "../models/JobApplication.js";
import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

// --- SEARCH JOBS (REMOTIVE API PROXY) ---
export const searchJobs = async (req, res) => {
  try {
    const { q } = req.query;
    const queryParam = q ? encodeURIComponent(q) : "developer";
    
    const response = await fetch(`https://remotive.com/api/remote-jobs?search=${queryParam}`);
    if (!response.ok) {
      return res.status(response.status).json({
        message: `Failed to fetch jobs from Remotive API: ${response.statusText}`,
      });
    }

    const data = await response.json();
    // Remotive returns { "jobs-count": x, "jobs": [...] }
    return res.status(200).json({
      jobs: data.jobs || [],
    });
  } catch (error) {
    console.error("Search Jobs Error:", error);
    return res.status(500).json({
      message: "Failed to search jobs via proxy.",
      error: error.message,
    });
  }
};

// --- AUTO-TAILOR RESUME & CREATE CRM APPLICATION ---
export const tailorResume = async (req, res) => {
  try {
    const { baseResumeId, jobTitle, company, jobDescription, jobUrl } = req.body;
    const userId = req.userId;

    if (!baseResumeId || !jobTitle || !company || !jobDescription) {
      return res.status(400).json({
        message: "Missing required fields (baseResumeId, jobTitle, company, jobDescription)",
      });
    }

    // 1. Fetch base resume
    const baseResume = await Resume.findById(baseResumeId);
    if (!baseResume) {
      return res.status(404).json({ message: "Base resume not found." });
    }

    // 2. Prepare simplified data for LLM context
    const baseDataForLLM = {
      professional_summary: baseResume.professional_summary,
      skills: baseResume.skills,
      experience: baseResume.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        description: exp.description
      })),
      projects: baseResume.projects.map(proj => ({
        name: proj.name,
        description: proj.description
      }))
    };

    // 3. Prompt Gemini to tailor the resume sections
    const systemPrompt = `You are a professional resume writer and ATS optimization expert. Your task is to tailor the candidate's resume sections to align with the target Job Description (JD).
Modify the professional summary, refilter/prioritize skills, and rewrite experience and project descriptions using action verbs, matching keywords, and impact-driven sentences. Do not fabricate any projects, companies, education, or dates.
You must return the output in the exact JSON format matching this schema:
{
  "professional_summary": "Tailored summary goes here...",
  "skills": ["Skill 1", "Skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "description": "Tailored description highlighting matching metrics/skills..."
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Tailored project description highlighting matching tech stack..."
    }
  ]
}`;

    const userPrompt = `Base Resume Data:
${JSON.stringify(baseDataForLLM, null, 2)}

Target Job Description:
Job Title: ${jobTitle}
Company: ${company}
Job Description:
${jobDescription}`;

    const aiResponse = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const parsedAI = JSON.parse(aiResponse.choices[0].message.content);

    // 4. Construct tailored Resume template structures
    let currentTailoredResume = {
      userId,
      title: `${company} - ${jobTitle} (Tailored)`,
      template: baseResume.template,
      accent_color: baseResume.accent_color,
      personal_info: baseResume.personal_info,
      professional_summary: parsedAI.professional_summary || baseResume.professional_summary,
      skills: parsedAI.skills || baseResume.skills,
      experience: baseResume.experience.map(exp => {
        const tailoredExp = parsedAI.experience?.find(
          e => e.company.toLowerCase() === exp.company.toLowerCase() && 
               e.position.toLowerCase() === exp.position.toLowerCase()
        );
        return {
          company: exp.company,
          position: exp.position,
          start_date: exp.start_date,
          end_date: exp.end_date,
          is_current: exp.is_current,
          description: tailoredExp ? tailoredExp.description : exp.description
        };
      }),
      projects: baseResume.projects.map(proj => {
        const tailoredProj = parsedAI.projects?.find(
          p => p.name.toLowerCase() === proj.name.toLowerCase()
        );
        return {
          name: proj.name,
          type: proj.type,
          description: tailoredProj ? tailoredProj.description : proj.description
        };
      }),
      education: baseResume.education,
      certifications: baseResume.certifications
    };

    // --- AUTONOMOUS ATS SELF-CORRECTION LOOP (TARGET: 85%) ---
    let currentScore = 0;
    let missingKeywords = [];
    let iterations = 0;
    const maxIterations = 3; // Prevent infinite API requests and token exhaustion
    const finalFeedbackLog = [];

    while (iterations < maxIterations) {
      iterations++;
      console.log(`[ATS Loop] Iteration ${iterations}: Evaluating resume match...`);

      // A. Evaluate the current tailored draft against the JD
      const scannerSystemPrompt = "You are an expert technical recruiter software. Your job is to compare a candidate's resume to a provided job description. Return a strict JSON object mapping the match, without markdown or backticks, with exactly this schema:\n{\n  \"matchPercentage\": <number between 0 and 100>,\n  \"matchingSkills\": [\"skill1\", \"skill2\", ...],\n  \"missingKeywords\": [\"keyword1\", \"keyword2\", ...]\n}";
      const scannerUserPrompt = `=== RESUME DATA ===\n${JSON.stringify({
        professional_summary: currentTailoredResume.professional_summary,
        skills: currentTailoredResume.skills,
        experience: currentTailoredResume.experience.map(e => ({ company: e.company, position: e.position, description: e.description })),
        projects: currentTailoredResume.projects.map(p => ({ name: p.name, description: p.description }))
      })}\n\n=== JOB DESCRIPTION ===\n${jobDescription}`;

      const scanResponse = await ai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: "system", content: scannerSystemPrompt },
          { role: "user", content: scannerUserPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const parsedScan = JSON.parse(scanResponse.choices[0].message.content);
      currentScore = parsedScan.matchPercentage || 0;
      missingKeywords = parsedScan.missingKeywords || [];

      finalFeedbackLog.push({
        iteration: iterations,
        score: currentScore,
        missingKeywords: [...missingKeywords]
      });

      console.log(`[ATS Loop] Iteration ${iterations}: Achieved Score: ${currentScore}%`);

      // Break if we hit our target score or max retries
      if (currentScore >= 85 || iterations >= maxIterations) {
        break;
      }

      // B. Refine the text by injecting feedback & missing keywords
      console.log(`[ATS Loop] Score ${currentScore}% is below target 85%. Initiating AI Self-Correction...`);
      const refinerSystemPrompt = `You are an expert resume writer. Your job is to review a candidate's current resume draft and optimize it to raise its ATS match score.
You must update the professional summary, experience bullets, projects, and skills to integrate the following missing keywords: ${JSON.stringify(missingKeywords)}.
Do not change company names, dates, degrees, or fabricate fake projects. Only optimize the text descriptions to align with the job description.
Return the output in the exact JSON format matching this schema:
{
  "professional_summary": "Highly optimized resume summary...",
  "skills": ["Updated skill 1", "Updated skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "description": "Tailored and keyword-rich experience description..."
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Tailored project description matching job keywords..."
    }
  ]
}`;

      const refinerUserPrompt = `=== CURRENT RESUME DRAFT ===
${JSON.stringify(currentTailoredResume, null, 2)}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

=== SCANNER FEEDBACK ===
Previous ATS Match Score: ${currentScore}%
Missing Keywords to Integrate: ${missingKeywords.join(", ")}`;

      const refineResponse = await ai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
          { role: "system", content: refinerSystemPrompt },
          { role: "user", content: refinerUserPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const parsedRefine = JSON.parse(refineResponse.choices[0].message.content);

      // Overwrite the draft with refined descriptions
      currentTailoredResume.professional_summary = parsedRefine.professional_summary || currentTailoredResume.professional_summary;
      currentTailoredResume.skills = parsedRefine.skills || currentTailoredResume.skills;
      
      if (parsedRefine.experience) {
        currentTailoredResume.experience = currentTailoredResume.experience.map(exp => {
          const refinedExp = parsedRefine.experience.find(
            e => e.company.toLowerCase() === exp.company.toLowerCase() && 
                 e.position.toLowerCase() === exp.position.toLowerCase()
          );
          return {
            ...exp,
            description: refinedExp ? refinedExp.description : exp.description
          };
        });
      }

      if (parsedRefine.projects) {
        currentTailoredResume.projects = currentTailoredResume.projects.map(proj => {
          const refinedProj = parsedRefine.projects.find(
            p => p.name.toLowerCase() === proj.name.toLowerCase()
          );
          return {
            ...proj,
            description: refinedProj ? refinedProj.description : proj.description
          };
        });
      }
    }

    // 5. Save the final optimized Resume in the database
    const tailoredResume = await Resume.create(currentTailoredResume);

    // 6. Generate cover letter based on the finalized optimized resume
    const coverLetterPrompt = `You are an expert career coach. Write a customized, highly professional, and compelling cover letter for the candidate applying for the ${jobTitle} role at ${company}.
Use the candidate's tailored resume credentials:
Summary: ${currentTailoredResume.professional_summary}
Skills: ${currentTailoredResume.skills.join(", ")}
Experience: ${currentTailoredResume.experience.map(e => `${e.position} at ${e.company}: ${e.description}`).join("\n")}

And target Job Description:
${jobDescription}

Format the letter nicely with standard greeting, introduction, 2 body paragraphs connecting their experience to the job requirements, and a professional closing. Do not include personal contact placeholders in the header, just start directly with the formal greeting. Return ONLY the letter content.`;

    const coverLetterResponse = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: "You write outstanding cover letters. Only return the letter text itself." },
        { role: "user", content: coverLetterPrompt }
      ]
    });

    const coverLetterText = coverLetterResponse.choices[0].message.content;

    // 7. Create the CRM Job Application entry with self-correction history logged in the notes
    const application = await JobApplication.create({
      userId,
      jobTitle,
      company,
      status: "Tailored",
      resumeId: tailoredResume._id,
      coverLetter: coverLetterText,
      jobUrl: jobUrl || "",
      notes: `Automated ATS Self-Correction completed.
Iterations: ${iterations}
Final ATS Match Score: ${currentScore}%

History Log:
${finalFeedbackLog.map(log => `- Iteration ${log.iteration}: Score ${log.score}% (Missing: ${log.missingKeywords.slice(0, 5).join(", ")}...)`).join("\n")}`
    });

    return res.status(201).json({
      message: "Resume tailored and CRM application entry created successfully!",
      application,
      tailoredResumeId: tailoredResume._id
    });
  } catch (error) {
    console.error("Resume Tailoring Error:", error);
    return res.status(500).json({
      message: "Failed to tailor resume and create CRM entry.",
      error: error.message,
    });
  }
};

// --- GET ALL CRM APPLICATIONS ---
export const getApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const applications = await JobApplication.find({ userId })
      .populate("resumeId", "title updatedAt template")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Get Applications Error:", error);
    return res.status(500).json({
      message: "Failed to retrieve job applications.",
      error: error.message,
    });
  }
};

// --- UPDATE CRM APPLICATION STATUS / NOTES ---
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.userId;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const application = await JobApplication.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateFields },
      { new: true }
    ).populate("resumeId", "title updatedAt template");

    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized." });
    }

    return res.status(200).json({
      message: "Application updated successfully!",
      application,
    });
  } catch (error) {
    console.error("Update Application Error:", error);
    return res.status(500).json({
      message: "Failed to update application.",
      error: error.message,
    });
  }
};

// --- DELETE CRM APPLICATION ---
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const application = await JobApplication.findOneAndDelete({ _id: id, userId });
    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized." });
    }

    return res.status(200).json({
      message: "Application deleted successfully from CRM.",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);
    return res.status(500).json({
      message: "Failed to delete application.",
      error: error.message,
    });
  }
};
