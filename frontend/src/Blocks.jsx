import { useEffect, useState } from "react";
import axios from "axios";

function Blocks() {
    const [blocks, setBlocks] = useState([]);

    const fetchAndSetBlocks = async () => {
        const blocks = await axios.get("http://localhost:5100/api/blocks");
        setBlocks(blocks.data);
    };

    useEffect(() => {
        fetchAndSetBlocks();
    }, []);

    return (
        <div>
            <h3>Blocks</h3>
            <div>
                {blocks.map((block) => {
                    return <div key={block.hash}>{block.hash}</div>;
                })}
            </div>
        </div>
    );
}

export default Blocks;
