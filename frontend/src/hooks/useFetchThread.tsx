
import { useState, useEffect } from 'react';
import { MessageWithFilesV2 } from '../utils/ChatItems';

const useFetchThread = (tid: string | null) => {
    const [data, setData] = useState<MessageWithFilesV2[]>([]);
    const [loadingTid, setLoadingTid] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [thread_id, setThread] = useState(tid);

    useEffect(() => {
        const fetchData = async () => {

            if (!thread_id) {
                return;
            }
            setLoadingTid(true);
            try {
                const response = await fetch(`/threads/${thread_id}/history`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
       
                const messages: MessageWithFilesV2[] = data.map((item: MessageWithFilesV2) => ({  
                    id: item.id,  
                    type: item.type === 'ai' ? 'assistant' : 'user',  
                    content: item.content,  
                    name: item.name,  
                    additional_kwargs: item.additional_kwargs,  
                    example: item.example,  
                  })); 
                setData(messages)

                setLoadingTid(false);
                setError(null);
                
            } catch (error) {
                setLoadingTid(false);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('未知错误！');
                }
               
            } finally {
                setLoadingTid(false);
            }
            
        };
        fetchData();
        
    }, [tid]);

    function updateThread(thread_id: string) {
        setThread(thread_id);
    }
    
    return { data, loadingTid, error, updateThread};
}

export default useFetchThread;