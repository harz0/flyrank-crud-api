# FlyRank CRUD API

A simple CRUD API built with Node.js, Express, and SQLite for managing tasks. This project was developed as part of the FlyRank Backend AI Engineering internship.

## Features

- Create tasks
- View all tasks
- View a task by ID
- Update tasks
- Delete tasks
- Input validation
- SQLite database persistence
- Automatic database and table creation
- Initial seed data when the database is empty
- Swagger API documentation

## Technologies Used

- Node.js
- Express.js
- SQLite
- better-sqlite3
- Swagger UI

## Installation

1. Clone the repository.
2. Open the project folder in a terminal.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   node server.js
   ```

The API runs at:

http://localhost:3000/

The SQLite database file (`tasks.db`) is created automatically when the server starts. The database and `tasks` table are initialized if they do not exist. Three example tasks are inserted only when the table is empty.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check if the API is running |
| GET | `/health` | Check API health |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Database

SQLite is used to persist tasks across server restarts without requiring a separate database server.

- **Database:** SQLite
- **Library:** better-sqlite3
- **Database file:** `tasks.db` in the project root
- **Table:** `tasks`
- **Columns:** `id`, `title`, `done`

The database file is excluded from Git using `.gitignore`. It is generated locally when the application starts.

### Example SQL Query

Retrieve all tasks from the database:

```sql
SELECT * FROM tasks;
```

Find completed tasks:

```sql
SELECT * FROM tasks WHERE done = 1;
```

Count all tasks:

```sql
SELECT COUNT(*) AS total_tasks FROM tasks;
```

## Swagger Documentation

Swagger UI provides an interactive interface to explore and test the API endpoints.

Open:

http://localhost:3000/api-docs/

## Example Request

Check the API health using curl:

```bash
curl -i http://localhost:3000/health
```

Expected response status:

```text
HTTP/1.1 200 OK
```

## Swagger UI Screenshot

![Swagger UI](CRUD%20API.png)

## SQLite Database Screenshot

![SQLite Database](DATABASE.png)