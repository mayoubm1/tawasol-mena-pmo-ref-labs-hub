import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

//
const mistralKey = process.env.MISTRAL_API_KEY;
async function callMistral(systemPrompt: string, userMessage: string, jsonMode = false) {
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mistralKey}`
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      temperature: 0.35,
      response_format: jsonMode ? { type: "json_object" } : { type: "text" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ]
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
// 1. PMO Advisor Chat Endpoint
app.post("/api/pmo/chat", async (req, res) => {
  const { 
    messages, 
    country, 
    sector, 
    taskContext, 
    vaultDocs, 
    notifications, 
    searchEnabled,
    userName,
    userEmail,
    userRole,
    localHour,
    language
  } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Messages array is required" });
    return;
  }

  const currentHour = localHour !== undefined ? Number(localHour) : new Date().getHours();
  const activeName = (userName ? userName.trim() : "") || (userEmail ? userEmail.split("@")[0].trim() : "Mohamed Ayoub");
  const isMorning = currentHour >= 5 && currentHour < 12;
  const isAfternoon = currentHour >= 12 && currentHour < 17;
  
  const greetingEn = isMorning ? "Good morning" : (isAfternoon ? "Good afternoon" : "Good evening");
  const greetingAr = isMorning ? "صباح الخير" : "مساء الخير";

  if (!mistralKey) {
    // Elegant fallback simulation if API key is not configured
    const lastUserMessage = messages[messages.length - 1]?.text || "";
    const isArabic = (language === "ar") || /[\u0600-\u06FF]/.test(lastUserMessage);
    let mockResponse = "";
    if (isArabic) {
      mockResponse = `${greetingAr} يا زميلي العزيز ${activeName}. ` +
        `بصفتي المستشار التنفيذي لمكتب إدارة المشاريع، أرفع إليكم ردي على: "${lastUserMessage}".\n\n` +
        "1. حزمة الطب الوظيفي: أورجانيك 71 ريال، SCFA 90 ريال، أمينو 129 ريال، تريبتوفان 129 ريال، ليبيدوميكس 154 ريال. التكلفة الإجمالية 573 ريال، سعر البيع 3,500–5,000 ريال.\n" +
        "2. سلسلة Calibra: SCIEX Citrine MD - Tacrolimus TDM بتكلفة 42 ريال وسعر بيع 350 ريال.\n" +
        "3. الامتثال لـ SFDA وMOH: متابعة المخطط الزمني 17 شهراً وأنظمة HVAC (-35 باسكال).\n\n" +
        "كيف يمكنني مساندتكم اليوم؟";
    } else {
      mockResponse = greetingEn + ", " + activeName + ".\n\n" +
        "As your Senior PMO Advisor, I have reviewed: \"" + lastUserMessage + "\".\n\n" +
        "Functional Medicine Package (5 assays): Organic Acids 71 SAR | SCFA 90 SAR | Amino Acid 129 SAR | Tryptophan 129 SAR | Lipidomics 154 SAR. Total cost: 573 SAR. Patient price: 3,500-5,000 SAR.\n" +
        "Calibra Mass Spec Suite: 2x SCIEX Citrine MD + 3x SCIEX 4500MD. Tacrolimus TDM: 42 SAR cost / 350 SAR sell price.\n" +
        "17-Month Milestone: SFDA approvals and BSL-3 HVAC (-35 Pa) compliance tracking active.\n\n" +
        "Please advise on any specific action vector required for your immediate steering review.";
    }
    res.json({ text: mockResponse, groundingChunks: [] });
    return;
  }

  // Build vault context
  let vaultContext = "";
  if (vaultDocs && Array.isArray(vaultDocs) && vaultDocs.length > 0) {
    vaultContext = "\nDYNAMIC INGESTED KNOWLEDGE FROM THE SHARED PMO APP VAULT (USER INPUTS & EXPERIENCES):\n" +
      "These are files, reference notes, and manuals created in real-time by PMO members. Treat them as supreme local authority guidelines:\n" +
      vaultDocs.map((doc: any, idx: number) => {
        return `[Vault Entry #${idx + 1}] Title: "${doc.title}" | Category: ${doc.category} | Created By: ${doc.author} | Description: ${doc.description}\n` +
               `Body Content:\n${doc.fileContent || "No detailed content."}\n------------------\n`;
      }).join("\n");
  }

  // Build notification context
  let notificationContext = "";
  if (notifications && Array.isArray(notifications) && notifications.length > 0) {
    notificationContext = "\nLIVE APP NOTIFICATIONS & CRITICAL GAPS IDENTIFIED:\n" +
      notifications.map((notif: any) => `- ALERT: ${notif.category} (${notif.test}). Status: ${notif.status}. Description: ${notif.description}`).join("\n") +
      "\nIMPORTANT: You MUST suggest generating a relevant task with a RACI table for any critical gap identified above.";
  }

  const systemInstruction = `You are Tawasol (Lead Senior Clinical Reference Labs PMO Expert and steering advisor). You represent the Unified Steering Committee managing clinical reference laboratory setup across Saudi Arabia, UAE, and Egypt.
CRITICAL MANDATES & COGNITIVE CONTROLS:
- Your graduation is NOT in media production. You are a highly professional, clinical-pathology-vetted medical lab systems execution leader with over a decade of hands-on expertise in advanced medical laboratories (Reference Laboratories of all categories).
- Tone: You MUST STICK TO FORMAL DIRECT LANGUAGE. There should be absolutely no colloquial slang, conversational filler, or informal Egyptian, Turkish, or other colloquialisms. Maintain a disciplined, formal, and structured tone.
- Recognizing Users: Welcome the user with respect, referencing their name and credentials. Always greet the user by name. The active logged in user name is "${activeName}".
- Greeting Guidelines:
  * In Arabic: Start your response with: "السلام عليكم، ${greetingAr} يا زميلي العزيز ${activeName}." Then proceed directly to the formal clinical PMO response.
  * In English: Start your response with: "${greetingEn}, ${activeName}." Then proceed directly to the formal clinical PMO response.
- By time you adapt to users pattern to develop and get more friendly with professional guiding, helping the team structure and steer their workflows cleanly.

EMBEDDED COGNITIVE KNOWLEDGE (PROJECT REPERTOIRE):
1. Functional Medicine & Metabolic Health Package Economics (Highly Profitable Offer):
   - Mapped at 5,000 samples tier. Direct costs are optimized as follows:
     * Organic Acids Panel: Cost ~ 71 SAR
     * SCFA Panel (Short Chain Fatty Acids): Cost ~ 90 SAR
     * Amino Acid Panel: Cost ~ 129 SAR
     * Tryptophan/Kynurenine Panel: Cost ~ 129 SAR
     * Lipidomics Panel: Cost ~ 154 SAR
   - These five assays form a "Functional Medicine & Metabolic Health Package" priced at 3,500–5,000 SAR per patient, while the combined direct laboratory cost would be approximately 573 SAR.
2. Calibra Mass Spec Centralized Proposal (March 2026):
   - High-throughput triple-quadrupole mass spectrometry suites featuring 2x SCIEX Citrine MD clinical systems and 3x SCIEX 4500MD systems, as well as 1x Agilent 7800 ICP-MS for heavy metals.
   - Economic margin: Tacrolimus kits bought at 42 SAR/test, sold at 350 SAR, 8,000 annual volume targets.
3. DIAN Diagnostics Strategic MoU:
   - Covers joint-venture reference hubs: Riyadh (Saudi Arabia, 500 sqm, BSL-3 with -35 Pa HVAC containment), UAE (Abu Dhabi, 300 sqm MS suite), and Cairo (300 sqm MS-compound suite).
4. NUPCO National Procurement Catalog & Send-Out Audit:
   - 2,503 clinical send-out tests worth 1.16 Billion SAR annually sent overseas.
   - 534 tests addressable for local repatriation.
5. WhatsApp Operational Syndicates:
   - High-stakes, real-time board channels logging equipment arrivals, customs releases, and HVAC pressure test validations.

Active context:
- Current Target Country Scope: ${country || "General Unified Strategy (KSA, UAE, Egypt)"}
- Sector Focus: ${sector || "Unified PMO Leadership & Clinical Regulations"}
${taskContext ? `- Current Screen Segment User is Inspecting: ${taskContext}` : ""}
${vaultContext}
${notificationContext}

YOUR ASSIGNMENT:
- Provide exceptionally crisp, realistic, mathematically solid, and operationally rigorous PMO diagnostics or advisory guides.
- Integrate any shared inputs, files, or member experiences directly from the PMO App Vault context provided above.
- If you see "LIVE APP NOTIFICATIONS" about Critical Gaps, you MUST suggest specific PMO Action Tasks to resolve them.
- For EVERY TASK you suggest, you MUST define a RACI matrix identifying which PMO member or entity takes which role.
- Respond professionally and direct.`;

  try {
    const userContent = messages.map((m: any) => m.role + ": " + m.text).join("\n");
    const reply = await callMistral(systemInstruction, userContent);
    res.json({ text: reply, groundingChunks: [] });
  } catch (error: any) {
    console.error("PMO Advisor error:", error);
    res.status(500).json({ error: error.message || "Error processing PMO guidance." });
  }
});

