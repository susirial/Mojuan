import {useEffect,useState} from 'react';

function MyPage() {

    // 使用useEffect 来访问后端 http://127.0.0.1:8100/test 地址
    //通过fetch 请求， 返回loading 状态,error 状态,data 状态
    //定义3个 zhuangtai 变量， 分别表示loading, error, data 状态
    // 一步一步实现，fetch 中不使用.then(), .catch(), .finally()
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [data, setData] = useState(null);

     useEffect(() => {
         const fetchData = async () => {
             try {
                setLoading(true);
               const response = await fetch('/test');
                 const json = await response.json();
                 setData(json);
                 setLoading(false);
             }
             catch (error) {
                 setError(error);
                 setLoading(false);
             }
             finally {
                 setLoading(false);
             }
         }
         fetchData();
     }, [])

     if (loading) {
         return <div>Loading...</div>;
     }
     
     if (error) {
         return <div>Error: {error.message}</div>;
     }

    return (
        <div>
            <h1>My Page</h1>
            <p>This is my custom page.</p>
            {/* Add more content here */}
            <h2>{data.param}</h2>
        </div>
    );
}
export default MyPage;