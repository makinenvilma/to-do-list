import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [deadline, setDeadline] = useState('');

  // Hae tehtävät backendistä
  useEffect(() => {
    axios
      .get('http://localhost:5000/todos')
      .then((response) => {
        setTodos(response.data);
      })
      .catch((error) => console.error(error));
  }, []);

  // Lisää uusi tehtävä
  const addTodo = () => {
    if (newTodo.trim() !== '' && deadline !== '') {
      const todo = {
        id: uuidv4(), // Luodaan uniikki id jokaiselle tehtävälle
        text: newTodo,
        completed: false,
        status: 'waiting',
        deadline: deadline,
      };
      axios
        .post('http://localhost:5000/todos', todo)
        .then((response) => {
          setTodos([...todos, response.data]);
          setNewTodo('');
          setDeadline('');
        })
        .catch((error) => console.error(error));
    }
  };

  // Merkitse tehtävä tehdyksi
  const toggleComplete = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            completed: !todo.completed,
            status: todo.completed ? 'in-progress' : 'completed',
          }
        : todo
    );
    setTodos(updatedTodos);
  };

  // Vaihda tehtävän status "odotustilasta" aktiiviseksi
  const startTask = (id) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? {...todo, status: 'in-progress'} : todo
    );
    setTodos(updatedTodos);
  };

  // Poista tehtävä
  const deleteTodo = (id) => {
    axios
      .delete(`http://localhost:5000/todos/${id}`) // Käytetään tehtävän uniikkia ID:tä
      .then(() => {
        setTodos(todos.filter((todo) => todo.id !== id)); // Poista tehtävä lokaalisti state:sta
      })
      .catch((error) => console.error(error));
  };

  // Tarkista, onko tehtävä myöhässä (overdue)
  const isOverdue = (deadline) => {
    const currentDate = new Date().toISOString().split('T')[0]; // Nykyinen päivämäärä (muodossa YYYY-MM-DD)
    return deadline < currentDate;
  };

  // Suodata tehtävät erikseen overdue, aloittamattomat, aktiiviset ja suoritetut
  const overdueTodos = todos.filter(
    (todo) => !todo.completed && isOverdue(todo.deadline)
  );
  const waitingTodos = todos.filter(
    (todo) =>
      todo.status === 'waiting' && !todo.completed && !isOverdue(todo.deadline)
  );
  const inProgressTodos = todos.filter(
    (todo) => todo.status === 'in-progress' && !todo.completed
  );
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div style={{textAlign: 'center', marginTop: '50px'}}>
      <h1>To-Do List</h1>

      <input
        type='text'
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder='Add new task'
      />
      <input
        type='date'
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        placeholder='Deadline'
      />
      <button onClick={addTodo}>Add</button>

      <h2>Overdue Tasks</h2>
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {overdueTodos.length > 0
          ? overdueTodos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  color: 'red',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              >
                {todo.text} - Due by: {todo.deadline}
                <input
                  type='checkbox'
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                />
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{marginLeft: '10px'}}
                >
                  Delete
                </button>
              </li>
            ))
          : null}
      </ul>

      <h2>Waiting Tasks (Not Started)</h2>
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {waitingTodos.map((todo) => (
          <li
            key={todo.id}
            style={{textDecoration: todo.completed ? 'line-through' : 'none'}}
          >
            {todo.text} - <strong>{todo.status}</strong> - Due by:{' '}
            {todo.deadline}
            <button
              onClick={() => startTask(todo.id)}
              style={{marginLeft: '10px'}}
            >
              Start
            </button>
            <input
              type='checkbox'
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
            />
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{marginLeft: '10px'}}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>In-Progress Tasks</h2>
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {inProgressTodos.map((todo) => (
          <li
            key={todo.id}
            style={{textDecoration: todo.completed ? 'line-through' : 'none'}}
          >
            {todo.text} - <strong>{todo.status}</strong> - Due by:{' '}
            {todo.deadline}
            <input
              type='checkbox'
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
            />
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{marginLeft: '10px'}}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h2>Completed Tasks</h2>
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {completedTodos.map((todo) => (
          <li key={todo.id} style={{textDecoration: 'line-through'}}>
            {todo.text} - Completed on {todo.deadline}
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{marginLeft: '10px'}}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
