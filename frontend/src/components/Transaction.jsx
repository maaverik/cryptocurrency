function Transaction({ transaction }) {
    const { input, outputMap } = transaction;
    const recipients = Object.keys(outputMap);

    return (
        <div className="Transaction">
            <div>
                From: {`${input.address.substring(0, 20)}...`} | Balance:
                {input.amount}
            </div>
            {recipients.map((rec) => (
                <div key={rec}>
                    To: {`${rec.substring(0, 20)}...`} | Sent:
                    {outputMap[rec]}
                </div>
            ))}
        </div>
    );
}

export default Transaction;
