document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');
    const addContactBtn = document.getElementById('add-contact-btn');
    const contactNameInput = document.getElementById('contact-name');
    const contactsList = document.querySelector('.contacts');
    const fileInput = document.createElement('input'); // Create a hidden file input
    const fileUploadBtn = document.createElement('button'); // Create a file upload button

    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileUploadBtn.textContent = '📎'; // File upload icon
    fileUploadBtn.style.marginRight = '10px';

    document.querySelector('.chat-input').prepend(fileUploadBtn); // Add file upload button to chat input

    let username = prompt("Enter your name:");
    if (!username) {
        username = "Anonymous"; // Default if no name is provided
    }

    // Connect to the WebSocket server
    const socket = io('http://localhost:3000');

    // Listen for new messages
    socket.on('receiveMessage', (data) => {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', data.sender === username ? 'sent' : 'received');
        newMessage.innerHTML = `<p>${data.sender}: ${data.message}</p>`;
        chatMessages.appendChild(newMessage);

        // Scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (data.sender !== username) {
            showNotification(data.sender, data.message);
            playMessageTune();
        }
    });

    // Listen for file messages
    socket.on('receiveFile', (data) => {
        const fileLink = document.createElement('a');
        fileLink.href = data.fileContent;
        fileLink.download = data.fileName;
        fileLink.textContent = `Download: ${data.fileName}`;
        fileLink.style.display = 'block';
        chatMessages.appendChild(fileLink);

        // Scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Function to show notification
    function showNotification(sender, message) {
        if (Notification.permission === 'granted') {
            new Notification(`${sender} says: ${message}`);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(`${sender} says: ${message}`);
                }
            });
        }
    }

    // Function to play message sound (tune)
    function playMessageTune() {
        const audio = new Audio('C:\\Users\\TEMP.DEEKSHA\\Downloads\\Messenger-Notification-Sound.mp3');
 // Update to your sound file path
        audio.play();
    }

    // Handle file upload button click
    fileUploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection and send file
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = {
                    sender: username,
                    fileName: file.name,
                    fileContent: reader.result
                };

                // Emit the file data to the server
                socket.emit('fileUpload', fileData);
            };
            reader.readAsDataURL(file); // Encode file as Base64
        }
    });

    // Send a message
    sendBtn.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const messageData = {
                sender: username,
                message: messageText
            };

            // Emit the message to the server
            socket.emit('sendMessage', messageData);

            // Clear the input field
            messageInput.value = '';
        }
    });

    // Add new contact to contact list
    addContactBtn.addEventListener('click', () => {
        const contactName = contactNameInput.value.trim();

        if (contactName) {
            const newContactDiv = document.createElement('div');
            newContactDiv.classList.add('contact');
            newContactDiv.textContent = contactName;
            contactsList.appendChild(newContactDiv);

            contactNameInput.value = ''; // Clear input field

            newContactDiv.addEventListener('click', () => {
                selectedContact = contactName;
                document.querySelector('.chat-header p').textContent = `Chat with ${contactName}`;
                chatMessages.innerHTML = ''; // Clear previous messages
            });
        }
    });
});
