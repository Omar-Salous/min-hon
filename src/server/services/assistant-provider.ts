type AssistantProviderId = "ollama" | "openai";

export type AssistantProviderMessage = {
  role: "assistant" | "developer" | "system" | "user";
  content: string;
};

export type AssistantProviderRequest = {
  prompt: string;
  history: AssistantProviderMessage[];
  responseSchema: Record<string, unknown>;
  responseSchemaName: string;
};

type OllamaChatResponse = {
  error?: string;
  message?: {
    content?: string;
  };
};

type OpenAIOutputContent = {
  text?: string;
  refusal?: string;
};

type OpenAIResponsePayload = {
  output?: Array<{
    content?: OpenAIOutputContent[];
  }>;
};

type AssistantProviderConfig =
  | {
      provider: "ollama";
      endpoint: string;
      model: string;
    }
  | {
      provider: "openai";
      apiKey?: string;
      endpoint: string;
      model: string;
    };

export class AssistantProviderError extends Error {
  code?: string;
  provider: AssistantProviderId;

  constructor(
    message: string,
    options: {
      provider: AssistantProviderId;
      code?: string;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "AssistantProviderError";
    this.provider = options.provider;
    this.code = options.code;
  }
}

const DEFAULT_OLLAMA_ENDPOINT = "http://localhost:11434/api/chat";
const DEFAULT_OLLAMA_MODEL = "gemma3";
const DEFAULT_OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export function getAssistantProviderConfig(): AssistantProviderConfig {
  const configuredProvider = process.env.MIN_HON_ASSISTANT_PROVIDER?.trim().toLowerCase();
  const provider =
    configuredProvider === "ollama" || configuredProvider === "openai"
      ? configuredProvider
      : process.env.NODE_ENV === "development"
        ? "ollama"
        : "openai";

  if (provider === "ollama") {
    return {
      provider,
      endpoint: process.env.OLLAMA_STYLE_ASSISTANT_ENDPOINT?.trim() || DEFAULT_OLLAMA_ENDPOINT,
      model: process.env.OLLAMA_STYLE_ASSISTANT_MODEL?.trim() || DEFAULT_OLLAMA_MODEL,
    };
  }

  return {
    provider,
    endpoint: process.env.OPENAI_STYLE_ASSISTANT_ENDPOINT?.trim() || DEFAULT_OPENAI_ENDPOINT,
    model: process.env.OPENAI_STYLE_ASSISTANT_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    apiKey: process.env.OPENAI_API_KEY?.trim(),
  };
}

export function isAssistantProviderConfigured() {
  const config = getAssistantProviderConfig();

  if (config.provider === "ollama") {
    return Boolean(config.endpoint && config.model);
  }

  return Boolean(config.endpoint && config.model && config.apiKey);
}

export async function createAssistantProviderReply(input: AssistantProviderRequest) {
  const config = getAssistantProviderConfig();

  if (config.provider === "ollama") {
    return createOllamaReply(config, input);
  }

  if (!config.apiKey) {
    throw new AssistantProviderError("OPENAI_API_KEY is required for OpenAI assistant mode.", {
      provider: "openai",
      code: "openai_missing_api_key",
    });
  }

  return createOpenAiReply(config, input);
}

export function describeActiveAssistantProvider() {
  const config = getAssistantProviderConfig();

  if (config.provider === "ollama") {
    return `Ollama local mode (${config.model} via ${config.endpoint})`;
  }

  return `OpenAI mode (${config.model})`;
}

function buildOllamaSystemPrompt(prompt: string, responseSchema: Record<string, unknown>) {
  return [
    prompt,
    "",
    "Return only valid JSON that matches this schema exactly:",
    JSON.stringify(responseSchema),
  ].join("\n");
}

async function createOllamaReply(
  config: Extract<AssistantProviderConfig, { provider: "ollama" }>,
  input: AssistantProviderRequest,
) {
  let response: Response;

  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        stream: false,
        format: input.responseSchema,
        options: {
          temperature: 0,
        },
        messages: [
          {
            role: "system",
            content: buildOllamaSystemPrompt(input.prompt, input.responseSchema),
          },
          ...input.history.map((message) => ({
            role: mapRoleForOllama(message.role),
            content: message.content,
          })),
        ],
      }),
    });
  } catch (error) {
    throw new AssistantProviderError(
      `Could not reach Ollama at ${config.endpoint}.`,
      {
        provider: "ollama",
        code: "ollama_unreachable",
        cause: error,
      },
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AssistantProviderError(
      `Ollama request failed with status ${response.status}: ${errorBody}`,
      {
        provider: "ollama",
        code: getOllamaErrorCode(errorBody),
      },
    );
  }

  const payload = (await response.json()) as OllamaChatResponse;
  const responseText = payload.message?.content?.trim();

  if (!responseText) {
    throw new AssistantProviderError("Ollama did not return a readable response.", {
      provider: "ollama",
      code: "ollama_empty_response",
    });
  }

  return parseStructuredAssistantResponse(responseText, "ollama");
}

