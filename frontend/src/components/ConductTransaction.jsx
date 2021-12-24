import { useState } from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

function ConductTransaction() {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");

    const conductTransaction = async () => {
        const response = await axios.post(
            "http://localhost:5100/api/transaction",
            { recipient, amount }
        );
        alert(response.data.type);
    };

    return (
        <div>
            <h3>Conduct a transaction</h3>
            <br />
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
