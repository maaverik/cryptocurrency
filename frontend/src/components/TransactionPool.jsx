import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import axios from "axios";
import Transaction from "./Transaction";

const POLL_INTERVAL = 10000; // milliseconds

function TransactionPool() {
    const [transactionPoolMap, setTransactionPoolMap] = useState({});
    const navigate = useNavigate();

    const fetchAndSetMap = async () => {
        const response = await axios.get(
            `${document.location.origin}/api/transaction-pool-map`
        );
        setTransactionPoolMap(response.data);
    };

    useEffect(() => {
        fetchAndSetMap();
        const reference = setInterval(() => fetchAndSetMap(), POLL_INTERVAL);
        return () => clearInterval(reference); // prevent memory leak
    }, []);

    const mineTransactions = async () => {
        const response = await axios.get(
            `${document.location.origin}/api/mine-transactions`
        );
        if (response.status === 200) {
            alert("success");
            navigate("/blocks");
        } else {
            alert("mining failed");
        }
    };

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
            <hr />
            <Button variant="danger" onClick={mineTransactions}>
                Mine transactions
            </Button>
        </div>
    );
}

export default TransactionPool;
