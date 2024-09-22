import { IMessage } from "../models";

const fetchApi = async (messages: Array<IMessage>) => {
  const _headers = new Headers();
  _headers.append("Content-Type", "application/json");
  _headers.append("accept", "text/event-stream");

  const raw = JSON.stringify({
    model: import.meta.env.VITE_INFRA_MODEL,
    messages: messages,
    stream: true,
  });

  const requestOptions = {
    method: "POST",
    headers: _headers,
    body: raw,
  };

  return fetch(import.meta.env.VITE_INFRA_URL, requestOptions);
};

const handleStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  callback: (chunk: IMessage) => void
) => {
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunkString = decoder.decode(value, { stream: true });

    const splitChunks = chunkString.split("\n\n"); //fix lost 2 record first

    for (const chunk of splitChunks) {
      if (chunk.includes("[DONE]")) break;

      if (chunk.includes("data:")) {
        const chunkJson = JSON.parse(chunk.split("data: ")[1]);

        const content = chunkJson.choices[0].delta?.content ?? "";
        callback({
          role: "assistant",
          content: content,
        });
      }
    }
  }
};

const callInfraAPI = async (
  messages: Array<IMessage>,
  callback: (chunk: IMessage) => void
) => {
  try {
    const response = await fetchApi(messages);
    const reader = response?.body?.getReader();

    if (reader) {
      await handleStream(reader, callback);
    }
  } catch (error) {
    console.log(error);
  }
};

export { callInfraAPI };
