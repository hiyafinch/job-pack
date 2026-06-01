// Pipes and Filters — each function is one filter in the pipeline.
// pipeline(context) passes the context object through each stage in sequence.

export async function pipeline(stages, initialContext) {
  let context = initialContext;
  for (const stage of stages) {
    context = await stage(context);
  }
  return context;
}

// Filter 1: build a tailored prompt for the given artifact type
export function buildPrompt(artifactType) {
  return (ctx) => {
    const { jobDescription, candidateProfile } = ctx;

    const prompts = {
      resume: `You are a professional resume writer. Given the job description and candidate profile below, produce a tailored resume in plain text format.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${candidateProfile}

Produce ONLY the resume content. Use clear sections: Summary, Experience, Skills, Education.`,

      coverLetter: `You are an expert cover letter writer. Given the job description and candidate profile below, write a compelling, concise cover letter (3–4 paragraphs) addressed to the hiring company.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${candidateProfile}

Produce ONLY the cover letter text.`,

      infographic: `You are a career research analyst. Given the job description below, produce a JSON object with two keys: "pros" (array of 4–6 reasons this company/role is attractive) and "cons" (array of 3–5 potential drawbacks or risks). Be specific and honest.

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY valid JSON. Example: {"pros":["..."],"cons":["..."]}`,
    };

    return { ...ctx, prompt: prompts[artifactType] };
  };
}

// Filter 2: send the prompt to the LLM adapter
export function callLLM(llmBackend) {
  return async (ctx) => {
    const rawText = await llmBackend.generate(ctx.prompt);
    return { ...ctx, rawText };
  };
}

// Filter 3: parse the LLM response
export function parseResponse(artifactType) {
  return (ctx) => {
    let parsed = ctx.rawText.trim();

    if (artifactType === 'infographic') {
      // Extract JSON from response
      const match = parsed.match(/\{[\s\S]*\}/);
      if (!match) {
        parsed = { pros: ['Unable to parse pros'], cons: ['Unable to parse cons'] };
      } else {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = { pros: ['Parse error'], cons: ['Parse error'] };
        }
      }
    }

    return { ...ctx, parsed };
  };
}
