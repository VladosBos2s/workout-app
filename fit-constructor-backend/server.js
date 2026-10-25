const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// Database connection pool
const pool = require('./db');
// Password hashing library
const bcrypt = require('bcrypt');
const { emit } = require('cluster');
const { error } = require('console');

const app = express();
app.use(cors());
app.use(express.json());

// 1. REGISTRATION
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'EMAIL_PASSWORD_REQUIRED' });
    }

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'USER_ALREADY_EXISTS' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    // Return email at top level so frontend handles it correctly
    res.status(201).json({
      message: 'Registration successful!',
      email: newUser.rows[0].email,
      userId: newUser.rows[0].id
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR_REGISTRATION' });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'EMAIL_PASSWORD_REQUIRED' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
    }

    const user = userResult.rows[0];

    if (!user.password_hash) {
      return res.status(400).json({ error: 'OLD_ACCOUNT_RE_REGISTER' });
    }

    // Compare input password with hashed password from database
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS' });
    }

    res.json({
      message: 'Login successful!',
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR_LOGIN' });
  }
});

// 3. EXERCISES (Dynamic translation based on header)
app.get('/api/exercises', async (req, res) => {
  try {
    // Determine language from frontend header (default to 'ru')
    const lang = req.headers['accept-language']?.includes('en') ? 'en' : 'ru';
    
    // Select columns dynamically using the language suffix
    const query = `
      SELECT 
        id, 
        title_${lang} AS title, 
        muscle_group, 
        description_${lang} AS description, 
        default_weight, 
        default_sets, 
        default_reps, 
        weight_beginner, 
        weight_intermediate, 
        weight_advanced,
        video
      FROM exercises 
      ORDER BY id ASC
    `;

    const result = await pool.query(query);
    
    const formattedExercises = result.rows.map(ex => ({
      id: ex.id,
      title: ex.title,
      muscleGroup: ex.muscle_group,
      description: ex.description,
      unit: 'kg',
      loads: {
        beginner: Number(ex.weight_beginner || 0),
        intermediate: Number(ex.weight_intermediate || 0),
        advanced: Number(ex.weight_advanced || 0)
      },
      sets: ex.default_sets || 3,
      reps: ex.default_reps || '8-12',
      videoUrl: ex.video
    }));

    res.json(formattedExercises);
  } catch (err) {
    console.error('Error fetching exercises:', err.message);
    res.status(500).json({ error: 'FAILED_TO_FETCH_EXERCISES' });
  }
});

// GET CLIENT'S FULL WORKOUT PLAN (WITH EXERCISES)
app.get('/api/user-full-workouts', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED' });
    }

    // Determine language from frontend header (default to 'ru')
    const lang = req.headers['accept-language']?.includes('en') ? 'en' : 'ru';

    // 1. Find user ID
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: 'USER_NOT_FOUND' });
    }
    const userId = userResult.rows[0].id;

    // 2. Fetch user workouts
    const workoutsResult = await pool.query(
      'SELECT id, title as "dayName" FROM workouts WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );

    const workouts = workoutsResult.rows;

    // 3. Fetch exercises for each workout using dynamic language columns
    const fullWorkouts = [];
    for (const w of workouts) {
      const exercisesResult = await pool.query(
        `SELECT 
            e.id, 
            e.title_${lang} AS title, 
            e.muscle_group as "muscleGroup", 
            e.description_${lang} AS description, 
            e.video, 
            we.sets, 
            we.reps, 
            we.weight 
         FROM workout_exercises we
         JOIN exercises e ON we.exercise_id = e.id
         WHERE we.workout_id = $1`,
        [w.id]
      );

      fullWorkouts.push({
        dayName: w.dayName,
        exercises: exercisesResult.rows
      });
    }

    res.json(fullWorkouts);
  } catch (err) {
    console.error('Error fetching full plan:', err.message);
    res.status(500).json({ error: 'FAILED_TO_FETCH_WORKOUT_PLAN' });
  }
});

// GET SPECIFIC USER WORKOUTS (FOR ADMIN)
app.get('/api/admin/user-workouts', async (req, res) => {
  try {
    const { email } = req.query;
    
    // Find user ID
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }
    const userId = userResult.rows[0].id;

    // Fetch user workouts
    const workouts = await pool.query(
      'SELECT id, title as "dayName", created_at as date FROM workouts WHERE user_id = $1',
      [userId]
    );

    res.json(workouts.rows);
  } catch (err) {
    console.error('Admin panel error:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

//  ASSIGN CUSTOM PLAN TO USER (FOR ADMIN)
app.post('/api/admin/set-user-plan', async (req, res) => {
  try {
    console.log("Admin email attempting to save:", req.body.adminEmail);
    const { adminEmail, targetEmail, days } = req.body;

    if (!adminEmail) {
      return res.status(401).json({ error: 'ADMIN_AUTH_REQUIRED' });
    }

    // 1. Verify administrator role
    const adminResult = await pool.query('SELECT role FROM users WHERE email = $1', [adminEmail]);
    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'ACCESS_DENIED_ADMIN_REQUIRED' });
    }

    // 2. Find client user
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [targetEmail]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }
    const userId = userResult.rows[0].id;

    // 3. Delete client's previous workouts and exercises
    const oldWorkouts = await pool.query('SELECT id FROM workouts WHERE user_id = $1', [userId]);
    for (const workout of oldWorkouts.rows) {
      await pool.query('DELETE FROM workout_exercises WHERE workout_id = $1', [workout.id]);
    }
    await pool.query('DELETE FROM workouts WHERE user_id = $1', [userId]);

    // 4. Save new days and exercises with custom values
    if (days && Array.isArray(days)) {
      for (const day of days) {
        // Safely check all possible naming variants from frontend payload
        const rawTitle = day.dayName || day.name || day.title;
        const workoutTitle = (rawTitle && rawTitle.trim() !== '') ? rawTitle.trim() : 'Trainer Workout Plan';

        const newWorkout = await pool.query(
          `INSERT INTO workouts (user_id, title) VALUES ($1, $2) RETURNING id`,
          [userId, workoutTitle]
        );

        const workoutId = newWorkout.rows[0].id;

        // Save associated exercises for this workout day
        if (day.exercises && Array.isArray(day.exercises)) {
         for (const ex of day.exercises) {
    await pool.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        workoutId,
        ex.exerciseId || ex.id,
        ex.sets || 3,
        ex.reps || '10',
        ex.weight || ex.baseLoad || 0
      ]
    );
  }

        }
      }
    }

    res.status(201).json({ message: `Plan for user ${targetEmail} successfully created and saved!` });

  } catch (err) {
    console.error('Error saving trainer plan:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR_ASSIGNING_PLAN' });
  }
});

