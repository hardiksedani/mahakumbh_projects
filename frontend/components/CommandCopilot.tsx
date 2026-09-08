"use client";

import { useState } from "react";
import { Bot, Send, X, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";

export function CommandCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "USER" | "AI"; text: string }>>([
    {
      sender: "AI",
      text: "Jai Shri Ram! I am the KumbhRakshak AI Copilot. Ask me about crowd density, rumors, lost persons, or emergency dispatch.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { sender: "USER", text: userText }]);
    setInput("");

    // Simulated Copilot Responses
    setTimeout(() => {
      let reply = "Scanning command databases...";
      const query = userText.toLowerCase();

      if (query.includes("stampede") || query.includes("crowd")) {
        reply = "⚠️ Ram Kund Main Sector capacity is at 88%. Recommend publishing WhatsApp crowd advisory to divert incoming pilgrims to Kapila Ghat (42% capacity).";
      } else if (query.includes("rumor") || query.includes("fake") || query.includes("death")) {
        reply = "❌ DEBUNKED: Viral WhatsApp claim regarding 50 deaths at Sector 4 is FALSE. CCTV cameras confirmed zero casualties; smoke was from cold-night campfires.";
      } else if (query.includes("lost") || query.includes("child") || query.includes("missing")) {
        reply = "🔎 AI Lost Person Radar actively scanning 100+ CCTV feeds. 1 child (Aarav Sharma) matched at Ram Kund North Gate (CAM-04) 2 mins ago.";
      } else if (query.includes("temple") || query.includes("hanuman")) {
        reply = "✅ Lete Hanuman Temple is OPEN and operating normally. Current queue wait time is 15-20 minutes.";
      } else {
        reply = `Command received: "${userText}". Multi-agency units (Police, Medical, Fire) are currently on STANDBY across all 12 sectors.`;
      }

      setMessages((prev) => [...prev, { sender: "AI", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs shadow-2xl hover:scale-105 transition-all shadow-orange-500/30 border border-orange-400/40"
        >
          <Bot className="w-5 h-5 animate-pulse" />
          <span>Kumbh AI Copilot</span>
          <Sparkles className="w-4 h-4 text-amber-200" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-sm text-slate-100">Kumbh AI Command Copilot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl max-w-[85%] ${
                  m.sender === "USER"
                    ? "ml-auto bg-orange-500 text-white font-medium"
                    : "mr-auto bg-slate-800 text-slate-200 border border-slate-700"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex gap-1 overflow-x-auto text-[10px]">
            <button
              onClick={() => setInput("Check stampede risk at Ram Kund")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded whitespace-nowrap"
            >
              Stampede Risk?
            </button>
            <button
              onClick={() => setInput("Check fake rumors on social media")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded whitespace-nowrap"
            >
              Social Rumors?
            </button>
            <button
              onClick={() => setInput("Status of Lete Hanuman Temple")}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded whitespace-nowrap"
            >
              Temple Status?
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask Copilot (e.g. Dispatch medical unit)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-orange-500 outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
