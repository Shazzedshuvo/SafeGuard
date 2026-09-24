export interface RiskyWordCategory {
  name: string;
  badgeColor: string;
  description: string;
  words: string[];
}

export const RISKY_CATEGORIES: Record<string, RiskyWordCategory> = {
  contact: {
    name: "Contact & Communication",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    description: "External contact details that violate Fiverr's off-platform communication policy",
    words: [
      "mail", "email", "emails", "e-mail", "gmail", "gmails", "hotmail", "outlook", "yahoo", 
      "phone", "mobile", "number", "contact", "call", "contact us", "whatsapp", "telegram", 
      "skype", "zoom", "meet", "hangouts", "viber", "imo", "signal", "facetime", "wechat"
    ],
  },
  payment: {
    name: "Payment & Financial",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    description: "Financial terms & off-platform payment methods strictly forbidden on Fiverr",
    words: [
      "pay", "payment", "payments", "purchase", "purchasing", "purchased", "paypal", "stripe", 
      "venmo", "cashapp", "bank", "western union", "moneygram", "btc", "bitcoin", "crypto", 
      "wallet", "wire transfer", "invoice", "direct payment", "outside fiverr", "outside fiver", 
      "off fiverr", "off fiver", "send money", "money", "price", "prices", "buy", "pricing", 
      "salary", "fee", "fees", "dollar", "dollars", "tip", "tips", "credit card", "debit card"
    ],
  },
  external: {
    name: "External Platforms & Reviews",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    description: "Alternative platforms or solicitations for 5-star ratings/feedback",
    words: [
      "personal website", "domain", "upwork", "freelancer", "freelancer.com", "peopleperhour", 
      "toptal", "fiverr alternative", "trustpilot reviews", "google reviews", "review", "reviews", 
      "5 star", "rating", "feedback", "five star", "5-star"
    ],
  },
  social: {
    name: "Social Media & Growth",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    description: "Social media handles or artificial engagement services",
    words: [
      "facebook", "messenger", "instagram", "linkedin", "twitter", "x.com", "snapchat", 
      "tiktok", "youtube", "pinterest", "reddit", "discord", "watch hour", "auto like", 
      "auto likes", "auto follower", "auto followers"
    ],
  },
  policyEvasion: {
    name: "Policy Evasion Phrases",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
    description: "Phrases indicating intent to bypass Fiverr platform guidelines",
    words: [
      "give me your number", "contact me outside", "message me on", "hire me on", 
      "work outside fiverr", "pay directly", "reach out to me"
    ],
  },
  gambling: {
    name: "Gambling & Casino",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    description: "Gambling, betting, or speculative gaming terminology",
    words: [
      "gambling", "casino", "betting", "sports betting", "poker", "slot games", 
      "slots", "blackjack", "crypto casino", "roulette", "sportsbook", "virtual casino", "betting tips"
    ],
  },
  inappropriate: {
    name: "Inappropriate & Explicit",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    description: "Profanity, offensive language, or adult content",
    words: [
      "fuck", "shit", "bitch", "bastard", "asshole", "dick", "pussy", "slut", 
      "whore", "cunt", "nude", "nudes", "porn", "sex", "hentai", "adult content"
    ],
  },
  threats: {
    name: "Threats & Harm",
    badgeColor: "bg-red-700/20 text-red-400 border-red-700/30",
    description: "Violent language, weapons, or hate speech",
    words: [
      "kill", "die", "suicide", "bomb", "terrorist", "attack", "shoot", "gun", "weapon"
    ],
  },
};

// Flattened list for fast checking
export const ALL_DEFAULT_RISKY_WORDS: string[] = Object.values(RISKY_CATEGORIES).flatMap(
  (c) => c.words
);

// Custom intelligent hyphen positions for high-frequency freelance words
export const CUSTOM_HYPHEN_POSITIONS: Record<string, number[]> = {
  payment: [3], // pay-ment
  payments: [3], // pay-ments
  payroll: [3], // pay-roll
  payslip: [3], // pay-slip
  whatsapp: [4], // what-sapp
  telegram: [4], // tele-gram
  email: [1], // e-mail
  emails: [1], // e-mails
  review: [2], // re-view
  reviews: [2], // re-views
  paypal: [3], // pay-pal
  skype: [2], // sk-ype
  phone: [2], // ph-one
  contact: [3], // con-tact
};

