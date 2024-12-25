import { ref, onValue } from 'firebase/database';
import { database } from './firebase';

export const fetchUsers = (callback: (data: Record<string, any> | null) => void): void => {
  const usersRef = ref(database, '/users');
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};
