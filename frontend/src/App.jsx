import { useState } from "react";
import "./App.css";

const roles = [
  {
    id: "student",
    title: "Student",
    icon: "🎓",
    description: "Explore events, register, and track your attendance.",
    loginId: "Student ID / Email",
  },
  {
    id: "coordinator",
    title: "Coordinator",
    icon: "🧑‍💼",
    description: "Manage events, registrations, and attendance.",
    loginId: "Coordinator ID / Email",
  },
  {
    id: "faculty",
    title: "Faculty / HOD",
    icon: "👨‍🏫",
    description: "Monitor department events and student attendance.",
    loginId: "Faculty ID / Email",
  },
];

const sampleEvents = [
  {
    id: 1,
    title: "Tech Fest 2026",
    category: "Technology",
    date: "October 25, 2026",
    venue: "Main Auditorium",
    description:
      "Explore exciting technologies, innovative projects, coding competitions, and technical workshops.",
    icon: "💻",
  },
  {
    id: 2,
    title: "Cultural Fest",
    category: "Cultural",
    date: "October 28, 2026",
    venue: "College Open Ground",
    description:
      "Celebrate creativity through music, dance, art, and performances by talented students.",
    icon: "🎭",
  },
  {
    id: 3,
    title: "Innovation Summit",
    category: "Innovation",
    date: "November 2, 2026",
    venue: "Seminar Hall",
    description:
      "Discover new ideas, meet innovators, and present creative solutions to real-world problems.",
    icon: "🚀",
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const filteredEvents = sampleEvents.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  function openLogin() {
    setSelectedRole(null);
    setLoginId("");
    setPassword("");
    setPage("roles");
  }

  function chooseRole(role) {
    setSelectedRole(role);
    setLoginId("");
    setPassword("");
    setPage("login");
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!loginId.trim() || !password.trim()) {
      alert("Please enter your ID/email and password.");
      return;
    }

    // Frontend demonstration only.
    // Real authentication must be implemented using the backend API.
    setPage("dashboard");
  }

  function goHome() {
    setPage("home");
    setSelectedRole(null);
  }

  function logout() {
    setPage("home");
    setSelectedRole(null);
    setLoginId("");
    setPassword("");
  }

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <button className="brand brand-button" onClick={goHome}>
          <span className="brand-icon">✦</span>
          CampusConnect
        </button>

        <div className="nav-links">
          {page === "home" && (
            <>
              <a href="#home">Home</a>
              <a href="#events">Events</a>
              <a href="#about">About</a>

              <button
                className="nav-button login-nav-button"
                onClick={openLogin}
              >
                Login <span>→</span>
              </button>
            </>
          )}

          {page !== "home" && page !== "dashboard" && (
            <button className="nav-button" onClick={goHome}>
              ← Back to Home
            </button>
          )}

          {page === "dashboard" && (
            <button className="nav-button" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <main>
        {/* HOME PAGE */}
        {page === "home" && (
          <>
            <section className="hero" id="home">
              <div className="hero-content">
                <span className="eyebrow">
                  ✨ YOUR CAMPUS, YOUR COMMUNITY
                </span>

                <h1>
                  Every Event.
                  <br />
                  <span>One Campus.</span>
                </h1>

                <p>
                  Discover campus events, connect with your community,
                  register for exciting experiences, and make every
                  college moment memorable.
                </p>

                <div className="hero-actions">
                  <a href="#events" className="primary-button">
                    Explore Events <span>→</span>
                  </a>

                  <button
                    className="secondary-button"
                    onClick={openLogin}
                  >
                    Login to CampusConnect
                  </button>
                </div>

                <div className="hero-note">
                  <span className="status-dot"></span>
                  Discover what's happening on campus
                </div>
              </div>

              <div className="hero-visual">
                <div className="visual-orbit orbit-one"></div>
                <div className="visual-orbit orbit-two"></div>

                <div className="visual-card main-visual-card">
                  <span className="visual-icon">🎓</span>
                  <span className="visual-label">CAMPUS LIFE</span>

                  <h2>Make Every Moment Count.</h2>

                  <p>
                    Learn something new. Meet amazing people.
                    Create unforgettable memories.
                  </p>
                </div>

                <div className="floating-card floating-top">
                  <span>📅</span>
                  <div>
                    <strong>Upcoming Events</strong>
                    <small>Find your next experience</small>
                  </div>
                </div>

                <div className="floating-card floating-bottom">
                  <span>🎯</span>
                  <div>
                    <strong>Your Campus Journey</strong>
                    <small>Starts right here</small>
                  </div>
                </div>
              </div>
            </section>

            <section className="events-section" id="events">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">WHAT'S HAPPENING?</span>
                  <h2>Upcoming Events</h2>
                  <p>
                    Find your interests, explore opportunities,
                    and join the campus excitement.
                  </p>
                </div>

                <span className="event-count">
                  {filteredEvents.length} Events
                </span>
              </div>

              <div className="search-container">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search campus events..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="event-grid">
                {filteredEvents.map((event) => (
                  <article className="event-card" key={event.id}>
                    <div className={`event-banner banner-${event.id}`}>
                      <span className="event-icon">{event.icon}</span>

                      <span className="event-category">
                        {event.category}
                      </span>
                    </div>

                    <div className="event-content">
                      <h3>{event.title}</h3>

                      <div className="event-info">
                        <span>📅 {event.date}</span>
                        <span>📍 {event.venue}</span>
                      </div>

                      <p>{event.description}</p>

                      <button
                        className="details-button"
                        onClick={() => setSelectedEvent(event)}
                      >
                        View Details <span>→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="no-events">
                  No events found. Try another search.
                </div>
              )}
            </section>

            <section className="about-section" id="about">
              <span className="eyebrow">ABOUT CAMPUSCONNECT</span>

              <h2>Your Campus Experience, Simplified.</h2>

              <p>
                CampusConnect brings campus events together in one place.
                Explore activities, discover opportunities, and stay
                connected with college life. QR-based attendance and
                student registration can be integrated with the backend.
              </p>

              <a href="#events" className="primary-button">
                Discover Events <span>→</span>
              </a>
            </section>
          </>
        )}

        {/* ROLE SELECTION PAGE */}
        {page === "roles" && (
          <section className="auth-page">
            <div className="auth-heading">
              <span className="eyebrow">WELCOME TO CAMPUSCONNECT</span>

              <h1>
                Choose Your <span>Role.</span>
              </h1>

              <p>
                Select your role to continue to your secure login page.
              </p>
            </div>

            <div className="role-grid">
              {roles.map((role) => (
                <article className="role-card" key={role.id}>
                  <div className="role-icon">{role.icon}</div>

                  <h2>{role.title}</h2>

                  <p>{role.description}</p>

                  <button
                    className="primary-button role-button"
                    onClick={() => chooseRole(role)}
                  >
                    Continue as {role.title} <span>→</span>
                  </button>
                </article>
              ))}
            </div>

            <button className="back-link" onClick={goHome}>
              ← Return to Homepage
            </button>
          </section>
        )}

        {/* SEPARATE LOGIN FORM FOR EACH ROLE */}
        {page === "login" && selectedRole && (
          <section className="auth-page login-page">
            <div className="login-card">
              <div className="role-icon login-role-icon">
                {selectedRole.icon}
              </div>

              <span className="eyebrow">CAMPUSCONNECT ACCOUNT</span>

              <h1>{selectedRole.title} Login</h1>

              <p className="login-description">
                Sign in to access your {selectedRole.title.toLowerCase()}{" "}
                dashboard.
              </p>

              <form onSubmit={handleLogin} className="login-form">
                <label htmlFor="loginId">
                  {selectedRole.loginId}
                </label>

                <input
                  id="loginId"
                  type="text"
                  placeholder={`Enter your ${selectedRole.loginId}`}
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  autoComplete="username"
                  required
                />

                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="submit"
                  className="primary-button submit-login"
                >
                  Login to Dashboard <span>→</span>
                </button>
              </form>

              <button
                className="back-link"
                onClick={() => setPage("roles")}
              >
                ← Change Role
              </button>

              <p className="demo-notice">
                Demo UI only. Real account verification will be
                connected to the backend.
              </p>
            </div>
          </section>
        )}

        {/* ROLE-SPECIFIC DASHBOARDS */}
        {page === "dashboard" && selectedRole && (
          <Dashboard
            role={selectedRole}
            loginId={loginId}
            events={sampleEvents}
            onExploreEvents={() => setPage("home")}
          />
        )}
      </main>

      {/* EVENT DETAILS MODAL */}
      {page === "home" && selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close event details"
            >
              ×
            </button>

            <span className="modal-icon">{selectedEvent.icon}</span>

            <span className="eyebrow">{selectedEvent.category}</span>

            <h2 id="modal-title">{selectedEvent.title}</h2>

            <p>{selectedEvent.description}</p>

            <div className="modal-info">
              <p>📅 {selectedEvent.date}</p>
              <p>📍 {selectedEvent.venue}</p>
            </div>

            <button
              className="primary-button modal-button"
              onClick={() => setSelectedEvent(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      <footer className="footer">
        <button className="brand brand-button" onClick={goHome}>
          <span className="brand-icon">✦</span>
          CampusConnect
        </button>

        <p>
          © 2026 CampusConnect. Smart campus experiences start here.
        </p>
      </footer>
    </div>
  );
}

/* DASHBOARD COMPONENT */

function Dashboard({ role, loginId, events, onExploreEvents }) {
  const dashboardData = {
    student: {
      heading: "Student Dashboard",
      subtitle: "Discover events and keep track of your campus journey.",
      stats: [
        { label: "Upcoming Events", value: events.length, icon: "📅" },
        { label: "My Registrations", value: "0", icon: "🎟️" },
        { label: "Attendance", value: "0%", icon: "✅" },
      ],
      features: [
        {
          icon: "🎟️",
          title: "My Registrations",
          description: "View the events you have registered for.",
        },
        {
          icon: "📱",
          title: "QR Attendance",
          description: "Access event QR attendance features when available.",
        },
        {
          icon: "📊",
          title: "Attendance History",
          description: "Review your attendance records when connected.",
        },
      ],
    },

    coordinator: {
      heading: "Coordinator Dashboard",
      subtitle: "Organize campus events and manage event activities.",
      stats: [
        { label: "Available Events", value: events.length, icon: "📅" },
        { label: "Registrations", value: "—", icon: "🎟️" },
        { label: "Attendance Records", value: "—", icon: "✅" },
      ],
      features: [
        {
          icon: "➕",
          title: "Create Event",
          description: "Prepare new campus events for publication.",
        },
        {
          icon: "🗂️",
          title: "Manage Events",
          description: "Organize event details, dates, and venues.",
        },
        {
          icon: "📋",
          title: "Manage Attendance",
          description: "Access attendance management when backend support is ready.",
        },
      ],
    },

    faculty: {
      heading: "Faculty / HOD Dashboard",
      subtitle: "Monitor department activities and student participation.",
      stats: [
        { label: "Campus Events", value: events.length, icon: "📅" },
        { label: "Department", value: "—", icon: "🏛️" },
        { label: "Attendance Reports", value: "—", icon: "📊" },
      ],
      features: [
        {
          icon: "🏛️",
          title: "Department Events",
          description: "Review events relevant to your department.",
        },
        {
          icon: "📊",
          title: "Attendance Reports",
          description: "Review reports once attendance data is connected.",
        },
        {
          icon: "👥",
          title: "Student Participation",
          description: "Monitor participation using verified system records.",
        },
      ],
    },
  };

  const data = dashboardData[role.id];

  return (
    <section className="dashboard-page">
      <div className="dashboard-welcome">
        <span className="eyebrow">
          ✨ CAMPUSCONNECT WORKSPACE
        </span>

        <h1>
          {data.heading}
        </h1>

        <p>{data.subtitle}</p>

        <div className="dashboard-user">
          <span className="dashboard-avatar">{role.icon}</span>

          <div>
            <strong>{role.title}</strong>
            <small>{loginId}</small>
          </div>

          <span className="demo-badge">DEMO</span>
        </div>
      </div>

      <div className="dashboard-stats">
        {data.stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-icon">{stat.icon}</span>
            <p>{stat.label}</p>
            <h2>{stat.value}</h2>
          </article>
        ))}
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>Quick Access</h2>
        </div>
      </div>

      <div className="dashboard-feature-grid">
        {data.features.map((feature) => (
          <article className="dashboard-feature-card" key={feature.title}>
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>

      <div className="dashboard-events">
        <div className="dashboard-section-heading">
          <div>
            <span className="eyebrow">STAY CONNECTED</span>
            <h2>Upcoming Campus Events</h2>
          </div>

          <button className="secondary-button" onClick={onExploreEvents}>
            Explore Events →
          </button>
        </div>

        <div className="dashboard-event-list">
          {events.map((event) => (
            <article className="dashboard-event-row" key={event.id}>
              <span className="dashboard-event-icon">{event.icon}</span>

              <div>
                <h3>{event.title}</h3>
                <p>
                  📅 {event.date} &nbsp; · &nbsp; 📍 {event.venue}
                </p>
              </div>

              <span className="event-category">
                {event.category}
              </span>
            </article>
          ))}
        </div>
      </div>

      <p className="dashboard-demo-note">
        This is a frontend demo dashboard. Live registrations, attendance
        records, event management, and permissions require backend
        integration.
      </p>
    </section>
  );
}

export default App;