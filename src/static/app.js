document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        // Title
        const title = document.createElement("h4");
        title.textContent = name;

        // Description
        const desc = document.createElement("p");
        desc.textContent = details.description;

        // Schedule
        const scheduleP = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleP.appendChild(scheduleStrong);
        scheduleP.appendChild(document.createTextNode(` ${details.schedule}`));

        // Availability
        const availP = document.createElement("p");
        const availStrong = document.createElement("strong");
        availStrong.textContent = "Availability:";
        availP.appendChild(availStrong);
        availP.appendChild(document.createTextNode(` ${spotsLeft} spots left`));

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        participantsSection.appendChild(participantsHeading);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            // Participant name span
            const nameSpan = document.createElement("span");
            nameSpan.textContent = p;
            nameSpan.className = "participant-name";

            // Delete button (icon)
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = `Remove ${p}`;
            deleteBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#c62828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 5.5H16" stroke="#c62828" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M8.5 9.5V13.5" stroke="#c62828" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M11.5 9.5V13.5" stroke="#c62828" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 5.5V4.5C9 3.94772 9.44772 3.5 10 3.5C10.5523 3.5 11 3.94772 11 4.5V5.5" stroke="#c62828" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            `;
            deleteBtn.addEventListener("click", (e) => {
              e.preventDefault();
              // Unregister logic will be implemented in next step
              unregisterParticipant(name, p);
            });

            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "participant-item none";
          li.textContent = "No participants yet";
          participantsList.appendChild(li);
        }

        // Unregister function
        async function unregisterParticipant(activity, email) {
          if (!confirm(`Remove ${email} from ${activity}?`)) return;
          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
              {
                method: "POST", // Change to DELETE if backend expects DELETE
              }
            );
            if (!response.ok) {
              const result = await response.json();
              alert(result.detail || "Failed to unregister participant.");
            }
            // Refresh activities list
            fetchActivities();
          } catch (error) {
            alert("Failed to unregister participant. Please try again.");
            console.error("Error unregistering participant:", error);
          }
        }

        participantsSection.appendChild(participantsList);

        // Assemble card
        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(scheduleP);
        activityCard.appendChild(availP);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list so UI updates
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
