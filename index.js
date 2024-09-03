import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//Reads from JSON file
function readTasks() {
    const data = fs.readFileSync("tasks.json");
    return JSON.parse(data);
}

//Writes to JSON file
function writeTasks(tasks) {
    fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
}

//Clears JSON file on termination of server
function clearTasksFile() {
    const emptyTasks = { 
        selfTasks: [], 
        universityTasks: [] 
    };

    writeTasks(emptyTasks); //Write an empty array to the JSON file
    console.log("Cleared tasks.json");
}

app.get("/", (req, res) => {
    const today = new Date().toDateString();
    const tasks = readTasks(); //Reads current tasks
    res.render("index.ejs", { date: today, tasks: tasks.selfTasks }); //Passes self-related tasks to the EJS template
});

app.get("/university", (req, res) => {
    const tasks = readTasks(); //Reads current tasks
    res.render("university.ejs", { tasks: tasks.universityTasks }); //Passes work-related tasks to the EJS template
});

app.post("/", (req, res) => {
    const task = req.body.task; //Access the input value using body-parser req.body
    const tasks = readTasks(); //Reads current tasks
    tasks.selfTasks.push(task); //Add new task
    writeTasks(tasks); //Wrtes updated tasks to JSON file
    console.log(`Self task added: ${task}`);
    res.redirect("/");
});

app.post("/university", (req, res) => {
    const task = req.body.task; //Access the input value using body-parser req.body
    const tasks = readTasks(); //Reads current tasks
    tasks.universityTasks.push(task); //Add new task
    writeTasks(tasks); //Wrtes updated tasks to JSON file
    console.log(`University task added: ${task}`);
    res.redirect("/university");
});

//Listen for the SIGINT signal (Ctrl+C) or other termination signals
process.on('SIGINT', () => {
    clearTasksFile();
    process.exit(); 
});

process.on('SIGTERM', () => {
    clearTasksFile();
    process.exit();
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});