const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

let todos = [];

// Hae kaikki tehtävät
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Lisää uusi tehtävä
app.post('/todos', (req, res) => {
  const newTodo = req.body;
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Poista tehtävä ID:n perusteella
app.delete('/todos/:id', (req, res) => {
  const todoId = req.params.id;
  todos = todos.filter((todo) => todo.id !== todoId); // Suodata pois tehtävä, jonka ID täsmää
  res.status(200).send({message: 'Todo deleted successfully'});
});

// Käynnistä palvelin
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
