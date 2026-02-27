import express, { type Request, type Response } from 'express';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { departments, subjects } from '../db/schema/app.js';

const router = express.Router();

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 10);
    const offset = (page - 1) * limit;

    const whereClauses = [];

    const departmentQuery = req.query.department;
    if (typeof departmentQuery === 'string' && departmentQuery.trim() !== '') {
      const departmentId = Number(departmentQuery);
      if (Number.isFinite(departmentId)) {
        whereClauses.push(eq(subjects.departmentId, departmentId));
      }
    }

    const searchQuery = req.query.search;
    if (typeof searchQuery === 'string' && searchQuery.trim() !== '') {
      const search = `%${searchQuery.trim()}%`;
      whereClauses.push(or(ilike(subjects.name, search), ilike(subjects.code, search)));
    }

    const whereCondition = whereClauses.length ? and(...whereClauses) : undefined;

    const dataQuery = db
      .select({
        id: subjects.id,
        departmentId: subjects.departmentId,
        departmentName: departments.name,
        name: subjects.name,
        code: subjects.code,
        description: subjects.description,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .orderBy(desc(subjects.id))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ total: sql<number>`count(*)` })
      .from(subjects);

    const [data, countRows] = await Promise.all([
      whereCondition ? dataQuery.where(whereCondition) : dataQuery,
      whereCondition ? countQuery.where(whereCondition) : countQuery,
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch subjects',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const subjectId = toPositiveInt(req.params.id, 0);

    if (subjectId < 1) {
      return res.status(400).json({ message: 'Invalid subject id' });
    }

    const rows = await db
      .select({
        id: subjects.id,
        departmentId: subjects.departmentId,
        departmentName: departments.name,
        name: subjects.name,
        code: subjects.code,
        description: subjects.description,
        createdAt: subjects.createdAt,
        updatedAt: subjects.updatedAt,
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(eq(subjects.id, subjectId))
      .limit(1);

    if (!rows.length) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json({ data: rows[0] });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch subject',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;