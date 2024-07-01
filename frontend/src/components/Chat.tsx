import { useEffect, useRef } from "react";
import { StreamStateProps } from "../hooks/useStreamState";
import { useChatMessages } from "../hooks/useChatMessages";
import TypingBox from "./TypingBox";
import { Message } from "./Message";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { MessageWithFiles } from "../utils/formTypes.ts";
import { useParams,useNavigate } from "react-router-dom";
import useThreadAndAssistant from "../hooks/useThreadAndAssistant.ts";

interface ChatProps extends Pick<StreamStateProps, "stream" | "stopStream"> {
  startStream: (
    message: MessageWithFiles | null,
    thread_id: string,
  ) => Promise<void>;
}

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function Chat(props: ChatProps) {
  const { chatId } = useParams();
  const { messages, next } = useChatMessages(
    chatId ?? null,
    props.stream,
    props.stopStream,
  );

  const { currentChat, assistantConfig, isLoading } = useThreadAndAssistant();
  const navigate = useNavigate();

  const prevMessages = usePrevious(messages);
  useEffect(() => {
    scrollTo({
      top: document.body.scrollHeight,
      behavior:
        prevMessages && prevMessages?.length === messages?.length
          ? "smooth"
          : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // 这里如果有错，一般是token过期了
  if (props.stream?.error){
    alert("Token 已过期，请重新登录~.~")
    navigate('/signin')
  }

  if (isLoading) return <div>载入中...</div>;
  if (!currentChat || !assistantConfig) return <div>没有找到数据...</div>;

  return (
    <div className="flex-1 flex flex-col items-stretch pb-[76px] pt-2">
      {messages?.map((msg, i) => (
        <Message
          {...msg}
          key={msg.id}
          runId={
            i === messages.length - 1 && props.stream?.status === "done"
              ? props.stream?.run_id
              : undefined
          }
        />
      ))}
      {(props.stream?.status === "inflight" || messages === null) && (
        <div className="leading-6 mb-2 animate-pulse font-black text-gray-400 text-lg">
          ...
        </div>
      )}
      {props.stream?.status === "error" && (
        <div className="flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
          An error has occurred. Please try again.
        </div>
      )}
      {next?.length > 0 && props.stream?.status !== "inflight" && (
        <div
          className="flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-yellow-600/20 cursor-pointer"
          onClick={() => props.startStream(null, currentChat.thread_id)}
        >
          <ArrowDownCircleIcon className="h-5 w-5 mr-1" />
          Click to continue.
        </div>
      )}
      <div className="fixed left-0 lg:left-72 bottom-0 right-0 p-4">
        <TypingBox
          onSubmit={(msg) => props.startStream(msg, currentChat.thread_id)}
          onInterrupt={
            props.stream?.status === "inflight" ? props.stopStream : undefined
          }
          inflight={props.stream?.status === "inflight"}
          currentConfig={assistantConfig}
          currentChat={currentChat}
        />
      </div>
    </div>
  );
}