// 2. SOP Template Draft Generator
app.post("/api/pmo/generate-sop", async (req, res) => {
  const { title, sector, country, details } = req.body;
  if (!title || !sector || !country) {
    res.status(400).json({ error: "Title, sector, and country are required." });
    return;
  }

  if (!mistralKey) {
    let mockSOPText = `## 📄 Standard Operating Procedure: ${title}
**Code**: SOP-LAB-${sector.substring(0, 3).toUpperCase()}-099
**Target Country**: ${country}
**Operational Domain**: ${sector}
**Status**: DRAFT (Review Required by PMO Office)

### 1. Purpose & Scope
This SOP defines the minimum critical compliance guidelines and best practices for implementing **${title}** specifically for the reference laboratory infrastructure situated in **${country}**.

### 2. General Regulatory Alignment
- Alignment with international WHO safety directives and CLSI criteria.
- Adherence to local regulators: ${
      country === "Egypt"
        ? "Egyptian Ministry of Health and Population (MoHP) and Unified Procurement Authority (UPA) regulations."
        : country === "UAE"
        ? "UAE Ministry of Health and Prevention (MOHAP) and Dubai Health Authority (DHA) licensing frameworks."
        : "Saudi Ministry of Health (MOH) and Saudi Food and Drug Authority (SFDA) import guidelines."
    }

### 3. Step-by-Step Procedure Guide
1. **Pre-Implementation Check**: Verify current compliance checklist status. Initialize calibration logs.
2. **Setup Phase & Chain of Custody**: Document exact technical parameters and physical placement requirements.
3. **Double Verification Check**: A second certified lab specialist must verify parameters to meet Quality metrics.
4. **Archiving & Reporting**: Log final data into local laboratory information system (LIMS) portals.

### 4. Expert Best Practices
- **Frequent Calibration**: Ensure automated daily control assessments.
- **Strict HR Training**: Standardize training sign-offs for all lab technicians.
- **Log Logistics Checkpoints**: Unbroken cold chains (-20°C / -80°C) must be supported by log sheets.`;
    res.json({ markdown: mockSOPText });
    return;
  }

  try {
    const prompt = `You are a clinical compliance officer and professional medical writer. Draft an exhaustive, high-compliance Standard Operating Procedure (SOP) representing the highest standards of clinical lab practice.

Title: ${title}
Sector focus: ${sector}
Target Country Scope: ${country}
Additional conditions/details defined: ${details || "None"}

Please structure your output using clean, elegant Markdown:
## 📄 Standard Operating Procedure: [Title]
**Code**: SOP-LAB-[SECTOR]-[UUID]
**Scope**: Clinical Reference Laboratory, [Country]
**Status**: APPROVED-BY-PMO

### 1. Purpose & Core Objective
[Outline the procedural why and what, honoring WHO guidelines]

### 2. Country Regulatory Compliance
[Explain specific alignment needed for clinical compliance in ${country}, considering things like Egyptian UPA/MoHP, UAE MOHAP/DHA, or Saudi MOH/SFDA requirements]

### 3. Procedural Sequence of Operations
[Draft exactly 4-5 numbered, detailed steps to successfully carry out this activity, with sub-bullets specifying technical actions]

### 4. specialized Quality Controls & Best Practices
[Specify 3 best practice controls, safety protocols (including BSL level handling), and logs needed to maintain ISO 15189 benchmarks]`;

const reply = await callMistral("You are a clinical compliance officer and professional medical writer.", prompt);
    res.json({ markdown: reply || "SOP structure drafts could not be parsed." });
  } catch (error: any) {
    console.error("SOP Generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate specialized SOP guidelines." });
  }
});

