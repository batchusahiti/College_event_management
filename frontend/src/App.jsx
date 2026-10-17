import { useState } from "react";
import "./App.css";

function App() {
  const [events] = useState([
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
  ]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">✦</span>
          CampusConnect
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#events">Events</a>
          <a href="#about">About</a>
          <a href="#events" className="nav-button">
            Explore Events
          </a>
        </div>
      </nav>

      <main>
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

              <a href="#about" className="secondary-button">
                Learn More
              </a>
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
              onChange={(e) => setSearch(e.target.value)}
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
      </main>

      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-icon">✦</span>
          CampusConnect
        </a>

        <p>
          © 2026 CampusConnect. Smart campus experiences start here.
        </p>
      </footer>

      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
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
    </div>
  );
}

export default App;