import React, { useEffect, useState } from "react";
import MainHeader from './components/MainHeader';
import Navbar from './components/Navbar';
import { getVerification } from './api/auth';
import {useNavigate} from 'react-router-dom';
import DisableDevtool from 'disable-devtool';
import { ToastContainer } from 'react-toastify';
import { useCookies } from 'react-cookie'
import Dashboard from "./pages/Dashboard";

function App() {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  let [optionNavbar, setOptionNavbar] = useState(null);

  let [verifyResultStatus, setVerifyResultStatus] = useState(null);

  useEffect(() => {
   // - DisableDevtool();
    (async () => {
      try {
        const verifyResult = await getVerification(cookies.token);
        setVerifyResultStatus(verifyResult.success);
        if (!verifyResult.success) {
          navigate("/login");
        }
      } catch(ex) {
        navigate("/login");
      }
    })();
  }, []);

  const logout = () => {
    removeCookie('token');
    navigate("/login");
  }

  return (
    <>
      <Navbar logout={logout} />
      <MainHeader />
      <Dashboard showLayout={false} />
    </>
  );
}

export default App;
