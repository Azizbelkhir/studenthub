// ==============================================================================
// 🎓 StudentHub Cloud — Serveur Principal (Node.js)
// Projet Cloud Computing · EPI Sousse · IoT 2026-2027
// ==============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'students.json');
const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');

// Démonstration Admin
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'studenthub_cloud_secret_epi_sousse_2026';

// Données initiales par défaut (EPI Sousse)
const INITIAL_STUDENTS = [
  { id: 1, numero: 'STU26001', nom: 'Ben Ali', prenom: 'Ahmed', email: 'ahmed.benali@epi.tn', filiere: 'IoT', niveau: 'Ing2', created_at: '2026-09-15T08:30:00Z', updated_at: '2026-09-15T08:30:00Z', date_inscription: '2026-09-15T08:30:00Z' },
  { id: 2, numero: 'STU26002', nom: 'Mansouri', prenom: 'Fatima', email: 'fatima.mansouri@epi.tn', filiere: 'IoT', niveau: 'Ing2', created_at: '2026-09-16T09:15:00Z', updated_at: '2026-09-16T09:15:00Z', date_inscription: '2026-09-16T09:15:00Z' },
  { id: 3, numero: 'STU26003', nom: 'Trabelsi', prenom: 'Mohamed', email: 'mohamed.trabelsi@epi.tn', filiere: 'Informatique', niveau: 'Ing1', created_at: '2026-09-18T10:00:00Z', updated_at: '2026-09-18T10:00:00Z', date_inscription: '2026-09-18T10:00:00Z' },
  { id: 4, numero: 'STU26004', nom: 'Khalil', prenom: 'Sarah', email: 'sarah.khalil@epi.tn', filiere: 'Informatique', niveau: 'Ing3', created_at: '2026-09-20T11:45:00Z', updated_at: '2026-09-20T11:45:00Z', date_inscription: '2026-09-20T11:45:00Z' },
  { id: 5, numero: 'STU26005', nom: 'Bouaziz', prenom: 'Omar', email: 'omar.bouaziz@epi.tn', filiere: 'Réseaux', niveau: 'M1', created_at: '2026-09-22T14:20:00Z', updated_at: '2026-09-22T14:20:00Z', date_inscription: '2026-09-22T14:20:00Z' },
  { id: 6, numero: 'STU26006', nom: 'Ferchichi', prenom: 'Leila', email: 'leila.ferchichi@epi.tn', filiere: 'Réseaux', niveau: 'M2', created_at: '2026-09-25T15:10:00Z', updated_at: '2026-09-25T15:10:00Z', date_inscription: '2026-09-25T15:10:00Z' },
  { id: 7, numero: 'STU26007', nom: 'Hamdi', prenom: 'Youssef', email: 'youssef.hamdi@epi.tn', filiere: 'IoT', niveau: 'Ing3', created_at: '2026-10-02T08:00:00Z', updated_at: '2026-10-02T08:00:00Z', date_inscription: '2026-10-02T08:00:00Z' },
  { id: 8, numero: 'STU26008', nom: 'Jlassi', prenom: 'Nour', email: 'nour.jlassi@epi.tn', filiere: 'Informatique', niveau: 'L3', created_at: '2026-10-10T12:30:00Z', updated_at: '2026-10-10T12:30:00Z', date_inscription: '2026-10-10T12:30:00Z' },
];

// Initialisation de la persistance
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2), 'utf-8');
}

const loadStudents = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
};

const saveStudents = (students) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(students, null, 2), 'utf-8');
};

// Simple signature de token HMAC
const createToken = (payload) => {
  const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 86400000 })).toString('base64url');
  const sign = crypto.createHmac('sha256', JWT_SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sign}`;
};

const verifyToken = (token) => {
  try {
    const [head, body, sign] = token.split('.');
    if (!head || !body || !sign) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${head}.${body}`).digest('base64url');
    if (sign !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch {
      resolve({});
    }
  });
});

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
};