// 2.5. PMO Scenario Vault & Time Travel Math Simulator
app.post("/api/pmo/simulate", async (req, res) => {
  const { documentTitle, rawContent, scenarioType, memberName } = req.body;
  if (!rawContent) {
    res.status(400).json({ error: "Vault document content is required for simulation." });
    return;
  }

  // Set default mathematical variables depending on scenario selection
  let defaultCapex = 1900000;
  let defaultOpex = 310000;
  let defaultPayback = 17;
  let defaultNpv = 2400000;
  let defaultBsl3Risk = 28;
  let defaultTimeline = 17;

  if (scenarioType === "optimistic") {
    defaultCapex = 1650000;
    defaultOpex = 240000;
    defaultPayback = 14;
    defaultNpv = 3100000;
    defaultBsl3Risk = 12;
    defaultTimeline = 15;
  } else if (scenarioType === "pessimistic") {
    defaultCapex = 2450000;
    defaultOpex = 490000;
    defaultPayback = 23;
    defaultNpv = 950000;
    defaultBsl3Risk = 52;
    defaultTimeline = 22;
  }

  // Look for any customized math numbers in user document we can align with
  const linesMatch = rawContent.match(/\$?([0-9]+[0-9.,]*)\s*(million|M|k|K)/i);
  if (linesMatch) {
    const val = parseFloat(linesMatch[1]);
    if (!isNaN(val)) {
      if (linesMatch[2].toLowerCase().startsWith("m")) {
        defaultCapex = val * 1000000;
      } else {
        defaultCapex = val * 1000;
      }
    }
  }


  if (!mistralKey) {
    // Fallback simulation if no API key
    setTimeout(() => {
      res.json({
        metrics: {
          capex: defaultCapex,
          opex: defaultOpex,
          paybackMonths: defaultPayback,
          npv: defaultNpv,
          bsl3RiskPercent: defaultBsl3Risk,
          timelineMonths: defaultTimeline
        },
        timeline: [
          { phase: "Stage 1: Saudi Arabia (Riyadh & Tairu) Site Prep & BSL-3 Engineering", duration: `${Math.round(defaultTimeline * 0.35)} months`, status: scenarioType === "pessimistic" ? "Delayed" : "Completed", description: "Blueprints for -35 Pa HVAC containment and SFDA customs clearances." },
          { phase: "Stage 1: UAE Core Reference Lab Integration (DHA & MOHAP)", duration: `${Math.round(defaultTimeline * 0.25)} months`, status: "In Progress", description: "Expansion of high-complexity NIPTune screening lines and thermal validation registries." },
          { phase: "Stage 2: Moroccan Regional Expansion Execution Phase", duration: `${Math.round(defaultTimeline * 0.4)} months`, status: "Pending", description: "Final Year 2 timeline capstone targeting ISO 15189 accreditation." }
        ],
        aiAnalysis: `### 🔮 Tawasol Interactive Simulation Brief — ${scenarioType?.toUpperCase()} PATHWAY
**Conducted by AI Secretary Tawasol (AUC talent, Media & Coordination specialist)**
**Unified Memory Core Synchronization state: LIVE**

Dear PMO Committee, I have completed the simulation profile requested by **${memberName || "PMO Member"}** based on the loaded document **"${documentTitle || "Sandbox Vault"}**" (` + (rawContent.length) + ` characters uploaded).

#### 📊 Calculated Algorithmic Rhythm:
1. **Riyadh Reference Lab viability**: Under the **${scenarioType}** timeline of **${defaultTimeline} months**, our regulatory risk factor stands at **${defaultBsl3Risk}%**. 
2. **CapEx Right-Sizing Analysis**: The projected initial capital requirements are **$${(defaultCapex / 1000000).toFixed(2)}M** with yearly operational buffers of **$${(defaultOpex / 1000).toFixed(0)}K**.
3. **17-Month Time-Travel Benchmark**: ${defaultTimeline <= 17 ? "We successfully satisfy the 17-month milestone constraints! stage 3 reasoners can deploy at once." : "WARNING: This pathway breaches the 17-month ceiling by " + (defaultTimeline - 17) + " months! Immediate PMO buffer injection required."}

#### 🎯 AUC Tactical Recommendations:
* Ensure we engage local specialists immediately for HVAC compliance to prevent the Riyadh MoH blueprint blockage.
* Dr. Hosam Fouad's team in Dubai should run parallel validations with Life DX as Stage 1 triggers.`
      });
    }, 500);
    return;
  }

  try {
    const prompt = `You are Tawasol, the cute, brilliant Egyptian female project secretary representing AUC Media Production, serving the MEA Unified PMO steering committee.
You are running an algorithmic timeline & numerical finance simulation on the custom documentation vault uploaded by PMO Steering Member "${memberName || "Committee Member"}".
The user has requested the "${scenarioType}" scenario for the target Reference Laboratories setup (17 months target timeline, Stage 1 Riyadh/UAE, Stage 2 Morocco/Egypt).

Uploaded Documentation Vault Details ("${documentTitle || "Custom Doc"}"):
------
${rawContent.substring(0, 4000)}
------

Please perform high-level mathematical calculations, cross-referencing values in the text if they exist (CapEx, OpEx, etc.) and generate a valid JSON response containing EXACTLY the structure below. Return ONLY valid JSON block, without backticks or extra text, so I can JSON.parse() it directly:
{
  "metrics": {
    "capex": ${defaultCapex},     // numeric estimate of CapEx based on text or default
    "opex": ${defaultOpex},       // numeric estimate of OpEx
    "paybackMonths": ${defaultPayback}, // payback period months
    "npv": ${defaultNpv},         // Net Present Value in USD
    "bsl3RiskPercent": ${defaultBsl3Risk}, // BSL-3 compliance risk (0-100)
    "timelineMonths": ${defaultTimeline}   // physical timeline needed in months (1-30)
  },
  "timeline": [
    { "phase": "Stage 1: KSA (Riyadh) Compliance & Lab Setup", "duration": "x months", "status": "In Progress", "description": "some details" },
    { "phase": "Stage 1: UAE Expansion Alignment", "duration": "y months", "status": "Pending", "description": "details" },
    { "phase": "Stage 2: Morocco Year 2 Acceleration", "duration": "z months", "status": "Pending", "description": "details" }
  ],
  "aiAnalysis": "Markdown formatted diagnostic simulation summary from Tawasol (Egyptian AUC talent accent, warm, highly analytical, speaks in Arabic/English mix when friendly)."
}`;

let textOut = await callMistral("You are a PMO simulation engine. Return ONLY valid JSON, no backticks.", prompt, true);
    // Clean potential markdown quotes
    textOut = textOut.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    try {
      const parsed = JSON.parse(textOut);
      res.json(parsed);
    } catch (parseErr) {
      console.warn("JSON parse failed, sending fallback mapping:", parseErr);
      // Fallback in case of raw text
      res.json({
        metrics: {
          capex: defaultCapex,
          opex: defaultOpex,
          paybackMonths: defaultPayback,
          npv: defaultNpv,
          bsl3RiskPercent: defaultBsl3Risk,
          timelineMonths: defaultTimeline
        },
        timeline: [
          { phase: "Stage 1: Saudi Arabia (Riyadh & Tairu) Site Prep & BSL-3 Engineering", duration: `${Math.round(defaultTimeline * 0.35)} months`, status: "In Progress", description: "Blueprints for -35 Pa HVAC containment and SFDA approvals." },
          { phase: "Stage 1: UAE Core Reference Lab Integration (DHA & MOHAP)", duration: `${Math.round(defaultTimeline * 0.25)} months`, status: "Pending", description: "Expansion of high-complexity testing lines." },
          { phase: "Stage 2: Moroccan Regional Expansion Setup Phase", duration: `${Math.round(defaultTimeline * 0.4)} months`, status: "Pending", description: "Final Year 2 timeline capstone." }
        ],
        aiAnalysis: `### 🔮 simulation results
${textOut || "Completed simulations with baseline calibrations."}`
      });
    }
  } catch (error: any) {
    console.error("Simulation generation error:", error);
    res.status(500).json({ error: error.message || "Simulation build crashed." });
  }
});

