
import { Schemas } from "../hooks/useSchemas.ts";
import TypingBox from "./TypingBox.tsx";

import {
  ConfigListProps,
  Config as ConfigInterface,
} from "../hooks/useConfigList.ts";
import { cn } from "../utils/cn.tsx";
import { MessageWithFiles } from "../utils/formTypes.ts";
import useThreadAndAssistant from "../hooks/useThreadAndAssistant.ts";

interface NewChatProps extends ConfigListProps {
  configSchema: Schemas["configSchema"];
  configDefaults: Schemas["configDefaults"];
  enterConfig: (id: string | null) => void;
  startChat: (
    config: ConfigInterface,
    message: MessageWithFiles,
  ) => Promise<void>;
}

export function ChatRolNewChat(props: NewChatProps) {

  const { assistantConfig, isLoading } = useThreadAndAssistant();

  if (isLoading) return <div>载入中...</div>;
  if (!assistantConfig)
    return <div>该助手不存在...</div>;

  return (
    <div
      className={cn(
        "flex flex-col items-stretch",
        assistantConfig ? "pb-[76px]" : "pb-6",
      )}
    >
      <div className="fixed left-0 lg:left-72 bottom-0 right-0 p-4">
        <TypingBox
          onSubmit={async (msg: MessageWithFiles) => {
            if (assistantConfig) {
              await props.startChat(assistantConfig, msg);
            }
          }}
          currentConfig={assistantConfig}
          currentChat={null}
        />
      </div>
    </div>
  );
}
