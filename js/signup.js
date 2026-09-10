window.onload = () => {
    const loader = document.querySelector(".loader-container");
    setTimeout(() => loader.classList.add("fade-out"), 2500);
};

document.getElementById("signup-form").addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("signup-name").value;

    const email = document.getElementById("signup-email").value;

    const password = document.getElementById("signup-password").value;

    const confirmPassword = document.getElementById("signup-cpassword").value;

    if(password !== confirmPassword){
        alert("Passwords do not match");
        return;
    }

    try{
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        alert("Account Created Successfully!");

        window.location.href="index.html";

    }
    catch(error){
        alert(error.message || "Unable to create account");

    }

});