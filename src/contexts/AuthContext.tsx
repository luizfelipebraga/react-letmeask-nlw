import firebase from "firebase";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../services/firebase";


type User = {
    id: string;
    name: string;
    avatar: string;
  }
  
  type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
  }

  type AuthContextProps = {
      children: ReactNode
  }
  
 export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProps) {

    const [user, setUser] = useState<User>();

  useEffect(() => {
    //!! monitora se o usuario ja foi logado anteriormente, se sim eu retorno as informações dele.
    //** */ Boa prática: Quando temos um listener (auth.onAuthStateChanged) por exemplo precisamos ficar independente dele, para isso precisamos de um return
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const { displayName, photoURL, uid } = user

        if (!displayName || !photoURL) {
          throw new Error('Missing information from Google Account.')
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
        })
      }
    })

    return () => {
      unsubscribe();
    }
  }, [])

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const response = await auth.signInWithPopup(provider);

    if (response.user) {
      const { displayName, photoURL, uid } = response.user

      if (!displayName || !photoURL) {
        throw new Error('Missing information from Google Account.')
      }

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL
      })
    }
  }
   
    return (
      <AuthContext.Provider value={{ user, signInWithGoogle }}>
        {props.children}
      </AuthContext.Provider>
        
    )
}