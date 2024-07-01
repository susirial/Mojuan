import { Schemas } from "../hooks/useSchemas";
import { ChatRolLlmCfg } from "./ChatRolLlmCfg";
import {
  ConfigListProps,
  Config as ConfigInterface,
} from "../hooks/useConfigList";
import { cn } from "../utils/cn";
import { MessageWithFiles } from "../utils/formTypes.ts";
import { useParams } from "react-router-dom";
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

export function ChatRolAsisstantCfg(props: NewChatProps) {

  const { assistantId } = useParams();

  const { assistantConfig, isLoading } = useThreadAndAssistant();

  if (isLoading) return <div>连接服务器...</div>;


  return (
    <div
      className={cn(
        "flex flex-col items-stretch",
        assistantConfig ? "pb-[76px]" : "pb-6",
      )}
    >
      <div className="flex-1 flex flex-col md:flex-row lg:items-stretch self-stretch">
        <main className="flex-1">
          <div className="px-4">
            <ChatRolLlmCfg
              key={assistantId}
              config={assistantConfig || null}
              configSchema={props.configSchema}
              configDefaults={props.configDefaults}
              saveConfig={props.saveConfig}
              enterConfig={props.enterConfig}
            />
          </div>
        </main>
      </div>

    </div>
  );
}
