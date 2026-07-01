"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Nia — The Beginly Navigator
   "Nia" is Beginly's AI-assisted guide. She is:
   - NOT a real adviser or immigration/legal professional
   - NOT affiliated with any government body
   - NOT a substitute for professional advice
   - A helpful orientation tool only

   Users are shown this disclaimer before their first interaction.
   She can help with: checklist guidance, task explanations,
   UK culture tips, where to find official information.
   She CANNOT help with: legal case-specific advice, immigration
   status, financial decisions, or anything requiring a regulated
   professional.
────────────────────────────────────────────────────────────── */

interface NiaMessage {
  id: string;
  role: "nia" | "user";
  text: string;
  timestamp: Date;
}

const NIA_DISCLAIMER = `👋 Hi, I'm **Nia** — The Beginly Navigator.

I'm your AI-assisted guide, here to help you find your way around settling in the UK. I can help with:
• Explaining your checklist tasks
• Pointing you to official UK government sources
• Tips for navigating UK daily life

**Important:** I'm not a real adviser. I can't give immigration, legal, medical, or financial advice. For those, please speak to a qualified professional — your university international student support team is a great place to start.

Let's chat! 😊`;

const NIA_SCOPE_LIMITS = [
  "immigration status or visa advice",
  "legal case-specific guidance",
  "financial investment decisions",
  "medical diagnosis or treatment",
  "anything requiring a regulated professional",
];

function buildRefusal(topic: string): string {
  return `That's an important topic — but it's outside what I can help with. For **${topic}**, I'd recommend speaking to a qualified professional rather than relying on general guidance. Your university will have an international student support team who can point you to the right person. You can also find official information at [GOV.UK](https://www.gov.uk).`;
}

function isInScope(topic: string): boolean {
  const lower = topic.toLowerCase();
  return !NIA_SCOPE_LIMITS.some((limit) => lower.includes(limit));
}

