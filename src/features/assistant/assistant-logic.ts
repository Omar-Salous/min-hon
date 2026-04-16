import { products, productsById } from "@/features/commerce/commerce-data";
import type { ProductColor, ProductId, ProductSize } from "@/features/commerce/commerce-types";

export type AssistantMode =
  | "occasion"
  | "weather"
  | "gift"
  | "full-look"
  | "customize";

export type WeatherCondition = "hot" | "mild" | "cold" | "windy" | "rainy";
export type StylePreference = "minimal" | "warm" | "statement" | "relaxed" | "elevated";
export type OccasionValue = "everyday" | "event" | "gifting" | "travel" | "weekend";
export type AssistantIntent = "gift" | "personal" | "full-look";

export type AssistantStage =
  | "welcome"
  | "weather"
  | "occasion"
  | "style"
  | "color"
  | "size"
  | "intent"
  | "result";

export type QuickReply = {
  label: string;
  value: string;
};

export type RecommendationCard = {
  productId: ProductId;
  reason: string;
  emphasis?: string;
};

export type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  chips?: QuickReply[];
  cards?: RecommendationCard[];
  note?: string;
};

export type AssistantProfile = {
  mode?: AssistantMode;
  weather?: WeatherCondition;
  occasion?: OccasionValue;
  style?: StylePreference;
  color?: ProductColor;
  size?: ProductSize | "skip";
  intent?: AssistantIntent;
};

export type AssistantFlow = {
  stage: AssistantStage;
  profile: AssistantProfile;
};

type AssistantReply = {
  flow: AssistantFlow;
  message: AssistantMessage;
};

const modeReplies: QuickReply[] = [
  { label: "Occasion Styling", value: "mode:occasion" },
  { label: "Weather Suggestions", value: "mode:weather" },
  { label: "Gift Recommendation", value: "mode:gift" },
  { label: "Full Look Help", value: "mode:full-look" },
  { label: "Customized Piece", value: "mode:customize" },
];

const occasionReplies: QuickReply[] = [
  { label: "Everyday wear", value: "occasion:everyday" },
  { label: "Evening or event", value: "occasion:event" },
  { label: "Gift moment", value: "occasion:gifting" },
  { label: "Travel day", value: "occasion:travel" },
  { label: "Weekend outing", value: "occasion:weekend" },
];

const weatherReplies: QuickReply[] = [
  { label: "Hot", value: "weather:hot" },
  { label: "Mild", value: "weather:mild" },
  { label: "Cold", value: "weather:cold" },
  { label: "Windy", value: "weather:windy" },
  { label: "Rainy", value: "weather:rainy" },
];

const styleReplies: QuickReply[] = [
  { label: "Minimal", value: "style:minimal" },
  { label: "Warm & heritage", value: "style:warm" },
  { label: "Statement", value: "style:statement" },
  { label: "Relaxed", value: "style:relaxed" },
  { label: "Elevated", value: "style:elevated" },
];

const colorReplies: QuickReply[] = [
  { label: "Ivory", value: "color:Ivory" },
  { label: "Clay", value: "color:Clay" },
  { label: "Olive", value: "color:Olive" },
  { label: "Charcoal", value: "color:Charcoal" },
];

const sizeReplies: QuickReply[] = [
  { label: "S", value: "size:S" },
  { label: "M", value: "size:M" },
  { label: "L", value: "size:L" },
  { label: "XL", value: "size:XL" },
  { label: "No size needed", value: "size:skip" },
];

const intentReplies: QuickReply[] = [
  { label: "Gift", value: "intent:gift" },
  { label: "Personal piece", value: "intent:personal" },
  { label: "Full look", value: "intent:full-look" },
];

export function createInitialAssistantFlow(): AssistantFlow {
  return {
    stage: "welcome",
    profile: {},
  };
}

export function createWelcomeMessage(): AssistantMessage {
  return {
    id: createMessageId(),
    role: "assistant",
    text: "Welcome to the MIN HON Assistant. I’m a guided styling prototype for now, designed to help you shape a look, gift, or personalized piece from the collection. Where would you like to begin?",
    chips: modeReplies,
    note: "Frontend prototype: the recommendations below are rule-based and use the live product catalog.",
  };
}

