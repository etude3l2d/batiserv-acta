
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

export const Login = () => {
  const handleLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // The signed-in user info.
      const user = result.user;
      console.log(user);
    } catch (error) {
      // Handle Errors here.
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Sign in with GitHub</button>
    </div>
  );
};
