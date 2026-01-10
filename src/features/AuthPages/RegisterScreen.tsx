import React, {useState, FormEvent, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser, faLock} from "@fortawesome/free-solid-svg-icons";
import {useDispatch} from "react-redux";
import {connectSocket, sendSocket} from "../../api/socket";

interface RegisterScreenProps {
    switchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({switchToLogin}) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Thêm state thông báo thành công
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();
    useEffect(() => {
        const handleSuccess = (e: any) => {
            setIsLoading(false);
            setSuccessMsg(e.detail);
            setError(null);
            // Tùy chọn: Tự động chuyển sang trang login sau 2 giây
            setTimeout(() => {
                switchToLogin();
            }, 2000);
        };

        const handleError = (e: any) => {
            setIsLoading(false);
            setError(e.detail);
            setSuccessMsg(null);
        };

        window.addEventListener("register-success", handleSuccess);
        window.addEventListener("register-error", handleError);

        return () => {
            window.removeEventListener("register-success", handleSuccess);
            window.removeEventListener("register-error", handleError);
        };
    }, [switchToLogin]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        connectSocket(() => {
            sendSocket({
                action: "onchat",
                data: {
                    event: "REGISTER",
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

    return (
        <div className="auth-form-container">
            <h2>Đăng Ký</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}

                {/* Username */}
                <div className="form-group-icon">
                    <FontAwesomeIcon icon={faUser} className="input-icon"/>
                    <input
                        type="text"
                        placeholder="Tên Tài Khoản"
                        value={username}
                        onChange={handleInputChange(setUsername)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password */}
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

                {/* Submit Button */}
                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? "Tạo Tài Khoản..." : "Đăng Ký"}
                </button>
            </form>

            {/* Switch to Login */}
            <div className="signup-link-container">
                Đã có tài khoản?
                <a href="#" className="signup-link" onClick={switchToLogin}>
                    Đăng Nhập ngay
                </a>
            </div>
        </div>
    );
};

export default RegisterScreen;
