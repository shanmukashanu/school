// ---------- CORE IMPORTS ----------
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// ---------- THIRD-PARTY IMPORTS ----------
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ---------- ENV SETUP ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (default behavior)
dotenv.config();

// ---------- VALIDATE ENV ----------
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.error("❌ Missing Mongo connection string. Set MONGODB_URI (preferred) or MONGO_URI in .env");
}

// ---------- APP INIT ----------
const app = express();
const PORT = process.env.PORT || 5000;






const DEFAULT_CORS_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://school-ybq2.onrender.com',
];

const corsAllowlist = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : DEFAULT_CORS_ORIGINS
);

app.use(cors({
  origin(origin, callback) {
    // allow non-browser requests or same-origin (no Origin header)
    if (!origin) return callback(null, true);
    if (corsAllowlist.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
// Avoid 304 cached responses on API (helps frontend always get fresh JSON)
app.disable('etag');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose
  .connect(MONGO_URI, { dbName: process.env.MONGODB_DB_NAME || 'school' })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

async function ensureDefaultAdmin() {
  try {
    const username = 'shannu@admin.com';
    const password = '66770000';
    const existing = await User.findOne({ username });
    const passwordHash = await bcrypt.hash(password, 10);
    if (!existing) {
      await User.create({
        username,
        passwordHash,
        role: 'admin',
        name: 'Shannu Admin',
        email: username,
        school: '',
      });
      console.log('✅ Default admin user created:', username);
      return;
    }

    // Ensure the credentials and role match what the UI expects
    await User.updateOne(
      { _id: existing._id },
      { $set: { passwordHash, role: 'admin', name: existing.name || 'Shannu Admin', email: existing.email || username } }
    );
    console.log('✅ Default admin user ensured:', username);
  } catch (e) {
    console.error('Failed to ensure default admin user:', e.message || e);
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// If DB is not connected, short-circuit with a clear error to avoid 500s later
app.use((req, res, next) => {
  const ready = mongoose.connection.readyState === 1; // 1 = connected
  if (!ready && req.path.startsWith('/api/')) {
    return res.status(503).json({ error: 'Database not connected. Check MongoDB Atlas IP whitelist and credentials.' });
  }
  next();
});

// (Legacy Student model removed in favor of school-scoped StudentRecord)

// User schema (for members)
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    role: { type: String, enum: ['student','teacher','parent','admin'], required: true },
    school: { type: String },
  },
  { timestamps: true }
);
const User = mongoose.model('User', userSchema);

mongoose.connection.on('connected', () => {
  ensureDefaultAdmin();
});

// In case the connection was already established before the listener was attached
if (mongoose.connection.readyState === 1) {
  ensureDefaultAdmin();
}

// Gallery schema
const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['All Photos','Campus','Events','Sports','Academics','Cultural','Labs'], default: 'All Photos' },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);
const GalleryItem = mongoose.model('GalleryItem', gallerySchema);

// Blog schema
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['All Posts','News','Events','Achievements','Academics','Sports','Culture'], default: 'All Posts' },
    coverUrl: { type: String },
    publicId: { type: String },
  },
  { timestamps: true }
);
const Blog = mongoose.model('Blog', blogSchema);

// Document schema
const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: 'Academics' },
    pdfUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);
const Document = mongoose.model('Document', documentSchema);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Notices schema
const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['high','normal'], default: 'normal' },
    date: { type: String },
    school: { type: String },
  },
  { timestamps: true }
);
const Notice = mongoose.model('Notice', noticeSchema);

// Events schema
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String },
    description: { type: String },
    school: { type: String },
  },
  { timestamps: true }
);
const Event = mongoose.model('Event', eventSchema);

// ---------- AUTH & USERS ----------
// Create user (admin action)
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, name, email, school } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password and role are required' });
    }
    const allowed = ['student','teacher','parent','admin'];
    if (!allowed.includes(role)) return res.status(400).json({ error: `Invalid role. Allowed: ${allowed.join(', ')}` });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role, name, email, school });
    res.status(201).json({ id: user._id, username: user.username, role: user.role, name: user.name, email: user.email, school: user.school });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Create user failed' });
  }
});

