import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { faTv } from "@fortawesome/free-solid-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { faHeadset } from "@fortawesome/free-solid-svg-icons";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { faCircleMinus } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import LogoImage from "../img/logo.jpeg";
import { NavLink } from "react-router-dom";
import {useNavigate} from 'react-router-dom';
import { useCookies } from 'react-cookie'

function Navbar(props) {
  const {setOptionNavbar = () => {}} = props;
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const showSidebar = () => setSidebar(!sidebar);

  const logout = () => {
    removeCookie('token');
    navigate("/login");
  }

  return (
    <>
      <div value={{ color: '#fff' }}>
        <div className='navbar'>
          <Link to='#' className='menu-bars'>
            <FontAwesomeIcon icon={faBars} onClick={showSidebar} />
          </Link>
          <div className="navbar-user" aria-label="Usuario logado">
            <FontAwesomeIcon icon={faUserShield} />
            <span>Logado como administrador</span>
          </div>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars-close'>
                <FontAwesomeIcon icon={faClose} />
              </Link>
              
            </li>

            <li className="nav-text">
              <NavLink to="/customers">
                <FontAwesomeIcon icon={faUsers} />
                <span>Clientes</span>
              </NavLink>

            </li>

            <li className="nav-text">

              <NavLink to="/sellVoucher">
                <FontAwesomeIcon icon={faCirclePlus} />
                <span>Vender Voucher</span>
              </NavLink>
              
            </li>
            <li className="nav-text">
              <NavLink to="/debitVoucher">
                <FontAwesomeIcon icon={faCircleMinus} />
                <span>Debitar Voucher</span>
              </NavLink>
            </li>            <li className="nav-text">
              <NavLink to="/dashboard">
                <FontAwesomeIcon icon={faChartLine} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-text">
              <NavLink to="/history">
                <FontAwesomeIcon icon={faClockRotateLeft} />
                <span>Histórico</span>
              </NavLink>
            </li>
            <li className="nav-text">
              <NavLink to="/reversals">
                <FontAwesomeIcon icon={faRotateLeft} />
                <span>Estornos</span>
              </NavLink>
            </li>
            <li className="nav-text">
              <NavLink to="/support">
                <FontAwesomeIcon icon={faHeadset} />
                <span>Suporte</span>
              </NavLink>
            </li>
            <li className="nav-text">
              <Link onClick={() => logout()}>
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
