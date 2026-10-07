# FlyRank CRUD API

A simple CRUD API built with Node.js and Express for managing tasks.

## Features

- Create tasks
- View all tasks
- View a task by ID
- Update tasks
- Delete tasks
- Input validation
- Swagger API documentation

## Installation

1. Clone the repository.
2. Open the project folder in a terminal.
3. Install the dependencies:

```bash
npm install

.The API will run at:
 http://localhost:3000/

 ## API Endpoints
| Method | Endpoint     | Description                 |
|--------|--------------|-----------------------------|
| GET    | `/`          | Check if the API is running |
| GET    | `/health`    | Check API health            |
| GET    | `/tasks`     | Get all tasks               |
| GET    | `/tasks/:id` | Get a task by ID            |
| POST   | `/tasks`     | Create a new task           |
| PUT    | `/tasks/:id` | Update a task               |
| DELETE | `/tasks/:id` | Delete a task               |

Swagger Documentation
Swagger UI is available at:
http://localhost:3000/api-docs/
.It provides an interactive interface for viewing and testing all API endpoints.
## Example Request
Check the API health using curl:

```bash
curl -i http://localhost:3000/health

Expected Output : 
HTTP/1.1 200 OK

## Swagger UI
![Swagger UI](CRUD%20API.png)