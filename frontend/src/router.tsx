
import {
  createBrowserRouter,
} from "react-router-dom";
import MyHome from "./components/MyHome";
import MyPage from "./components/MyPage";
import Stream from "./components/Stream";
import AiTalk from "./components/AiTalk";
import ChatHomeV2 from "./components/LlmChat/ChatHomeV2";
import ChatHomeV3 from "./components/LlmChat/ChatHomeV3";
import ChatHome from "./components/LlmChat/ChatHome";
import TestUseCallBack from "./components/LlmChat/TestUseCallBack";
import MyDropzone from "./components/LlmChat/TestUseDropZone";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MyHome />,
  },
  {
    path: "/mypage",
    element: <MyPage/>,
  },
  {
    path: "/talk",
    element: <Stream/>,
  },
  {
    path: "/aitalk",
    element: <AiTalk/>,
  },
  {
    path: "/chathome",
    element: <ChatHome />,
  },
  {
    path: "/chathomev2",
    element: <ChatHomeV2 />,
  },
  {
    path: "/chathomev3",
    element: <ChatHomeV3 />,
  },
  {
    path: "/cbtest",
    element: <TestUseCallBack />,
  },
  {
    path:'/dropfile',
    element: <MyDropzone/>,
  },

]);


export default router;