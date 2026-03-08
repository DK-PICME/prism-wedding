import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Auth Context 생성
const AuthContext = createContext();

// Auth Provider 컴포넌트
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 정보 Firestore에 저장
  const saveUserData = async (uid, email, displayName = null, photoURL = null) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          email,
          displayName: displayName || '',
          photoURL: photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date(),
        });
      } else {
        // 기존 사용자: lastLogin 업데이트
        await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
      }

      // 사용자 데이터 로컬 상태에 저장
      const updatedUserSnap = await getDoc(userRef);
      setUserData(updatedUserSnap.data());
    } catch (err) {
      console.error('사용자 데이터 저장 오류:', err);
      setError(err.message);
    }
  };

  // 회원가입 (이메일/비밀번호)
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // 프로필 업데이트
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Firestore에 사용자 정보 저장
      await saveUserData(result.user.uid, email, displayName);

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 로그인 (이메일/비밀번호)
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Firestore에서 사용자 정보 업로드
      await saveUserData(result.user.uid, result.user.email, result.user.displayName);

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 비밀번호 재설정 이메일 발송
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 구글 로그인 (credential)
  const loginWithGoogle = async (credential) => {
    try {
      setError(null);
      const result = await signInWithCredential(auth, credential);

      // Firestore에 사용자 정보 저장
      await saveUserData(
        result.user.uid,
        result.user.email,
        result.user.displayName,
        result.user.photoURL
      );

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 사용자 인증 상태 변화 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Firestore에서 사용자 데이터 불러오기
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } catch (err) {
          console.error('사용자 데이터 로드 오류:', err);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다');
  }
  return context;
}
