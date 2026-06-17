export default function DemoNav({ activeView, onSelectRole, onGoToSlides }) {
  function handleNav(id) {
    if (id === "slides") {
      onGoToSlides();
      return;
    }
    onSelectRole(id);
  }

  return (
    <div className="demo-nav" role="navigation" aria-label="Demo navigation">
      <span className="demo-nav-label">demo</span>
      {[
        { id: "student", label: "Student" },
        { id: "admin", label: "Admin" },
        { id: "slides", label: "Slides" },
      ].map(({ id, label }) => (
        <button
          key={id}
          className={`demo-nav-btn${activeView === id ? " is-active" : ""}`}
          onClick={() => handleNav(id)}
          aria-current={activeView === id ? "page" : undefined}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