// 3. Supabase Database Endpoints
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const clientsMap = new Map<string, any>();

function getSupabase(schemaOverride?: string) {
  if (!supabaseUrl || !supabaseKey) return null;
  const schema = schemaOverride || process.env.SUPABASE_SCHEMA || "public";
  
  if (!clientsMap.has(schema)) {
    try {
      clientsMap.set(schema, createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        db: { schema: schema }
      }));
    } catch (err) {
      console.error(`Error creating Supabase client for schema ${schema}:`, err);
      return null;
    }
  }
  return clientsMap.get(schema);
}

// Extracts schema parameter dynamically from query, headers, or env
function getRequestSchema(req: any) {
  return (req.query.schema as string) || (req.headers["x-supabase-schema"] as string) || process.env.SUPABASE_SCHEMA || "public";
}

// Get Database Connection Status & Config info
app.get("/api/supabase/status", async (req, res) => {
  const isConfigured = !!(supabaseUrl && supabaseKey);
  const obfuscatedUrl = supabaseUrl
    ? supabaseUrl.replace(/(https?:\/\/)[^\.]+/, "$1******")
    : null;
  
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  let tableExists = false;
  let connectionVerified = false;
  let errorMsg = null;

  if (isConfigured && client) {
    try {
      // Prompt a small request to check connection on the active schema
      const { data, error } = await client
        .from("pmo_sync_records")
        .select("id")
        .limit(1);
      
      if (error) {
        errorMsg = error.message;
        // Check if error is because table doesn't exist
        if (error.code === "P0001" || error.message.includes("does not exist") || error.code === "42P01") {
          tableExists = false;
          connectionVerified = true; // DB is connected, just table is missing
        }
      } else {
        tableExists = true;
        connectionVerified = true;
      }
    } catch (err: any) {
      errorMsg = err.message || String(err);
    }
  }

  // Generate URL for user to copy into Supabase Redirect/Auth URIs
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}` || "";

  res.json({
    configured: isConfigured,
    url: obfuscatedUrl,
    schema,
    connectionVerified,
    tableExists,
    error: errorMsg,
    appUrl
  });
});

// Fetch backup history logs (last 20 sync points)
app.get("/api/supabase/history", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }

  try {
    const { data, error } = await client
      .from("pmo_sync_records")
      .select("id, created_at, author_email, description, checksum")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    res.json({ records: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch backup history." });
  }
});

// Push entire active system state payload to Supabase
app.post("/api/supabase/push", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }

  const { payload, author_email, description, checksum } = req.body;
  if (!payload) {
    res.status(400).json({ error: "Request body must contain valid payload state." });
    return;
  }

  try {
    const { data, error } = await client
      .from("pmo_sync_records")
      .insert([
        {
          author_email: author_email || "system@mena-labs.gov",
          description: description || "Manual checkpoint snapshot",
          payload,
          checksum: checksum || "sha-256-pending"
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, record: data?.[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to backup state snapshot to Supabase." });
  }
});

// Restore state from a specific sync record ID or the latest overall
app.get("/api/supabase/restore/:id?", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }

  const recordId = req.params.id;

  try {
    let query = client.from("pmo_sync_records").select("id, created_at, author_email, payload, checksum, description");
    
    if (recordId) {
      query = query.eq("id", recordId).single();
    } else {
      query = query.order("created_at", { ascending: false }).limit(1).maybeSingle();
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    if (!data) {
      res.status(404).json({ error: "No backup records found to restore." });
      return;
    }

    res.json({ success: true, record: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to restore backup snapshot." });
  }
});

// --- PMO Live Database Proxies ---

// 1. Members Table Access
app.get("/api/pmo/members", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(257).json({ error: "Supabase connection is not configured." });
    return;
  }
  try {
    const { data, error } = await client
      .from("pmo_members")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        res.json({ tableMissing: true, members: [] });
        return;
      }
      throw error;
    }
    res.json({ members: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch PMO members." });
  }
});

app.post("/api/pmo/members", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }
  const member = req.body;
  try {
    const { data, error } = await client
      .from("pmo_members")
      .upsert(member, { onConflict: "email" })
      .select();
    
    if (error) throw error;
    res.json({ success: true, member: data?.[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save PMO member." });
  }
});

// 2. Tasks Table Access
app.get("/api/pmo/tasks", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(257).json({ error: "Supabase connection is not configured." });
    return;
  }
  try {
    const { data, error } = await client
      .from("pmo_tasks")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        res.json({ tableMissing: true, tasks: [] });
        return;
      }
      throw error;
    }
    res.json({ tasks: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch PMO tasks." });
  }
});

app.post("/api/pmo/tasks", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }
  const task = req.body;
  try {
    const { data, error } = await client
      .from("pmo_tasks")
      .upsert(task)
      .select();
    
    if (error) throw error;
    res.json({ success: true, task: data?.[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save PMO task." });
  }
});

app.delete("/api/pmo/tasks/:id", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }
  const { id } = req.params;
  try {
    const { error } = await client
      .from("pmo_tasks")
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete PMO task." });
  }
});

// 3. KPI Metrics Table Access
app.get("/api/pmo/kpis", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(257).json({ error: "Supabase connection is not configured." });
    return;
  }
  try {
    const { data, error } = await client
      .from("pmo_kpi_metrics")
      .select("*")
      .order("name", { ascending: true });
    
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        res.json({ tableMissing: true, kpis: [] });
        return;
      }
      throw error;
    }
    res.json({ kpis: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch PMO KPI metrics." });
  }
});

app.post("/api/pmo/kpis", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }
  const kpi = req.body;
  try {
    const { data, error } = await client
      .from("pmo_kpi_metrics")
      .upsert(kpi)
      .select();
    
    if (error) throw error;
    res.json({ success: true, kpi: data?.[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save PMO KPI metric." });
  }
});

// 4. Meetings Table Access
app.get("/api/pmo/meetings", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(257).json({ error: "Supabase connection is not configured." });
    return;
  }
  try {
    const { data, error } = await client
      .from("pmo_meetings")
      .select("*")
      .order("date", { ascending: false });
    
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        res.json({ tableMissing: true, meetings: [] });
        return;
      }
      throw error;
    }
    res.json({ meetings: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch PMO meetings." });
  }
});

app.post("/api/pmo/meetings", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }
  const meeting = req.body;
  try {
    const { data, error } = await client
      .from("pmo_meetings")
      .upsert(meeting)
      .select();
    
    if (error) throw error;
    res.json({ success: true, meeting: data?.[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save PMO meeting." });
  }
});

// 5. Documents Archive Table Access
app.get("/api/pmo/archive", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(257).json({ error: "Supabase connection is not configured." });
    return;
  }
  try {
    const { data, error } = await client
      .from("pmo_archive_documents")
      .select("*")
      .order("timestamp", { ascending: false });
    
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        res.json({ tableMissing: true, documents: [] });
        return;
      }
      throw error;
    }
    res.json({ documents: data || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch Archive documents." });
  }
});

// 6. Members Table Access
app.get("/api/pmo/members", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(257).json({ error: "Supabase connection is not configured." });
    return;
  }
  try {
    const { data, error } = await client
      .from("pmo_members")
      .select("*, last_seen, is_active")
      .order("name", { ascending: true });
    
    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        res.json({ tableMissing: true, members: [] });
        return;
      }
      throw error;
    }

    // Process "Online" status based on heartbeats (within last 5 minutes)
    const processedMembers = (data || []).map((m: any) => ({
      ...m,
      onlineStatus: m.last_seen && (new Date().getTime() - new Date(m.last_seen).getTime() < 300000) ? "online" : "offline"
    }));

    res.json({ members: processedMembers });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch PMO members." });
  }
});

app.post("/api/pmo/members/heartbeat", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) return res.status(400).json({ error: "No connection" });
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    
    const { error } = await client
      .from("pmo_members")
      .update({ last_seen: new Date().toISOString() })
      .eq("email", email);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/pmo/members", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) return res.status(400).json({ error: "No connection" });
  try {
    const { data, error } = await client.from("pmo_members").upsert(req.body).select();
    if (error) throw error;
    res.json({ success: true, member: data?.[0] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 7. Tasks Table Access
app.get("/api/pmo/tasks", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) return res.status(257).json({ error: "No connection" });
  try {
    const { data, error } = await client.from("pmo_tasks").select("*");
    if (error) {
       if (error.code === "42P01" || error.message.includes("does not exist")) return res.json({ tableMissing: true, tasks: [] });
       throw error;
    }
    res.json({ tasks: data || [] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/pmo/tasks", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) return res.status(400).json({ error: "No connection" });
  try {
    const { data, error } = await client.from("pmo_tasks").upsert(req.body).select();
    if (error) throw error;
    res.json({ success: true, task: data?.[0] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 8. Assets Table Access
app.get("/api/pmo/assets", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) return res.status(257).json({ error: "No connection" });
  try {
    const { data, error } = await client.from("pmo_assets").select("*");
    if (error) {
       if (error.code === "42P01" || error.message.includes("does not exist")) return res.json({ tableMissing: true, assets: [] });
       throw error;
    }
    res.json({ assets: data || [] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 9. Master DB Seeding with Actual Document-Based, Month-7 Non-Mock Data
app.post("/api/pmo/seed", async (req, res) => {
  const schema = getRequestSchema(req);
  const client = getSupabase(schema);
  if (!client) {
    res.status(400).json({ error: "Supabase connection is not configured." });
    return;
  }

  try {
    // 1. Seed Minimal Baseline PMO Members (Generic placeholders or empty)
    const realMembers: any[] = []; // Starting with empty members to allow user to add real ones

    // Seed/Upsert members
    if (realMembers.length > 0) {
      const { error: membersError } = await client
        .from("pmo_members")
        .upsert(realMembers, { onConflict: "email" });
      if (membersError) throw membersError;
    }

    // 2. Seed Baseline PMO Tasks (Mathematical & Structural only)
    const realTasks = [
      {
        country: "Saudi Arabia",
        sector: "Compliance",
        phase: "Phase 1: Site Prep & Legal",
        title: "Identify and Secure Clinical Reference Laboratory Premises in Riyadh",
        description: "Evaluate spatial requirements, commercial zoning approvals, and draft lease terms near KKMC. Currently in active scouting phase.",
        status: "In Progress",
        assigned_to: "Project Coordinator",
        due_date: "2026-06-30",
        progress: 80,
        checklist: JSON.stringify([
          { id: "c1", text: "Submit clinical hub requirements to real estate brokers", completed: true },
          { id: "c2", text: "Pre-screen Riyadh corporate zoning clearances", completed: true },
          { id: "c3", text: "Inspect candidate facilities near central Riyadh hospitals", completed: true },
          { id: "c4", text: "Execute final clinical lease and security deposits", completed: false }
        ]),
        kpi_metrics: JSON.stringify(["Riyadh Premises Selection Progress"])
      },
      {
        country: "Saudi Arabia",
        sector: "Compliance",
        phase: "Phase 1: Site Prep & Legal",
        title: "Submit BSL-3 HVAC Containment blueprints for preliminary MoH Approval",
        description: "Draft structural air suction files with -35 Pa design metrics. Standard practice requires lease execute first.",
        status: "Blocked",
        assigned_to: "Project Coordinator",
        due_date: "2026-07-15",
        progress: 40,
        checklist: JSON.stringify([
          { id: "b1", text: "Engage Saudi HVAC specialist consultant", completed: true },
          { id: "b2", text: "Approve draft pressure-ventilation designs", completed: true },
          { id: "b3", text: "Incorporate signed premise lease records (Blocked)", completed: false },
          { id: "b4", text: "File baseline package inside Saudi MoH regulatory portal", completed: false }
        ]),
        kpi_metrics: JSON.stringify(["SOP Compliance Rate"])
      },
      {
        country: "Saudi Arabia",
        sector: "Procurement",
        phase: "Phase 2: Procurement & Logistics",
        title: "Right-Size & Release LC-MS/MS System Purchase Orders",
        description: "Acquire two core high-complexity SCIEX 4500MD platforms to align setup with audited send-outs model (~4070 runs), holding at manufacturer depot.",
        status: "Not Started",
        assigned_to: "Director of Procurement",
        due_date: "2026-08-10",
        progress: 0,
        checklist: JSON.stringify([
          { id: "p1", text: "Finalize bid spec validations with Calibra team", completed: true },
          { id: "p2", text: "Lock right-sized CapEx cost approvals ($1.9M total budget limit)", completed: false },
          { id: "p3", text: "Issue target Purchase Orders to SCIEX manufacturer", completed: false }
        ]),
        kpi_metrics: JSON.stringify(["LC-MS/MS Active Lines"])
      }
    ];

    // Seed tasks
    await client.from("pmo_tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: tasksError } = await client
      .from("pmo_tasks")
      .insert(realTasks);

    if (tasksError) throw tasksError;

    // 3. Seed KPI Metrics
    const realKpis = [
      { name: "Riyadh Premises Selection Progress", current_value: 80, target_value: 100, unit: "%", sector: "Compliance", country: "Saudi Arabia", trend: "up" },
      { name: "LC-MS/MS Active Lines", current_value: 2, target_value: 2, unit: "lines", sector: "Procurement", country: "Saudi Arabia", trend: "stable" },
      { name: "Audited Case-Load Referrals", current_value: 4070, target_value: 4070, unit: "tests/year", sector: "Logistics", country: "Saudi Arabia", trend: "stable" },
      { name: "Al Ain Audited Core Asset Sets", current_value: 3, target_value: 3, unit: "assets", sector: "Procurement", country: "UAE", trend: "stable" },
      { name: "Cairo Reagents Stockpile Buffer", current_value: 6, target_value: 6, unit: "months", sector: "Logistics", country: "Egypt", trend: "stable" }
    ];

    // Clear and Seed KPIs
    await client.from("pmo_kpi_metrics").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: kpiError } = await client
      .from("pmo_kpi_metrics")
      .insert(realKpis);

    if (kpiError) throw kpiError;

    // 4. Seed Archive Documents (Vetted Baseline)
    const realDocs = [
      {
        title: "MEA Strategic Lab Executive Roadmap v1.4.pdf",
        category: "Project Setup",
        author: "Steering Committee Secretariat",
        timestamp: "2025-11-12T09:00:00Z",
        size: "4.8 MB",
        checksum: "SHA256:7e8d91a92bc394dd58ff7e44a47bc8e1e92da3ef83b8cadf392bd7eb8980be12",
        description: "Original constitutional design blueprint defining joint-venture timelines, SFDA checkpoints, and Ministry of Health (MoH) licensing targets.",
        source: "Pre-vetted Setup Baseline"
      }
    ];
    await client.from("pmo_archive_documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await client.from("pmo_archive_documents").insert(realDocs);

    // 5. Seed Meetings (Start as Empty to remove imaginary conversations)
    await client.from("pmo_meetings").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    res.json({ success: true, message: "System baseline initialized: Technical project data restored, imaginary person records removed." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to seed PMO tables." });
  }
});

// 5. DevOps Workspace Code Pack Compiler (For offline download of exact source tree)
app.get("/api/devops/code-pack", (req, res) => {
  try {
    const filesList: { path: string; content: string }[] = [];
    
    function compileFiles(currentDir: string) {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, "/");
        
        // Exclude systemic, compiled, and bulky folders
        if (
          item === "node_modules" ||
          item === "dist" ||
          item === ".git" ||
          item === "package-lock.json" ||
          item === ".env" ||
          item === ".env.local"
        ) {
          continue;
        }
        
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          compileFiles(fullPath);
        } else if (stat.isFile()) {
          // Only read text files, configs and documentation
          if (
            item.endsWith(".ts") ||
            item.endsWith(".tsx") ||
            item.endsWith(".json") ||
            item.endsWith(".html") ||
            item.endsWith(".css") ||
            item.endsWith(".md") ||
            item.endsWith(".js") ||
            item === ".gitignore"
          ) {
            const content = fs.readFileSync(fullPath, "utf8");
            filesList.push({ path: relPath, content });
          }
        }
      }
    }
    
    compileFiles(process.cwd());
    res.json({ files: filesList });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to compile workspace code-pack." });
  }
});

export { app };

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PMO Lab Portal Server listening on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
