// Automated verification test suite for StudentHub Cloud
import server from './server.js';
import http from 'node:http';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Lancement des tests automatisés StudentHub Cloud...\n');
  let token = '';
  let createdStudentId = null;

  // 1. Health check
  console.log('1️⃣  Test GET /api/health');
  const health = await request('GET', '/api/health');
  if (health.status !== 200 || !health.body.success) throw new Error('Health check échoué');
  console.log('   ✅ Health OK —', health.body.message);

  // 2. Stats
  console.log('2️⃣  Test GET /api/stats');
  const stats = await request('GET', '/api/stats');
  if (stats.status !== 200 || !stats.body.success) throw new Error('Stats échoué');
  console.log(`   ✅ Stats OK — Total étudiants: ${stats.body.data.total}, Filières: ${stats.body.data.totalFilieres}`);

  // 3. Students list
  console.log('3️⃣  Test GET /api/students');
  const list = await request('GET', '/api/students?limit=5');
  if (list.status !== 200 || !list.body.success) throw new Error('Students list échoué');
  console.log(`   ✅ Liste OK — ${list.body.data.length} étudiants retournés (Total: ${list.body.pagination.total})`);

  // 4. Admin Login
  console.log('4️⃣  Test POST /api/auth/login');
  const login = await request('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
  if (login.status !== 200 || !login.body.token) throw new Error('Login échoué');
  token = login.body.token;
  console.log('   ✅ Authentification Admin OK — Token JWT généré');

  // 5. Auth Verify
  console.log('5️⃣  Test GET /api/auth/verify');
  const verify = await request('GET', '/api/auth/verify', null, { Authorization: `Bearer ${token}` });
  if (verify.status !== 200) throw new Error('Verify échoué');
  console.log('   ✅ Vérification Session JWT OK');

  // 6. Create Student
  console.log('6️⃣  Test POST /api/students (Création)');
  const newStudent = await request('POST', '/api/students', {
    nom: 'Gharbi',
    prenom: 'Sami',
    email: 'sami.gharbi@epi.tn',
    filiere: 'IoT',
    niveau: 'Ing2'
  }, { Authorization: `Bearer ${token}` });
  if (newStudent.status !== 201 || !newStudent.body.data) throw new Error('Création étudiant échouée');
  createdStudentId = newStudent.body.data.id;
  console.log(`   ✅ Étudiant créé: ${newStudent.body.data.prenom} ${newStudent.body.data.nom} (N° ${newStudent.body.data.numero})`);

  // 7. Update Student
  console.log(`7️⃣  Test PUT /api/students/${createdStudentId} (Modification)`);
  const updated = await request('PUT', `/api/students/${createdStudentId}`, {
    nom: 'Gharbi',
    prenom: 'Sami',
    email: 'sami.gharbi@epi.tn',
    filiere: 'IoT',
    niveau: 'Ing3'
  }, { Authorization: `Bearer ${token}` });
  if (updated.status !== 200) throw new Error('Modification étudiant échouée');
  console.log(`   ✅ Étudiant modifié: niveau passé à ${updated.body.data.niveau}`);

  // 8. Delete Student
  console.log(`8️⃣  Test DELETE /api/students/${createdStudentId} (Suppression)`);
  const deleted = await request('DELETE', `/api/students/${createdStudentId}`, null, { Authorization: `Bearer ${token}` });
  if (deleted.status !== 200) throw new Error('Suppression étudiant échouée');
  console.log('   ✅ Étudiant supprimé avec succès');

  // 9. Export CSV
  console.log('9️⃣  Test GET /api/students/export/csv (Export)');
  const csv = await request('GET', '/api/students/export/csv');
  if (csv.status !== 200) throw new Error('Export CSV échoué');
  console.log('   ✅ Export CSV généré avec succès');

  // 10. Frontend static assets & SPA
  console.log('🔟 Test GET / (Distribution Frontend React)');
  const frontend = await request('GET', '/');
  if (frontend.status !== 200 || !frontend.body.includes('<div id="root">')) {
    throw new Error('Frontend index.html non servi correctement');
  }
  console.log('   ✅ Frontend React servi avec succès (HTML root détecté)');

  console.log('\n🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS (10/10) !');
  server.close();
  process.exit(0);
};

runTests().catch(err => {
  console.error('\n❌ Erreur pendant les tests:', err);
  server.close();
  process.exit(1);
});