// Serveur HTTP
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // ─── API Routes ─────────────────────────────────────────────────────────────

  // 1. Health
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      success: true,
      message: '🎓 StudentHub Cloud API — En ligne et opérationnel',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      platform: 'Microsoft Azure App Service',
    });
  }

  // 2. Auth Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { username, password } = await parseBody(req);
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = createToken({ username });
      return sendJson(res, 200, {
        success: true,
        message: 'Connexion réussie',
        token,
        admin: { username },
      });
    }
    return sendJson(res, 401, { success: false, message: 'Nom d’utilisateur ou mot de passe incorrect' });
  }

  // 3. Auth Verify
  if (pathname === '/api/auth/verify' && method === 'GET') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token && verifyToken(token)) {
      return sendJson(res, 200, { success: true, message: 'Token valide' });
    }
    return sendJson(res, 401, { success: false, message: 'Token invalide ou expiré' });
  }

  // 4. Stats
  if (pathname === '/api/stats' && method === 'GET') {
    const students = loadStudents();
    const total = students.length;

    // Group by filière
    const byFiliereMap = {};
    for (const s of students) {
      byFiliereMap[s.filiere] = (byFiliereMap[s.filiere] || 0) + 1;
    }
    const byFiliere = Object.entries(byFiliereMap)
      .map(([filiere, count]) => ({ filiere, count }))
      .sort((a, b) => b.count - a.count);

    // Group by niveau
    const byNiveauMap = {};
    for (const s of students) {
      byNiveauMap[s.niveau] = (byNiveauMap[s.niveau] || 0) + 1;
    }
    const byNiveau = Object.entries(byNiveauMap)
      .map(([niveau, count]) => ({ niveau, count }));

    // Recent 7 days
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recent = students.filter(s => new Date(s.created_at || s.date_inscription).getTime() >= sevenDaysAgo).length;

    return sendJson(res, 200, {
      success: true,
      data: {
        total,
        recent,
        totalFilieres: byFiliere.length,
        byFiliere,
        byNiveau,
      },
    });
  }

  // 5. Export CSV
  if (pathname === '/api/students/export/csv' && method === 'GET') {
    const students = loadStudents();
    let csv = '\uFEFFNumero,Nom,Prenom,Email,Filiere,Niveau,Date Inscription\n';
    for (const s of students) {
      csv += `"${s.numero}","${s.nom}","${s.prenom}","${s.email}","${s.filiere}","${s.niveau}","${s.date_inscription || s.created_at}"\n`;
    }
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="etudiants_studenthub.csv"',
      'Access-Control-Allow-Origin': '*',
    });
    return res.end(csv);
  }

  // 6. Students Collection (GET list & POST create)
  if (pathname === '/api/students') {
    const students = loadStudents();

    if (method === 'GET') {
      const search = (urlObj.searchParams.get('search') || '').toLowerCase();
      const filiere = urlObj.searchParams.get('filiere') || '';
      const niveau = urlObj.searchParams.get('niveau') || '';
      const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
      const limit = parseInt(urlObj.searchParams.get('limit') || '10', 10);

      let filtered = students;
      if (search) {
        filtered = filtered.filter(s =>
          s.nom.toLowerCase().includes(search) ||
          s.prenom.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          s.numero.toLowerCase().includes(search)
        );
      }
      if (filiere) {
        filtered = filtered.filter(s => s.filiere === filiere);
      }
      if (niveau) {
        filtered = filtered.filter(s => s.niveau === niveau);
      }

      // Sort descending by id/date
      filtered.sort((a, b) => b.id - a.id);

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return sendJson(res, 200, {
        success: true,
        data: paginated,
        pagination: { total, page, limit, totalPages },
      });
    }

    if (method === 'POST') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token || !verifyToken(token)) {
        return sendJson(res, 401, { success: false, message: 'Authentification requise pour ajouter un étudiant' });
      }

      const body = await parseBody(req);
      const { nom, prenom, email, filiere, niveau } = body;

      if (!nom || !prenom || !email || !filiere || !niveau) {
        return sendJson(res, 400, { success: false, message: 'Tous les champs obligatoires doivent être renseignés' });
      }

      // Check unique email
      if (students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(res, 409, { success: false, message: 'Cette adresse email est déjà enregistrée' });
      }

      const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      const year = new Date().getFullYear().toString().slice(-2);
      const numero = `STU${year}${String(nextId).padStart(3, '0')}`;
      const now = new Date().toISOString();

      const newStudent = {
        id: nextId,
        numero,
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        filiere,
        niveau,
        created_at: now,
        updated_at: now,
        date_inscription: now,
      };

      students.push(newStudent);
      saveStudents(students);

      return sendJson(res, 201, {
        success: true,
        message: 'Étudiant ajouté avec succès',
        data: newStudent,
      });
    }
  }

  // 7. Student Single Item (GET, PUT, DELETE by id)
  const singleMatch = pathname.match(/^\/api\/students\/(\d+)$/);
  if (singleMatch) {
    const studentId = parseInt(singleMatch[1], 10);
    const students = loadStudents();
    const index = students.findIndex(s => s.id === studentId);

    if (method === 'GET') {
      if (index === -1) return sendJson(res, 404, { success: false, message: 'Étudiant non trouvé' });
      return sendJson(res, 200, { success: true, data: students[index] });
    }

    if (method === 'PUT') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token || !verifyToken(token)) {
        return sendJson(res, 401, { success: false, message: 'Authentification requise' });
      }

      if (index === -1) return sendJson(res, 404, { success: false, message: 'Étudiant non trouvé' });

      const body = await parseBody(req);
      const { nom, prenom, email, filiere, niveau } = body;

      // Duplicate email check
      if (email && students.some(s => s.id !== studentId && s.email.toLowerCase() === email.toLowerCase())) {
        return sendJson(res, 409, { success: false, message: 'Cette adresse email est déjà utilisée par un autre étudiant' });
      }

      students[index] = {
        ...students[index],
        nom: nom ? nom.trim() : students[index].nom,
        prenom: prenom ? prenom.trim() : students[index].prenom,
        email: email ? email.trim().toLowerCase() : students[index].email,
        filiere: filiere || students[index].filiere,
        niveau: niveau || students[index].niveau,
        updated_at: new Date().toISOString(),
      };

      saveStudents(students);
      return sendJson(res, 200, { success: true, message: 'Étudiant mis à jour avec succès', data: students[index] });
    }

    if (method === 'DELETE') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token || !verifyToken(token)) {
        return sendJson(res, 401, { success: false, message: 'Authentification requise' });
      }

      if (index === -1) return sendJson(res, 404, { success: false, message: 'Étudiant non trouvé' });

      students.splice(index, 1);
      saveStudents(students);
      return sendJson(res, 200, { success: true, message: 'Étudiant supprimé avec succès' });
    }
  }

  // ─── Frontend Static Files & SPA Fallback ────────────────────────────────────
  if (fs.existsSync(FRONTEND_DIST)) {
    let filePath = path.join(FRONTEND_DIST, pathname === '/' ? 'index.html' : pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      return fs.createReadStream(filePath).pipe(res);
    }

    // SPA fallback: redirect all unknown frontend routes to index.html
    const indexPath = path.join(FRONTEND_DIST, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(indexPath).pipe(res);
    }
  }

  // 404 Not Found
  return sendJson(res, 404, { success: false, message: 'Ressource non trouvée' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🎓 StudentHub Cloud — Serveur démarré avec succès !`);
  console.log(`🌐 Application Web : http://localhost:${PORT}`);
  console.log(`📡 API Health      : http://localhost:${PORT}/api/health`);
  console.log(`👥 API Students    : http://localhost:${PORT}/api/students`);
  console.log(`📊 API Stats       : http://localhost:${PORT}/api/stats`);
  console.log(`🔑 Admin Compte    : ${ADMIN_USER} / ${ADMIN_PASS}`);
  console.log(`======================================================\n`);
});

export default server;
