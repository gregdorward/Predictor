export const collection = () => ({});
export const getDocs = async () => ({ docs: [] });
export const getDoc = async () => ({ exists: () => false, data: () => null });
export const query = (...args) => args;
export const doc = (...args) => args;
export const updateDoc = async () => {};
export const getFirestore = () => null;
