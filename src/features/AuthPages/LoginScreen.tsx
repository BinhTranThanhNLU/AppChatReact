// src/features/AuthPages/LoginScreen.tsx
import React, { useState, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom"; 

interface LoginScreenProps {
  switchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ switchToRegister }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); // ✅ THÊM

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Fake API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (username !== "admin" || password !== "123456") {
        throw new Error("Incorrect username or password.");
      }

      // ✅ LƯU TRẠNG THÁI LOGIN
      localStorage.setItem("isLogin", "true");

      console.log("Login successful:", { username, rememberMe });

      // ✅ CHUYỂN SANG MESSENGER
      navigate("/messenger");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "A system error has occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError(null);
    };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group-icon">
          <FontAwesomeIcon icon={faUser} className="input-icon" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleInputChange(setUsername)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group-icon">
          <FontAwesomeIcon icon={faLock} className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? "LOADING..." : "LOG IN"}
        </button>

        <a href="#" className="forgot-password-link">
          Forget Password
        </a>
      </form>

      <div className="signup-link-container">
        Not a member?
        <a
          href="#"
          className="signup-link"
          onClick={switchToRegister}
        >
          Sign up now
        </a>
      </div>
    </div>
  );
};

export default LoginScreen;
