
import { FC } from "react";
import { ChatInputV2 } from "./ChatInputV2";
import { ChatLoaderV2 } from "./ChatLoaderV2";
import { ChatMessage } from "./ChatMessage";
import { ResetChat } from "./ResetChat";
import { Message } from "../../utils/ChatItems";

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (message: Message) => void;
  onReset: () => void;
  onCancle:() => void;

}


export const ChatV2: FC<Props> = ({ messages, loading, onSend, onReset, onCancle }) => {
  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-8">
        <ResetChat onReset={onReset} />
      </div>

      <div className="flex flex-col rounded-lg px-2 sm:p-4 sm:border border-neutral-300">
        {messages.map((message, index) => (
          <div
            key={index}
            className="my-1 sm:my-1.5"
          >
            <ChatMessage message={message} />
          </div>
        ))}

        {loading && (
          <div className="my-1 sm:my-1.5">
            <ChatLoaderV2 />
          </div>
        )}

        <div className="mt-4 sm:mt-8 bottom-[56px] left-0 w-full">
          <ChatInputV2 onSend={onSend} loading={loading} onCancle={onCancle}/>
        </div>
      </div>
    </>
  );
};
