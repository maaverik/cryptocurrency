import "../styles/App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Blocks from "./Blocks";
import logo from "../logo.png";
function App() {
    const [walletInfo, setWalletInfo] = useState({ address: "", balance: 0 });

    const fetchAndSetWalletInfo = async () => {
        const walletInfo = await axios.get("http://localhost:5100/api/wallet");
        setWalletInfo(walletInfo.data);
    };

    useEffect(() => {
        fetchAndSetWalletInfo();
    }, []);

    return (
        <div className="App">
            <img className="logo" src={logo} alt="logo"></img>
            <br />
            <h2>Blockchain and cryptocurrency app</h2>
            <br />
            <div className="WalletInfo">
                <div> Address: {walletInfo.address}</div>
                <div> Balance: {walletInfo.balance}</div>
            </div>
            <br />
            <Blocks />
        </div>
    );
}

export default App;