function generateNiaReply(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();

  if (/^(hi|hello|hey|nia'?s?|start|help)/.test(msg)) {
    return `Welcome. I can help you understand Beginly checklist tasks, find relevant guidance pages, and point you toward official sources. I give general settlement guidance only — not legal, immigration, medical, financial, tax, or housing advice.`;
  }

  if (/evisa|ukvi|brp|visa|work hours|right to work|immigration/.test(msg)) {
    return `This is a sensitive immigration/work-rights topic, so I cannot decide or interpret your personal legal position. Please check your UKVI online account, your eVisa/visa conditions, GOV.UK, and your university international student support team. I can help you find the right checklist task or explain general terms, but not make the decision for you.`;
  }

  if (/bank|account|overdraft|loan|credit|money transfer|insurance/.test(msg)) {
    return `I can explain general preparation steps, but Beginly does not recommend or rank financial products.\n\nFor a UK bank account, you may be asked for ID, proof of address, and proof of student status. Compare official provider terms, fees, eligibility, app/branch access, and any overdraft conditions yourself. Never pay anyone who claims they can guarantee a bank account.`;
  }

  if (/budget|expense|saving/.test(msg)) {
    return `Budgeting early is sensible. This is general organisation guidance, not financial advice.\n\nUseful categories to track are rent, bills, food, transport, phone/SIM, course materials, and an emergency buffer. If you are considering overdrafts, credit, insurance, or money-transfer products, compare official terms and speak to a qualified adviser if unsure.`;
  }

  if (/gp registration|nhs|doctor|health|dental|prescription|optician/.test(msg)) {
    return `GP/NHS setup is an important settlement step. I can give general guidance, but I cannot confirm your personal entitlement or provide medical advice.\n\nStart by finding a GP near your term-time address, checking whether they accept new patients, and following their registration process. For eligibility, charges, symptoms, medication, or urgent concerns, check NHS guidance or contact NHS 111/999 as appropriate.`;
  }

  if (/accommodation|housing|flat|rent|landlord|deposit|council tax/.test(msg)) {
    return `Accommodation and council-tax issues can be situation-specific. I can provide general safety guidance, not legal or housing advice.\n\nBefore paying or signing, keep written evidence, avoid pressure payments, check provider details, and read official guidance. For tenancy disputes, formal letters, eviction threats, unclear contract terms, or council-tax liability questions, contact your university housing team, Citizens Advice, Shelter, your council, or a qualified adviser.`;
  }

  if (/national insurance|ni number|work permit|job/.test(msg)) {
    return `For work-related setup, first check your own visa/eVisa conditions and university guidance. I cannot decide what work you are legally permitted to do.\n\nFor National Insurance number information, use the current GOV.UK process. Keep your NI number private and avoid sharing it through unofficial forms or messages.`;
  }

  if (/safe|scam|warning|fraud/.test(msg)) {
    return `Scam awareness is one of Beginly's safest and most useful areas. Watch for upfront payments to guarantee jobs, landlords who refuse verification, fake official calls asking for payment, document phishing, and requests for bank login details or one-time codes.\n\nIf something feels wrong, pause, keep evidence, and check with your university support team or the relevant official reporting route.`;
  }

  if (/checklist|task|roadmap|next/.test(msg)) {
    return `Your Beginly roadmap is generated from your arrival status, accommodation type, work interest, and settlement stage. Start with high-priority tasks, then complete tasks that unlock later steps such as banking, GP registration, and local-admin setup.`;
  }

  return `I can help with general settlement guidance and checklist navigation. For official, regulated, medical, legal, immigration, financial, tax, or housing decisions, please use official sources or a qualified professional. Tell me the checklist task or general topic you want to understand, and I’ll keep it practical and safe.`;
}

export default function Nia({ autoOpen = false }: { autoOpen?: boolean }) {
  const [open, setOpen] = useState(autoOpen);
  const [dismissed, setDismissed] = useState(false);
  const [messages, setMessages] = useState<NiaMessage[]>([]);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Show disclaimer on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: "nia-intro",
          role: "nia",
          text: NIA_DISCLAIMER,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: NiaMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate typing delay
    setTimeout(() => {
      const reply = isInScope(trimmed)
        ? generateNiaReply(trimmed)
        : buildRefusal(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `nia-${Date.now()}`,
          role: "nia",
          text: reply,
          timestamp: new Date(),
        },
      ]);
    }, 800 + Math.random() * 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "nia-intro-reset",
        role: "nia",
        text: NIA_DISCLAIMER,
        timestamp: new Date(),
      },
    ]);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Nia — The Beginly Navigator"
          className="fixed bottom-22 right-4 z-50 w-14 h-14 rounded-full bg-violet shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          style={{ bottom: "6rem" }}
        >
          <Bot className="w-7 h-7 text-white" />
          <span className="sr-only">Open Nia</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden
            ${minimized ? "bottom-22 right-4 w-14 h-14" : "bottom-22 right-4 w-80 sm:w-96 h-[32rem]"}
          `}
          style={{ bottom: minimized ? "6rem" : "6rem" }}
          aria-label="Nia chat assistant"
        >
          {/* Minimized: just the icon */}
          {minimized ? (
            <button
              onClick={() => setMinimized(false)}
              className="w-full h-full bg-violet rounded-2xl flex items-center justify-center"
              aria-label="Expand Nia chat"
            >
              <Bot className="w-7 h-7 text-white" />
            </button>
          ) : (
            <>
              {/* Header */}
              <div className="bg-violet px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-sm">Nia — The Beginly Navigator</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={resetChat}
                    aria-label="Reset chat"
                    className="text-white/70 hover:text-white p-1 rounded"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMinimized(true)}
                    aria-label="Minimize Nia"
                    className="text-white/70 hover:text-white p-1 rounded"
                  >
                    <span aria-hidden="true">—</span>
                  </button>
                  <button
                    onClick={() => { setOpen(false); setMinimized(false); }}
                    aria-label="Close Nia"
                    className="text-white/70 hover:text-white p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* NIA disclosure banner */}
              <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-start gap-2 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Transparency note:</strong> Nia is an AI orientation tool — not a regulated adviser. For immigration, legal, or financial advice, contact a qualified professional.
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "nia"
                          ? "bg-civic-100 text-navy rounded-tl-sm"
                          : "bg-violet text-white rounded-tr-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-civic-200 p-3 flex gap-2 shrink-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nia anything…"
                  rows={1}
                  aria-label="Message Nia"
                  className="flex-1 resize-none border border-civic-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet/40 placeholder:text-civic-400"
                />
                <button
                  onClick={handleSend}
                  aria-label="Send message"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-violet hover:bg-violet/90 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Source links */}
              <div className="bg-civic-50 border-t border-civic-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
                <ExternalLink className="w-3 h-3 text-civic-400" />
                <p className="text-xs text-civic-500">
                  Always verify key info at{" "}
                  <a
                    href="https://www.gov.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GOV.UK
                  </a>{" "}
                  ·{" "}
                  <a
                    href="https://www.nhs.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    NHS.uk
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
