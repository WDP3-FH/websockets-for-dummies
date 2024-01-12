window.onload = () => {
    const inputUsername = document.getElementById("inputUsername");
    inputUsername.focus();
    inputUsername.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            console.log("ENTER PRESSED");
            inputUsername.disabled = true;
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

            // Handle server messages
            socket.addEventListener("message", (event) => {
                const response_msg = JSON.parse(event.data);

                // Add server message to chat
                const paragraph = document.createElement("p");
                paragraph.innerHTML = `<span class="username ${
                    response_msg.userId == inputUsername.value ? "me" : "notme"
                }">${response_msg.userId}</span>: ${response_msg.msg}`;

                console.log(inputUsername.value);
                console.log(response_msg.userId);
                // if (response_msg.userId == inputUsername) {
                //     paragraph.innerHTML += "me";
                // } else {
                //     paragraph.innerHTML += "notme";
                // }
                // paragraph.innerHTML +=
                //     '">' + response_msg.userId + "</span>: " + response_msg.msg;
                document
                    .getElementById("text-container")
                    .appendChild(paragraph);
                // +=response_msg.userId + ": " + response_msg.msg + "\n";
            });

            // Send-Button
            // document.getElementById("btnSend").addEventListener("click", () => {
            //     const msg = {
            //         type: "messageSent",
            //         userId: userId,
            //         msg: document.getElementById("inputChat").value,
            //     };

            //     socket.send(JSON.stringify(msg));
            //     document.getElementById("inputChat").value = "";
            // });
            const inputChat = document.getElementById("inputChat");
            inputChat.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    const msg = {
                        type: "messageSent",
                        userId: userId,
                        msg: inputChat.value,
                    };

                    socket.send(JSON.stringify(msg));
                    inputChat.value = "";
                }
            });
            document
                .getElementById("chat-container")
                .classList.remove("hidden");

            const usernames =
                document.getElementsByClassName("insert-username");

            [].forEach.call(usernames, (username) => {
                // username.innerHTML = `${userId} <i>&lt;press ENTER></i>: `;
                username.innerHTML = `${userId}: `;
            });
            document.getElementById("inputChat").focus();
        }
    });
};
