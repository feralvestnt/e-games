import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bulma/css/bulma.min.css';
import './index.css';
import './output.css';
import './theme.css';
import App from './App';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ClientPages from './pages/ClientPage';
import SellVoucher from './pages/SellVoucher';
import DebitVoucher from './pages/DebitVoucher';
import VoucherHistory from './pages/VoucherHistory';
import VoucherReversal from './pages/VoucherReversal';
import Dashboard from './pages/Dashboard';
import Support from './pages/Support';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/customers",
    element: <ClientPages />,
  },
  {
    path: "/client",
    element: <ClientPages />,
  },
   {
    path: "/sellVoucher",
    element: <SellVoucher />,
  }, 
  {
    path: "/debitVoucher",
    element: <DebitVoucher />,
  },  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/history",
    element: <VoucherHistory />,
  },
  {
    path: "/reversals",
    element: <VoucherReversal />,
  },
  {
    path: "/support",
    element: <Support />,
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} >
      <App />
    </RouterProvider>
    <ToastContainer position="top-right" autoClose={3000} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
