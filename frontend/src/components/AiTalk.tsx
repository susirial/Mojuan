import { useState } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

function AiTalk() {

    const [inputData, setInputData] = useState('');
    const [kanbanData,setKanban] = useState<string>('');

    async function sseTalk(){

        const controller = new AbortController();


        await fetchEventSource('/ragstream', {
          signal: controller.signal,
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'data': inputData,
          }),
          onmessage: (event) => {
            setKanban((prev)=>prev + event.data)
          },
          onerror: (error) => {
            alert('出错')
            console.error('EventSource error:', error);
          },
          onclose: () => {
    
            //alert('关闭')
            setKanban((prev)=>prev + '\n')
            console.log('EventSource closed');
          }
        })
    }

    return (
        <>
        <pre>{kanbanData}</pre>
        <input type="text" value={inputData} onChange={(e) => setInputData(e.target.value)} />
        <button onClick={sseTalk}> 发送</button>
        </>
    )
    
}

export default AiTalk;