export function continueAssistantFlow(flow: AssistantFlow, selectedValue: string): AssistantReply {
  if (selectedValue === "restart") {
    return {
      flow: createInitialAssistantFlow(),
      message: createWelcomeMessage(),
    };
  }

  const [type, rawValue] = selectedValue.split(":") as [string, string];
  const nextProfile = { ...flow.profile };
  let nextStage: AssistantStage = flow.stage;

  if (type === "mode") {
    nextProfile.mode = rawValue as AssistantMode;
    nextProfile.intent = getIntentFromMode(nextProfile.mode);
    nextStage = nextProfile.mode === "weather" ? "weather" : "occasion";
    return {
      flow: { stage: nextStage, profile: nextProfile },
      message: createQuestionMessage(nextStage, nextProfile),
    };
  }

  if (type === "weather") {
    nextProfile.weather = rawValue as WeatherCondition;
    nextStage = "occasion";
  }

  if (type === "occasion") {
    nextProfile.occasion = rawValue as OccasionValue;
    nextStage = "style";
  }

  if (type === "style") {
    nextProfile.style = rawValue as StylePreference;
    nextStage = "color";
  }

  if (type === "color") {
    nextProfile.color = rawValue as ProductColor;
    nextStage = "size";
  }

  if (type === "size") {
    nextProfile.size = rawValue === "skip" ? "skip" : (rawValue as ProductSize);
    nextStage = nextProfile.intent ? "result" : "intent";
  }

  if (type === "intent") {
    nextProfile.intent = rawValue as AssistantIntent;
    nextStage = "result";
  }

  if (nextStage === "result") {
    return {
      flow: { stage: "result", profile: nextProfile },
      message: createRecommendationMessage(nextProfile),
    };
  }

  return {
    flow: { stage: nextStage, profile: nextProfile },
    message: createQuestionMessage(nextStage, nextProfile),
  };
}

export function createUserMessage(label: string): AssistantMessage {
  return {
    id: createMessageId(),
    role: "user",
    text: label,
  };
}

function createQuestionMessage(stage: AssistantStage, profile: AssistantProfile): AssistantMessage {
  if (stage === "weather") {
    return {
      id: createMessageId(),
      role: "assistant",
      text: "Tell me the weather you want to dress for, and I’ll shape suggestions that feel comfortable and polished.",
      chips: weatherReplies,
    };
  }

  if (stage === "occasion") {
    return {
      id: createMessageId(),
      role: "assistant",
      text:
        profile.mode === "gift"
          ? "What kind of gifting moment is this for?"
          : "What’s the occasion or moment you’re dressing for?",
      chips: occasionReplies,
    };
  }

  if (stage === "style") {
    return {
      id: createMessageId(),
      role: "assistant",
      text: "How should the look feel overall?",
      chips: styleReplies,
    };
  }

  if (stage === "color") {
    return {
      id: createMessageId(),
      role: "assistant",
      text: "Which color direction feels most right for you?",
      chips: colorReplies,
    };
  }

  if (stage === "size") {
    return {
      id: createMessageId(),
      role: "assistant",
      text: "Do you want me to keep sizing in mind for apparel recommendations?",
      chips: sizeReplies,
    };
  }

  return {
    id: createMessageId(),
    role: "assistant",
    text: "Should I guide this as a gift, a personal piece, or a full look?",
    chips: intentReplies,
  };
}

