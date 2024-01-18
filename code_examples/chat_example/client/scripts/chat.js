function addInputEventToInputFields() {
    // input fields grow with their text input (underline)
    const inputs = document.querySelectorAll("input");
    [].forEach.call(inputs, (input) => {
        input.addEventListener("input", (event) => {
            event.target.style.width = event.target.value.length + 0.5 + "ch"; // 1ch == 1 character
        });
    });
}

window.onload = () => {
    addInputEventToInputFields();

    const inputUsername = document.getElementById("inputUsername");
    inputUsername.focus(); // automatic focus username-input-field

    inputUsername.addEventListener("keydown", (event) => {
        // user sends data with pressing enter
        if (event.key === "Enter") {
            inputUsername.disabled = true; // username should not be changed afterwards

            // -------- WEBSOCKET IMPLEMENTATION --------

            // CREATE WEBSOCKET-CONNECTION
            const socket = new WebSocket("ws://localhost:8080");
            const userId = document.getElementById("inputUsername").value;
            // try to establish WebSocket-Connection and send greetings to the server
            socket.addEventListener("open", (event) => {
                const msg = {
                    type: "open",
                    userId: userId,
                    msg: "Hello Server!",
                };
                socket.send(JSON.stringify(msg));
            });

            // HANDLE INCOMING SERVER MESSAGES
            socket.addEventListener("message", (event) => {
                const response_msg = JSON.parse(event.data);

                // Add server message to chat
                const paragraph = document.createElement("p");
                paragraph.innerHTML = `<span class="username ${
                    response_msg.userId == inputUsername.value ? "me" : "notme"
                }">${response_msg.userId}</span>: ${response_msg.msg}`;
                document
                    .getElementById("text-container")
                    .appendChild(paragraph);
            });

            // SEND CHAT MESSAGES USING WEBSOCKETS
            const inputChat = document.getElementById("inputChat");
            inputChat.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    // create chat message
                    const msg = {
                        type: "messageSent",
                        userId: userId,
                        msg: inputChat.value,
                    };

                    // send chat message
                    socket.send(JSON.stringify(msg));

                    // cleanup chat-message input-field
                    inputChat.value = "";
                    event.target.style.width =
                        event.target.value.length + 0.5 + "ch"; // 1ch <=> 1 character
                }
            });

            // -------- WEBSOCKET IMPLEMENTATION --------

            // make chat visible after username input
            document
                .getElementById("chat-container")
                .classList.remove("hidden");
            // insert username from input
            const usernames =
                document.getElementsByClassName("insert-username");
            [].forEach.call(usernames, (username) => {
                username.innerHTML = `${userId}: `;
            });
            inputChat.focus();
        }
    });
};
