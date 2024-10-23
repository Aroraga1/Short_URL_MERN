// Handle form submission
document
  .getElementById("inputForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get input values
    const string1 = document.getElementById("string1").value;
    const string2 = document.getElementById("string2").value;

    // Concatenate the strings to create the short URL
    const concatenatedString = `https://shortit-lemon.vercel.app/${string2}`; // No need for String() here

    fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: string1,
        mainURL: string2, // Pass only the short string without the base URL
        username: string2,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        alert(data.message); // Show the success message from the response

        // Display the generated short URL in the output box
        const outputText = document.getElementById("outputText");
        outputText.value = concatenatedString; // Use the concatenated string for output

        // Make the output section visible
        document.getElementById("outputSection").style.display = "block";
        document.getElementById("copyBtn").style.display = "inline-block"; // Show the copy button
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error saving URL.");
      });
  });

// Copy to Clipboard Function
document.getElementById("copyBtn").addEventListener("click", function () {
  const outputText = document.getElementById("outputText");

  // Use the Clipboard API
  navigator.clipboard
    .writeText(outputText.value)
    .then(() => {
      // Display success message
      const successMessage = document.getElementById("successMessage");
      successMessage.style.display = "block";

      // Hide the success message after 2 seconds
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 2000);
    })
    .catch((error) => {
      console.error("Error copying to clipboard:", error);
      alert("Failed to copy to clipboard.");
    });
});
