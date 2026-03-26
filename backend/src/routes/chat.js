import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const chatRouter = express.Router();

function getGeminiModel() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
}

function safeString(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function normalize(s) {
  return safeString(s).toLowerCase().trim();
}

/* ------------------ NEW: GREETING DETECTION ------------------ */
function detectGreeting(q) {
  if (!q) return null;

  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(q)) {
    return "Hello! 👋 I can help you with medicine information. Please tell me the name of a medicine.";
  }

  if (/\b(thank you|thanks|thx)\b/i.test(q)) {
    return "You're welcome! 😊 Let me know if you need information about any medicine.";
  }

  if (/\b(bye|goodbye|see you)\b/i.test(q)) {
    return "Goodbye! 👋 Stay safe and feel free to come back anytime.";
  }

  if (/\b(how are you)\b/i.test(q)) {
    return "I'm here and ready to help you with medicine information 😊";
  }

  return null;
}

/* ------------------ MEDICINE DETECTION ------------------ */
function detectMedicine(question) {
  const q = normalize(question);

  const rules = [
    { key: 'paracetamol', label: 'Paracetamol', regex: /\b(paracetamol|acetaminophen)\b/i },
    { key: 'ibuprofen', label: 'Ibuprofen', regex: /\b(ibuprofen|advil|nurofen)\b/i },
    { key: 'amoxicillin', label: 'Amoxicillin', regex: /\b(amoxicillin|amoxil)\b/i },
    { key: 'ceftriaxone', label: 'Ceftriaxone', regex: /\b(ceftriaxone|rocephin)\b/i },
    { key: 'azithromycin', label: 'Azithromycin', regex: /\b(azithromycin|zithromax)\b/i },
    { key: 'ciprofloxacin', label: 'Ciprofloxacin', regex: /\b(ciprofloxacin|cipro)\b/i },
    { key: 'omeprazole', label: 'Omeprazole', regex: /\b(omeprazole|prilosec)\b/i },
    { key: 'metronidazole', label: 'Metronidazole', regex: /\b(metronidazole|flagyl)\b/i },
  ];

  for (const r of rules) {
    if (r.regex.test(q)) return r;
  }
  return null;
}

/* ------------------ RESPONSES ------------------ */
function buildGenericResponse(medicine) {
  const label = medicine.label;
  return {
    medicine: label,
    usage:
      `Used for general treatment of symptoms/conditions as prescribed by a clinician for ${label}.`,
    how_to_use:
      `Take/use ${label} exactly as directed on the label or by your healthcare professional.`,
    common_side_effects:
      'Common effects include nausea, stomach upset, headache, dizziness, or mild diarrhea.',
    serious_side_effects:
      'Seek urgent medical care for severe allergic reactions or unusual symptoms.',
    interactions:
      'May interact with other medicines, alcohol, or supplements.',
    disclaimer:
      'This information is for educational purposes only. Please consult a healthcare professional.',
  };
}

function buildMedicineResponse(medicine) {
  const key = medicine.key;

  if (key === 'paracetamol') {
    return {
      medicine: 'Paracetamol',
      usage: 'Used to reduce pain and fever.',
      how_to_use:
        'Take as directed. Avoid overdose or combining with similar medicines.',
      common_side_effects: 'Usually well tolerated, may cause nausea.',
      serious_side_effects:
        'Liver damage if overdosed. Seek help if symptoms appear.',
      interactions:
        'Avoid alcohol and other paracetamol-containing drugs.',
      disclaimer:
        'This information is for educational purposes only. Please consult a healthcare professional.',
    };
  }

  if (key === 'ibuprofen') {
    return {
      medicine: 'Ibuprofen',
      usage: 'Used for pain, inflammation, and fever.',
      how_to_use:
        'Take with food. Avoid long-term use without medical advice.',
      common_side_effects: 'Stomach pain, nausea, dizziness.',
      serious_side_effects:
        'Bleeding, kidney issues, or allergic reactions.',
      interactions:
        'Avoid combining with NSAIDs or blood thinners.',
      disclaimer:
        'This information is for educational purposes only. Please consult a healthcare professional.',
    };
  }

  return buildGenericResponse(medicine);
}

function formatFallbackContent(payload) {
  if (!payload) return "Please tell me the name of a medicine you want to know about.";
  if (typeof payload === "string") return payload;
  const lines = [];
  if (payload.medicine) lines.push(`Medicine: ${payload.medicine}`);
  if (payload.usage) lines.push(`Usage: ${payload.usage}`);
  if (payload.how_to_use) lines.push(`How to use: ${payload.how_to_use}`);
  if (payload.common_side_effects) lines.push(`Common side effects: ${payload.common_side_effects}`);
  if (payload.serious_side_effects) lines.push(`Serious side effects: ${payload.serious_side_effects}`);
  if (payload.interactions) lines.push(`Interactions: ${payload.interactions}`);
  if (payload.disclaimer) lines.push(`Note: ${payload.disclaimer}`);
  return lines.join("\n");
}

/* ------------------ MAIN ROUTE ------------------ */
chatRouter.post("/", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    const lastMessage = messages[messages.length - 1].content;

    // 1️⃣ Check for greetings
    const greetingResponse = detectGreeting(lastMessage);
    if (greetingResponse) return res.json({ content: greetingResponse });

    // 2️⃣ Try Google Gemini first
    try {
      const model = getGeminiModel();
      if (!model) {
        throw new Error("Missing GOOGLE_API_KEY");
      }
      const userText = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      const result = await model.generateContent(userText);
      const response = await result.response;
      const aiMessage = response.text();

      return res.json({ content: aiMessage });

    } catch (aiErr) {
      const msg = aiErr && typeof aiErr === "object" && "message" in aiErr ? aiErr.message : String(aiErr);
      console.error("Gemini failed, using fallback:", msg);

      // Optional: detect quota exceeded
      if (aiErr && typeof aiErr === "object" && aiErr.status === 429) {
        console.warn("Quota exceeded. Using fallback response.");
      }

      // 3️⃣ Fallback: hand-coded medicine detection
      const medicine = detectMedicine(lastMessage);
      const fallbackResponse = medicine
        ? buildMedicineResponse(medicine)
        : {
            medicine: "",
            usage: "Please tell me the name of a medicine you want to know about.",
            how_to_use: "",
            common_side_effects: "",
            serious_side_effects: "",
            interactions: "",
            disclaimer:
              "This information is for educational purposes only. Please consult a healthcare professional.",
          };

      return res.json({ content: formatFallbackContent(fallbackResponse) });
    }

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ content: "AI is currently unavailable. Please try again later." });
  }
});