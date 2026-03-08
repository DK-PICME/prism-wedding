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
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

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

      // 이메일 검증 메일 발송
      try {
        await sendEmailVerification(result.user, {
          url: `${window.location.origin}/?page=verify-email`,
          handleCodeInApp: true,
        });
      } catch (emailError) {
        console.error('이메일 검증 발송 오류:', emailError);
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

      // 이메일 검증 확인
      if (!result.user.emailVerified) {
        setError('이메일 인증이 필요합니다. 등록된 이메일의 인증 링크를 클릭해주세요.');
        await signOut(auth);
        throw new Error('이메일 미인증');
      }

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

  // 이메일 검증 재전송
  const resendEmailVerification = async (user) => {
    try {
      setError(null);
      if (!user) {
        throw new Error('사용자 정보가 없습니다');
      }

      await sendEmailVerification(user, {
        url: `${window.location.origin}/?page=verify-email`,
        handleCodeInApp: true,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 구글 로그인 (credential)
  const loginWithGoogle = async (idToken) => {
    try {
      setError(null);
      
      // ID Token을 Firebase Credential로 변환
      const credential = GoogleAuthProvider.credential(idToken);
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

  // 프로필 업데이트 (이름, 이메일)
  const updateUserProfile = async (displayName) => {
    try {
      setError(null);
      if (!currentUser) throw new Error('사용자 정보를 찾을 수 없습니다');

      // Firebase Auth 프로필 업데이트
      await updateProfile(currentUser, { displayName });

      // Firestore 업데이트
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: displayName || '',
        photoURL: currentUser.photoURL || '',
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 로컬 상태 업데이트
      setUserData((prev) => ({
        ...prev,
        displayName: displayName || '',
      }));

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 계정 삭제 (재인증 필요)
  const deleteAccount = async (password) => {
    try {
      setError(null);
      
      // currentUser 다시 확인
      const user = auth.currentUser;
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');

      // Firestore에서 사용자 데이터 삭제 (이를 먼저 해야 deleteUser 실패 시에도 안전)
      const userRef = doc(db, 'users', user.uid);
      try {
        await deleteDoc(userRef);
      } catch (firestoreErr) {
        console.warn('Firestore 삭제 중 오류:', firestoreErr);
        // Firestore 삭제 실패는 무시하고 계속 진행
      }

      // Firebase Auth 계정 삭제
      try {
        await deleteUser(user);
      } catch (deleteErr) {
        // 재로그인이 필요한 경우의 에러 처리
        if (deleteErr.code === 'auth/requires-recent-login') {
          throw new Error('보안상의 이유로 재로그인이 필요합니다. 다시 로그인 후 계정 삭제를 시도해주세요.');
        }
        throw deleteErr;
      }

      // 로컬 상태 초기화
      setCurrentUser(null);
      setUserData(null);

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Firestore에서 사용자 데이터 불러오기 (선택적)
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            // Firestore에 데이터가 없으면 Firebase Auth 정보로 생성
            setUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
            });
          }
        } catch (err) {
          console.warn('Firestore 데이터 로드 실패, Firebase Auth 정보 사용:', err.code);
          // 권한 오류 또는 다른 오류 시 Firebase Auth 정보 사용
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          });
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
    resendEmailVerification,
    updateUserProfile,
    deleteAccount,
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
