import { MessageWithFilesV2 } from "../../utils/ChatItems";
import { FC,Fragment } from "react";
import {
    DocumentTextIcon,
    DocumentIcon,
} from "@heroicons/react/20/solid";

interface Props {
  message: MessageWithFilesV2;
}

export const ChatMessageV3: FC<Props> = ({ message }) => {


    function getFileTypeIcon(fileType: string) {
        switch (fileType) {
          case "text/plain":
          case "text/csv":
          case "text/html":
            return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
          case "application/pdf":
            return <DocumentIcon className="h-5 w-5 text-red-500" />;
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          case "application/msword":
            return <DocumentIcon className="h-5 w-5 text-blue-500" />;
          default:
            return <DocumentIcon className="h-5 w-5 text-gray-500" />;
        }
      }
    
      function FileIcon(props: { fileType: string }) {
        return <div>{getFileTypeIcon(props.fileType)}</div>;
      }

    const FilesToShow = message.files?.map((file) => {
// This would be a new utility function.
        return (
          <Fragment key={file.name}>
            <div className="flex items-center">
              <FileIcon fileType={file.type} />{" "}
              {/* New component to render file type icons */}
              <span className="ml-2">{file.name}</span>
            </div>
          </Fragment>
        );
      });

      return (  
        <div className={`flex flex-col ${message.type === "assistant" ? "items-start" : "items-end"}`}>  
          <div  
            className={`flex items-center ${message.type === "assistant" ? "bg-neutral-200 text-neutral-900" : "bg-blue-500 text-white"} rounded-2xl px-3 py-2 max-w-[67%] whitespace-pre-wrap`}  
            style={{ overflowWrap: "anywhere" }}  
          >  
            {typeof message.content === 'string' ? message.content : '非文本内容'}  
          </div>  
          {/* 文件展示的逻辑应该在这里添加，如果有文件信息 */}  
          {message.files && FilesToShow}
          <div>  
            {/* 可能的文件展示组件 */}  
          </div>  
        </div>  
      );  
    }; 