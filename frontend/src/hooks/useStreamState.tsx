import { useCallback, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Message } from "./useChatList";
import useChatRolAuth from './useChatRolAuth';

export interface StreamState {
  status: "inflight" | "error" | "done";
  messages?: Message[];
  run_id?: string;
  error?: string; // 新增一个可选的错误信息属性  
}

export interface StreamStateProps {
  stream: StreamState | null;
  startStream: (input: Message[] | null, thread_id: string) => Promise<void>;
  stopStream?: (clear?: boolean) => void;
}

function useStreamState(): StreamStateProps {
  const [current, setCurrent] = useState<StreamState | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const { authToken} = useChatRolAuth(); 

  const startStream = useCallback(
    async (input: Message[] | null, thread_id: string) => {
      const controller = new AbortController();
      setController(controller);
      setCurrent({ status: "inflight", messages: input || [] });

      await fetchEventSource("/runs/stream", {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json",'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ input, thread_id }),
        openWhenHidden: true,
        onmessage(msg) {
          if (msg.event === "data") {
            const messages = JSON.parse(msg.data);
            setCurrent((current) => ({
              status: "inflight" as StreamState["status"],
              messages: mergeMessagesById(current?.messages, messages),
              run_id: current?.run_id,
            }));
          } else if (msg.event === "metadata") {
            const { run_id } = JSON.parse(msg.data);
            setCurrent((current) => ({
              status: "inflight",
              messages: current?.messages,
              run_id: run_id,
            }));
          } else if (msg.event === "error") {
            setCurrent((current) => ({
              status: "error",
              messages: current?.messages,
              run_id: current?.run_id,
            }));
          }
        },
        onclose() {
          setCurrent((current) => ({
            status: current?.status === "error" ? current.status : "done",
            messages: current?.messages,
            run_id: current?.run_id,
          }));
          setController(null);
        },
        onerror(error) {
          setCurrent((current) => ({
            status: "error",
            messages: current?.messages,
            run_id: current?.run_id,
            error: error.message || "An unknown error occurred", // 设置错误信息
          }));
          setController(null);
          // susirial throw error;
        },
      });
    },
    [],
  );

  const stopStream = useCallback(
    (clear: boolean = false) => {
      controller?.abort();
      setController(null);
      if (clear) {
        setCurrent((current) => ({
          status: "done",
          run_id: current?.run_id,
        }));
      } else {
        setCurrent((current) => ({
          status: "done",
          messages: current?.messages,
          run_id: current?.run_id,
        }));
      }
    },
    [controller],
  );

  return {
    startStream,
    stopStream,
    stream: current,
  };
}

export function mergeMessagesById(
  left: Message[] | null | undefined,
  right: Message[] | null | undefined,
): Message[] {
  const merged = (left ?? [])?.slice();
  for (const msg of right ?? []) {
    const foundIdx = merged.findIndex((m) => m.id === msg.id);
    if (foundIdx === -1) {
      merged.push(msg);
    } else {
      merged[foundIdx] = msg;
    }
  }
  return merged;
}

export default useStreamState;