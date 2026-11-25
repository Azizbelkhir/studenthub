import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  studentValidators,
  exportCSV,
} from '../controllers/studentsController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Routes publiques (lecture)
router.get('/', getAllStudents);
router.get('/export/csv', exportCSV);
router.get('/:id', getStudentById);

// Routes protégées (écriture)
router.post('/', verifyToken, studentValidators, createStudent);
router.put('/:id', verifyToken, studentValidators, updateStudent);
router.delete('/:id', verifyToken, deleteStudent);

export default router;
