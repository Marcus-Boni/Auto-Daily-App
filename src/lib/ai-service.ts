const HUGGING_FACE_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HUGGING_FACE_MODEL = "Qwen/Qwen2.5-7B-Instruct";
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

export async function generateDailyWithAI(prompt: string): Promise<string> {
  const apiKey = getHuggingFaceApiKey();

  let response: Response;

  try {
    response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HUGGING_FACE_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
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

    const message = parseErrorMessage(payload);

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