const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const typing = document.getElementById("typing");

messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function quickMessage(text) {
    messageInput.value = text;
    sendMessage();
}

function addMessage(message, sender) {

    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "user"
            ? "user-message"
            : "bot-message";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.innerHTML = message
        .replace(/\n/g, "<br>");

    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) return;

    addMessage(message, "user");

    messageInput.value = "";

    typing.classList.remove("hidden");

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        typing.classList.add("hidden");

        addMessage(
            data.reply ||
            "Aiyoo ma 🥺❤️ konjam problem vandhuruchu. Try pannalama? ✨",
            "bot"
        );

    } catch (error) {

        console.error(error);

        typing.classList.add("hidden");

        addMessage(
            "Aiyoo thangoo 😭❤️ server reach aagala. Backend running ah check pannu ma ✨",
            "bot"
        );
    }
}

/* Auto focus */
messageInput.focus();
