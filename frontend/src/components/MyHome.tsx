import {useState} from 'react';

function MyHome() {

    const [inputData, setInputData] = useState<string>('初始值');

    async function sendData() {
        try {
            const response = await fetch('testpost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: inputData,
                }),
                })
            if (!response.ok) {
                alert('请求失败');
                return;
                
            }
            const data = await response.json();
            alert(data.param);
        }
        catch (error) {
            alert('请求失败');
        }
    }
    

    return (
        <div>
            <h1>My Home Page</h1>
            <p>Welcome to my home page.</p>
            <input type="text" value={inputData} onChange={(e) => setInputData(e.target.value)} />
            <button onClick={sendData}>点击我</button>

        </div>
    );
}

export default MyHome;