//写一个自定义的hook，接收一个text参数，拼接成一个url,比如`https://jsonplaceholder.typicode.com/${text}`
//你需要通过fetch方法来访问这个连接，得到数据，保存在data里面
//你需要返回一个loading变量，一个error变量，一个data变量，一个更新函数
//你用useState来保存用户输入的text，用useEffect来处理fetch请求

import { useState, useEffect } from 'react';

const useFetchData = (text: string) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(text);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://jsonplaceholder.typicode.com/${url}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setData(data);
                setLoading(false);
                setError(null);
                
            } catch (error) {
                setLoading(false);
                setError(error.message);
            } finally {
                setLoading(false);
            }
            
        };
        fetchData();
        
    }, [url]);

    function updateText(newText: string) {
        setUrl(newText);
    }
    
    return { data, loading, error, updateText};
}

export default useFetchData;