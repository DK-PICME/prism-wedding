import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  unlink,
  updatePassword,
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

      const defaultSettings = {
        notifications: {
          uploadComplete: true,
          orderStatusChange: true,
          downloadReady: true,
          marketing: false,
        },
      };
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          email,
          displayName: displayName || '',
          photoURL: photoURL || '',
          createdAt: new Date(),
          lastLogin: new Date(),
          settings: defaultSettings,
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

  // 커스텀 Google 로그인 (팝업 방식 - 새로운 방식)
  const loginWithGooglePopup = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      // prompt 설정 제거 (기본값 사용) - 'none'은 리다이렉트 후 오류 발생 가능
      
      try {
        // 팝업으로 Google 로그인 시도
        const result = await signInWithPopup(auth, provider);

        // Firestore에 사용자 정보 저장
        await saveUserData(
          result.user.uid,
          result.user.email,
          result.user.displayName,
          result.user.photoURL
        );

        return result.user;
      } catch (popupErr) {
        // 팝업 차단 또는 자동 로그인 실패 시 리다이렉트로 폴백
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/invalid-credential') {
          console.log('팝업 차단 또는 자동 로그인 실패 - 리다이렉트 방식으로 진행');
          await signInWithRedirect(auth, provider);
          return null; // 리다이렉트는 페이지 새로고침
        }
        throw popupErr;
      }
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

      // Firestore 업데이트 (권한 없으면 로컬만 반영, 실패해도 Auth는 이미 성공)
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: displayName || '',
          photoURL: currentUser.photoURL || '',
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (firestoreErr) {
        if (firestoreErr?.code === 'permission-denied') {
          console.warn('Firestore 프로필 동기화 실패(권한). Firebase Auth는 반영됨. firebase deploy --only firestore 규칙 배포 후 재시도하세요.');
        } else {
          throw firestoreErr;
        }
      }

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

  // 사용자 설정 업데이트 (알림, 다운로드 등 - settings 객체 merge)
  const updateUserSettings = async (partialSettings) => {
    let mergedSettings;
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      const userRef = doc(db, 'users', user.uid);
      const currentData = (await getDoc(userRef)).data() || {};
      mergedSettings = {
        ...(currentData.settings || {}),
        ...partialSettings,
      };
      if (partialSettings.notifications) {
        mergedSettings.notifications = {
          ...(currentData.settings?.notifications || {}),
          ...partialSettings.notifications,
        };
      }

      await setDoc(userRef, { settings: mergedSettings, updatedAt: new Date().toISOString() }, { merge: true });
      setUserData((prev) => ({ ...prev, settings: mergedSettings }));
      return true;
    } catch (err) {
      const isPermissionDenied = err?.code === 'permission-denied' || err?.message?.includes('permission');
      if (isPermissionDenied) {
        if (mergedSettings) {
          setUserData((prev) => ({ ...prev, settings: mergedSettings }));
        } else {
          setUserData((prev) => {
            const merged = { ...(prev?.settings || {}), ...partialSettings };
            if (partialSettings.notifications) {
              merged.notifications = { ...(prev?.settings?.notifications || {}), ...partialSettings.notifications };
            }
            return { ...prev, settings: merged };
          });
        }
        console.warn('Firestore 설정 저장 실패(권한)');
        return true;
      }
      setError(err.message);
      throw err;
    }
  };

  // 연결된 계정 해제 (providerId: 'password' | 'google.com' 등)
  // password: 이메일/비밀번호로 재인증 필요 시 전달
  const unlinkProvider = async (providerId, { password } = {}) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');
      if (user.providerData.length <= 1) {
        throw new Error('마지막 연동 계정은 해제할 수 없습니다.');
      }
      if (!user.providerData.some((p) => p.providerId === providerId)) {
        throw new Error('해당 계정이 연결되어 있지 않습니다.');
      }

      const doUnlink = async () => {
        const u = auth.currentUser;
        if (!u) throw new Error('사용자 정보를 찾을 수 없습니다.');
        const updatedUser = await unlink(u, providerId);
        setCurrentUser(updatedUser);
        setUserData((prev) => (prev ? { ...prev } : null));
        return true;
      };

      try {
        return await doUnlink();
      } catch (err) {
        if (err.code !== 'auth/requires-recent-login') throw err;

        // 재인증 필요
        const hasPassword = user.providerData.some((p) => p.providerId === 'password');
        const hasGoogle = user.providerData.some((p) => p.providerId === 'google.com');

        if (providerId === 'password' && hasGoogle) {
          // 이메일 해제 시: Google로 재인증
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(user, provider);
          return await doUnlink();
        }
        if (providerId === 'google.com' && hasPassword) {
          // Google 해제 시: 비밀번호로 재인증
          if (!password?.trim()) {
            throw new Error('재인증을 위해 비밀번호를 입력해주세요.');
          }
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);
          return await doUnlink();
        }

        throw new Error('보안을 위해 다시 로그인해주세요. 로그아웃 후 재로그인한 다음 시도해주세요.');
      }
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
    // 리다이렉트 후 결과 처리
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // 리다이렉트 로그인 성공
          await saveUserData(
            result.user.uid,
            result.user.email,
            result.user.displayName,
            result.user.photoURL
          );
        }
      } catch (err) {
        console.error('리다이렉트 결과 처리 오류:', err);
        setError(err.message);
      }
    };

    handleRedirectResult();

    // 인증 상태 감시
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // 토큰 준비 후 Firestore 로드 (FutureBuilder 패턴: auth ready → getDoc)
        (async () => {
          try {
            await user.getIdToken(true);
            if (auth.currentUser?.uid !== user.uid) return;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (auth.currentUser?.uid !== user.uid) return;
            if (userSnap.exists()) {
              setUserData(userSnap.data());
            } else {
              setUserData({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
              });
            }
          } catch (err) {
            if (auth.currentUser?.uid !== user.uid) return;
            console.warn('Firestore 데이터 로드 실패, Firebase Auth 정보 사용:', err.code);
            setUserData({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
            });
          }
        })();
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 비밀번호 변경
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const user = auth.currentUser;
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');
      if (!user.email) throw new Error('이메일 로그인 사용자가 아닙니다.');
      
      // 현재 비밀번호로 재인증
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      try {
        await reauthenticateWithCredential(user, credential);
      } catch (err) {
        if (err.code === 'auth/wrong-password') {
          throw new Error('현재 비밀번호가 올바르지 않습니다.');
        }
        throw err;
      }

      // 새 비밀번호로 변경
      await updatePassword(user, newPassword);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

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
    loginWithGooglePopup,
    resendEmailVerification,
    updateUserProfile,
    updateUserSettings,
    unlinkProvider,
    deleteAccount,
    changePassword,
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
