import { createContext, useContext, useState, useEffect, ReactNode } from 'react';    
import { jwtDecode } from "jwt-decode";
  
// 定义 JWT 解码函数  
const isTokenExpired = (token:string) => {  
  try {  
    const decodedToken = jwtDecode(token);  
    const currentTime = Date.now() / 1000;  
    if (decodedToken.exp === undefined) {
      return true; // 如果 token 没有过期时间，假设它已经过期
    }
    return decodedToken.exp < currentTime;  
  } catch (error) {  
    return true; // 如果无法解码 token，假设它已经过期  
  }  
};  
  
interface AuthContextType {  
  authToken: string;  
  login: (token: string) => void;  
  logout: () => void;  
  checkToken: () => boolean;  
}  
  
const defaultAuthContext: AuthContextType = {  
  authToken: 'undefined',  
  login: () => {},  
  logout: () => {},  
  checkToken: () => false  
};  
  
const AuthContext = createContext<AuthContextType>(defaultAuthContext);  
  
export const AuthProvider = ({ children }: { children: ReactNode }) => {  
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || 'undefined');  
 
  
  useEffect(() => {  

  
    // 检查 token 是否过期，并在必要时处理登出  
    if (authToken !== 'undefined' && isTokenExpired(authToken)) {  
      logout();  
    }  
  }, [authToken]);  
  
  const login = (token: string) => {  
    localStorage.setItem('authToken', token);  
    setAuthToken(token);  

  };  
  
  const logout = () => {  
    localStorage.removeItem('authToken');  
    setAuthToken('undefined');  

  };  
  
  const checkToken = () => {  
    return authToken !== 'undefined' && authToken !== 'null' && !isTokenExpired(authToken);  
  };  
  
  return (  
    <AuthContext.Provider value={{ authToken, login, logout, checkToken }}>  
      {children}  
    </AuthContext.Provider>  
  );  
};  
  
const useChatRolAuth = () => {  
  return useContext(AuthContext);  
};  
  
export default useChatRolAuth;  
