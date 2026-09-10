
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getLogin } from "../api/auth";
import React, { useState } from "react";
import VoucherDeskLogo from "../img/voucher-desk-logo.png";
import Rest from "../img/restaurant-main.jpeg";
import { useCookies } from 'react-cookie';
import {useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';

function LoginPage() {
    const year = new Date().getFullYear();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [cookies, setCookie] = useCookies(['user'])
    const navigate = useNavigate();

    const loginValidation = () => {
        if (!username.length) {
            setLoginError("Informe o usuArio.");
            return;
        }
        if (!password.length) {
            setLoginError("Informe a senha.");
            return;
        }
        return true;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!loginValidation()) {
            return;
        }
        try {
            const result = await getLogin({user: username, password: password});
        
            loginVerification(result);
        } catch (ex) {
            toast.error('Error Login ', ex);
            setLoginError("NAo foi possAvel efetuar Login. Verifique se os dados estAo corretos e tente novamente.");
        }
    };

    const loginVerification = (data) => {
        if (data.success) {
            setCookie('token',data.token);
            setCookie('response',data);
            navigate("/");
        }
    }

    return (
        <div style={{display: 'flex'}}>
        <form onSubmit={handleSubmit} style={{width: '50%'}}>
            <div style={{width: 300, margin:'auto'}} >
                <div className="m-4" style={{textAlign: 'center'}}>
                    <img src={VoucherDeskLogo} alt="Voucher Desk" style={{width: 150, height: 150, objectFit: 'contain', margin: 'auto'}} />
                    <h1 style={{color: '#1f4d3a', fontSize: 26, fontWeight: 700, marginTop: 8}}>Voucher Desk</h1>
                    
                </div>
                <div className="m-4">
                    <div className="field">
                        <p className="control has-icons-left has-icons-right">
                            <input className="input is-small" placeholder="UsuArio" type="text"
                            value={username} onChange={(e) => setUsername(e.target.value)}/>
                            <span className="icon is-small is-left has-text-warning">
                                <FontAwesomeIcon icon={faUser} />
                            </span>
                        </p>
                    </div>
                    <div className="field">
                        <p className="control has-icons-left">
                            <input className="input is-small" type="password" placeholder="Senha" 
                            value={password} onChange={(e) => setPassword(e.target.value)}/>
                            <span className="icon is-small is-left has-text-warning">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                        </p>
                    </div>
                </div>
                {loginError.length > 0 &&
                <div className="notification is-danger m-4">
                    {loginError}
                </div>}
                <div className="m-4">
                    <button className="button is-small is-fullwidth" style={{backgroundColor: '#2f7d59',
    borderColor: '#2f7d59', color: 'white'}}>Entrar</button>
                </div>
                <div className="m-4" style={{padding: 15}}>
                    @ {year} Restaurante da Regina
                </div>
            </div>
        </form>
        <div style={{width: '50%'}}>
            <img src={Rest} alt="" />
        </div>
        </div>
    );
}

export default LoginPage;
