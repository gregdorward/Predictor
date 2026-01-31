import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; 

function BetSlipFooter({ userTips = [], user, onPlaceBet, userDetail }) {
    const [stake, setStake] = useState(1);
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {
        // Guard: Ensure user and UID exist before creating references
        if (!user?.uid) return;

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        // This is the logic you tested and verified
        const balanceRef = doc(db, "users", user.uid, "monthlyStats", monthKey);

        const unsubscribe = onSnapshot(balanceRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Set the balance state using your data field
                setCurrentBalance(data.currentBalance || 0);
            } else {
                setCurrentBalance(0);
            }
        }, (error) => {
            console.error("Error in balance listener:", error);
        });

        // Cleanup: Stop listening to updates if the component unmounts
        return () => unsubscribe();
    }, [user?.uid]);

    // UI Guard: Don't show the slip if there's no user or no tips
    if (!user?.uid || userTips.length === 0) return null;

    const totalOdds = userTips.reduce((acc, tip) => acc * parseFloat(tip.odds || 1), 1);
    const potentialReturn = (totalOdds * stake).toFixed(2);
    const isOverStake = stake > currentBalance;

    return (
        <div className="BetSlipFooter">
            <div className="BalanceInfo">
                Available: <strong>£{currentBalance.toFixed(2)}</strong>
            </div>

            <div className="StakeInputRow">
                <label>Stake: £</label>
                <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(parseFloat(e.target.value))}
                    className={isOverStake ? "error-input" : ""}
                />
            </div>

            <button 
                onClick={() => onPlaceBet(stake)}
                disabled={isOverStake || stake <= 0}
                className={isOverStake ? "btn-error" : "btn-success"}
            >
                {isOverStake ? "Insufficient Funds" : `Submit Tip (£${potentialReturn})`}
            </button>
        </div>
    );
}

export default BetSlipFooter;