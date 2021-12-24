import { BrowserRouter, Route, Routes } from "react-router-dom";
import history from "../history";
import Main from "./Main";
import Blocks from "./Blocks";
// import ConductTransaction from "./components/ConductTransaction";
// import TransactionPool from "./components/TransactionPool";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/blocks" element={<Blocks />} />
                    {/* <Route
                    path="/conduct-transaction"
                    element={<ConductTransaction />}
                />
                <Route path="/transaction-pool" element={<TransactionPool />} /> */}
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
