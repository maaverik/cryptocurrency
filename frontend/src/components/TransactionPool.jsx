import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Transaction from "./Transaction";

const POLL_INTERVAL = 10000; // milliseconds

function TransactionPool() {
    const [transactionPoolMap, setTransactionPoolMap] = useState({});
    const fetchAndSetMap = async () => {
        const response = await axios.get(
            "http://localhost:5100/api/transaction-pool-map"
        );
        setTransactionPoolMap(response.data);
    };

    useEffect(() => {
        fetchAndSetMap();
        setInterval(() => fetchAndSetMap(), POLL_INTERVAL);
    }, []);

    return (
        <div className="TransactionPool">
            <br />
            <Link to="/">Go Home</Link>
            <br />
            <h2>Transaction Pool</h2>
            {Object.values(transactionPoolMap).map((transaction) => (
                <div key={transaction.id}>
                    <hr /> <Transaction transaction={transaction} />{" "}
                </div>
            ))}
        </div>
    );
}

export default TransactionPool;
