// TODO: remember that for site_2, THIS WILL NEED TO CHANGE TO THE ACTUAL SITE WHERE THE LOW ANTHRO BOT WILL BE KEPT
let rasaServerUrl = "https://site-2-820874387134.europe-west2.run.app/webhooks/rest/webhook";

// Potential chatbot responses, literally hardcoded in -> when working with real chatbot, will need to change this
let responses = {
    utter_greet: "Hello, it’s your Post Office Virtual Assistant. What do you need help with?",
    utter_anything_else: "Is there anything else?",
    utter_ask_further: "What else do you need help with?",
    utter_confirm_further_help: "If you have any other queries, send them here and I will attempt to provide you with an answer.",
    utter_repeat: "(SIMULATION MESSAGE: IF YOU HAVE SEEN THIS MESSAGE MULTIPLE TIMES, PLEASE USE THE 'SUGGESTED ANSWERS' BUTTONS)",

    utter_is_suitable: "Is this suitable?",
    utter_like_to_continue: "Continue?",
    utter_like_to_purchase: "Is this correct?",
    utter_repeat_form: "(SIMULATION MESSAGE: IF YOU HAVE SEEN THIS MESSAGE MULTIPLE TIMES, PLEASE USE THE BUTTONS BELOW)"
}

document.addEventListener("DOMContentLoaded", async function () {

    // Gonna first restart interaction I think, fairly important for form things and stuff
    // gonna do both action_restart and action_session_start, as action_session_start doesn't reset slots
    try {
        let response = await fetch(rasaServerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // So these message with "/" actually follow intents instead of responses (see domain.yml)
            // And default actions
            body: JSON.stringify({ sender: "user", message: "/restart" }),
        });

        let data = await response.json();

        response = await fetch(rasaServerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // So these message with "/" actually follow intents instead of responses (see domain.yml)
            body: JSON.stringify({ sender: "user", message: "/session_start" }),
        });

        // Not gonna do anything with this, just wanting to double make sure everything works correctly
        data = await response.json();
        

    } catch (error) {
        console.error("Error connecting to Rasa:", error);
    }

    // Then send the initial message
    sendInitialMessage();
});

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Extracting the message sending into its own function for reusability
async function rasaInteraction(msg) {
    // Remove all children of the div (i.e. remove the buttons) 
    // Avoids the bug with incorrect buttons being displayed
    document.getElementById("button_space").replaceChildren();

    let chatBox = document.getElementById("chat-box");

    try {
        // Perform a POST request on the server, using the message passed in as the message
        let response = await fetch(rasaServerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // So these message with "/" actually follow intents instead of responses (see domain.yml)
            body: JSON.stringify({ sender: "user", message: msg }),
        });

        // Store the response
        let data = await response.json();

        // We keep track of the last message - that is so the correct buttons can be displayed later
        let lastMsg = "";

        // Display bot response
        for (let msg of data) {

            // Create the thinking message that will act as a delay when running the program
            let thinkingContainer = document.createElement("div");
            thinkingContainer.classList.add('message', 'bot-message-container');

            // Create the image
            let botImage = document.createElement('img');
            botImage.className = 'avatar';
            botImage.src = "https://www.dropbox.com/scl/fi/zzbw46gau2dv501asfhk3/chatbot.png?rlkey=iotpyz7je8j3rrkyvx8xvskdy&st=lervrr4c&raw=1";
            botImage.alt = "Virtual Assistant Avatar";
            
            // Create the text of the message
            let thinkingMessage = document.createElement("div");
            thinkingMessage.classList.add ("bot-message", "thinking");
            // Another way of adding changed anthropomorphism -> this has a ... while high anthro has 'alex is typing'
            thinkingMessage.innerHTML = "<i>...</i>";

            // Add everything to the container
            thinkingContainer.appendChild(botImage);
            thinkingContainer.appendChild(thinkingMessage);
            chatBox.appendChild(thinkingContainer);

            const count = (msg) => msg.trim().split(/\s+/).length;

            // Scroll to bottom
            chatBox.scrollTop = chatBox.scrollHeight;

            // The low anthropomorphism chatbots have a set waiting time between each message
            await new Promise(resolve => setTimeout(resolve, 3500));

            // Remove the "thinking" message
            chatBox.removeChild(thinkingContainer);

            // Create the actual message 
            let botMessageContainer = document.createElement("div");
            botMessageContainer.classList.add('message', 'bot-message-container');

            let botMessage = document.createElement("div");
            botMessage.className = "bot-message";
            botMessage.innerText = msg.text;
            
            if (msg.text.trim().replace(".", ",") == "(THIS MARKS THE END OF THE SIMULATION, PLEASE CLICK ON THE FOLLOWING LINK TO BE TAKEN TO THE QUESTIONNAIRE)") {
                botMessage.innerHTML = "(THIS MARKS THE END OF THE SIMULATION, PLEASE CLICK ON THE <a href='https://forms.gle/7EDfpcHVYRS4FVX19'> FOLLOWING LINK </a> TO BE TAKEN TO THE QUESTIONNAIRE)"
            }
            
            botMessageContainer.appendChild(botImage.cloneNode());
            botMessageContainer.appendChild(botMessage);
            
            chatBox.appendChild(botMessageContainer);

            lastMsg = msg.text;
        };

        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        // Create the buttons, passing in lastMsg as a variable
        makeButtons(lastMsg);

    } catch (error) {
        console.error("Error connecting to Rasa:", error);
    }
}

