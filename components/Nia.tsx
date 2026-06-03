"use client";
import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Nia — The SettleMap Navigator
   "Nia" is SettleMap's AI-assisted guide. She is:
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

const NIA_DISCLAIMER = `👋 Hi, I'm **Nia** — The SettleMap Navigator.

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

  // Greetings
  if (/^(hi|hello|hey|nia's?|start|help)/.test(msg)) {
    return `Welcome! I'm here to help you work through your SettleMap checklist. Here's a quick overview of what you can ask me:\n\n**Your checklist** — I can explain what any task means and why it matters.\n**Official sources** — I can point you to GOV.UK, NHS, or university pages.\n**UK life** — Questions about how things work — banking, transport, student discounts.\n\nWhat's on your mind today?`;
  }

  // Task explanations
  if (/gp registration|nhs|doctor|health/.test(msg)) {
    return `GP registration is one of the most important tasks on your checklist. Here's why:\n\nAs an international student, you've paid the **Immigration Health Surcharge** as part of your visa fee — so you're entitled to full NHS care, including GP services.\n\n**Steps:**\n1. Find a GP near you at [nhs.uk/service-search/find-a-gp](https://www.nhs.uk/service-search/find-a-gp)\n2. Check they're accepting new patients\n3. Fill in a **GMS1 registration form** (available at the surgery)\n4. You don't need proof of ID — just your UK address\n\nRegistering early means you're covered when you need medical help. Don't wait until you're ill!`;
  }

  if (/bank|account|money/.test(msg)) {
    return `Opening a UK bank account is an important step. Here's what you need to know:\n\n**What you'll typically need:**\n• Your passport\n• Your UK address (tenancy agreement or accommodation letter works)\n• Proof of student status (your university ID or a student status letter)\n\n**Top student accounts right now:** Santander, NatWest, and HSBC all offer interest-free overdrafts. Compare them at [moneysavingexpert.com](https://www.moneysavingexpert.com) before deciding.\n\nNote: some banks require a branch visit — check this before travelling to the UK!`;
  }

  if (/evisa|ukvi|brp|visa|work hours/.test(msg)) {
    return `Great question — but this is exactly the kind of topic where I'd recommend speaking to a qualified adviser.\n\nFor anything to do with your **visa conditions, eVisa, or work-hour limits**, please check:\n• Your **UKVI online account** at [gov.uk/prove-immigration-status](https://www.gov.uk/prove-immigration-status)\n• Your **university's international student support team** — they deal with these questions daily\n• The official **GOV.UK student visa page** at [gov.uk/student-visa](https://www.gov.uk/student-visa)\n\nThese sources have the most accurate, up-to-date information for your specific situation.`;
  }

  if (/budget|money|expense|saving/.test(msg)) {
    return `Managing your money as a student is a skill — and you're already taking the right step by thinking about it early!\n\n**Quick tips:**\n• **Fixed costs first** — rent, utilities, phone. Set these as non-negotiables in your budget.\n• **Student overdrafts** — many UK student accounts offer an interest-free overdraft. Use it carefully as a safety net, not extra income.\n• **Student discounts** — always ask! Most retailers, restaurants, and shops offer a student discount (usually 10–20%). Get a **Totum** card to access these easily.\n• **Free help** — your university will have a free money advice service. Use it!\n\nCheck out the Budget Planner at [moneysavingexpert.com](https://www.moneysavingexpert.com) to build your first budget.`;
  }

  if (/accommodation|housing|flat|rent|landlord/.test(msg)) {
    return `Getting your accommodation sorted is one of the first big things to do. A few things worth knowing:\n\n**Before you sign:**\n• Never transfer money without seeing a written tenancy agreement first\n• Check the landlord is registered with a deposit protection scheme (TDS, DPS, or MyDeposits) — it's legally required\n• Use Shelter's checklist: [shelterengland.org](https://www.shelterengland.org)\n\n**Deposits:**\nYour deposit must be protected within 30 days. Check it at the DPS portal: [depositprotection.com](https://www.depositprotection.com)\n\n**Council tax:**\nFull-time students are exempt — but you need to claim it! Contact your local council to confirm.`;
  }

  if (/national insurance|ni number|work permit/.test(msg)) {
    return `If you're planning to work in the UK, you'll need a **National Insurance (NI) number**. Here's the short version:\n\n• It's your unique tax reference number — employers use it to deduct the right tax\n• **How to apply:** Call the DWP on **0300 200 3500** and they'll schedule an evidence interview\n• You'll need your passport and UKVI online account / eVisa for the interview\n• Your NI number will be posted to you within 3–4 weeks\n\nNote: some employers can hire you *before* you have an NI number — but you must apply quickly once you start.`;
  }

  if (/nhs|doctor|gp|dental|prescription|optician/.test(msg)) {
    return `The NHS is the UK's public health service. As an international student, you've paid the **Immigration Health Surcharge** — you're entitled to full NHS care.\n\n**Key services:**\n• **GP** — free, your first point of contact for most health issues. Register on day one.\n• **A&E / 999** — for emergencies only\n• **111** — non-emergency medical help, 24/7\n• **Prescriptions** — currently £9.90 per item (check if you qualify for HC2 for free prescriptions)\n• **Dentist** — NHS places are limited. Register early!\n• **Eye tests** — free NHS eye test for students, plus a voucher toward glasses\n\n**Download the NHS App** — it lets you order prescriptions and book appointments.`;
  }

  if (/safe|scam|warning|fraud/.test(msg)) {
    return `Protecting yourself from scams is really important — international students are sometimes targeted.\n\n**Red flags to watch for:**\n• Anyone asking for money upfront to "guarantee" a job\n• Landlords who won't show the property but ask for a deposit\n• Calls or texts claiming to be from the Home Office or HMRC asking for payment\n• Offers that sound too good to be true\n\n**Official sources:**\n• Action Fraud (UK fraud reporting): [actionfraud.police.uk](https://www.actionfraud.police.uk)\n• UK Finance (banking scams): [ukfinance.org.uk](https://www.ukfinance.org.uk)\n\nIf something feels wrong, trust your instincts and ask your university's student support team.`;
  }

  // Fallback — in scope
  return `That's a good question! Here's a general answer:\n\nFrom what you've described, the best next step would be to check the official guidance on GOV.UK or speak to your university's support team — they're experienced in helping students with exactly these kinds of questions.\n\nWould you like me to point you to a specific official source, or shall we talk through your checklist and find the relevant task?`;
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
          aria-label="Open Nia — The SettleMap Navigator"
          className="fixed bottom-22 right-4 z-50 w-14 h-14 rounded-full bg-primary shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
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
              className="w-full h-full bg-primary rounded-2xl flex items-center justify-center"
              aria-label="Expand Nia chat"
            >
              <Bot className="w-7 h-7 text-white" />
            </button>
          ) : (
            <>
              {/* Header */}
              <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-sm">Nia — The SettleMap Navigator</span>
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
                          : "bg-primary text-white rounded-tr-sm"
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
                  className="flex-1 resize-none border border-civic-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-civic-400"
                />
                <button
                  onClick={handleSend}
                  aria-label="Send message"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
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
