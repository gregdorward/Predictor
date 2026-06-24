import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

const UsernameSetup = ({ db, user, onUsernameSet }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState('');

    const checkUsernameAvailability = async (name) => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('displayName', '==', name));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.some(doc => doc.id !== user.uid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            setValidationError("Username cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            const isDuplicate = await checkUsernameAvailability(trimmedUsername);

            if (isDuplicate) {
                setValidationError("That username is already taken. Please choose another.");
                setLoading(false);
                return;
            }

            await updateProfile(user, {
                displayName: trimmedUsername,
            });

            await setDoc(doc(db, "users", user.uid), {
                displayName: trimmedUsername,
            }, { merge: true });

            setLoading(false);
            onUsernameSet(trimmedUsername);

        } catch (error) {
            console.error("Error setting username:", error);
            setValidationError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="username-setup-banner">
            <h3>Choose an optional username to link to your account</h3>
            <p>This will be used in the monthly prediction league where you can win 1 month's free access, should you wish to take part</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your unique username"
                    required
                    disabled={loading}
                />
                {validationError && (
                    <p className="username-setup-error">{validationError}</p>
                )}
                <button type="submit" disabled={loading || !!validationError}>
                    {loading ? 'Saving...' : 'Set Username'}
                </button>
            </form>
        </div>
    );
};

export default UsernameSetup;
