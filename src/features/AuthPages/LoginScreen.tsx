// src/features/AuthPages/LoginScreen.tsx
import React, { useState, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { data, useNavigate } from "react-router-dom";
import { sendSocket, connectSocket } from "../../api/socket";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../chat/AuthSlice";

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

  const dispatch = useDispatch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    connectSocket();

    // gửi login
    sendSocket({
      action: "onchat",
      data: {
        event: "LOGIN",
        data: {
          user: username,
          pass: password,
        },
      },
    });

    // lưu user tạm để socket dùng
    dispatch(loginSuccess({ user: username, reLoginCode: "" }));

    // chờ server trả RE_LOGIN → rồi navigate
    setTimeout(() => {
      navigate("/messenger");
    }, 800);
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
        <a href="#" className="signup-link" onClick={switchToRegister}>
          Sign up now
        </a>
      </div>
    </div>
  );
};

export default LoginScreen;
