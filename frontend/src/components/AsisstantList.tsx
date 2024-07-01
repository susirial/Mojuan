
import useConfigList from "../hooks/useConfigList";
import {Config} from "../hooks/useConfigList";
import AsisstantCard from "./AsisstantCard";
import { Divider } from "antd";


function AsisstantList(props: {
  currentConfig: Config | null | undefined;
  enterConfig: (id: string | null) => void;
}) {
    const { configs,deleteConfig} = useConfigList();



    async function deleteAssistantConfig(id: string) {
      await deleteConfig(id);
      window.location.reload();  

    }

    return (
        <ul role="list" className="-mx-2 mt-2 space-y-1">
        {configs?.map((config) => (
          <li key={config.assistant_id} style={{margin: '10px'}}>
            <AsisstantCard config={config} currentConfig={props.currentConfig} enterConfig={props.enterConfig} deleteConfig={deleteAssistantConfig}/>
          </li>
        )) ?? (
          <li className="leading-6 p-2 animate-pulse font-black text-gray-400 text-lg">
         <Divider type='horizontal'>暂无数据</Divider>
          </li>
        )}
      </ul>
    )
}


export default AsisstantList;