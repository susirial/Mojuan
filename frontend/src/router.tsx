import { createBrowserRouter } from "react-router-dom";
import Home from "../src/components/Home";
import NotFound from "./components/NotFound";
import ChatRolUserSignIn from "./components/ChatRolUserSignIn";
import ChatRol404 from "./components/ChatRol404";
import ChatRol403 from "./components/ChatRol403";
import ChatRol500 from "./components/ChatRol500";
import ChatRolStepReg from "./components/ChatRolStepReg";
import ChatRolResetPass from "./components/ChatRolResetPass";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path:"/thread/:chatId",
         element: <Home />
    },
    {
        path:"/assistant/:assistantId",
        element: <Home />    
    },
    {
        path:"/cfg",
        element: <Home edit={true}/>    
    },
    {
        path:"/signup",  
        element: <ChatRolStepReg/>
    },
    {
        path:"/resetpwd",
        element: <ChatRolResetPass/>
    },
    {
        path:"/signin",
        element: <ChatRolUserSignIn/>   
    },
    {
        path:"404",
        element:<ChatRol404/>  
    },
    {
        path:"403",
        element:<ChatRol403/>  
    },
    {
        path:"/500/:errorCode",
        element:<ChatRol500/>  
    },
    {
        path:"*",
        element: <NotFound />    
    },


]);

export default router;