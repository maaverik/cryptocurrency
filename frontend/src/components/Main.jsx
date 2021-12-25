import "../styles/App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../logo.png";

function Main() {
    const [walletInfo, setWalletInfo] = useState({ address: "", balance: 0 });

    const fetchAndSetWalletInfo = async () => {
        const walletInfo = await axios.get("http://localhost:5100/api/wallet");
        setWalletInfo(walletInfo.data);
    };

    useEffect(() => {
        fetchAndSetWalletInfo();
    }, []);

    return (
        <div>
            <img className="logo" src={logo} alt="logo"></img>
            <br />
            <br />
            <Link to="/blocks">Go to Blocks</Link>
            <br />
            <Link to="/conduct-transaction">Conduct a transaction</Link>
            <br />
            <Link to="/transaction-pool">Transaction Pool</Link>
            <br />
            <br />
            <h2>Blockchain and cryptocurrency app</h2>
            <br />
            <div className="WalletInfo">
                <div> Address: {walletInfo.address}</div>
                <div> Balance: {walletInfo.balance}</div>
            </div>
        </div>
    );
}

export default Main;
