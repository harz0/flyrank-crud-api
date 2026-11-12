const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const pool = require("./db");
const supabase = require("./supabase");
const authMiddleware = require("./authMiddleware");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==================== AUTH: SIGNUP ====================

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or signup failed
 *       500:
 *         description: Server error
 */
app.post("/auth/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(201).json({ user: data.user });
    } catch (error) {
        console.error("Signup failed:", error.message);
        return res.status(500).json({ error: "Signup failed" });
    }
});

// ==================== AUTH: LOGIN ====================
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

       if (error || !data.session) {
    console.error("Supabase login error:", error?.message);

    return res.status(401).json({
        error: "Invalid email or password"
    });
}

        return res.status(200).json({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ error: "Login failed" });
    }
});

// ==================== PUBLIC ROUTE ====================

app.get("/public/info", (req, res) => {
    return res.status(200).json({
        message: "This is public information",
        authenticated: false
    });
});

// ==================== PROTECTED ROUTE (STAGE 2) ====================
/**
 * @swagger
 * /protected/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Missing or invalid authentication token
 */
app.get("/protected/profile", authMiddleware, (req, res) => {
    return res.status(200).json({
        message: "Profile retrieved successfully",
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});
/**
 * @swagger
 * /protected/dashboard:
 *   get:
 *     summary: Access the protected dashboard
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *       401:
 *         description: Missing or invalid authentication token
 */

app.get("/protected/dashboard", authMiddleware, (req, res) => {
    return res.status(200).json({
        message: "Welcome to the protected dashboard",
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout successful
 *       401:
 *         description: Missing or invalid authentication token
 *       500:
 *         description: Server error
 */
app.post("/auth/logout", authMiddleware, async (req, res) => {
    try {
        const response = await fetch(
            `${process.env.SUPABASE_URL}/auth/v1/logout`,
            {
                method: "POST",
                headers: {
                    apikey: process.env.SUPABASE_KEY,
                    Authorization: `Bearer ${req.token}`
                }
            }
        );

        if (!response.ok) {
            return res.status(400).json({
                error: "Logout failed"
            });
        }

        return res.status(204).send();
    } catch (error) {
        console.error("Logout failed:", error.message);
        return res.status(500).json({
            error: "Logout failed"
        });
    }
});
// ==================== SWAGGER ====================

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "FlyRank CRUD API",
            version: "1.0.0",
            description: "A CRUD API for managing tasks and authentication"
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./server.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==================== HOME ====================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/", (req, res) => {
    res.json({ message: "FlyRank CRUD API is running" });
});

// ==================== HEALTH ====================

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is healthy
 */
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// ==================== GET ALL TASKS ====================

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of all tasks
 */
app.get("/tasks", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, done FROM tasks ORDER BY id"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Get tasks failed:", error.message);
        res.status(500).json({ error: "Failed to retrieve tasks" });
    }
});

// ==================== GET TASK BY ID ====================

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 */
app.get("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        const result = await pool.query(
            "SELECT id, title, done FROM tasks WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Get task failed:", error.message);
        res.status(500).json({ error: "Failed to retrieve task" });
    }
});

// ==================== CREATE TASK ====================

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Title is required
 */
app.post("/tasks", async (req, res) => {
    const { title } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING id, title, done",
            [title.trim(), false]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create task failed:", error.message);
        res.status(500).json({ error: "Failed to create task" });
    }
});

// ==================== UPDATE TASK ====================

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - done
 *             properties:
 *               title:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 */
app.put("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { title, done } = req.body;

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
    }

    if (typeof done !== "boolean") {
        return res.status(400).json({ error: "Done must be a boolean" });
    }

    try {
        const result = await pool.query(
            "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING id, title, done",
            [title.trim(), done, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Update task failed:", error.message);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// ==================== DELETE TASK ====================

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 */
app.delete("/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Delete task failed:", error.message);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

// ==================== START SERVER ====================

async function startServer() {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL connection verified");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to PostgreSQL:", error.message);
        process.exit(1);
    }
}

startServer();