const React = window.React;
const ReactRouterDOM = window.ReactRouterDOM;
const { HashRouter, Routes, Route, Link } = ReactRouterDOM;

// Create a custom HashRouter component
function CustomHashRouter({ children }) {
    return (
        <HashRouter>
            {children}
        </HashRouter>
    );
}

// Make router components available globally
window.CustomHashRouter = CustomHashRouter;
window.Routes = Routes;
window.Route = Route;
window.Link = Link; 