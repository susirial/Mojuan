import {PlusIcon,  ArrowLongRightIcon} from "@heroicons/react/24/outline";

import { ChatListProps } from "../hooks/useChatList";
import { cn } from "../utils/cn";
import useThreadAndAssistant from "../hooks/useThreadAndAssistant.ts";
import {useCallback} from "react";
import { useNavigate } from "react-router-dom";

export function ChatList(props: {
  chats: ChatListProps["chats"];
  enterChat: (id: string | null) => void;
  enterConfig: (id: string | null) => void;
  deleteChat: (thread_id: string) => void; // New prop to handle chat deletion
}) {
  const navigate = useNavigate();
  const { currentChat, assistantConfig } = useThreadAndAssistant();

const deleteChat = useCallback(async (thread_id: string) => {
    try {
      const response = await fetch(`/threads/delete`, {
        method: "POST",
        body: JSON.stringify({ thread_id }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const saved = await response.json();
      console.log('susirial 删除对话返回', saved);

      // 父组件删除对话
      props.deleteChat(thread_id);
      navigate("/");

    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }, [props]);

    return (
    <>
      <div
        onClick={() => props.enterChat(null)}
        className={cn(
          !currentChat && assistantConfig
            ? "bg-gray-50 text-indigo-600"
            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
          "group flex gap-x-3 rounded-md -mx-2 p-2 leading-6 font-semibold cursor-pointer",
        )}
      >
        <span
          className={cn(
            !currentChat && assistantConfig
              ? "text-indigo-600 border-indigo-600"
              : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
          )}
        >
          <PlusIcon className="h-4 w-4" />
        </span>
        <span className="truncate">新建 对话</span>
      </div>

      <div
        onClick={() => props.enterConfig(null)}
        className={cn(
          !assistantConfig
            ? "bg-gray-50 text-indigo-600"
            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
          "mt-1 group flex gap-x-3 rounded-md -mx-2 p-2 leading-6 font-semibold cursor-pointer",
        )}
      >
        <span
          className={cn(
            !assistantConfig
              ? "text-indigo-600 border-indigo-600"
              : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
          )}
        >
          <PlusIcon className="h-4 w-4" />
        </span>
        <span className="truncate">新机 器人</span>
      </div>

      <div className="text-xs font-semibold leading-6 text-gray-400 mt-4">
        你的对话
      </div>
      <ul role="list" className="-mx-2 mt-2 space-y-1">
        {props.chats?.map((chat) => (
          <li key={chat.thread_id}>
            <div
              className={cn(
                chat.thread_id === currentChat?.thread_id
                  ? "bg-gray-50 text-indigo-600"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                "group flex gap-x-3 rounded-md p-2 leading-6 cursor-pointer",
              )}
            >
              <span
                  onClick={() => props.enterChat(chat.thread_id)}
                className={cn(
                  chat.thread_id === currentChat?.thread_id
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
                )}
              >
                {chat.name?.[0] ?? " "}
              </span>
              <span className="truncate">{chat.name.substring(0, 4)}</span>
                <ArrowLongRightIcon className="h-4 w-4"/>
              <span
                  onClick={() => deleteChat(chat.thread_id)}
                  className={cn(
                  chat.thread_id === currentChat?.thread_id
                    ? "text-indigo-600 border-indigo-600"
                    : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
                )}>
                {/*<button onClick={() => deleteChat(chat.thread_id)}*/}
                {/*> 删除</button>*/}
                {'删除'}
              </span>

            </div>

          </li>
        )) ?? (
          <li className="leading-6 p-2 animate-pulse font-black text-gray-400 text-lg">
            ...
          </li>
        )}
      </ul>
    </>
  );
}
