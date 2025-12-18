import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'; // ⭐️ IMPORTED Firestore functions

const UsernameModal = ({ auth, db, user, onClose, onUsernameSet }) => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState(''); // ⭐️ NEW STATE

    // Function to check Firestore for duplicate usernames
    const checkUsernameAvailability = async (name) => {
        // Query the 'users' collection where the displayName equals the input name
        const usersRef = collection(db, 'users');
        console.log(usersRef);
        // Note: You must create an index in Firestore for this query!
        const q = query(usersRef, where('displayName', '==', name)); 
        const querySnapshot = await getDocs(q);

        // If the snapshot size is greater than 0, a duplicate exists.
        // We also check if the found user is the CURRENT user (in case they are just saving their existing name)
        const isDuplicate = querySnapshot.docs.some(doc => doc.id !== user.uid);

        return isDuplicate; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError(''); // Clear previous errors

        const trimmedUsername = username.trim();

        // 1. Empty String Validation
        if (!trimmedUsername) {
            setValidationError("Username cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            // 2. Duplicate Check
            const isDuplicate = await checkUsernameAvailability(trimmedUsername);
            
            if (isDuplicate) {
                setValidationError("That username is already taken. Please choose another.");
                setLoading(false);
                return;
            }

            // --- Success: Update Firebase ---

            // 1. Update Firebase Auth Profile
            await updateProfile(user, {
                displayName: trimmedUsername,
            });

            // 2. Update Firestore Document (for league table/querying)
            await setDoc(doc(db, "users", user.uid), {
                displayName: trimmedUsername, // Ensure this field exists in Firestore
            }, { merge: true });

            setLoading(false);
            onClose(); 
            onUsernameSet(trimmedUsername); 

        } catch (error) {
            console.error("Error setting username:", error);
            setValidationError("An unexpected error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>User tips are expanding soon. Choose a username to link to your account</h3>
                <p>This will be used for tracking your tips, their profitibility and as a means to take part in a tipping league - coming soon!</p>
                <p>Choose something anomynous that you can use to identify yourself in the league table.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your unique username"
                        required
                        disabled={loading}
                    />
                    {/* ⭐️ Display Validation Error */}
                    {validationError && (
                        <p style={{ color: 'red', marginTop: '10px' }}>{validationError}</p>
                    )}
                    
                    <button type="submit" disabled={loading || !!validationError}> 
                        {loading ? 'Saving...' : 'Set Username'}
                    </button>
                    {/* Move Dismiss button outside of form if it's not part of submission */}
                    <button
                        type="button" // Use type="button" to prevent form submission
                        onClick={onClose}
                        className="modal-close-button dismiss-btn" // Added a new class for styling
                        disabled={loading}
                    >
                        Dismiss
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernameModal;