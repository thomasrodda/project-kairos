import React, { useEffect, useContext} from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../index.css';

const Login = () => {
  // Get user and setUser from UserContext
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();

  // Listen for changes in authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        console.log("User set in Login:", authUser);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setUser]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);  // Await the promise
    const authUser = userCredential.user;
    setUser(authUser);  // Set the authenticated user

    // Fetch user data
    const userId = authUser.uid;
    const email = authUser.email;
    const name = authUser.displayName;

    // Check if a document for this user ID already exists
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);  // Await the promise

    // If it doesn't exist, create a new document
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {  // Await the promise
        email: email,
        name: name,
      });
    }

    // Redirect to workspace selection after successful login
    navigate("/workspace-selection");

  };
  
  return (
    <div className="mainMenu menuBackground">
        <div className="menuContentArea boxShadowBlackL flex flex-col items-center justify-center">
            <div className="workspaceCreationHeading">
                <h1 className="text-pageName font-bold">Sign in to Slate-AI</h1>
                {/* The text changes based on the stage */}
                <h2 className="text-h4 text-grey mx-2">Log in with your Google account</h2>
            </div>
            <div id="signInGoogle" className="flex justify-center">
                <button onClick={signInWithGoogle} type="submit" className="w-full z-10">
                    <div className="SpecialButton SpecialButton:hover gradient-border gradient-border:after">
                        <h2 className="SpecialButtonText">
                          Sign in with Google
                        </h2>
                    </div>
                </button>
            </div>
        </div>
    </div>
  );
};

export default Login;
