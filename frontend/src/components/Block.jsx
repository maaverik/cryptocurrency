import { useState } from "react";
import { Button } from "react-bootstrap";

function Block(props) {
    const { timestamp, hash, data } = props.block;
    const [displayFull, setDisplayFull] = useState(false);
    const hashToDisplay = `${hash.substring(0, 15)}...`;
    const stringData = JSON.stringify(data);
    const dataToDisplay =
        stringData.length > 35
            ? `${stringData.substring(0, 35)}...`
            : stringData;

    const toggleDisplay = () => setDisplayFull(() => !displayFull);

    return (
        <div>
            <div className="Block">
                <div>Hash: {hashToDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                <div>Data: {displayFull ? stringData : dataToDisplay}</div>
                <Button variant="danger" size="small" onClick={toggleDisplay}>
                    {displayFull ? "Show less" : "Show more"}
                </Button>
            </div>
        </div>
    );
}

export default Block;
