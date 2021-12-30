import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Block from "./Block";

function Blocks() {
    const [blocks, setBlocks] = useState([]);

    const fetchAndSetBlocks = async () => {
        const blocks = await axios.get(
            `${document.location.origin}/api/blocks`
        );
        setBlocks(blocks.data);
    };

    useEffect(() => {
        fetchAndSetBlocks();
    }, []);

    return (
        <div>
            <Link to="/">Go home</Link>
            <br />
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
