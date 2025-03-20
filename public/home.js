function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to BadBank</h1>
          <p className="hero-subtitle">Your Trusted Partner in Modern Banking</p>
          <div className="hero-buttons">
            <a href="#/createaccount" className="btn btn-primary">Create Account</a>
            <a href="#/login" className="btn btn-outline">Login</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="bank.png" alt="Modern Banking" className="hero-img" />
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Choose BadBank?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Banking</h3>
            <p>State-of-the-art encryption and security measures to protect your assets</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Easy Transactions</h3>
            <p>Simple and quick deposits and withdrawals with just a few clicks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Modern Interface</h3>
            <p>Clean and intuitive design for the best user experience</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>24/7 Support</h3>
            <p>Our dedicated team is always here to help you</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers who trust BadBank with their financial needs</p>
          <a href="#/createaccount" className="btn btn-primary">Open Your Account Today</a>
        </div>
      </div>
    </div>
  );
}
