//import React, { useContext } from 'react';
//import { UserContext } from './context';

function NavBar() {
    const { currentUser, logout } = React.useContext(UserContext);

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <a href="#" className="flex-shrink-0 flex items-center">
                            <img
                                className="h-8 w-auto"
                                src="bank.png"
                                alt="Bank Logo"
                            />
                        </a>
                    </div>

                    <div className="flex items-center space-x-4">
                        {currentUser ? (
                            <>
                                <span className="text-gray-700">
                                    Welcome, {currentUser.name}
                                </span>
                                <button
                                    className="btn btn-outline"
                                    onClick={logout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="#/createaccount/"
                                    className="btn btn-outline"
                                >
                                    Create Account
                                </a>
                                <a
                                    href="#/login/"
                                    className="btn btn-primary"
                                >
                                    Login
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}