// List users with optional role filter
app.get('/api/users', async (req, res) => {
  try {
    const { role, school } = req.query;
    const q = {};
    if (role) q.role = role;
    if (school) q.school = school;
    const users = await User.find(q).sort({ createdAt: -1 }).select('username role name email school createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign({ id: user._id, role: user.role, school: user.school }, secret, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role, name: user.name, email: user.email, school: user.school }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- AUTH MIDDLEWARE ----------
function auth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const [, token] = hdr.split(' ');
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
      req.user = payload; // { id, role, school }
      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// ---------- SCHOOL-SCOPED ACADEMICS ----------
// Student model
const studentRecordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String },
    school: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
const StudentRecord = mongoose.model('StudentRecord', studentRecordSchema);

// Attendance
const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['Present','Absent','Late'], required: true },
    remarks: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    school: { type: String, required: true },
  },
  { timestamps: true }
);
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Marks
const markSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true },
    exam: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    outOf: { type: Number, required: true },
    term: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    school: { type: String, required: true },
  },
  { timestamps: true }
);
const Mark = mongoose.model('Mark', markSchema);

// Remarks
const remarkSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true },
    text: { type: String, required: true },
    category: { type: String },
    date: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    school: { type: String, required: true },
  },
  { timestamps: true }
);
const Remark = mongoose.model('Remark', remarkSchema);

// Fees
const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord', required: true },
    feeType: { type: String, required: true },
    amount: { type: Number, required: true },
    fine: { type: Number, default: 0 },
    status: { type: String, enum: ['Paid','Pending','Partial'], default: 'Pending' },
    dueDate: { type: String },
    paidDate: { type: String },
    remarks: { type: String },
    school: { type: String, required: true },
  },
  { timestamps: true }
);
const FeePayment = mongoose.model('FeePayment', feeSchema);

// Newsletter
const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    school: { type: String },
  },
  { timestamps: true }
);
const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

