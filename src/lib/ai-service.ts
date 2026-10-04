const HUGGING_FACE_API_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "Qwen/Qwen2.5-Coder-7B-Instruct";
const FALLBACK_MODELS = [DEFAULT_MODEL, "meta-llama/Llama-3.1-8B-Instruct"];
const REQUEST_TIMEOUT_MS = 30_000;

interface HuggingFaceErrorPayload {
  error?: { message?: string } | string;
  message?: string;
}

interface HuggingFaceChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_API_KEY"
      | "RATE_LIMIT"
      | "PROVIDER_UNAVAILABLE"
      | "INVALID_RESPONSE"
      | "REQUEST_FAILED"
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

function parseErrorMessage(payload: HuggingFaceErrorPayload): string {
  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (payload.error?.message) {
    return payload.error.message;
  }

  if (payload.message) {
    return payload.message;
  }

  return "Erro desconhecido do provedor de IA";
}

function sanitizeMessage(message: string, secret?: string): string {
  if (!secret) return message;
  return message.replaceAll(secret, "[REDACTED]");
}

function getHuggingFaceApiKey(): string {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new AIServiceError(
      "HUGGINGFACE_API_KEY environment variable is not configured",
      "PROVIDER_UNAVAILABLE"
    );
  }

  return apiKey;
}

function isModelUnsupported(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("not supported") ||
    lower.includes("model_not_supported") ||
    lower.includes("not a chat model") ||
    lower.includes("not found")
  );
}

async function callChatCompletion(
  model: string,
  prompt: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: signal
        ? AbortSignal.any([AbortSignal.timeout(REQUEST_TIMEOUT_MS), signal])
        : AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new AIServiceError("Tempo limite ao consultar o provedor de IA", "REQUEST_FAILED");
    }

    throw new AIServiceError("Falha ao consultar o provedor de IA", "REQUEST_FAILED");
  }

  if (!response.ok) {
    let payload: HuggingFaceErrorPayload = {};

    try {
      payload = (await response.json()) as HuggingFaceErrorPayload;
    } catch {
      payload = {};
    }

    const rawMessage = parseErrorMessage(payload);
    const message = sanitizeMessage(rawMessage, apiKey);

    if (response.status === 401 || response.status === 403) {
      throw new AIServiceError(message, "INVALID_API_KEY");
    }

    if (response.status === 429) {
      throw new AIServiceError(message, "RATE_LIMIT");
    }

    if (response.status >= 500) {
      throw new AIServiceError(message, "PROVIDER_UNAVAILABLE");
    }

    throw new AIServiceError(message, "REQUEST_FAILED");
  }

  const data = (await response.json()) as HuggingFaceChatCompletionResponse;
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new AIServiceError("Resposta vazia ou inválida do provedor de IA", "INVALID_RESPONSE");
  }

  return text;
}

export async function generateDailyWithAI(prompt: string, signal?: AbortSignal): Promise<string> {
  signal?.throwIfAborted();
  const apiKey = getHuggingFaceApiKey();

  const configuredModel = process.env.HUGGINGFACE_MODEL?.trim();
  const candidateModels = [configuredModel, ...FALLBACK_MODELS].filter((m): m is string =>
    Boolean(m && m.length > 0)
  );

  const uniqueModels = [...new Set(candidateModels)];
  let lastError: AIServiceError | null = null;

  for (let i = 0; i < uniqueModels.length; i++) {
    const model = uniqueModels[i];
    try {
      signal?.throwIfAborted();
      return await callChatCompletion(model, prompt, apiKey, signal);
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      if (error instanceof AIServiceError) {
        lastError = error;
        if (error.code === "INVALID_API_KEY" || error.code === "RATE_LIMIT") {
          throw error;
        }

        if (i < uniqueModels.length - 1 && isModelUnsupported(error.message)) {
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError ?? new AIServiceError("Falha ao consultar o provedor de IA", "REQUEST_FAILED");
}