// Add new exercises (only admin can add)
app.post('/api/exercises', async (req, res) => {
  try {
    const { email, title, muscleGroup, description, default_weight, default_sets, default_reps, video } = req.body;

    if (!email) {
      return res.status(401).json({ error: 'AUTHORIZATION_REQUIRED' });
    }

    // Check user role
    const userResult = await pool.query('SELECT role FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'ACCESS_DENIED_ADMIN_REQUIRED' });
    }

    const newExercise = await pool.query(
      'INSERT INTO exercises (title, muscle_group, description, default_weight, default_sets, default_reps, video) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
      [title, muscleGroup, description, default_weight || 0, default_sets || 3, default_reps || '8-12', video || null]
    );
    
    res.status(201).json({
      message: 'Exercise successfully added to database!',
      exercise: newExercise.rows[0]
    });
  } catch (err) {
    console.error('Error adding exercise:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR_ADDING_EXERCISE' });
  }
});

// GET USER'S SAVED WORKOUTS
app.get('/api/saved-workouts', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.json([]);
    }

    // Find user ID by email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userResult.rows.length === 0) {
      return res.json([]);
    }
    const userId = userResult.rows[0].id;

    // Fetch user workouts
    const workoutsResult = await pool.query(
      'SELECT id, title as "dayName", created_at as date FROM workouts WHERE user_id = $1 ORDER BY id ASC',
      [userId]
    );
    
    res.json(workoutsResult.rows);
  } catch (err) {
    console.error('Error fetching saved workouts:', err.message);
    res.status(500).json({ error: 'FAILED_TO_FETCH_SAVED_WORKOUTS' });
  }
});

// 5. SAVE / UPDATE WORKOUT
app.post('/api/saved-workouts', async (req, res) => {
  try {
    const { userEmail, email, dayName } = req.body;
    const currentEmail = userEmail || email;

    if (!currentEmail) {
      return res.status(400).json({ error: 'LOGIN_REQUIRED' });
    }

    // Find user ID by email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [currentEmail]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'USER_NOT_FOUND' });
    }
    const userId = userResult.rows[0].id;

    // Check if workout already exists for this user
    const existingWorkout = await pool.query(
      'SELECT id FROM workouts WHERE user_id = $1 AND title = $2',
      [userId, dayName]
    );

    let workoutId;
    if (existingWorkout.rows.length > 0) {
      workoutId = existingWorkout.rows[0].id;
    } else {
      // Create new workout
      const newWorkout = await pool.query(
        'INSERT INTO workouts (user_id, title) VALUES ($1, $2) RETURNING id',
        [userId, dayName]
      );
      workoutId = newWorkout.rows[0].id;
    }

    res.status(201).json({ 
      message: 'Workout successfully saved to database!', 
      workout: { id: workoutId, dayName } 
    });

  } catch (err) {
    console.error('Error saving workout:', err.message);
    res.status(500).json({ error: 'FAILED_TO_SAVE_WORKOUT' });
  }
});

// 6. DELETE WORKOUT
app.delete('/api/saved-workouts/:id', async (req, res) => {
  try {
    const workoutId = req.params.id;
    await pool.query('DELETE FROM workouts WHERE id = $1', [workoutId]);

    res.json({ message: 'Workout successfully deleted', id: workoutId });
  } catch (err) {
    console.error('Error deleting workout:', err.message);
    res.status(500).json({ error: 'FAILED_TO_DELETE_WORKOUT' });
  }
});

// Update info about user
app.put('/api/user/parameters', async (req, res) => {
  try {
    const { email, weight, height, age, activityLevel, goal } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED' });
    }

    const updatedUser = await pool.query(
      `UPDATE users 
       SET weight = $1, height = $2, age = $3, activity_level = $4, goal = $5 
       WHERE email = $6 
       RETURNING email, weight, height, age, activity_level, goal`,
      [weight || null, height || null, age || null, activityLevel || null, goal || null, email]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    res.json({
      message: 'Parameters successfully updated in database!',
      user: updatedUser.rows[0]
    });

  } catch (err) {
    console.error('Error updating parameters:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR_UPDATING_PARAMETERS' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});