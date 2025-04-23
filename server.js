const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Using the promises API for cleaner async code
const app = express();
const port = 5501;

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Path to our "database" file
const submissionsFilePath = path.join(__dirname, 'submissions.json');

// Function to read existing submissions from the JSON file
async function readSubmissions() {
    try {
        const data = await fs.readFile(submissionsFilePath, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        // If the file doesn't exist or is empty/invalid JSON, return an empty array
        return [];
    }
}

// Function to save a new submission to the JSON file
async function saveSubmission(submission) {
    const existingSubmissions = await readSubmissions();
    existingSubmissions.push(submission);
    await fs.writeFile(submissionsFilePath, JSON.stringify(existingSubmissions, null, 2), 'utf8');
}

// Handle the contact form submission
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    const newSubmission = {
        timestamp: new Date().toISOString(),
        name,
        email,
        message
    };

    try {
        await saveSubmission(newSubmission);
        console.log('New submission saved:', newSubmission);
        res.send('Thank you for your message! We have received it.');
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).send('Error saving your message. Please try again later.');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});