import { MessageWithFiles } from "../../utils/ChatItems";
import { IconArrowUp } from "@tabler/icons-react";
import { FC, KeyboardEvent, useEffect, useRef, useState,useCallback,Fragment } from "react";
import {
    XCircleIcon,
    DocumentTextIcon,
    DocumentIcon,
} from "@heroicons/react/20/solid";
import { useDropzone } from "react-dropzone";
import {
    DocumentPlusIcon,
  } from "@heroicons/react/20/solid";

import { DROPZONE_CONFIG } from '../../constants';
import { cn } from '../../utils/cn';


interface Props {
  onSend: (message: MessageWithFiles) => void;
  loading: boolean;
  onCancle: () => void;
}

function convertBytesToReadableSize(bytes: number) {
    const units = ["bytes", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  }

export const ChatInputV3: FC<Props> = ({ onSend,loading,onCancle }) => {
  const [content, setContent] = useState<string>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDocumentRetrievalActive, setIsDocumentRetrievalActive] =
  useState(true);

  // 定义保存文件的字段
  const [files, setFiles] = useState<File[]>([]);



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
  

  // 自定义 onDrop 方法
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => {
      const newFiles = acceptedFiles.filter(
        (acceptedFile) =>
          !prevFiles.some(
            (prevFile) =>
              prevFile.name === acceptedFile.name &&
              prevFile.size === acceptedFile.size,
          ),
      );
      return [...prevFiles, ...newFiles];
    });
  }, []);


  const { open } = useDropzone({
    ...DROPZONE_CONFIG,
    onDrop,
    // Disable click and keydown behavior
    noClick: true,
    noKeyboard: true,
  });
  const FilesToShow = files.map((file) => {
    const readableSize = convertBytesToReadableSize(file.size); // This would be a new utility function.
    return (
      <Fragment key={file.name}>
        <div className="flex items-center">
          <FileIcon fileType={file.type} />{" "}
          {/* New component to render file type icons */}
          <span className="ml-2">{file.name}</span>
        </div>
        <span className="text-sm text-gray-600">{readableSize}</span>
        <span
          className="justify-center not-prose ml-2 inline-flex items-center rounded-full text-xs font-medium cursor-pointer bg-gray-50 text-gray-600 relative top-[1px]"
          onClick={() => setFiles((files) => files.filter((f) => f !== file))}
        >
          <XCircleIcon className="h-4 w-4" />
        </span>
      </Fragment>
    );
  });



  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > 4000) {
      alert("Message limit is 4000 characters");
      return;
    }

    setContent(value);
  };

  const handleSend = () => {
    if (!content) {
      alert("Please enter a message");
      return;
    }
    onSend({ role: "user", content, files});
    
    // 清空文档
    setFiles([])
  
    setContent("");
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [content]);

  return (
    <>
    <div className="flex flex-col">
      {files.length > 0 ? (
        <div
          className={cn(
            "self-end w-fit grid grid-cols-[auto,1fr,auto]" +
              " gap-2 p-2 bg-white rounded-md text-sm text-gray-900" +
              " shadow-sm border border-gray-300",
              loading && "opacity-50 cursor-not-allowed",
          )}
        >
          {FilesToShow}
        </div>
      ) : null}
      <form
        className="mt-2 flex rounded-md shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          if (loading) return;
          const form = e.target as HTMLFormElement;
          const message = form.message.value;
          if (!message) return;
         
          alert("发送成功");
        
      
          form.message.value = "";
          setFiles([]);
        }}
      >
        {" "}
        <div
          className={cn(
            "relative flex flex-grow items-stretch focus-within:z-10",
            loading && "opacity-50 cursor-not-allowed",
          )}
        >

          <textarea
            disabled={loading}
            name="messsage"
            id="message"
            ref={textareaRef}
            className="min-h-[44px] rounded-lg pl-4 pr-12 py-2 w-full focus:outline-none focus:ring-1 focus:ring-neutral-300 border-2 border-neutral-200"
            style={{ resize: "none" }}
            placeholder="输入消息..."
            value={content}
            rows={1}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {isDocumentRetrievalActive && (
            <div className="cursor-pointer absolute m-1 p-3 inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50">
              <DocumentPlusIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
                onClick={open}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          onClick={
            loading
              ? (e) => {
                  e.preventDefault();
                  console.log("取消了对话");
                  
                  onCancle();
                }
              : (e)=>{e.preventDefault();console.log("开始对话");handleSend()}
          }
 
          className={cn(
            "relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 " +
              "py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 bg-white",
              loading &&  "opacity-50 cursor-not-allowed",
          )}
        >
          {loading ? (
            <XCircleIcon
              className="-ml-0.5 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          ) : (
            <IconArrowUp
              className="hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white hover:opacity-80"
              aria-hidden="true"
            />
          )}
          {loading ? "取消"  : "发送"}
        </button>
      </form>
    </div>
    </>
  );
};
