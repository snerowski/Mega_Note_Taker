const express = require("express");
const path = require("path");
const db = require("./Develop/db/db.json");
const fs = require("fs");
const { v4: generateId } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.static("public"));


// GET request for accessing the note page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

// POST request for writing a new note
app.use(express.json({ limit: '1mb' }));
app.post("/api/notes", (req, res) => {
  console.log("POST request received");
  console.info(`${req.method} request received to add a note`);
  const { title, text } = req.body;
  if (title && text) {
    const newNote = { id: generateId(), title, text };
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json('Error in posting review');
      } else {
        const savedNotes = JSON.parse(data);
        savedNotes.push(newNote);
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(savedNotes, null, 4),
          (writeErr) => {
            if (writeErr) {
              console.error(writeErr);
              res.status(500).json('Error in posting review');
            } else {
              console.info("successfully added note!");
              const response = {
                status: "success",
                body: "newReview",
              };
              console.log(response);
              res.status(201).json(response);
            }
          }
        );
      }
    });
  } else {
    res.status(500).json('Error in posting review');
  }
});


// GET request for loading saved notes from the DB
app.get("/api/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/db/db.json"))
);

app.listen(PORT, () =>
  console.log(`Note taking app listening at http://localhost:${PORT}.`)
);

// Request for deleting notes
app.delete("/api/notes/:id", (req, res) => {
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error in reading database file" });
    } else {
      const savedNotes = JSON.parse(data);
      const filteredNotes = savedNotes.filter((note) => note.id !== req.params.id);
      fs.writeFile(
        "./db/db.json",
        JSON.stringify(filteredNotes, null, 4),
        (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
            res.status(500).json({ error: "Error in writing database file" });
          } else {
            console.info("Successfully deleted note!");
            res.json({ message: "Note deleted" });
          }
        }
      );
    }
  });
});


