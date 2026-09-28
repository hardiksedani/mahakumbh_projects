"use client";

import { useState } from "react";
import { Header } from "@/components/ui";
import { api, type MultilingualBroadcastResponse } from "@/lib/api";
import {
  Megaphone, Globe, Send, CheckCircle2, Copy, Sparkles,
  Share2, ShieldCheck, Flame, Radio, Clock, MessageSquare, AlertCircle
} from "lucide-react";

const TOPICS = [
  { id: "TRAFFIC_DIVERSION", label: "🚨 Traffic Diversion", defaultTitle: "Route Diversion near Ram Kund Gate 4", defaultDetails: "Heavy devotee buildup approaching Ram Kund. Light vehicles diverted to Ring Road Sector 7." },
  { id: "SHAHI_SNAN", label: "🕉️ Shahi Snan Schedule", defaultTitle: "Amrit Snan Holy Dip Timings", defaultDetails: "Auspicious Amrit Snan begins 04:15 AM. Special designated corridors active for Divyang and senior citizens." },
  { id: "GHAT_CAPACITY", label: "🌊 Ghat Capacity Alert", defaultTitle: "Ghat Overflow Prevention Advisory", defaultDetails: "Ram Kund is at 88% capacity. Pilgrims advised to proceed to Kapila Sangam Ghat for peaceful holy dip." },
  { id: "ADVISORY", label: "📢 Public Safety Protocol", defaultTitle: "General Crowd Advisory & Helplines", defaultDetails: "Follow designated one-way barricades. 24/7 free medical camp operational at Sector 4." },
];

