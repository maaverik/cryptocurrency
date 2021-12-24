import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Blocks from "./Blocks";

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
            <div> Address: {walletInfo.address}</div>
            <div> Balance: {walletInfo.balance}</div>
            <Blocks />
        </div>
    );
}

export default App;