// ----- Admin: create students in own school -----
app.post('/api/school/students', auth(['admin']), async (req, res) => {
  try {
    const school = req.user.school;
    const { name, rollNo, className, section, userId, parentUserId } = req.body;
    if (!name || !rollNo || !className) return res.status(400).json({ error: 'name, rollNo, className required' });
    const s = await StudentRecord.create({ name, rollNo, className, section, userId, parentUserId, school });
    res.status(201).json(s);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ----- Teacher: list students in own school -----
app.get('/api/students', auth(['teacher','admin']), async (req, res) => {
  try {
    const { className, section } = req.query;
    const q = { school: req.user.school };
    if (className) q.className = className;
    if (section) q.section = section;
    const students = await StudentRecord.find(q).sort({ className: 1, rollNo: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Newsletter subscribe (public)
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email, school } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email required' });
    const normalized = String(email).trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!emailOk) return res.status(400).json({ error: 'invalid email' });
    const doc = await NewsletterSubscription.findOneAndUpdate(
      { email: normalized },
      { $setOnInsert: { email: normalized, school: school ? String(school) : undefined } },
      { new: true, upsert: true }
    );
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Newsletter list (admin)
app.get('/api/newsletter', auth(['admin']), async (req, res) => {
  try {
    const { school } = req.query;
    const q = school ? { school: String(school) } : {};
    const list = await NewsletterSubscription.find(q).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/newsletter/:id', auth(['admin']), async (req, res) => {
  try {
    await NewsletterSubscription.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Teacher/Admin Reports -----
app.get('/api/reports/marks', auth(['teacher','admin']), async (req, res) => {
  try {
    const { className, section, exam, term } = req.query;
    if (!className) return res.status(400).json({ error: 'className required' });
    const sQ = { school: req.user.school, className: String(className) };
    if (section) sQ.section = String(section);
    const students = await StudentRecord.find(sQ).sort({ rollNo: 1, name: 1 });
    const studentIds = students.map((s) => s._id);
    const mQ = { school: req.user.school, studentId: { $in: studentIds } };
    if (exam) mQ.exam = String(exam);
    if (term) mQ.term = String(term);
    const marks = await Mark.find(mQ).sort({ createdAt: -1 });
    res.json({ students, marks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/attendance', auth(['teacher','admin']), async (req, res) => {
  try {
    const { className, section, month } = req.query;
    if (!className) return res.status(400).json({ error: 'className required' });
    if (!month) return res.status(400).json({ error: 'month required (YYYY-MM)' });
    const monthStr = String(month);
    const sQ = { school: req.user.school, className: String(className) };
    if (section) sQ.section = String(section);
    const students = await StudentRecord.find(sQ).sort({ rollNo: 1, name: 1 });
    const studentIds = students.map((s) => s._id);
    const aQ = {
      school: req.user.school,
      studentId: { $in: studentIds },
      date: { $regex: `^${monthStr}` },
    };
    const attendance = await Attendance.find(aQ).sort({ date: 1 });
    res.json({ students, attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Teacher: add attendance -----
app.post('/api/students/:id/attendance', auth(['teacher','admin']), async (req, res) => {
  try {
    const student = await StudentRecord.findById(req.params.id);
    if (!student || student.school !== req.user.school) return res.status(404).json({ error: 'Student not found' });
    const { date, status, remarks } = req.body;
    if (!date || !status) return res.status(400).json({ error: 'date and status required' });
    const rec = await Attendance.create({ studentId: student._id, date, status, remarks, teacherId: req.user.id, school: req.user.school });
    res.status(201).json(rec);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ----- Teacher: add marks -----
app.post('/api/students/:id/marks', auth(['teacher','admin']), async (req, res) => {
  try {
    const student = await StudentRecord.findById(req.params.id);
    if (!student || student.school !== req.user.school) return res.status(404).json({ error: 'Student not found' });
    const { exam, subject, score, outOf, term } = req.body;
    if (!exam || !subject || score == null || outOf == null) return res.status(400).json({ error: 'exam, subject, score, outOf required' });
    const rec = await Mark.create({ studentId: student._id, exam, subject, score, outOf, term, teacherId: req.user.id, school: req.user.school });
    res.status(201).json(rec);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ----- Teacher: add remark -----
app.post('/api/students/:id/remarks', auth(['teacher','admin']), async (req, res) => {
  try {
    const student = await StudentRecord.findById(req.params.id);
    if (!student || student.school !== req.user.school) return res.status(404).json({ error: 'Student not found' });
    const { text, category, date } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const rec = await Remark.create({ studentId: student._id, text, category, date, teacherId: req.user.id, school: req.user.school });
    res.status(201).json(rec);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ----- Student/Parent: view own records -----
app.get('/api/me/attendance', auth(['student','parent']), async (req, res) => {
  try {
    const student = req.user.role === 'student'
      ? await StudentRecord.findOne({ userId: req.user.id })
      : await StudentRecord.findOne({ parentUserId: req.user.id });
    if (!student) return res.json([]);
    const list = await Attendance.find({ studentId: student._id }).sort({ date: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/me/marks', auth(['student','parent']), async (req, res) => {
  try {
    const student = req.user.role === 'student'
      ? await StudentRecord.findOne({ userId: req.user.id })
      : await StudentRecord.findOne({ parentUserId: req.user.id });
    if (!student) return res.json([]);
    const list = await Mark.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/me/remarks', auth(['student','parent']), async (req, res) => {
  try {
    const student = req.user.role === 'student'
      ? await StudentRecord.findOne({ userId: req.user.id })
      : await StudentRecord.findOne({ parentUserId: req.user.id });
    if (!student) return res.json([]);
    const list = await Remark.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ----- Fees (Teacher/Admin) -----
app.post('/api/fees', auth(['teacher','admin']), async (req, res) => {
  try {
    const { studentId, feeType, amount, fine = 0, status = 'Pending', dueDate, paidDate, remarks } = req.body;
    if (!studentId || !feeType || amount == null) return res.status(400).json({ error: 'studentId, feeType, amount required' });
    const s = await StudentRecord.findById(studentId);
    if (!s || s.school !== req.user.school) return res.status(404).json({ error: 'Student not found' });
    const rec = await FeePayment.create({ studentId, feeType, amount, fine, status, dueDate, paidDate, remarks, school: req.user.school });
    res.status(201).json(rec);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// List fees (optionally by studentId)
app.get('/api/fees', auth(['teacher','admin']), async (req, res) => {
  try {
    const { status, studentId } = req.query;
    const q = { school: req.user.school };
    if (status) q.status = status;
    if (studentId) q.studentId = studentId;
    const fees = await FeePayment.find(q).sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/fees/:id', auth(['teacher','admin']), async (req, res) => {
  try {
    const fee = await FeePayment.findById(req.params.id);
    if (!fee || fee.school !== req.user.school) return res.status(404).json({ error: 'Not found' });
    const { feeType, amount, fine, status, dueDate, paidDate, remarks } = req.body;
    if (feeType !== undefined) fee.feeType = feeType;
    if (amount !== undefined) fee.amount = amount;
    if (fine !== undefined) fee.fine = fine;
    if (status) fee.status = status;
    if (dueDate !== undefined) fee.dueDate = dueDate;
    if (paidDate) fee.paidDate = paidDate;
    if (remarks !== undefined) fee.remarks = remarks;
    await fee.save();
    res.json(fee);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/fees/:id', auth(['teacher','admin']), async (req, res) => {
  try {
    const fee = await FeePayment.findById(req.params.id);
    if (!fee || fee.school !== req.user.school) return res.status(404).json({ error: 'Not found' });
    await fee.deleteOne();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Student/Parent: view own fees
app.get('/api/me/fees', auth(['student','parent']), async (req, res) => {
  try {
    const student = req.user.role === 'student'
      ? await StudentRecord.findOne({ userId: req.user.id })
      : await StudentRecord.findOne({ parentUserId: req.user.id });
    if (!student) return res.json([]);
    const fees = await FeePayment.find({ studentId: student._id, school: student.school }).sort({ createdAt: -1 });
    res.json(fees);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---------- NOTICES ----------
app.post('/api/notices', async (req, res) => {
  try {
    const { title, content, priority = 'normal', date = '', school } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content are required' });
    const notice = await Notice.create({ title, content, priority, date, school });
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/notices', async (req, res) => {
  try {
    const { school } = req.query;
    const q = school ? { school } : {};
    const notices = await Notice.find(q).sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notices/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- EVENTS ----------
app.post('/api/events', async (req, res) => {
  try {
    const { title, date, time = '', description = '', school } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'title and date are required' });
    const ev = await Event.create({ title, date, time, description, school });
    res.status(201).json(ev);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { school } = req.query;
    const q = school ? { school } : {};
    const events = await Event.find(q).sort({ date: 1, createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'uploads' });
    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gallery routes
app.post('/api/gallery', upload.single('file'), async (req, res) => {
  try {
    const { title, category = 'All Photos' } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'Image file required (field name: file)' });
    const allowed = ['All Photos','Campus','Events','Sports','Academics','Cultural','Labs'];
    if (!allowed.includes(category)) return res.status(400).json({ error: `Invalid category. Allowed: ${allowed.join(', ')}` });
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'gallery', resource_type: 'image' });
    const item = await GalleryItem.create({ title, category, imageUrl: result.secure_url, publicId: result.public_id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Upload failed' });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    const q = category && category !== 'All Photos' ? { category } : {};
    const items = await GalleryItem.find(q).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const doc = await GalleryItem.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await cloudinary.uploader.destroy(doc.publicId);
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Blogs routes
app.post('/api/blogs', upload.single('file'), async (req, res) => {
  try {
    const { title, content, category = 'All Posts' } = req.body;
    console.log('POST /api/blogs body:', { title, contentLen: content?.length, category, hasFile: !!req.file });
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });
    const allowed = ['All Posts','News','Events','Achievements','Academics','Sports','Culture'];
    if (!allowed.includes(category)) return res.status(400).json({ error: `Invalid category. Allowed: ${allowed.join(', ')}` });
    let coverUrl, publicId;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;
      const result = await cloudinary.uploader.upload(dataUri, { folder: 'blogs', resource_type: 'image' });
      coverUrl = result.secure_url;
      publicId = result.public_id;
    }
    const blog = await Blog.create({ title, content, category, coverUrl, publicId });
    res.status(201).json(blog);
  } catch (err) {
    console.error('POST /api/blogs error:', err);
    res.status(400).json({ error: err.message || 'Create failed' });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const { category } = req.query;
    const q = category && category !== 'All Posts' ? { category } : {};
    const items = await Blog.find(q).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const doc = await Blog.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.publicId) await cloudinary.uploader.destroy(doc.publicId);
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Documents routes (PDF uploads)
app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    const { title, category = 'Academics' } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!req.file) return res.status(400).json({ error: 'PDF file required (field name: file)' });
    const base64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'documents', resource_type: 'raw', format: 'pdf' });
    const doc = await Document.create({ title, category, pdfUrl: result.secure_url, publicId: result.public_id });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Upload failed' });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const { category } = req.query;
    const q = category ? { category } : {};
    const items = await Document.find(q).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' });
    await doc.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher/Admin: create students in own school (scoped)
app.post('/api/students', auth(['teacher','admin']), async (req, res) => {
  try {
    const school = req.user.school;
    const { name, rollNo, className, section, userId, parentUserId, email } = req.body;
    if (!name || !rollNo || !className) return res.status(400).json({ error: 'name, rollNo, className required' });
    const s = await StudentRecord.create({ name, rollNo, className, section, userId, parentUserId, school });
    res.status(201).json(s);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Create StudentRecords for student users in the same school that are missing records
app.post('/api/students/sync-missing', auth(['teacher','admin']), async (req, res) => {
  try {
    const school = req.user.school;
    const users = await User.find({ role: 'student', school });
    const created = [];
    for (const u of users) {
      const existing = await StudentRecord.findOne({ userId: u._id, school });
      if (!existing) {
        const rec = await StudentRecord.create({
          name: u.name || u.username,
          rollNo: u.username,
          className: 'Unassigned',
          section: '',
          userId: u._id,
          school,
        });
        created.push(rec._id);
      }
    }
    res.json({ created: created.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
