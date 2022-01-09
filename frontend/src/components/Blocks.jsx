import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import axios from "axios";
import Block from "./Block";

function Blocks() {
    const [blocks, setBlocks] = useState([]);
    const [pageId, setPageId] = useState(1);
    const [chainLength, setChainLength] = useState(0);

    const fetchPaginatedBlocks = async (id) => {
        const response = await axios.get(
            `${document.location.origin}/api/blocks/${id}`
        );
        setBlocks(response.data);
    };

    const fetchLength = async () => {
        const response = await axios.get(
            `${document.location.origin}/api/blocks/length`
        );
        setChainLength(response.data);
    };

    useEffect(() => {
        fetchLength();
        fetchPaginatedBlocks(pageId);
    }, [pageId]);

    const PageIds = () => {
        let ids = [...Array(Math.ceil(chainLength / 5)).keys()];
        ids = ids.map((id) => id + 1); // start from 1 instead of 0
        return ids.map((id) => (
            <span key={id}>
                <Button
                    size="small"
                    variant="danger"
                    onClick={() => setPageId(id)}
                >
                    {id}
                </Button>{" "}
            </span>
        ));
    };

    return (
        <div>
            <Link to="/">Go home</Link>
            <br />
            <h3>Blocks</h3>
            <PageIds />
            <div>
                {blocks.map((block) => {
                    return <Block key={block.hash} block={block} />;
                })}
            </div>
            <PageIds />
        </div>
    );
}

export default Blocks;
