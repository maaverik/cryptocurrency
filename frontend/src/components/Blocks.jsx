import { useEffect, useState } from "react";
import axios from "axios";
import Block from "./Block";

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
                    return <Block key={block.hash} block={block} />;
                })}
            </div>
        </div>
    );
}

export default Blocks;
