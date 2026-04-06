// 1. Configure MSAL for Multi-Tenant (Personal & Work/School accounts)
const msalConfig = {
    auth: {
        clientId: "f2269f4-7541-417a-9c6a-9c2a1df9e49b", // Your Application (client) ID
        authority: "https://login.microsoftonline.com/common", // Changed to "common" to allow any Microsoft account
        redirectUri: "https://arpan-404.github.io/Test-1/" // Your live GitHub Pages URL
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// 2. Handle Login
document.getElementById("loginBtn").onclick = async () => {
    try {
        // Request access to read and write files
        const loginResponse = await msalInstance.loginPopup({ scopes: ["Files.ReadWrite"] });
        
        // Save the access token for the API call
        sessionStorage.setItem("accessToken", loginResponse.accessToken);
        
        // Update the UI
        document.getElementById("uploadSection").style.display = "block";
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("statusMessage").innerText = `Welcome, ${loginResponse.account.name}!`;
    } catch (error) {
        console.error("Login failed:", error);
        alert("Authentication failed. Check the console for details.");
    }
};

// 3. Handle File Upload via Microsoft Graph API
document.getElementById("uploadBtn").onclick = async () => {
    const fileInput = document.getElementById("photoInput");
    const file = fileInput.files[0];
    const statusMsg = document.getElementById("statusMessage");

    if (!file) {
        alert("Please select a photo first.");
        return;
    }

    statusMsg.innerText = "Uploading...";
    const token = sessionStorage.getItem("accessToken");
    
    // Microsoft Graph endpoint to upload a file to the root of the user's OneDrive
    const endpoint = `https://graph.microsoft.com/v1.0/me/drive/root:/${file.name}:/content`;

    try {
        const response = await fetch(endpoint, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": file.type
            },
            body: file // Send the raw file binary
        });

        if (response.ok) {
            statusMsg.innerText = "Photo uploaded successfully to your OneDrive!";
        } else {
            const errorData = await response.json();
            console.error(errorData);
            statusMsg.innerText = "Upload failed. Check the console for details.";
        }
    } catch (error) {
        console.error("Upload error:", error);
        statusMsg.innerText = "An error occurred during the upload.";
    }
};
