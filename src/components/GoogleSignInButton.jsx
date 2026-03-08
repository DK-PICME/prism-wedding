import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

const GoogleSignInButton = ({ onSuccess, onError, isLoading }) => {
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // Google Sign-In 라이브러리 로드
    const loadGoogleSignIn = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    };

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        setIsInitializing(true);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignInResponse,
        });
        setIsInitializing(false);
      }
    };

    loadGoogleSignIn();
  }, []);

  const handleGoogleSignInResponse = async (response) => {
    try {
      const credential = response.credential;

      // ID Token을 Firebase에 전달
      const decodedToken = JSON.parse(atob(credential.split('.')[1]));

      // Google 인증 정보 생성
      const provider = new GoogleAuthProvider();
      const googleCredential = GoogleAuthProvider.credential(credential);

      // Firebase로 로그인
      const result = await signInWithCredential(auth, googleCredential);

      // 성공 콜백
      if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (error) {
      console.error('Google Sign-In 오류:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div
      id="g_id_signin"
      data-type="standard"
      data-size="large"
      data-theme="outline"
      data-text="signin_with"
      data-shape="rectangular"
      data-logo_alignment="left"
      style={{ display: isInitializing || isLoading ? 'none' : 'block' }}
    ></div>
  );
};

export default GoogleSignInButton;
