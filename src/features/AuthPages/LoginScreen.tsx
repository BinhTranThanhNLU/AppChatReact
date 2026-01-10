// src/features/AuthPages/LoginScreen.tsx
import React, {useState, FormEvent, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser, faLock} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import {sendSocket, connectSocket} from "../../api/socket";
import {useDispatch} from "react-redux";
import {useSelector} from "react-redux";
import {RootState} from "../../stores/Store";
import {setUser} from "../chat/AuthSlice";

interface LoginScreenProps {
    switchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({switchToRegister}) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLogin = useSelector((state: RootState) => state.auth.isLogin);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setIsLoading(true);
        setError(null);

        dispatch(setUser(username));

        connectSocket(() => {
            console.log("Socket connected, sending LOGIN for user:", username);

            // Gửi login
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
        });
    };

    const handleInputChange =
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setter(e.target.value);
                if (error) setError(null);
            };

    useEffect(() => {
        if (isLogin) {
            setIsLoading(false);
            navigate("/messenger");
        }
    }, [isLogin]);

    return (
        <div className="auth-form-container">
            <h2>Đăng Nhập</h2>

            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}

                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faUser} className="input-icon"/>
                    <input
                        type="text"
                        placeholder="Tên Tàì Khoản"
                        value={username}
                        onChange={handleInputChange(setUsername)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faLock} className="input-icon"/>
                    <input
                        type="password"
                        placeholder="Mật Khẩu"
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        required
                        disabled={isLoading}
                    />
                </div>


                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? "Đang tải..." : "Đăng Nhập"}
                </button>

            </form>

            <div className="signup-link-container">
                Chưa có tài khoản?
                <a href="#" className="signup-link" onClick={switchToRegister}>
                    Đăng Ký Ngay
                </a>
            </div>
        </div>
    );
};

export default LoginScreen;
