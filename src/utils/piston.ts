import axios from "axios"

// Map your frontend language names to Piston's specific versions
// You can check Piston docs for latest versions: https://emkc.org/api/v2/piston/runtimes
const RUNTIME_CONFIG: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  go: { language: "go", version: "1.16.2" }
};

export const executeCode = async (language: string, code: string, input: string) => {
  const config = RUNTIME_CONFIG[language.toLowerCase()];

  if (!config) {
    throw new Error(`Language ${language} is not supported or configured.`);
  }

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language: config.language,
      version: config.version,
      files: [{ content: code }],
      stdin: input, // Inject the test case input here
    });

    return response.data; // Returns { run: { stdout: "...", stderr: "..." } }
  } catch (error) {
    console.error("Piston API Error:", error);
    throw new Error("Code execution service failed");
  }
};