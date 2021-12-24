import { useState } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";

function Block({ block }) {
    const { timestamp, hash, data } = block;
    const [displayFull, setDisplayFull] = useState(false);
    const hashToDisplay = `${hash.substring(0, 15)}...`;
    const stringData = JSON.stringify(data);
    const dataToDisplay =
        stringData.length > 35
            ? `${stringData.substring(0, 35)}...`
            : stringData;

    const toggleDisplay = () => setDisplayFull(() => !displayFull);

    const RenderData = () => {
        if (displayFull) {
            return (
                <>
                    <div>
                        Data:{" "}
                        {data.map((transaction) => (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="danger"
                        size="small"
                        onClick={toggleDisplay}
                    >
                        Show less
                    </Button>
                </>
            );
        }

        return (
            <>
                <div>Data: {dataToDisplay}</div>
                <Button variant="danger" size="small" onClick={toggleDisplay}>
                    Show more
                </Button>
            </>
        );
    };

    return (
        <div>
            <div className="Block">
                <div>Hash: {hashToDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                <RenderData />
            </div>
        </div>
    );
}

export default Block;
