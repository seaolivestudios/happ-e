import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { isLoggedIn } from './auth';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    isLoggedIn().then(result => {
      setLoggedIn(result);
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  return <Redirect href={loggedIn ? '/(tabs)' : '/login'} />;
}