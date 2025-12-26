// Notebook App - JavaScript Implementation
// Following the detailed plan provided

class NotebookApp {
  constructor() {
    this.notes = [];
    this.currentNoteId = null;
    this.autoSaveTimeout = null;

    this.init();
  }

  init() {
    this.loadNotes();
    this.renderNotesList();
    this.updateStats();
    this.showEmptyState();
  }

  // Generate unique ID for notes
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Create new note following the data model from the plan
  createNote(title = "Untitled Note", body = "") {
    const note = {
      id: this.generateId(),
      title: title,
      body: body,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: [], // For future enhancement
    };

    this.notes.unshift(note); // Add to beginning of array
    this.saveNotes();
    return note;
  }

  // Load notes from localStorage
  loadNotes() {
    const savedNotes = localStorage.getItem("notebook-notes");
    if (savedNotes) {
      this.notes = JSON.parse(savedNotes);
    }
  }

  // Save notes to localStorage
  saveNotes() {
    localStorage.setItem("notebook-notes", JSON.stringify(this.notes));
    this.updateStats();
  }

  // Render notes list in sidebar
  renderNotesList(filteredNotes = null) {
    const notesList = document.getElementById("notesList");
    const notesToRender = filteredNotes || this.notes;

    notesList.innerHTML = "";

    notesToRender.forEach((note) => {
      const li = document.createElement("li");
      li.className = "note-item";
      li.onclick = () => this.selectNote(note.id);

      if (note.id === this.currentNoteId) {
        li.classList.add("active");
      }

      const preview =
        note.body.length > 50 ? note.body.substring(0, 50) + "..." : note.body;

      const date = new Date(note.updated).toLocaleDateString();

      // Use textContent for security (prevents XSS)
      const titleDiv = document.createElement("div");
      titleDiv.className = "note-title";
      titleDiv.textContent = note.title || "Untitled";

      const previewDiv = document.createElement("div");
      previewDiv.className = "note-preview";
      previewDiv.textContent = preview || "No content";

      const dateDiv = document.createElement("div");
      dateDiv.className = "note-date";
      dateDiv.textContent = date;

      li.appendChild(titleDiv);
      li.appendChild(previewDiv);
      li.appendChild(dateDiv);

      notesList.appendChild(li);
    });
  }

  // Select and display a note
  selectNote(noteId) {
    this.currentNoteId = noteId;
    const note = this.notes.find((n) => n.id === noteId);

    if (note) {
      this.renderSelectedNote(note);
      this.renderNotesList(); // Re-render to update active state
    }
  }

  // Display selected note in main area
  renderSelectedNote(note) {
    const editor = document.getElementById("noteEditor");
    const emptyState = document.getElementById("emptyState");
    const titleInput = document.getElementById("noteTitle");
    const bodyInput = document.getElementById("noteBody");

    // Show editor, hide empty state
    editor.classList.remove("hidden");
    emptyState.classList.add("hidden");

    // Populate inputs
    titleInput.value = note.title;
    bodyInput.value = note.body;

    // Focus on title if empty, otherwise on body
    if (!note.title || note.title === "Untitled Note") {
      titleInput.focus();
    } else {
      bodyInput.focus();
    }
  }

  // Show empty state when no note is selected
  showEmptyState() {
    const editor = document.getElementById("noteEditor");
    const emptyState = document.getElementById("emptyState");

    editor.classList.add("hidden");
    emptyState.classList.remove("hidden");
    this.currentNoteId = null;
  }

  // Update note content
  updateCurrentNote() {
    if (!this.currentNoteId) return;

    const note = this.notes.find((n) => n.id === this.currentNoteId);
    if (!note) return;

    const titleInput = document.getElementById("noteTitle");
    const bodyInput = document.getElementById("noteBody");

    note.title = titleInput.value || "Untitled Note";
    note.body = bodyInput.value;
    note.updated = new Date().toISOString();

    this.saveNotes();
    this.renderNotesList();
  }

  // Delete current note
  deleteNote(noteId) {
    const noteIndex = this.notes.findIndex((n) => n.id === noteId);
    if (noteIndex > -1) {
      this.notes.splice(noteIndex, 1);
      this.saveNotes();
      this.renderNotesList();

      if (this.currentNoteId === noteId) {
        this.showEmptyState();
      }
    }
  }

  // Search notes
  searchNotes(query) {
    if (!query.trim()) {
      this.renderNotesList();
      return;
    }

    const filteredNotes = this.notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.body.toLowerCase().includes(query.toLowerCase())
    );

    this.renderNotesList(filteredNotes);
  }

  // Update statistics
  updateStats() {
    const noteCount = document.getElementById("noteCount");
    const count = this.notes.length;
    noteCount.textContent = `${count} note${count !== 1 ? "s" : ""}`;
  }

  // Auto-save functionality
  scheduleAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.updateCurrentNote();
    }, 1000); // Auto-save after 1 second of inactivity
  }
}

// Initialize the app
const notebook = new NotebookApp();

// Global functions for HTML onclick events
function createNewNote() {
  const note = notebook.createNote();
  notebook.selectNote(note.id);
  notebook.renderNotesList();
}

function saveCurrentNote() {
  notebook.updateCurrentNote();

  // Show visual feedback
  const saveBtn = document.querySelector(".save-btn");
  const originalText = saveBtn.textContent;
  saveBtn.textContent = "✅ Saved!";
  saveBtn.style.background = "#28a745";

  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = "#28a745";
  }, 1500);
}

function deleteCurrentNote() {
  if (!notebook.currentNoteId) return;

  if (confirm("Are you sure you want to delete this note?")) {
    notebook.deleteNote(notebook.currentNoteId);
  }
}

function autoSave() {
  notebook.scheduleAutoSave();
}

function searchNotes(query) {
  notebook.searchNotes(query);
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Ctrl+N or Cmd+N for new note
  if ((e.ctrlKey || e.metaKey) && e.key === "n") {
    e.preventDefault();
    createNewNote();
  }

  // Ctrl+S or Cmd+S for save
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveCurrentNote();
  }

  // Delete key when no input is focused
  if (e.key === "Delete" && !e.target.matches("input, textarea")) {
    e.preventDefault();
    deleteCurrentNote();
  }
});

// Handle page visibility change to save notes
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") {
    notebook.updateCurrentNote();
  }
});