async function createOpenAiReply(
  config: Extract<AssistantProviderConfig, { provider: "openai" }>,
  input: AssistantProviderRequest,
) {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      instructions: input.prompt,
      text: {
        format: {
          type: "json_schema",
          name: input.responseSchemaName,
          strict: true,
          schema: input.responseSchema,
        },
      },
      input: input.history.map((message) => ({
        role: mapRoleForOpenAi(message.role),
        content: message.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AssistantProviderError(
      `OpenAI request failed with status ${response.status}: ${errorBody}`,
      {
        provider: "openai",
        code: getOpenAiErrorCode(errorBody),
      },
    );
  }

  const payload = (await response.json()) as OpenAIResponsePayload;
  const responseText = extractOpenAiResponseText(payload);

  if (!responseText) {
    throw new AssistantProviderError("OpenAI did not return a readable response.", {
      provider: "openai",
      code: "openai_empty_response",
    });
  }

  return parseStructuredAssistantResponse(responseText, "openai");
}

function mapRoleForOllama(role: AssistantProviderMessage["role"]) {
  if (role === "developer" || role === "system") {
    return "system";
  }

  return role;
}

function mapRoleForOpenAi(role: AssistantProviderMessage["role"]) {
  if (role === "system") {
    return "developer";
  }

  return role;
}

function extractOpenAiResponseText(payload: OpenAIResponsePayload) {
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === "string" && content.text.trim()) {
        return content.text;
      }

      if (typeof content.refusal === "string" && content.refusal.trim()) {
        return content.refusal;
      }
    }
  }

  return null;
}

function parseStructuredAssistantResponse(
  responseText: string,
  provider: AssistantProviderId,
) {
  const normalized = responseText.trim();

  try {
    return JSON.parse(normalized) as unknown;
  } catch {
    const withoutCodeFence = normalized
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(withoutCodeFence) as unknown;
    } catch {
      const objectMatch = withoutCodeFence.match(/\{[\s\S]*\}/);

      if (objectMatch) {
        return JSON.parse(objectMatch[0]) as unknown;
      }

      throw new AssistantProviderError("The assistant response was not valid JSON.", {
        provider,
        code: "invalid_json_response",
      });
    }
  }
}

function getOllamaErrorCode(errorBody: string) {
  const normalizedError = errorBody.toLowerCase();

  if (normalizedError.includes("model") && normalizedError.includes("not found")) {
    return "ollama_model_not_found";
  }

  try {
    const parsed = JSON.parse(errorBody) as { error?: string };

    if (typeof parsed.error === "string") {
      const normalizedParsedError = parsed.error.toLowerCase();

      if (normalizedParsedError.includes("model") && normalizedParsedError.includes("not found")) {
        return "ollama_model_not_found";
      }
    }
  } catch {
    // Ignore JSON parsing for error code inference.
  }

  return "ollama_request_failed";
}

function getOpenAiErrorCode(errorBody: string) {
  try {
    const parsed = JSON.parse(errorBody) as {
      error?: {
        code?: string;
        type?: string;
      };
    };

    return parsed.error?.code ?? parsed.error?.type;
  } catch {
    return undefined;
  }
}
