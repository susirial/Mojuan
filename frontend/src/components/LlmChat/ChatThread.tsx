import useFetchThread from "../../hooks/useFetchThread";
import {ChatMessageV3} from "./ChatMessageV3";

function ChatThread() {
    const { data} = useFetchThread('my_talk');

    
    return (
        <div>
            <h1> 对话 Thread </h1>
            {data.map((message, index) => (
            <div
                key={index}
                className="my-1 sm:my-1.5"
            >
                <ChatMessageV3 message={message} />
            </div>
            ))}
        </div>
    )
}

export default ChatThread