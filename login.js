/* ShikshaSetu login dashboard — prototype frontend authentication.
   Passwords are validated in the form but deliberately never saved.
   Replace demo sign-in with the Spring Boot authentication API when ready. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const $ = id => document.getElementById(id);
  const PROFILE_KEY = "shikshasetu-account-profile-v1";
  const SESSION_KEY = "shikshasetu-auth-session-v1";

  const safeProfile = () => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); }
    catch { return null; }
  };
  const showFeedback = (id, message, error = false) => {
    const el = $(id);
    el.textContent = message;
    el.className = `login-feedback show${error ? " error" : ""}`;
  };
  const clearFeedback = () => ["loginFeedback", "signupFeedback"].forEach(id => {
    const el = $(id); el.textContent = ""; el.className = "login-feedback";
  });
  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const openDashboard = profile => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: profile.email, startedAt: new Date().toISOString() }));
    } catch {
      showFeedback("loginFeedback", "Your browser blocked session storage. Enable site storage to continue.", true);
      showFeedback("signupFeedback", "Your browser blocked session storage. Enable site storage to continue.", true);
      return;
    }
    window.location.assign("dashboard.html");
  };
  const setTab = mode => {
    const isLogin = mode === "login";
    $("loginForm").hidden = !isLogin;
    $("signupForm").hidden = isLogin;
    $("loginTab").classList.toggle("active", isLogin);
    $("signupTab").classList.toggle("active", !isLogin);
    $("loginTab").setAttribute("aria-selected", String(isLogin));
    $("signupTab").setAttribute("aria-selected", String(!isLogin));
    $("loginTitle").textContent = isLogin ? "Welcome back" : "Create your account";
    $("loginSubtitle").textContent = isLogin
      ? "Sign in and continue to your ShikshaSetu workspace."
      : "Create your profile and give your AI Mentor a name.";
    clearFeedback();
  };

  // Login and dashboard share one theme controller and one saved preference.
  $("loginThemeToggle").addEventListener("click", () => {
    if (window.ShikshaSetuTheme) window.ShikshaSetuTheme.toggle();
    else {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("shikshasetu-theme", next); } catch {}
    }
  });

  // Tabs and password visibility.
  $("loginTab").addEventListener("click", () => setTab("login"));
  $("signupTab").addEventListener("click", () => setTab("signup"));
  $("forgotPasswordLink").addEventListener("click", () => showFeedback("loginFeedback", "Password recovery will be enabled when the Spring Boot email-verification flow is connected."));
  document.querySelectorAll("[data-password-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.passwordToggle);
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.textContent = reveal ? "Hide" : "Show";
      button.setAttribute("aria-pressed", String(reveal));
      const fieldLabel = input.closest(".login-field")?.querySelector(":scope > span")?.textContent?.trim() || "password";
      button.setAttribute("aria-label", `${reveal ? "Hide" : "Show"} ${fieldLabel.toLowerCase()}`);
    });
  });

  // Sign in: local profile lookup only until the Spring Boot auth endpoint exists.
  $("loginForm").addEventListener("submit", event => {
    event.preventDefault(); clearFeedback();
    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;
    if (!validEmail(email)) return showFeedback("loginFeedback", "Enter a valid email address.", true);
    if (password.length < 8) return showFeedback("loginFeedback", "Enter the password you use for your account (8+ characters).", true);
    const profile = safeProfile();
    if (!profile || String(profile.email).toLowerCase() !== email) {
      return showFeedback("loginFeedback", "No ShikshaSetu profile was found for this email in this browser. Create an account first or use the browser where you registered.", true);
    }
    openDashboard(profile);
  });

  // Account creation stores profile metadata and AI Mentor name, never the password.
  $("signupForm").addEventListener("submit", event => {
    event.preventDefault(); clearFeedback();
    const fullName = $("signupFullName").value.trim();
    const email = $("signupEmail").value.trim().toLowerCase();
    const age = Number($("signupAge").value);
    const role = $("signupRole").value;
    const password = $("signupPassword").value;
    const confirm = $("signupConfirmPassword").value;
    const aiMentorName = $("signupAiMentorName").value.trim();
    if (fullName.length < 2) return showFeedback("signupFeedback", "Enter your full name.", true);
    if (!validEmail(email)) return showFeedback("signupFeedback", "Enter a valid Gmail or institutional email address.", true);
    if (!Number.isInteger(age) || age < 13 || age > 100) return showFeedback("signupFeedback", "Enter an age between 13 and 100.", true);
    if (!["Student", "Mentor"].includes(role)) return showFeedback("signupFeedback", "Choose Student or Mentor.", true);
    if (password.length < 8) return showFeedback("signupFeedback", "Use a password with at least 8 characters.", true);
    if (password !== confirm) return showFeedback("signupFeedback", "The passwords do not match.", true);
    if (aiMentorName.length < 2) return showFeedback("signupFeedback", "Give your AI Mentor a name of at least 2 characters.", true);
    if (!$("signupConsent").checked) return showFeedback("signupFeedback", "Please accept the supportive-use notice to continue.", true);
    const prior = safeProfile();
    if (prior && String(prior.email).toLowerCase() === email) {
      setTab("login");
      $("loginEmail").value = email;
      return showFeedback("loginFeedback", "An account profile already exists for this email in this browser. Sign in instead.");
    }

    const profile = { fullName, email, age, role, aiMentorName, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
    catch { return showFeedback("signupFeedback", "Could not save your profile in this browser. Check storage permissions.", true); }
    openDashboard(profile);
  });

  // Returning users get an email hint; this is not an authentication token.
  const existing = safeProfile();
  if (existing?.email) $("loginEmail").value = existing.email;
  setTab("login");
});
