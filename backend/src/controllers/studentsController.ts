import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface Student {
  id?: number;
  numero: string;
  nom: string;
  prenom: string;
  email: string;
  filiere: string;
  niveau: string;
  date_inscription?: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Validation rules
export const studentValidators = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('filiere').trim().notEmpty().withMessage('La filière est requise'),
  body('niveau')
    .isIn(['L1', 'L2', 'L3', 'M1', 'M2', 'Ing1', 'Ing2', 'Ing3'])
    .withMessage('Niveau invalide'),
];

// Générer un numéro étudiant unique
const generateStudentNumber = async (): Promise<string> => {
  const year = new Date().getFullYear().toString().slice(-2);
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM students'
  );
  const total = (rows[0]?.['total'] as number) + 1;
  return `STU${year}${String(total).padStart(3, '0')}`;
};

// GET /api/students — Lister tous les étudiants (avec recherche)
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, filiere, niveau, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM students WHERE 1=1';
    const params: string[] = [];

    if (search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR numero LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (filiere) {
      query += ' AND filiere = ?';
      params.push(filiere as string);
    }
    if (niveau) {
      query += ' AND niveau = ?';
      params.push(niveau as string);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params);
    const total = (countRows[0]?.['total'] as number) || 0;

    // Paginated results
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(String(limitNum), String(offset));

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('getAllStudents error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des étudiants' });
  }
};

// GET /api/students/:id — Obtenir un étudiant
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM students WHERE id = ?',
      [req.params['id']]
    );
    if (!rows.length) {
      res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
      return;
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('getStudentById error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /api/students — Ajouter un étudiant
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { nom, prenom, email, filiere, niveau } = req.body as Student;
    const numero = await generateStudentNumber();

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO students (numero, nom, prenom, email, filiere, niveau) VALUES (?, ?, ?, ?, ?, ?)',
      [numero, nom, prenom, email, filiere, niveau]
    );

    const [newStudent] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Étudiant ajouté avec succès',
      data: newStudent[0],
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, message: 'Email déjà utilisé' });
      return;
    }
    console.error('createStudent error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création' });
  }
};

// PUT /api/students/:id — Modifier un étudiant
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  try {
    const { nom, prenom, email, filiere, niveau } = req.body as Student;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE students SET nom=?, prenom=?, email=?, filiere=?, niveau=? WHERE id=?',
      [nom, prenom, email, filiere, niveau, req.params['id']]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
      return;
    }

    const [updated] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM students WHERE id = ?',
      [req.params['id']]
    );

    res.json({
      success: true,
      message: 'Étudiant modifié avec succès',
      data: updated[0],
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      res.status(409).json({ success: false, message: 'Email déjà utilisé' });
      return;
    }
    console.error('updateStudent error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la modification' });
  }
};

// DELETE /api/students/:id — Supprimer un étudiant
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM students WHERE id = ?',
      [req.params['id']]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
      return;
    }

    res.json({ success: true, message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error('deleteStudent error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression' });
  }
};

// GET /api/students/export/csv — Export CSV
export const exportCSV = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT numero, nom, prenom, email, filiere, niveau, date_inscription FROM students ORDER BY nom'
    );

    const header = 'Numéro,Nom,Prénom,Email,Filière,Niveau,Date Inscription\n';
    const csv = header + rows.map((s) =>
      `${s['numero']},${s['nom']},${s['prenom']},${s['email']},${s['filiere']},${s['niveau']},${s['date_inscription']}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="etudiants.csv"');
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
  } catch (error) {
    console.error('exportCSV error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'export' });
  }
};
