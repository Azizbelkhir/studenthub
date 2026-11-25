import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Total étudiants
    const [totalRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM students'
    );
    const total = (totalRows[0]?.['total'] as number) || 0;

    // Par filière
    const [filiereRows] = await pool.execute<RowDataPacket[]>(
      'SELECT filiere, COUNT(*) as count FROM students GROUP BY filiere ORDER BY count DESC'
    );

    // Par niveau
    const [niveauRows] = await pool.execute<RowDataPacket[]>(
      `SELECT niveau, COUNT(*) as count FROM students 
       GROUP BY niveau 
       ORDER BY FIELD(niveau, 'L1','L2','L3','M1','M2','Ing1','Ing2','Ing3')`
    );

    // Inscriptions récentes (7 derniers jours)
    const [recentRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as recent FROM students 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    const recent = (recentRows[0]?.['recent'] as number) || 0;

    // Filières uniques
    const [filiereCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(DISTINCT filiere) as count FROM students'
    );
    const totalFilieres = (filiereCount[0]?.['count'] as number) || 0;

    res.json({
      success: true,
      data: {
        total,
        recent,
        totalFilieres,
        byFiliere: filiereRows,
        byNiveau: niveauRows,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors du calcul des statistiques' });
  }
};
