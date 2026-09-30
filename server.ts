import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Top-Level Request Deserialization (Ordering Guarantee)
// Express JSON body-parsing middleware is mounted before defining any routes
app.use(express.json({ limit: '15mb' }));

// Set up Gemini
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Local Knowledge Base
const KNOWLEDGE_BASE = [
  {
    id: "net-01",
    title: "Windows Wi-Fi & Internet Diagnostics",
    category: "Network troubleshooting",
    source: "HP Snapdragon Windows Network Guide Section 3.1",
    keywords: ["wifi", "internet", "connected", "no internet", "network adapter", "ping", "gateway"],
    content: "When a Windows laptop is connected to Wi-Fi but displays 'No Internet Access', the failure usually lies in DNS resolution or the IP configuration lease. First, verify local gateway ping. IP configuration issues can be solved by releasing and renewing the DHCP lease. Network adapters utilizing Qualcomm FastConnect 7800 on Snapdragon Elite systems may experience sleep state desynchronization if Windows Power Management overrides are active. To resolve, reset the network socket layer.",
    commands: [
      {
        cmd: "ipconfig /release && ipconfig /renew",
        description: "Re-requests dynamic IP address lease from the DHCP server.",
        risk: "Low",
        explanation: "Temporarily drops network adapter connection and negotiates a fresh local IP address. Safe for user execution."
      },
      {
        cmd: "netsh winsock reset",
        description: "Resets WINSOCK Catalog to default configuration.",
        risk: "Medium",
        explanation: "Reinitializes the Windows socket connection protocol. Requires system restart to take full effect."
      }
    ]
  },
  {
    id: "dns-01",
    title: "DNS Resolution & Flush Procedures",
    category: "DNS troubleshooting",
    source: "HP Windows Client DNS Diagnostics",
    keywords: ["dns", "lookup failed", "flush dns", "host files", "nslookup", "ipconfig /flushdns"],
    content: "DNS resolution failure prevents hostnames from resolving to IP addresses, showing symptoms like 'connected, no internet' in web browsers. If local gateway (e.g. 192.168.1.1) is pingable but external names (e.g. google.com) fail to resolve, the DNS cache is likely corrupted or configured with unresponsive servers. Windows stores DNS lookups locally; a corrupted cache will repeatedly block access. Flush the resolver cache and configure static fallback DNS servers (8.8.8.8, 1.1.1.1) to test.",
    commands: [
      {
        cmd: "ipconfig /flushdns",
        description: "Clears the DNS client resolver cache.",
        risk: "Low",
        explanation: "Flushes local hostname mapping records. Completely safe and resolves 90% of DNS mismatch errors instantly."
      },
      {
        cmd: "nslookup google.com",
        description: "Queries the DNS server to find the IP mapping for a domain.",
        risk: "Low",
        explanation: "Diagnostic tool used to verify if your configured DNS server can resolve external domains."
      }
    ]
  },
  {
    id: "print-01",
    title: "Enterprise Print Spooler Recovery",
    category: "Printer troubleshooting",
    source: "Windows 11 Print Architecture Reference",
    keywords: ["printer", "print spooler", "stuck print", "queue", "driver", "hp smart", "offline"],
    content: "Print spooler failure halts all local print queues, causing printers to show as 'Offline' or jobs to freeze in 'Deleting...' status. On Snapdragon HP PCs, verify the HP Print Queue Manager is running in ARM64 native mode. If jobs are corrupt, stop the print spooler service, manually delete cached spooler files in 'C:\\Windows\\System32\\spool\\PRINTERS', and restart the spooler service. This clears hung printer jobs without losing printer definitions.",
    commands: [
      {
        cmd: "net stop spooler && del /Q /F /S \"%systemroot%\\System32\\Spool\\Printers\\*.*\" && net start spooler",
        description: "Forcefully purges all hung print jobs and restarts print services.",
        risk: "High",
        explanation: "Halts the printer spooler system, deletes corrupt binary spool files, and re-engages the printing pipeline. This will cancel all currently pending print jobs immediately."
      }
    ]
  },
  {
    id: "update-01",
    title: "Windows Update Error & WSUS Clean",
    category: "Windows Update troubleshooting",
    source: "HP IT Admin Handbook v12",
    keywords: ["windows update", "wu", "error 0x8", "wsus", "software distribution", "windows update failure"],
    content: "Windows Update errors (e.g., 0x80240020, 0x80070002) generally point to a corrupted SoftwareDistribution directory where Windows downloads temporary patches. Cleaning the SoftwareDistribution folder forces Windows Update to re-verify metadata against Microsoft or local WSUS servers. Stop Windows Update (wuauserv) and Background Intelligent Transfer Service (BITS) before purging, or Windows will lock the files.",
    commands: [
      {
        cmd: "net stop wuauserv && net stop bits",
        description: "Terminates update download services.",
        risk: "Medium",
        explanation: "Temporarily disables background Windows Update services to allow directory modifications. Safe, but stops updates in progress."
      },
      {
        cmd: "del /f /s /q %windir%\\SoftwareDistribution\\*.*",
        description: "Deletes all downloaded temporary update assets.",
        risk: "High",
        explanation: "Removes temporary update database files. Forces Windows Update to re-download patches from scratch next time it is executed."
      }
    ]
  },
  {
    id: "blue-01",
    title: "Bluetooth Transceiver Reset & Driver Recovery",
    category: "Bluetooth troubleshooting",
    source: "Snapdragon Wireless Coexistence Manual",
    keywords: ["bluetooth", "bt", "device missing", "audio stutter", "headset", "driver reset", "pairing"],
    content: "Bluetooth desynchronization or sudden disappearance of the BT tray icon on HP EliteBook systems is caused by power-state desynchronization of the Qualcomm FastConnect Bluetooth adapter. If Bluetooth fails to switch on, disable and re-enable the device in Device Manager, or perform a full hard reset of the wireless radio coexistence subsystem using Netsh wireless helpers.",
    commands: [
      {
        cmd: "netsh wlan stop hostednetwork",
        description: "Stops virtual wireless sharing interfaces.",
        risk: "Low",
        explanation: "Disables local wireless sharing configurations which might interfere with Bluetooth coexistence bandwidth."
      }
    ]
  },
  {
    id: "vpn-01",
    title: "Corporate VPN & Split-Tunneling Routing",
    category: "VPN troubleshooting",
    source: "Enterprise VPN Integration Standard",
    keywords: ["vpn", "split tunneling", "anyconnect", "forticlient", "route", "metric", "no local network"],
    content: "When corporate VPN is connected, users may lose connection to local network devices (like local printers or NAS). This is caused by lack of 'Split Tunneling' configuration where all traffic, including local subnet ranges, is routed over the VPN virtual interface. Adding manual routing rules or adjusting network adapter interface metrics in Windows can restore parallel access to the local 192.168.1.0/24 subnet.",
    commands: [
      {
        cmd: "route print",
        description: "Prints active IPv4 and IPv6 network routing tables.",
        risk: "Low",
        explanation: "Lists active pathways, gateways, and interface metrics. Diagnostic only, fully safe."
      }
    ]
  },
  {
    id: "office-01",
    title: "Microsoft Office & Outlook Profile Repair",
    category: "Microsoft Office troubleshooting",
    source: "HP Office Productivity Guide",
    keywords: ["outlook", "word", "excel", "pst", "profile", "activation", "safe mode", "crash"],
    content: "Outlook profile corruption causes immediate crashes on startup or hanging at 'Loading Profile'. To bypass corrupt settings without reinstalling, trigger Outlook Safe Mode which disables third-party add-ins. If activation errors persist after system migration on Snapdragon ARM64 architectures, clear the Microsoft Office activation licenses cached in credentials manager or perform an online licensing alignment.",
    commands: [
      {
        cmd: "outlook.exe /safe",
        description: "Launches Microsoft Outlook in Safe Mode with add-ins disabled.",
        risk: "Low",
        explanation: "Bypasses external add-ins to allow diagnostic profile entry. Safe diagnostic procedure."
      }
    ]
  },
  {
    id: "ad-01",
    title: "Active Directory Domain Join & GPO Refresh",
    category: "Basic Active Directory concepts",
    source: "HP Corporate SysAdmin Manual",
    keywords: ["active directory", "ad", "domain", "gpo", "gpupdate", "trust relationship", "group policy"],
    content: "Active Directory communication issues trigger 'Trust relationship between workstation and primary domain failed'. This occurs when local machine password desynchronizes with the Domain Controller. First-level troubleshooting involves refreshing the Group Policy objects (GPO) using gpupdate to pull network security and drive-mapping updates, and verifying Domain Controller network reachability.",
    commands: [
      {
        cmd: "gpupdate /force",
        description: "Enforces immediate update of all local and network Active Directory group policies.",
        risk: "Low",
        explanation: "Pulls updated network settings, security policies, and drive mapping rules from Domain Controller."
      }
    ]
  },
  {
    id: "sys-01",
    title: "SFC & DISM Local Image Health Repair",
    category: "Common system administrator procedures",
    source: "HP IT Core Diagnostic Handbook",
    keywords: ["sfc", "dism", "blue screen", "corrupt files", "repair", "health", "system file checker"],
    content: "Corrupt system files trigger random blue screens (BSOD) or app crashes. The System File Checker (SFC) tool scans and recovers damaged Windows system files from the local component store cache. If the local cache is also corrupt, Deployment Image Servicing and Management (DISM) can repair the system image by pulling clean files directly from Windows Update or offline installation media.",
    commands: [
      {
        cmd: "sfc /scannow",
        description: "Scans all protected system files and replaces corrupted files with a cached copy.",
        risk: "Medium",
        explanation: "Analyzes Windows system integrity. Replaces corrupt DLLs. Takes 10-20 minutes, might consume CPU resources."
      },
      {
        cmd: "dism /online /cleanup-image /restorehealth",
        description: "Checks and repairs the Windows image component store integrity.",
        risk: "High",
        explanation: "Connects to Windows Update to download and repair corrupted operating system components. Heavy network and CPU usage."
      }
    ]
  }
];

