window.onload = () => {
    const loader = document.querySelector(".loader-container");
    setTimeout(() => loader.classList.add("fade-out"), 2500);
};

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        alert("Login Successful!");

        window.location.href = "index.html";

    } catch (error) {
        alert(error.message || "Unable to log in");
    }
});