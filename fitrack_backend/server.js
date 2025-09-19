const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware setup
app.use(
  /*cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })*/
  cors({
    origin: "*", // Temporarily allow all origins for development
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Aayush2511",
  database: "fitrack_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.stack);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ============================
// Registration Endpoints
// ============================

app.post("/register", (req, res) => {
  const { firstName, lastName, age, phoneNumber, email, password, userType } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !age ||
    !phoneNumber ||
    !email ||
    !password ||
    !userType
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `
    INSERT INTO user (First_Name, Last_Name, Age, Phone_number)
    VALUES (?, ?, ?, ?)
  `;

  db.execute(query, [firstName, lastName, age, phoneNumber], (err, result) => {
    if (err) {
      console.error("❌ Error inserting user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res
      .status(200)
      .json({ message: "Registration successful!", userId: result.insertId });
  });
});

app.post("/employee/register", (req, res) => {
  const {
    name,
    dob,
    phone,
    salary,
    startDate,
    gender,
    speciality,
    availability,
  } = req.body;

  if (
    !name ||
    !dob ||
    !phone ||
    !salary ||
    !startDate ||
    !gender ||
    !speciality ||
    !availability
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const employeeQuery = `
    INSERT INTO employee (Name, DOB, Phone_number, Salary, Start_Date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.execute(
    employeeQuery,
    [name, dob, phone, salary, startDate],
    (err, result) => {
      if (err) {
        console.error("❌ Error inserting employee:", err);
        return res
          .status(500)
          .json({ message: "Database error while inserting employee" });
      }

      const trainerId = result.insertId;
      const timings = availability.replace(" to ", "-");

      const trainerQuery = `
      INSERT INTO trainer (Trainer_ID, Timings, Gender, target_goal)
      VALUES (?, ?, ?, ?)
    `;

      db.execute(
        trainerQuery,
        [trainerId, timings, gender, speciality],
        (err2) => {
          if (err2) {
            console.error("❌ Error inserting trainer details:", err2);
            return res
              .status(500)
              .json({ message: "Database error while inserting trainer data" });
          }

          res.status(200).json({
            message: "Registration successful!",
            employeeId: trainerId,
          });
        }
      );
    }
  );
});

// ==================
// Court Booking
// ==================
app.post("/book-court", (req, res) => {
  const { userName, phoneNumber, bookingDate, bookingDuration, courtName } =
    req.body;

  if (
    !userName ||
    !phoneNumber ||
    !bookingDate ||
    !bookingDuration ||
    !courtName
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const getUserQuery = "SELECT User_ID FROM user WHERE Phone_number = ?";
  db.query(getUserQuery, [phoneNumber], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = result[0].User_ID;

    const insertBooking = `
      INSERT INTO booking (Name, Date_of_Booking, Duration, Court_Name, User_ID)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      insertBooking,
      [userName, bookingDate, bookingDuration, courtName, userId],
      (err2) => {
        if (err2) {
          console.error("Booking Insert Error:", err2);
          return res.status(500).json({ message: "Failed to book court" });
        }

        res
          .status(200)
          .json({ message: `✅ Court "${courtName}" booked for ${userName}` });
      }
    );
  });
});

// ==================
// gym booking
// ==================

app.post("/book-gym-plan", (req, res) => {
  const { phoneNumber, selectedPlan } = req.body;

  if (!phoneNumber || !selectedPlan) {
    return res
      .status(400)
      .json({ message: "Phone number and plan name are required" });
  }

  // Step 1: Get user_id from phone number
  const getUserId = "SELECT User_ID FROM user WHERE Phone_number = ?";
  db.query(getUserId, [phoneNumber], (err, userResult) => {
    if (err) {
      console.error("❌ Error getting user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userResult[0].User_ID;

    // Step 2: Get trainer_id based on target_goal (plan)
    const getTrainer = "SELECT Trainer_ID FROM trainer WHERE target_goal = ?";
    db.query(getTrainer, [selectedPlan], (err2, trainerResult) => {
      if (err2) {
        console.error("❌ Error getting trainer:", err2);
        return res.status(500).json({ message: "Database error" });
      }

      if (trainerResult.length === 0) {
        return res
          .status(404)
          .json({ message: "No trainer found for this plan" });
      }

      const trainerId = trainerResult[0].Trainer_ID;

      // Step 3: Prepare dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      // Format dates to YYYY-MM-DD
      const formatDate = (date) => date.toISOString().split("T")[0];

      const insertQuery = `
        INSERT INTO workout_plan (user_id, trainer_id, target_goal, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          userId,
          trainerId,
          selectedPlan,
          formatDate(startDate),
          formatDate(endDate),
        ],
        (err3, result3) => {
          if (err3) {
            console.error("❌ Error inserting workout plan:", err3);
            return res.status(500).json({ message: "Failed to book gym plan" });
          }

          res.status(200).json({
            message: `✅ Gym plan '${selectedPlan}' booked successfully`,
          });
        }
      );
    });
  });
});

// schedule updation

app.get("/get/trainers", (req, res) => {
  const query = `
    SELECT 
      e.Employee_ID, e.Name, t.Gender, t.Timings, t.target_goal
    FROM 
      employee e
    JOIN 
      trainer t ON e.Employee_ID = t.Trainer_ID
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching trainer data:", err);
      return res.status(500).json({ message: "Failed to fetch trainers" });
    }
    res.json(results);
  });
});

// ============================
// Admin: GET Routes
// ============================

app.get("/get/users", (req, res) => {
  db.query("SELECT * FROM user", (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching users" });
    res.json(result);
  });
});

app.get("/get/employees", (req, res) => {
  db.query("SELECT * FROM employee", (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching employees" });
    res.json(result);
  });
});
/*
app.get("/get/bookings", (req, res) => {
  const query = `
    SELECT Name, Date_of_Booking, Duration, Court_Name
    FROM booking
    ORDER BY Date_of_Booking DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching bookings:", err);
      return res.status(500).json({ message: "Failed to fetch booking data" });
    }
    res.json(results);
  });
});

*/
app.get("/get/bookings", (req, res) => {
  db.query(
    "SELECT Name, Date_of_booking,Duration,Court_name FROM booking",
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error fetching bookings" });
      res.json(result);
    }
  );
});

app.get("/get/equipment", (req, res) => {
  db.query("SELECT * FROM equipment", (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching equipment" });
    res.json(result);
  });
});

// ============================
// Admin: INSERT Routes
// ============================

app.post("/insert/user", (req, res) => {
  const { First_Name, Last_Name, Age, Phone_number, Membership_ID } = req.body;
  db.query(
    "INSERT INTO user (First_Name, Last_Name, Age, Phone_number, Membership_ID) VALUES (?, ?, ?, ?, ?)",
    [First_Name, Last_Name, Age, Phone_number, Membership_ID],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Insert failed" });
      res.json({ message: "User added", id: result.insertId });
    }
  );
});

// INSERT employee
app.post("/insert/employee", (req, res) => {
  const { Name, DOB, Phone_number, Salary, Start_Date } = req.body;
  db.query(
    "INSERT INTO employee (Name, DOB, Phone_number, Salary, Start_Date) VALUES (?, ?, ?, ?, ?)",
    [Name, DOB, Phone_number, Salary, Start_Date],
    (err, result) => {
      if (err) {
        console.error("❌ Insert failed:", err);
        return res.status(500).json({ message: "Insert failed" });
      }
      res.json({ message: "Employee added", id: result.insertId });
    }
  );
});

app.post("/insert/court", (req, res) => {
  const { court_name, timmings, capacity, facilityid } = req.body;
  db.query(
    "INSERT INTO court (court_name, timmings, capacity, facilityid) VALUES (?, ?, ?, ?)",
    [court_name, timmings, capacity, facilityid],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Insert failed" });
      res.json({ message: "Court added", id: result.insertId });
    }
  );
});

// POST route to insert equipment
app.post("/insert/equipment", async (req, res) => {
  console.log("Incoming data:", req.body); // 🔍 Log what data is received
  const { name, purchaseDate, serviceDate, facilityId } = req.body;

  if (!name || !purchaseDate || !serviceDate || !facilityId) {
    console.warn("Missing fields in request body:", {
      name,
      purchaseDate,
      serviceDate,
      facilityId,
    }); // 🔍 Log what's missing
    return res.status(400).send("All fields are required.");
  }

  const sql = `
    INSERT INTO equipment (Name, Purchase_Date, Service_Date, Facility_ID)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const [result] = await db
      .promise()
      .execute(sql, [name, purchaseDate, serviceDate, facilityId]);
    res.status(200).json({
      message: "Equipment inserted successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting equipment:", error);
    res.status(500).send("Failed to insert equipment.");
  }
});

// ============================
// Admin: UPDATE Routes
// ============================

app.put("/update/user/:id", (req, res) => {
  const id = req.params.id;
  const { First_Name, Last_Name, Age, Phone_number, Membership_ID } = req.body;
  db.query(
    "UPDATE user SET First_Name=?, Last_Name=?, Age=?, Phone_number=?, Membership_ID=? WHERE User_ID=?",
    [First_Name, Last_Name, Age, Phone_number, Membership_ID, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "User updated" });
    }
  );
});

//UPDATE EMPLOYEES

app.put("/update/employee/:id", (req, res) => {
  const id = req.params.id;
  const { Name, DOB, Phone_number, Salary, Start_Date } = req.body;
  db.query(
    "UPDATE employee SET Name=?, DOB=?, Phone_number=?, Salary=?, Start_Date=? WHERE Employee_ID=?",
    [Name, DOB, Phone_number, Salary, Start_Date, id],
    (err) => {
      if (err) {
        console.error("❌ Update failed:", err);
        return res.status(500).json({ message: "Update failed" });
      }
      res.json({ message: "Employee updated" });
    }
  );
});

app.put("/update/court/:id", (req, res) => {
  const id = req.params.id;
  const { court_name, timmings, capacity, facilityid } = req.body;
  db.query(
    "UPDATE court SET court_name=?, timings=?, capacity=?, facilityid=? WHERE court_id=?",
    [court_name, timmings, capacity, facilityid, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Court updated" });
    }
  );
});

app.put("/update/equipment/:id", (req, res) => {
  const id = req.params.id;
  const { name, purchasedate, service_date, facility_id } = req.body;
  db.query(
    "UPDATE equipment SET name=?, purchasedate=?, service_date=?, facility_id=? WHERE eq_id=?",
    [name, purchasedate, service_date, facility_id, id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });
      res.json({ message: "Equipment updated" });
    }
  );
});


// ============================
// Admin: DELETE Routes
// ============================


app.delete("/delete/user/:id", (req, res) => {
  const userId = req.params.id;
  console.log("🔍 Deleting user with ID:", userId);

  db.query("DELETE FROM user WHERE User_ID = ?", [userId], (err, result) => {
    if (err) {
      console.error("❌ Error deleting user:", err);
      return res
        .status(500)
        .json({ message: "Delete failed", error: err.message });
    }

    console.log("✅ User deleted:", result);
    res.json({ message: "User deleted", affectedRows: result.affectedRows });
  });
});

// DELETE employee by Employee_ID
app.delete("/delete/employee/:id", (req, res) => {
  const empId = req.params.id;

  // Step 1: Delete from trainer if exists
  db.query(
    "DELETE FROM trainer WHERE Trainer_ID = ?",
    [empId],
    (trainerErr, trainerResult) => {
      if (trainerErr) {
        console.error("❌ Error deleting from trainer:", trainerErr);
        return res.status(500).json({
          message: "Error deleting trainer",
          error: trainerErr.message,
        });
      }

      // Step 2: Delete from staff if exists
      db.query(
        "DELETE FROM staff WHERE Staff_ID = ?",
        [empId],
        (staffErr, staffResult) => {
          if (staffErr) {
            console.error("❌ Error deleting from staff:", staffErr);
            return res.status(500).json({
              message: "Error deleting staff",
              error: staffErr.message,
            });
          }

          // Step 3: Delete from employee
          db.query(
            "DELETE FROM employee WHERE Employee_ID = ?",
            [empId],
            (empErr, empResult) => {
              if (empErr) {
                console.error("❌ Error deleting from employee:", empErr);
                return res.status(500).json({
                  message: "Error deleting employee",
                  error: empErr.message,
                });
              }

              res.json({
                message:
                  "✅ Employee and associated trainer/staff records deleted successfully",
                deletedFromTrainer: trainerResult.affectedRows,
                deletedFromStaff: staffResult.affectedRows,
                deletedFromEmployee: empResult.affectedRows,
              });
            }
          );
        }
      );
    }
  );
});

app.delete("/delete/court/:id", (req, res) => {
  const courtId = req.params.id;
  db.query(
    "DELETE FROM court WHERE court_name = ?",
    [courtId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Delete failed" });
      res.json({ message: "Court deleted", affectedRows: result.affectedRows });
    }
  );
});

app.delete("/delete/equipment/:id", (req, res) => {
  const eqId = req.params.id;
  db.query("DELETE FROM equipment WHERE eq_id = ?", [eqId], (err, result) => {
    if (err) return res.status(500).json({ message: "Delete failed" });
    res.json({
      message: "Equipment deleted",
      affectedRows: result.affectedRows,
    });
  });
});

// profile page
app.get("/api/profile/:phone", async (req, res) => {
  const phone = req.params.phone;

  const userQuery = "SELECT * FROM user WHERE Phone_number = ?";

  db.query(userQuery, [phone], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });
    if (userResults.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = userResults[0];
    const userId = user.User_ID;

    const planQuery = ` SELECT * FROM workout_plan WHERE User_ID = ?`;
    const bookingQuery = `SELECT * FROM booking WHERE User_ID = ? ORDER BY Date_of_Booking DESC LIMIT 1`;

    db.query(planQuery, [userId], (err, planResults) => {
      if (err) return res.status(500).json({ error: err });

      const plan = planResults[0];
      const trainerId = plan?.Trainer_ID;

      // Get latest booking info regardless of plan
      db.query(bookingQuery, [userId], (err, bookingResults) => {
        if (err) return res.status(500).json({ error: err });

        // If no plan, send partial response
        if (!trainerId) {
          return res.json({
            user,
            plan: null,
            trainer: null,
            trainer_name: null,
            booking: bookingResults[0] || null,
          });
        }

        // Else get trainer and employee details
        const trainerQuery = `SELECT * FROM trainer WHERE Trainer_ID = ?`;
        const employeeQuery = `SELECT * FROM employee WHERE Employee_ID = ?`;

        db.query(trainerQuery, [trainerId], (err, trainerResults) => {
          if (err) return res.status(500).json({ error: err });

          db.query(employeeQuery, [trainerId], (err, employeeResults) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
              user,
              plan,
              trainer: trainerResults[0] || null,
              trainer_name: employeeResults[0]?.Name || null,
              booking: bookingResults[0] || null,
            });
          });
        });
      });
    });
  });
});

// ============================
// Start Server
// ============================
app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
