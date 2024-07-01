// import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router.tsx'
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from './hooks/useChatRolAuth.tsx'

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(

    <AuthProvider>
    <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    </QueryClientProvider>
    </AuthProvider>
 
)
