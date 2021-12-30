import { useEffect, useState } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ConductTransaction() {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [knownAddresses, setKnownAddresses] = useState([]);
    const navigate = useNavigate();

    const fetchAndSetAddresses = async () => {
        const response = await axios.get(
            `${document.location.origin}/api/known-addresses`
        );
        setKnownAddresses(response.data);
    };

    useEffect(() => {
        fetchAndSetAddresses();
    }, []);
    const conductTransaction = async () => {
        const response = await axios.post(
            `${document.location.origin}/api/transaction`,
            { recipient, amount }
        );
        alert(response.data.type);
        navigate("/transaction-pool");
    };

    return (
        <div className="ConductTransaction">
            <h3>Conduct a transaction</h3>
            <br />
            <h4>Known Addresses</h4>
            {knownAddresses.map((addr) => (
                <div key={addr}>
                    <div> {addr} </div>
                    <br />
                </div>
            ))}
            <Link to="/">Go home</Link>
            <br />
            <FormGroup>
                <FormControl
                    type="text"
                    placeholder="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                ></FormControl>
                <FormControl
                    type="number"
                    placeholder="amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                ></FormControl>
            </FormGroup>
            <div>
                <Button variant="danger" onClick={conductTransaction}>
                    Submit transaction
                </Button>
            </div>
        </div>
    );
}

export default ConductTransaction;
