
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useState } from 'react';

function Chat() {

  // const [inFlight, setInFlight] = useState(false);
  // const [error, setError] = useState('');
  // const [history, setHistory] = useState<string[]| null >([])

  const [inputData, setInputData] = useState('初始值');
  const [controler, setControler] = useState<AbortController| null>(null);
  const [data, setData] = useState<string| null>(null)

  async function startStream() {

    const controller = new AbortController();
    setControler(controller);
  
    await fetchEventSource('/stream', {
      signal: controller.signal,
      method:'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'data': inputData,
      }),
      onmessage: (event) => {
        console.log('Received event:', event);
        if (event.event === 'msg')
          alert(event.data);
        else{
          setData(event.data);
        
        }
      },
      onerror: (error) => {
        console.error('EventSource error:', error);
      },
      onclose: () => {
        controler?.abort();
        console.log('EventSource closed');
      }
    })
  }

  return (
    <div>
      <h1>Chat</h1>
      <p>This is the chat component.</p>
      <input type="text" value={inputData} onChange={(e) => setInputData(e.target.value)} />
      <button onClick={startStream}> 发送</button>
      <h2> {data}</h2>
    </div>
  );
}

export default Chat;