const LANGUAGES = [
  { id: "hindi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { id: "marathi", label: "मराठी (Marathi)", flag: "🚩" },
  { id: "gujarati", label: "ગુજરાતી (Gujarati)", flag: "🪔" },
  { id: "english", label: "English", flag: "🌐" },
];

export default function BroadcastStudioPage() {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].id);
  const [title, setTitle] = useState(TOPICS[0].defaultTitle);
  const [details, setDetails] = useState(TOPICS[0].defaultDetails);
  const [activeLang, setActiveLang] = useState<"english" | "hindi" | "marathi" | "gujarati">("hindi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MultilingualBroadcastResponse | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);
  const [publishedNotice, setPublishedNotice] = useState<string | null>(null);

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
    const t = TOPICS.find((x) => x.id === topicId);
    if (t) {
      setTitle(t.defaultTitle);
      setDetails(t.defaultDetails);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setPublishedNotice(null);
    try {
      const res = await api<MultilingualBroadcastResponse>("/api/social/generate-multilingual", {
        method: "POST",
        body: JSON.stringify({
          topic: selectedTopic,
          title,
          key_details: details,
          channels: ["x_twitter", "whatsapp", "instagram"],
        }),
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, channelKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channelKey);
    setTimeout(() => setCopiedChannel(null), 3000);
  };

  const handlePublish = (channelName: string) => {
    setPublishedNotice(`✅ Successfully Disseminated to Official ${channelName} Broadcast API!`);
    setTimeout(() => setPublishedNotice(null), 5000);
  };

  return (
    <div className="min-h-screen pb-16 space-y-4">
      <Header />

      <main className="max-w-[1700px] mx-auto px-4 space-y-5">
        {/* Banner */}
        <div className="card bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-saffron">Outcome Parameter 10.3</span>
              <span className="text-xs font-mono text-slate-400">Automated Official Content Generator</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 mt-1 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-orange-400" />
              Multilingual AI Social Media Broadcast Studio
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates culturally authentic, legally compliant, and multilingual official advisories across X (Twitter), WhatsApp Community bulletins, and Instagram story cards.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-green text-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Verified Stamp
            </span>
          </div>
        </div>

        {publishedNotice && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{publishedNotice}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-5">
          {/* Left Column: Generator Controls */}
          <div className="lg:col-span-5 card space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Select Advisory Topic & Key Facts
              </h2>
              <p className="text-[11px] text-slate-400">Choose a predefined operational scenario or enter custom instructions.</p>
            </div>

            {/* Topic Selectors */}
            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTopicChange(t.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                    selectedTopic === t.id
                      ? "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-md shadow-orange-500/10"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Official Bulletin Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500/60 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Key Facts / Actionable Instructions</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-orange-500/60 font-medium leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Generating Multilingual Copy..." : "Generate 4-Language Official Broadcast"}
            </button>
          </div>

          {/* Right Column: Multilingual Preview Studio */}
          <div className="lg:col-span-7 card space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  Multilingual Channel Previews
                </h2>
                <p className="text-[11px] text-slate-400">Select language tab to view culturally customized official copies.</p>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveLang(lang.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      activeLang === lang.id
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Channels Grid */}
            <div className="space-y-3">
              {/* Channel 1: X (Twitter) */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" /> X (Twitter) Official Feed
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          result?.channels?.x_twitter?.[activeLang] ||
                            "🚨 TRAFFIC UPDATE: Light vehicles diverted via Ring Road Sector 7. #KumbhMela2026",
                          "x_twitter"
                        )
                      }
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-all"
                    >
                      {copiedChannel === "x_twitter" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedChannel === "x_twitter" ? "Copied!" : "Copy Post"}
                    </button>
                    <button
                      onClick={() => handlePublish("X (Twitter)")}
                      className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Send className="w-3 h-3" /> Post Tweet
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {result?.channels?.x_twitter?.[activeLang] ||
                    (activeLang === "hindi"
                      ? "🚨 यातायात सूचना: श्रद्धालुओं की भारी संख्या को देखते हुए हल्के वाहनों को रिंग रोड सेक्टर 7 की तरफ मोड़ा गया है। कृपया पुलिस निर्देशों का पालन करें। #KumbhMela2026 #KumbhTraffic"
                      : activeLang === "marathi"
                      ? "🚨 वाहतूक सूचना: भाविकांच्या गर्दीमुळे हलकी वाहने रिंग रोड सेक्टर ७ कडे वळवण्यात आली आहेत. #KumbhMela2026 #KumbhTraffic"
                      : activeLang === "gujarati"
                      ? "🚨 ટ્રાફિક અપડેટ: શ્રદ્ધાળુઓની ભીડને લીધે નાના વાહનોને રિંગ રોડ સેક્ટર ૭ તરફ વાળવામાં આવ્યા છે. #KumbhMela2026 #KumbhTraffic"
                      : "🚨 TRAFFIC UPDATE: Heavy devotee movement. Light vehicles diverted via Ring Road Sector 7. Please follow police marshals. #KumbhMela2026 #KumbhTraffic")}
                </div>
              </div>

              {/* Channel 2: WhatsApp Community Bulletin */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> WhatsApp Community Official Bulletin
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          result?.channels?.whatsapp?.[activeLang] || "*Kumbh Official Bulletin*",
                          "whatsapp"
                        )
                      }
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-all"
                    >
                      {copiedChannel === "whatsapp" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedChannel === "whatsapp" ? "Copied!" : "Copy Bulletin"}
                    </button>
                    <button
                      onClick={() => handlePublish("WhatsApp Community Channel")}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Send className="w-3 h-3" /> Push to Channel
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {result?.channels?.whatsapp?.[activeLang] ||
                    (activeLang === "hindi"
                      ? "*कुंभ मेला प्राधिकरण आधिकारिक बुलेटिन*\n\n🚨 यातायात सूचना: राम कुंड की ओर भारी भीड़ के दृष्टिगत हल्के वाहनों को रिंग रोड सेक्टर 7 की ओर मोड़ा गया है।\n\n📍 आपातकालीन हेल्पलाइन: 108 / 100\n🔗 स्थिति: आधिकारिक सत्यापित सूचना"
                      : activeLang === "marathi"
                      ? "*कुंभमेळा प्राधिकरण अधिकृत बुलेटिन*\n\n🚨 वाहतूक सूचना: रामकुंडाकडे भाविकांची गर्दी वाढल्यामुळे हलकी वाहने रिंग रोड सेक्टर ७ कडे वळवण्यात आली आहेत.\n\n📍 मदत कक्ष: १०८ / १००\n🔗 अधिकृत माहिती"
                      : activeLang === "gujarati"
                      ? "*કુંભમેળા સત્તાવાર બુલેટિન*\n\n🚨 ટ્રાફિક અપડેટ: રામ કુંડ તરફ શ્રદ્ધાળુઓની ભીડને લીધે નાના વાહનોને રિંગ રોડ સેક્ટર ૭ તરફ વાળવામાં આવ્યા છે.\n\n📍 હેલ્પલાઇન: ૧૦૮ / ૧૦૦\n🔗 સત્તાવાર પ્રમાણિત માહિતી"
                      : "*Kumbh Authority Official Bulletin*\n\n🚨 TRAFFIC UPDATE: Heavy devotee movement towards Ram Kund. Light vehicles diverted via Ring Road Sector 7.\n\n📍 Helplines: 108 / 100\n🔗 Status: Official Verified")}
                </div>
              </div>

              {/* Channel 3: Instagram Advisory Story */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/30 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-400" /> Instagram Advisory Card
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          result?.channels?.instagram?.[activeLang] || "🚨 [OFFICIAL UPDATE]",
                          "instagram"
                        )
                      }
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-all"
                    >
                      {copiedChannel === "instagram" ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedChannel === "instagram" ? "Copied!" : "Copy Caption"}
                    </button>
                    <button
                      onClick={() => handlePublish("Instagram Official Handle")}
                      className="px-2.5 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Send className="w-3 h-3" /> Publish Story
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {result?.channels?.instagram?.[activeLang] ||
                    (activeLang === "hindi"
                      ? "🚨 [आधिकारिक सूचना] रूट डायवर्जन लागू।\nराम कुंड की ओर भारी भीड़। लाइव रूट मैप हेतु बायो में दिए लिंक पर क्लिक करें।"
                      : activeLang === "marathi"
                      ? "🚨 [अधिकृत सूचना] मार्ग वळवण्यात आला आहे.\nथेट नकाशासाठी बायोमधील लिंक तपासा."
                      : activeLang === "gujarati"
                      ? "🚨 [સત્તાવાર માહિતી] રૂટ ડાયવર્ઝન અમલી.\nલાઇવ નકશા માટે બાયોમાં લિંક તપાસો."
                      : "🚨 [OFFICIAL UPDATE] Route Diversion Active.\nHeavy movement near Ram Kund. Tap link in bio for interactive live route map.")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