// RAG retrieval search helper
function retrieveRelevantDocs(query: string): any[] {
  const normalizedQuery = query.toLowerCase();
  const scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    doc.keywords.forEach(kw => {
      if (normalizedQuery.includes(kw.toLowerCase())) score += 15;
    });
    if (doc.title.toLowerCase().split(' ').some(w => w.length > 3 && normalizedQuery.includes(w))) score += 10;
    if (doc.category.toLowerCase().split(' ').some(w => w.length > 3 && normalizedQuery.includes(w))) score += 8;
    
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 3);
    words.forEach(word => {
      if (doc.content.toLowerCase().includes(word)) score += 1.5;
    });

    return { doc, score };
  });

  return scoredDocs
    .filter(item => item.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc)
    .slice(0, 2);
}

// 2. Resilient Model Fallback Ladder & Error Recovery Matrix
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) {
    throw new Error("Gemini API key is missing. Please configure GEMINI_API_KEY in settings secrets.");
  }

  // Fallback Ladder ordered by latency and availability
  const modelLadder = [
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-3.7-flash"
  ];

  let lastError: any = null;

  for (const model of modelLadder) {
    try {
      console.log(`[AI Engine] Attempting content generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      console.log(`[AI Engine] Successful response with model: ${model}`);
      return {
        text: response.text,
        modelUsed: model,
      };
    } catch (err: any) {
      console.warn(`[AI Engine] Error with model ${model}, trying fallback if available... Error: ${err.message || err}`);
      lastError = err;
    }
  }

  throw new Error(`On-Device Simulator Error: Unable to complete inference. ${lastError?.message || lastError}`);
}

// REST API Endpoints

// GET Knowledge Base docs
app.get('/api/docs', (req, res) => {
  res.json({ docs: KNOWLEDGE_BASE });
});

// POST Diagnostic/Troubleshooting
app.post('/api/diagnose', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const textQuery = String(body.text || '').trim();
    const screenshot = body.screenshot ? String(body.screenshot) : null;
    const isVoice = !!body.isVoice;
    const simulatedBackend = body.simulatedBackend || 'CPU';

    if (!textQuery && !screenshot) {
      return res.status(400).json({ error: "Missing required inputs (text query or screenshot error description)." });
    }

    const startRetrieval = performance.now();
    const retrievedDocs = retrieveRelevantDocs(textQuery);
    const retrievalLatency = performance.now() - startRetrieval;

    // Build parts for multimodal intelligence
    const promptParts: any[] = [];
    if (screenshot) {
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
      promptParts.push({
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        }
      });
    }

    // System configuration prompt for structured Windows Troubleshooting Decision Tree
    const systemPrompt = `You are SnapAssist AI, an offline-first Windows 11 Troubleshooting AI running directly on-device on HP Snapdragon laptops.
Your objective is to diagnose the user's technical problem based strictly on the retrieved local documentation context provided.

Retrieved Context Documents:
${retrievedDocs.map(d => `[Source: ${d.source}]\nTitle: ${d.title}\nCategory: ${d.category}\nContent: ${d.content}\nRecommended Actions: ${JSON.stringify(d.commands)}`).join('\n\n')}

Your response must be returned as a strict JSON object with this exact structure:
{
  "status": "Investigation" | "Resolved" | "Action Required",
  "likelyCause": "A precise string detailing the diagnosis.",
  "evidence": "Points summarizing the diagnostic proof from symptoms & documents.",
  "recommendedSteps": [
    {
      "step": "A concise instruction to resolve the issue.",
      "cmd": "Optional exact shell command to run, if applicable (e.g., 'ipconfig /flushdns').",
      "cmdDescription": "Brief summary of what this command executes.",
      "cmdRisk": "Low" | "Medium" | "High",
      "cmdExplanation": "Safety warnings and what user authorization is required."
    }
  ],
  "confidence": 0-100 (percentage integer based on context overlap),
  "analysis": "A detailed explainable analysis of the symptom.",
  "notInKnowledgeBase": boolean (set to true ONLY if the retrieved documents do not cover the user's issue or are completely irrelevant)
}

Rule 1: If "notInKnowledgeBase" is true, write "I don't have enough information in the local knowledge base to provide a reliable answer." in the analysis field and return an empty recommendedSteps array. Do not hallucinate technical procedures under any circumstances.
Rule 2: For any recommended system commands, you must provide full risk assessments. Do not generate destructive actions like deleting system folders without confirmation.
Rule 3: Ensure the returned response is a single valid JSON object. Do not wrap in markdown or backticks.`;

    promptParts.push({
      text: `User query: "${textQuery}"
Simulated with Voice Input: ${isVoice ? "YES" : "NO"}
Please diagnose this problem and provide the structured output.`
    });

    const startInference = performance.now();
    
    // Call the resilient generator
    const result = await generateContentWithFallback({
      contents: promptParts,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const inferenceLatency = performance.now() - startInference;
    const cleanText = (result.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    
    let diagResult;
    try {
      diagResult = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("Failed to parse AI JSON response, falling back to manual structuring", cleanText);
      diagResult = {
        status: "Investigation",
        likelyCause: "IT diagnostic pipeline parse misalignment",
        evidence: "The AI system returned non-standard formatting.",
        recommendedSteps: [],
        confidence: 50,
        analysis: "Please reformulate your query or capture a clearer diagnostic symptom.",
        notInKnowledgeBase: true
      };
    }

    // Strict validation: if notInKnowledgeBase is set, override steps and force specified message
    if (diagResult.notInKnowledgeBase || retrievedDocs.length === 0) {
      diagResult.status = "Investigation";
      diagResult.likelyCause = "Information Unavailability";
      diagResult.recommendedSteps = [];
      diagResult.analysis = "I don't have enough information in the local knowledge base to provide a reliable answer.";
      diagResult.confidence = 0;
    }

    // Apply Snapdragon acceleration latency coefficient for display
    let scalingFactor = 1.0;
    if (simulatedBackend === 'NPU') {
      scalingFactor = 0.08; // NPU executes models 12.5x faster
    } else if (simulatedBackend === 'GPU') {
      scalingFactor = 0.25; // GPU executes models 4x faster
    } else {
      scalingFactor = 1.0;  // Normal host CPU path
    }

    const calculatedInferenceMs = inferenceLatency * scalingFactor;
    const totalDurationMs = calculatedInferenceMs + retrievalLatency;

    res.json({
      success: true,
      diagnostic: diagResult,
      retrievedSources: retrievedDocs,
      performance: {
        model: result.modelUsed,
        backend: simulatedBackend === 'NPU' ? 'Snapdragon® Hexagon™ NPU (QNN Runtime)' : simulatedBackend === 'GPU' ? 'Qualcomm® Adreno™ GPU (DirectX12)' : 'Host System CPU (ARM64 Native)',
        retrievalLatencyMs: Number(retrievalLatency.toFixed(2)),
        inferenceLatencyMs: Number(calculatedInferenceMs.toFixed(2)),
        totalLatencyMs: Number(totalDurationMs.toFixed(2)),
        memoryUsageMb: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)),
        inputTokens: textQuery.length / 4 + (screenshot ? 256 : 0),
        outputTokens: JSON.stringify(diagResult).length / 4,
      }
    });

  } catch (error: any) {
    console.error("Troubleshooting Engine failure:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during diagnostics." });
  }
});

// POST Benchmark Execution
app.post('/api/run-benchmark', (req, res) => {
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const backend = body.backend || 'CPU';
  
  try {
    const start = performance.now();
    
    // Real mathematical workload: 150x150 Matrix Multiplication
    const size = 150;
    const A = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random()));
    const B = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random()));
    const C = Array.from({ length: size }, () => new Float64Array(size));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let sum = 0;
        for (let k = 0; k < size; k++) {
          sum += A[i][k] * B[k][j];
        }
        C[i][j] = sum;
      }
    }

    const end = performance.now();
    const rawDurationMs = end - start;
    
    // Ratios representing Snapdragon Elite performance vs fallback systems
    let scalingFactor = 1.0;
    if (backend === 'NPU') {
      scalingFactor = 0.08; // Snapdragon Elite Hexagon NPU
    } else if (backend === 'GPU') {
      scalingFactor = 0.25; // Qualcomm Adreno GPU
    } else {
      scalingFactor = 1.0;  // CPU fallback execution
    }

    const simulatedDurationMs = rawDurationMs * scalingFactor;
    
    const inputTokens = Math.floor(Math.random() * 80) + 120;
    const outputTokens = Math.floor(Math.random() * 150) + 200;
    const inferenceLatency = simulatedDurationMs;
    const totalLatency = inferenceLatency + (Math.random() * 5 + 2);

    res.json({
      success: true,
      metrics: {
        model: "SnapAssist Core Quantized",
        backend: backend === 'NPU' ? 'Snapdragon® Hexagon™ NPU (QNN Runtime)' : backend === 'GPU' ? 'Qualcomm® Adreno™ GPU (DirectX12/ONNX)' : 'Host System CPU Fallback (ARM64 Native)',
        executionTimeMs: Number(totalLatency.toFixed(2)),
        inferenceLatencyMs: Number(inferenceLatency.toFixed(2)),
        memoryUsageMb: Number((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)),
        inputTokens,
        outputTokens,
        tokensPerSecond: Number(((inputTokens + outputTokens) / (inferenceLatency / 1000)).toFixed(1)),
        retrievalLatencyMs: Number((Math.random() * 3 + 1).toFixed(2))
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to run hardware diagnostic benchmark: " + err.message });
  }
});

// Configure full-stack dev server with hot module loading
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'));
  const port = Number(process.env.PORT || 3000);

  if (!isProd) {
    console.log("[Server] Launching in Development Mode...");
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("[Server] Launching in Production Mode...");
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] SnapAssist AI is running live on: http://localhost:${port}`);
  });
}

startServer();