export type ObfuscationMethod = "hyphen" | "dot" | "slash" | "zerowidth";

/**
 * Inserts obfuscation separator into a risky word
 */
export function obfuscateWord(word: string, method: ObfuscationMethod = "hyphen"): string {
  const clean = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (clean.length < 2) return word;

  let pos: number;
  if (CUSTOM_HYPHEN_POSITIONS[clean]) {
    const positions = CUSTOM_HYPHEN_POSITIONS[clean];
    pos = positions[Math.floor(Math.random() * positions.length)];
  } else {
    pos = Math.floor(clean.length / 2);
  }

  let separator = "-";
  if (method === "dot") separator = ".";
  else if (method === "slash") separator = "/";
  else if (method === "zerowidth") separator = "\u200B";

  const obfuscated = clean.slice(0, pos) + separator + clean.slice(pos);

  // Preserve original casing and surrounding characters if possible
  const regex = new RegExp(clean, "i");
  return word.replace(regex, obfuscated);
}

export interface ProcessedResult {
  originalText: string;
  safeText: string;
  highlightedHtml: string;
  detectedWords: Array<{
    word: string;
    category: string;
    count: number;
  }>;
  totalViolations: number;
  wordCountOriginal: number;
  charCountOriginal: number;
  wordCountSafe: number;
  charCountSafe: number;
}

/**
 * Processes message and replaces risky words with safe obfuscated equivalents
 */
export function processSafeMessage(
  input: string,
  options: {
    highlight?: boolean;
    obfuscationMethod?: ObfuscationMethod;
    customWords?: string[];
  } = {}
): ProcessedResult {
  const { highlight = true, obfuscationMethod = "hyphen", customWords = [] } = options;

  if (!input || !input.trim()) {
    return {
      originalText: "",
      safeText: "",
      highlightedHtml: "",
      detectedWords: [],
      totalViolations: 0,
      wordCountOriginal: 0,
      charCountOriginal: 0,
      wordCountSafe: 0,
      charCountSafe: 0,
    };
  }

  // Combine default words and custom user words
  const allWords = Array.from(new Set([...ALL_DEFAULT_RISKY_WORDS, ...customWords]));

  // Sort by length descending to match multi-word phrases first (e.g. "contact me outside" before "contact")
  allWords.sort((a, b) => b.length - a.length);

  const detectedMap = new Map<string, { word: string; category: string; count: number }>();
  let safeOutput = input;
  let htmlOutput = escapeHtml(input);

  // Helper to find category of word
  const findCategory = (w: string): string => {
    const lower = w.toLowerCase();
    for (const [catKey, catVal] of Object.entries(RISKY_CATEGORIES)) {
      if (catVal.words.some((kw) => kw.toLowerCase() === lower)) {
        return catVal.name;
      }
    }
    return "Custom Rule";
  };

  allWords.forEach((risky) => {
    // Regex for whole word / phrase match
    const escaped = risky.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "gi");

    // Match in raw input
    safeOutput = safeOutput.replace(pattern, (match) => {
      const lower = match.toLowerCase();
      const current = detectedMap.get(lower) || {
        word: match,
        category: findCategory(lower),
        count: 0,
      };
      current.count += 1;
      detectedMap.set(lower, current);

      return obfuscateWord(match, obfuscationMethod);
    });

    // In HTML highlight
    const htmlEscaped = escapeHtml(risky).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const htmlPattern = new RegExp(`\\b${htmlEscaped}\\b`, "gi");

    htmlOutput = htmlOutput.replace(htmlPattern, (match) => {
      const obfuscated = obfuscateWord(match, obfuscationMethod);
      return highlight
        ? `<span class="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-300 dark:border-red-500/40 inline-block" title="Restricted Word: ${match}">${obfuscated}</span>`
        : obfuscated;
    });
  });

  const originalWords = input.trim().split(/\s+/).filter(Boolean).length;
  const safeWords = safeOutput.trim().split(/\s+/).filter(Boolean).length;
  const detectedList = Array.from(detectedMap.values());
  const totalViolations = detectedList.reduce((acc, item) => acc + item.count, 0);

  return {
    originalText: input,
    safeText: safeOutput,
    highlightedHtml: htmlOutput,
    detectedWords: detectedList,
    totalViolations,
    wordCountOriginal: originalWords,
    charCountOriginal: input.length,
    wordCountSafe: safeWords,
    charCountSafe: safeOutput.length,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
