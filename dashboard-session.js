/* Dashboard entry guard and profile personalization. */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const PROFILE_KEY = "shikshasetu-account-profile-v1";
  const SESSION_KEY = "shikshasetu-auth-session-v1";
  let profile = null, session = null;
  try {
    profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {}
  if (!profile?.email || !session?.email || String(profile.email).toLowerCase() !== String(session.email).toLowerCase()) {
    window.location.replace("index.html");
    return;
  }

  const initials = String(profile.fullName || "User").trim().split(/\s+/).slice(0,2).map(part => part[0] || "").join("").toUpperCase();
  const mini = document.querySelector(".profile-mini");
  if (mini) {
    const avatar = mini.querySelector(".avatar");
    const name = mini.querySelector("strong");
    const detail = mini.querySelector("small");
    if (avatar) avatar.textContent = initials || "U";
    if (name) name.textContent = profile.fullName || profile.email;
    if (detail) detail.textContent = `${profile.role || "Member"} · AI Mentor: ${profile.aiMentorName || "ShikshaSetu AI"}`;
  }
  const accountButton = document.getElementById("accountSetupButton");
  if (accountButton) accountButton.textContent = "♙ My profile";

  const topActions = document.querySelector(".top-actions");
  if (topActions && !document.getElementById("signOutButton")) {
    const button = document.createElement("button");
    button.id = "signOutButton";
    button.type = "button";
    button.className = "secondary-button compact dashboard-signout";
    button.textContent = "Sign out";
    topActions.insertBefore(button, document.getElementById("addStudentTop"));
    button.addEventListener("click", () => {
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      window.location.replace("index.html");
    });
  }
});
