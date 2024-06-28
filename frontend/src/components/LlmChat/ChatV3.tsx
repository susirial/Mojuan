
import { FC } from "react";
import { ChatInputV3 } from "./ChatInputV3";
import { ChatLoaderV2 } from "./ChatLoaderV2";
import { ChatMessageV2 } from "./ChatMessageV2";
import { ResetChat } from "./ResetChat";
import { MessageWithFiles } from "../../utils/ChatItems";

interface Props {
  messages: MessageWithFiles[];
  loading: boolean;
  onSend: (message: MessageWithFiles) => void;
  onReset: () => void;
  onCancle:() => void;

}


export const ChatV3: FC<Props> = ({ messages, loading, onSend, onReset, onCancle }) => {
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
            <ChatMessageV2 message={message} />
          </div>
        ))}

        {loading && (
          <div className="my-1 sm:my-1.5">
            <ChatLoaderV2 />
          </div>
        )}

        <div className="mt-4 sm:mt-8 bottom-[56px] left-0 w-full">
          <ChatInputV3 onSend={onSend} loading={loading} onCancle={onCancle}/>
        </div>
      </div>
    </>
  );
};
