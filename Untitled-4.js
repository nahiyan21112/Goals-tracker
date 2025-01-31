// Get goals from localStorage or initialize empty array
let goals = JSON.parse(localStorage.getItem('dailyGoals')) || [];

// Add these constants at the top of the file
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Replace the API key constant with a function to get it from a secure source
function getApiKey() {
    return 'AIzaSyAkAnYHNhjwIthaLAi4DkA5_q4NiBJRTtI';
}

// Update date display
function updateDateDisplay() {
    const dateDisplay = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Function to update goals summary
function updateGoalsSummary() {
    const summary = document.getElementById('goalsSummary');
    const today = new Date().toLocaleDateString();
    const todaysGoals = goals.filter(goal => goal.date === today);
    const completed = todaysGoals.filter(goal => goal.completed).length;
    const total = todaysGoals.length;
    
    summary.innerHTML = `<span>${completed} completed</span> of <span>${total} total</span>`;
}

// Function to save goals to localStorage
function saveGoals() {
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
    updateGoalsSummary();
}

// Function to add a new goal
function addGoal() {
    const input = document.getElementById('goalInput');
    const goalText = input.value.trim();
    
    if (goalText) {
        const goal = {
            id: Date.now(),
            text: goalText,
            completed: false,
            date: new Date().toLocaleDateString()
        };
        
        goals.push(goal);
        saveGoals();
        renderGoals();
        input.value = '';
        
        // Add animation class to the new goal
        setTimeout(() => {
            const newGoal = document.querySelector('.goal-item:last-child');
            if (newGoal) newGoal.classList.add('fade-in');
        }, 0);
    }
}

// Function to toggle goal completion
function toggleGoal(id) {
    const goalElement = document.querySelector(`[data-goal-id="${id}"]`);
    goals = goals.map(goal => {
        if (goal.id === id) {
            if (!goal.completed && goalElement) {
                showCompletionAnimation(goalElement);
            }
            return { ...goal, completed: !goal.completed };
        }
        return goal;
    });
    
    saveGoals();
    renderGoals();
}

// Function to delete a goal
function deleteGoal(id) {
    const goalElement = document.querySelector(`[data-goal-id="${id}"]`);
    goalElement.classList.add('fade-out');
    
    setTimeout(() => {
        goals = goals.filter(goal => goal.id !== id);
        saveGoals();
        renderGoals();
    }, 200);
}

// Function to render goals
function renderGoals() {
    const goalsList = document.getElementById('goalsList');
    const today = new Date().toLocaleDateString();
    
    // Filter goals for today
    const todaysGoals = goals.filter(goal => goal.date === today);
    
    goalsList.innerHTML = todaysGoals.map((goal, index) => `
        <li class="goal-item ${goal.completed ? 'completed' : ''}" data-goal-id="${goal.id}">
            <span class="goal-number">${index + 1}.</span>
            <input 
                type="checkbox" 
                class="goal-checkbox"
                ${goal.completed ? 'checked' : ''} 
                onchange="toggleGoal(${goal.id})"
            >
            <span class="goal-text">${goal.text}</span>
            <button class="delete-btn" onclick="deleteGoal(${goal.id})">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
    
    updateGoalsSummary();
}

// Replace the theme functions with this new version
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    const icon = document.querySelector('#themeToggle i');
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// Function to initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('colorTheme') || 'indigo';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    setColorTheme(savedColor);
    
    // Set initial icon
    const icon = document.querySelector('#themeToggle i');
    icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// Initial setup
updateDateDisplay();
renderGoals();
initializeTheme();

// Add event listener for Enter key
document.getElementById('goalInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addGoal();
    }
});

// AI Assistant Functions
let isChatOpen = false;

function toggleAIChat() {
    const chatContainer = document.getElementById('chatContainer');
    isChatOpen = !isChatOpen;
    chatContainer.classList.toggle('active', isChatOpen);
}

function handleAIInput(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage('user', message);
        input.value = '';
        await generateAIResponse(message);
    }
}

async function handleAIInput(event) {
    if (event.key === 'Enter') {
        await sendAIMessage();
    }
}

function addMessage(type, content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    messageDiv.innerHTML = `
        <i class="fas ${type === 'user' ? 'fa-user' : 'fa-robot'}"></i>
        <div class="message-content">${content}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update the generateAIResponse function to handle task completion
async function generateAIResponse(userMessage) {
    addMessage('assistant', '<i class="fas fa-spinner fa-spin"></i> Thinking...');
    
    // Get current goals data
    const today = new Date().toLocaleDateString();
    const todaysGoals = goals.filter(goal => goal.date === today);
    const completedGoals = todaysGoals.filter(goal => goal.completed);
    const pendingGoals = todaysGoals.filter(goal => !goal.completed);

    // Check if the message is a command to add a task
    const addTaskRegex = /(?:add|create|new)(?:\s+(?:task|goal))?\s+(.+)/i;
    const addMatch = userMessage.match(addTaskRegex);

    if (addMatch) {
        const taskText = addMatch[1].trim();
        const goalInput = document.getElementById('goalInput');
        goalInput.value = taskText;
        addGoal();
        addMessage('assistant', `I've added a new goal: "${taskText}" 📝`);
        return;
    }

    // Check if the message is a command to complete a task
    const completionRegex = /(?:complete|mark|check|finish)(?:\s+(?:task|goal))?\s+(?:number\s+)?(\d+)/i;
    const completeMatch = userMessage.match(completionRegex);

    if (completeMatch) {
        const taskNumber = parseInt(completeMatch[1]) - 1;
        if (taskNumber >= 0 && taskNumber < todaysGoals.length) {
            const targetGoal = todaysGoals[taskNumber];
            if (!targetGoal.completed) {
                // Find and click the checkbox
                const goalElement = document.querySelector(`[data-goal-id="${targetGoal.id}"]`);
                if (goalElement) {
                    const checkbox = goalElement.querySelector('.goal-checkbox');
                    if (checkbox) {
                        checkbox.checked = true;
                        toggleGoal(targetGoal.id);
                        addMessage('assistant', `I've marked goal #${taskNumber + 1} as completed! Great job! 🎉`);
                    }
                }
                return;
            } else {
                addMessage('assistant', `Goal #${taskNumber + 1} is already completed! 👍`);
                return;
            }
        } else {
            addMessage('assistant', `I couldn't find goal #${taskNumber + 1}. Please check the goal number and try again.`);
            return;
        }
    }
    
    const apiKey = getApiKey();
    const prompt = `You are a helpful AI assistant for a goal tracking app. 
    Current context: 
    - Total goals today: ${todaysGoals.length}
    - Completed goals: ${completedGoals.length}
    - Pending goals: ${pendingGoals.length}
    
    Current goals list:
    ${todaysGoals.map((goal, index) => `${index + 1}. ${goal.text} (${goal.completed ? 'completed' : 'pending'})`).join('\n')}

    User message: ${userMessage}
    
    Please provide a helpful, encouraging response. Include the actual numbers in your response when discussing goals.
    Keep responses concise and motivational. If discussing incomplete goals, suggest breaking them into smaller steps.
    
    Note: Users can:
    - Add tasks by saying "add task [task description]" or "create goal [goal description]"
    - Complete tasks by saying "complete task 1" or "mark goal 2 as done"`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        // Remove loading message
        const messages = document.getElementById('chatMessages');
        messages.removeChild(messages.lastChild);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response format from API');
        }

        let aiResponse = data.candidates[0].content.parts[0].text;
        
        // Format the response with HTML
        aiResponse = aiResponse
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        addMessage('assistant', aiResponse);

    } catch (error) {
        console.error('Error:', error);
        // Remove loading message
        const messages = document.getElementById('chatMessages');
        messages.removeChild(messages.lastChild);
        
        // Show user-friendly error message
        addMessage('assistant', 'Sorry, I encountered an error while processing your request. Please try again in a moment.');
    }
}

// Add this function to handle color theme changes
function setColorTheme(color) {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    
    // Update active button
    document.querySelectorAll('.color-theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(`theme-${color}`)) {
            btn.classList.add('active');
        }
    });

    // Set the new color theme
    root.style.setProperty('--primary', `var(--theme-${color})`);
    root.style.setProperty('--primary-hover', `var(--theme-${color}-hover)`);
    
    // Save the preference
    localStorage.setItem('colorTheme', color);
}

// Add a helper function to show task completion animation
function showCompletionAnimation(goalElement) {
    if (goalElement) {
        goalElement.classList.add('completion-animation');
        setTimeout(() => {
            goalElement.classList.remove('completion-animation');
        }, 1000);
    }
}