function createRecommendationMessage(profile: AssistantProfile): AssistantMessage {
  const scoredProducts = products
    .map((product) => ({
      productId: product.id,
      score: getProductScore(product.id, profile),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const cards = scoredProducts.map(({ productId }, index) => ({
    productId,
    reason: getRecommendationReason(productId, profile, index),
    emphasis: getCardEmphasis(productId, profile),
  }));

  const productNames = cards.map((card) => productsById[card.productId].name);
  const summaryLine =
    profile.intent === "full-look"
      ? `I’d build the look around ${productNames[0]}, then layer in ${productNames[1]} and ${productNames[2]} for balance.`
      : `My strongest picks here are ${productNames[0]}, ${productNames[1]}, and ${productNames[2]}.`;

  return {
    id: createMessageId(),
    role: "assistant",
    text: `${summaryLine} These suggestions come from the current collection and your answers, so they stay grounded in what MIN HON can actually offer today.`,
    cards,
    chips: [
      { label: "Start over", value: "restart" },
      { label: "Try weather mode", value: "mode:weather" },
      { label: "Build a personalized piece", value: "mode:customize" },
    ],
    note: getRecommendationNote(profile),
  };
}

function getProductScore(productId: ProductId, profile: AssistantProfile) {
  let score = 1;

  score += occasionWeights[profile.occasion ?? "everyday"]?.[productId] ?? 0;
  score += weatherWeights[profile.weather ?? "mild"]?.[productId] ?? 0;
  score += styleWeights[profile.style ?? "minimal"]?.[productId] ?? 0;
  score += intentWeights[profile.intent ?? "personal"]?.[productId] ?? 0;

  const product = productsById[productId];

  if (profile.color && product.colors.includes(profile.color)) {
    score += 2;
  }

  if (profile.size && profile.size !== "skip") {
    score += product.sizes?.includes(profile.size) ? 2 : 0;
  }

  if (profile.mode === "customize" && (productId === "tshirt" || productId === "hoodie")) {
    score += 2;
  }

  return score;
}

function getRecommendationReason(productId: ProductId, profile: AssistantProfile, index: number) {
  const product = productsById[productId];

  if (index === 0 && profile.weather) {
    return `${product.name} fits the ${profile.weather} weather direction while staying aligned with the rest of your answers.`;
  }

  if (profile.intent === "gift") {
    return `${product.name} feels strong for gifting because it carries meaning well and still feels refined.`;
  }

  if (profile.intent === "full-look") {
    return `${product.name} helps anchor a more complete look instead of reading like a one-off item.`;
  }

  if (profile.mode === "customize") {
    return `${product.name} gives enough surface and presence to turn a story, memory, or dedication into something personal.`;
  }

  return `${product.name} supports the ${profile.style ?? "selected"} direction without drifting away from the calm MIN HON mood.`;
}

function getCardEmphasis(productId: ProductId, profile: AssistantProfile) {
  if (profile.intent === "full-look" && productId === "hoodie") {
    return "Strong outer layer for the look";
  }

  if (profile.intent === "gift" && (productId === "hand-watch" || productId === "bracelet")) {
    return "Elegant gifting option";
  }

  if (profile.mode === "customize" && (productId === "tshirt" || productId === "hoodie")) {
    return "Best for personalization";
  }

  return "Collection match";
}

function getRecommendationNote(profile: AssistantProfile) {
  const qrLine =
    "For future production, selected pieces can also connect to a story, memory, or digital content layer through a QR-linked experience.";

  if (profile.mode === "customize" || profile.intent === "personal") {
    return `If you want something more personal, move into Customize and we can shape a title, a story note, and eventually a QR-linked keepsake. ${qrLine}`;
  }

  if (profile.intent === "gift") {
    return `If this is a gift, I’d lean toward the pieces above and then personalize one through the Customize flow so the present carries more emotional weight. ${qrLine}`;
  }

  return `If you want to make the look more story-led, the Customize flow is the best next step. ${qrLine}`;
}

function getIntentFromMode(mode: AssistantMode): AssistantIntent | undefined {
  if (mode === "gift") {
    return "gift";
  }

  if (mode === "full-look") {
    return "full-look";
  }

  if (mode === "customize") {
    return "personal";
  }

  return undefined;
}

function createMessageId() {
  return `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const occasionWeights: Record<OccasionValue, Partial<Record<ProductId, number>>> = {
  everyday: { tshirt: 3, cap: 2, "hand-watch": 2, bracelet: 1, hoodie: 1 },
  event: { "hand-watch": 3, bracelet: 3, hoodie: 1, tshirt: 1 },
  gifting: { "hand-watch": 3, bracelet: 3, hoodie: 2, cap: 1, tshirt: 1 },
  travel: { cap: 3, tshirt: 2, hoodie: 2, "hand-watch": 1, bracelet: 1 },
  weekend: { tshirt: 2, hoodie: 2, cap: 2, bracelet: 1, "hand-watch": 1 },
};

const weatherWeights: Record<WeatherCondition, Partial<Record<ProductId, number>>> = {
  hot: { tshirt: 3, cap: 2, bracelet: 2, "hand-watch": 2 },
  mild: { tshirt: 2, cap: 1, "hand-watch": 2, bracelet: 2, hoodie: 1 },
  cold: { hoodie: 4, "hand-watch": 2, bracelet: 2, cap: 1 },
  windy: { hoodie: 3, cap: 3, "hand-watch": 1, bracelet: 1, tshirt: 1 },
  rainy: { hoodie: 3, cap: 2, bracelet: 2, "hand-watch": 1, tshirt: 1 },
};

const styleWeights: Record<StylePreference, Partial<Record<ProductId, number>>> = {
  minimal: { "hand-watch": 3, bracelet: 2, cap: 1, tshirt: 1 },
  warm: { hoodie: 3, bracelet: 2, "hand-watch": 2, tshirt: 1 },
  statement: { hoodie: 2, cap: 3, tshirt: 2, "hand-watch": 1, bracelet: 1 },
  relaxed: { tshirt: 3, hoodie: 2, cap: 2, bracelet: 1 },
  elevated: { "hand-watch": 3, bracelet: 3, hoodie: 1, tshirt: 1 },
};

const intentWeights: Record<AssistantIntent, Partial<Record<ProductId, number>>> = {
  gift: { "hand-watch": 3, bracelet: 3, hoodie: 1, cap: 1 },
  personal: { tshirt: 2, hoodie: 2, bracelet: 1, "hand-watch": 1 },
  "full-look": { tshirt: 3, hoodie: 2, cap: 2, "hand-watch": 2, bracelet: 2 },
};