// Extract the button making code into its own separate function (need to pass in the lassMsg as a local var)
function makeButtons(lastMsg) {

    // console.log(lastMsg)

    // console.log(responses.utter_greet === lastMsg)

    let className = "";
    
    // Depending on the chatbot response, we replace the currently empty buttonVals with a set of responses appropriate for the response
    let buttonVals = {};
    switch (lastMsg) {
        case responses.utter_greet: 
        case responses.utter_anything_else:
        case responses.utter_ask_further: 
        case responses.utter_confirm_further_help:
        case responses.utter_repeat:
            buttonVals = {"Statistics": "Hi, how often does the Post Office lose letters and parcels during delivery?", 
                "Insurance": "What kind of remedial action is taken by the Post Office if the letter is lost?", 
                "Postage Request": "Could you walk me through potential postage options suitable for sending a passport?"};
                // console.log(buttonVals);
            className = "";
            break;
        case responses.utter_is_suitable:
        case responses.utter_like_to_continue: 
        case responses.utter_like_to_purchase:
        case responses.utter_repeat_form:
            buttonVals = {"Yes": "Yes", "No": "No"};
            className = "input_button";
            break;
    }

    // console.log(buttonVals);

    // Then we make the buttons, where we give button a value corresponding with the text (https://www.w3schools.com/JSREF/prop_pushbutton_value.asp) 
    // and an onclick function that sends the message displayed in the button as a response
    let buttonPlace = document.getElementById("button_space");

    for (let val in buttonVals) {
        let responseButton = document.createElement("button");
        responseButton.innerText = val;
        responseButton.value = buttonVals[val];
        responseButton.className = className;
        responseButton.onclick = () => autofillResponse(responseButton.value);
        buttonPlace.appendChild(responseButton);
    }
}

// The onClick button function
function autofillResponse(buttonVal) {
    // Render the message, presented in the button, in the chatbot
    makeUserMessage(buttonVal);
    // Sending the message, rendering the message from the server and creating a new set of buttons (if applicable)
    rasaInteraction(buttonVal);
}

// A function that displays the user message
function makeUserMessage(msg) {
    let chatBox = document.getElementById("chat-box");

    // Display user message
    let userMessageContainer = document.createElement("div");
    userMessageContainer.classList.add('message', 'user-message-container');
    
    let userImage = document.createElement('img');
    userImage.className = 'avatar';
    userImage.src = "https://www.dropbox.com/scl/fi/yf0bh5vemosqj3qn477t3/user-1.png?rlkey=is8um60xzn691i9r6wyg2hmcv&st=v5agivaw&raw=1";
    userImage.alt = "User Avatar";

    let userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = msg;

    userMessageContainer.appendChild(userImage);
    userMessageContainer.appendChild(userMessage);

    chatBox.appendChild(userMessageContainer);

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send the initial message - use the greet intent (see domain.yml)
async function sendInitialMessage() {
    await rasaInteraction("/greet");
}

// Functions to send messages through the text input 
async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return; // Ignore empty messages

    // Create the chat bubble for the user's input
    makeUserMessage(userInput);

    // Clear input field
    document.getElementById("user-input").value = "";

    // Send message to Rasa
    rasaInteraction(userInput);
}