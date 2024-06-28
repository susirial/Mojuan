import { useState } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

function Stream() {
    const [inputData, setInputData] = useState<string>('初始值')
    const [sseData, setSseData] = useState<string|null>(null);

    async function submitData() {
        
        const ctrl = new AbortController();
        fetchEventSource('/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: inputData
            }),
            signal: ctrl.signal,
            onmessage(msg) {

                alert(msg.data);
                setSseData(msg.data);
                console.log(msg.data);

            },
            onclose() {
                alert('关闭');
            },
            onerror(err) {
            
                alert('错误');
            }
        });

    }


    // 写一个input 和一个button  

    return(
        <>

        <input value={inputData} onChange={(e) => setInputData(e.target.value)} />
        <button onClick={submitData}>提交</button>
        <h2>{sseData}</h2>
        </>
    )
   

}

export default Stream;