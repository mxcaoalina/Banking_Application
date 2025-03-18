const React = window.React;
const { createContext, useState, useEffect } = React;

// Create UserContext
const UserContext = createContext(null);

// Create UserProvider component
function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                try {
                    console.log('Checking auth for email:', userEmail);
                    const response = await fetch('/account/findOne', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: userEmail })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('Auth check response:', data);
                    
                    if (data && data._id) {
                        // 移除密码字段
                        const { password, ...userWithoutPassword } = data;
                        setCurrentUser(userWithoutPassword);
                        setIsAuthenticated(true);
                        console.log('User authenticated:', userWithoutPassword);
                    } else {
                        console.log('Auth check failed: Invalid user data');
                        localStorage.removeItem('userEmail');
                        setCurrentUser(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('userEmail');
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                }
            }
        };
        checkAuth();
    }, []);

    const login = (user) => {
        console.log('Logging in user:', user);
        // 移除密码字段
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('userEmail', user.email);
    };

    const logout = () => {
        console.log('Logging out user');
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userEmail');
    };

    return (
        <UserContext.Provider value={{ 
            currentUser, 
            setCurrentUser, 
            isAuthenticated, 
            login, 
            logout 
        }}>
            {children}
        </UserContext.Provider>
    );
}

// Create Card component
function Card(props) {
    function classes() {
        const bg = props.bgcolor ? ' bg-' + props.bgcolor : ' ';
        const txt = props.txtcolor ? ' text-' + props.txtcolor : ' text-white';
        return 'card mb-3 ' + bg + txt;
    }

    return (
        <div className={classes()} style={{maxWidth: "18rem"}}>
            <div className="card-header">{props.header}</div>
            <div className="card-body">
                {props.title && (<h5 className="card-title">{props.title}</h5>)}
                {props.text && (<p className="card-text">{props.text}</p>)}
                {props.body}
                {props.status && (<div id='createStatus'>{props.status}</div>)}
            </div>
        </div>      
    );    
}

// Export components to window object
window.UserContext = UserContext;
window.UserProvider = UserProvider;
window.Card = Card;