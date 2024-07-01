import { memo, useState,useEffect } from "react";
import { Message as MessageType } from "../hooks/useChatList";
import { str } from "../utils/str";
import { cn } from "../utils/cn";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { LangSmithActions } from "./LangSmithActions";
import { DocumentList } from "./Document";
import { Avatar,Typography  } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Robot from "../assets/robot-bot.png";

const { Text } = Typography;

function tryJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
}

function Function(props: {
  call: boolean;
  name?: string;
  args?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  return (
    <>
      {props.call && (
        <span className="text-gray-900 whitespace-pre-wrap break-words mr-2">
          使用
        </span>
      )}
      {props.name && (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 relative -top-[1px] mr-2">
          {props.name}
        </span>
      )}
      {!props.call && props.setOpen && (
        <span
          className={cn(
            "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 cursor-pointer relative top-1",
            props.open && "mb-2",
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            props.setOpen?.(!props.open);
          }}
        >
          <ChevronDownIcon
            className={cn("h-5 w-5 transition", props.open ? "rotate-180" : "")}
          /> 查看工具调用细节
          
        </span>
      )}
      {props.args && (
        <div className="text-gray-900 my-2 whitespace-pre-wrap break-words">
          <div className="ring-1 ring-gray-300 rounded">
            <table className="divide-y divide-gray-300">
              <tbody>
                {Object.entries(tryJsonParse(props.args)).map(
                  ([key, value], i) => (
                    <tr key={i}>
                      <td
                        className={cn(
                          i === 0 ? "" : "border-t border-transparent",
                          "py-1 px-3 table-cell text-sm border-r border-r-gray-300",
                        )}
                      >
                        <div className="font-medium text-gray-500">{key}</div>
                      </td>
                      <td
                        className={cn(
                          i === 0 ? "" : "border-t border-gray-200",
                          "py-1 px-3 table-cell",
                        )}
                      >
                        {str(value)}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export const Message = memo(function Message(
  props: MessageType & { runId?: string },
) {
  const [htmlContent, setHtmlContent] = useState('');  
  const [open, setOpen] = useState(false);
  const contentIsDocuments =
    ["function", "tool"].includes(props.type) &&
    Array.isArray(props.content) &&
    props.content.every((d) => !!d.page_content);

    useEffect(() => {  
      if (typeof props.content === 'string') {  
        Promise.resolve(marked(props.content))  
          .then((markup) => {  
            setHtmlContent(DOMPurify.sanitize(markup).trim());  
          })  
          .catch((error) => {  
            console.error('Error processing markdown', error);  
            setHtmlContent(''); // 或者设置为一些错误信息  
          });  
      }  
    }, [props.content]);  

  return (
    <div className="flex flex-col mb-8">
      <div className="leading-6 flex flex-row">
        <div
          className={cn(
            "font-medium text-sm text-gray-400 uppercase mr-2 mt-1 w-28 flex flex-col",
            props.type === "function" && "mt-2",
          )}
        >
  
          <div> {props.type === 'human' ? 
          <><Avatar size='small'   style={{ backgroundColor: '#40a9ff' }} icon={<UserOutlined />}  /> <Text strong>你</Text></> 
          :<><Avatar size='small'   src={Robot}  /> <Text strong>{props.type}</Text></>}</div>
        </div>
        <div className="flex-1">
          {["function", "tool"].includes(props.type) && (
            <Function
              call={false}
              name={props.name ?? props.additional_kwargs?.name}
              open={open}
              setOpen={contentIsDocuments ? undefined : setOpen}
            />
          )}
          {props.additional_kwargs?.function_call && (
            <Function
              call={true}
              name={props.additional_kwargs.function_call.name}
              args={props.additional_kwargs.function_call.arguments}
            />
          )}
          {props.additional_kwargs?.tool_calls
            ?.filter((call) => call.function)
            ?.map((call) => (
              <Function
                key={call.id}
                call={true}
                name={call.function?.name}
                args={call.function?.arguments}
              />
            ))}
          {(
            ["function", "tool"].includes(props.type) && !contentIsDocuments
              ? open
              : true
          ) ? (
            typeof props.content === "string" ? (
              <div
                className="text-gray-900 prose"
                dangerouslySetInnerHTML={{
                  // __html: DOMPurify.sanitize(marked(props.content)).trim(),
                  __html: htmlContent,  
                }}
              />
            ) : contentIsDocuments ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <DocumentList documents={props.content as any} />
            ) : (
              <div className="text-gray-900 prose">{str(props.content)}</div>
            )
          ) : (
            false
          )}
        </div>
      </div>
      {props.runId && (
        <div className="mt-2 pl-[120px]">
          <LangSmithActions runId={props.runId} />
        </div>
      )}
    </div>
  );
});
