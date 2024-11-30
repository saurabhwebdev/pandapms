import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../services/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { setUser, clearUser } from '../store/features/authSlice';

export function useAuth() {
  const [user, setLocalUser] = useState(auth.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLocalUser(user);
      if (user) {
        dispatch(setUser({
          clinicId: user.uid,
          email: user.email || '',
        }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return { user };
}
