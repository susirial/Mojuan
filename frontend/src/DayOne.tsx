
import useFetchData from './hooks/useFetchData';
//`
function DayOne() {


    const {data,loading,error,updateText} = useFetchData('posts');

    if(loading){
        return <div>loading</div>
    }
    if(error){
        return <div>error</div>
    }
    if(!data){
        return <div>no data</div>
    }


    return (
        <>
            <div>这是组件</div>
            <div>
                <button onClick={() => updateText('posts')}>posts</button>
                <button onClick={() => updateText('comments')} >comments</button>
                <button onClick={() => updateText('users')} >users</button>
            </div>
            {/* <h1>{text}</h1> */}
            {data.map(
                item=>{
                    return <pre> {JSON.stringify(item)}</pre>;}
            )}
        </>

    )
}

export default DayOne;