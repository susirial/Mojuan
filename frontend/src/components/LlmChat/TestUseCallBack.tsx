import { useState,useEffect,useCallback } from 'react'
import '../../styles/tailwindStyle.css'


function List({ getItems }) {
    const [items, setItems] = useState([])
  
    useEffect(() => {
      setItems(getItems())
      console.log('List 组件更新')
    }, [getItems])

  
    return items.map(item => <div key={item}>{item}</div>)
  }



 function TestUseCallBack() {
    const [number, setNumber] = useState(1)
    const [dark, setDark] = useState(false)

    // const getItems = () => {
    //     return [number, number + 1, number + 2]
    // }

    const getItems = useCallback(() => {
        return [number, number + 1, number + 2];
    }, [number]);

    const theme = {
        backgroundColor: dark ? '#333' : '#FFF',
        color: dark ? '#FFF' : '#333'
    }

    return (
        <div className="flex flex-col h-screen" style={theme} >
            <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
            <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
                <div>
                    <input type="number" value={number} onChange={e => setNumber(parseInt(e.target.value))} className="focus:ring-1 focus:ring-neutral-300 border-2 border-neutral-200"/>
                    <button onClick={() => setDark(prevDark=>!prevDark)}>切换主题</button>
                    <List getItems={getItems} />
                </div>
            </div>
            </div>
        </div>
    )
}

export default TestUseCallBack
