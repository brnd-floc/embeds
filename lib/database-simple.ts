import mysql from "mysql2/promise";

export interface Brand {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  score: number;
  ranking: string;
  uniqueVotersCount: number;
  category?: {
    name: string;
    totalBrands?: number;
    ranking?: number;
  };
}

export interface User {
  id: number;
  username: string;
  points?: number;
  brndPowerLevel?: number;
  photoUrl?: string;
}

export interface UserBrandVotes {
  transactionHash: string;
  date: Date;
  user: User;
  brand1: Brand;
  brand2: Brand;
  brand3: Brand;
  podiumImageUrl?: string;
  brndPaidWhenCreatingPodium?: number;
}

let connection: mysql.Connection | null = null;

async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    const config: mysql.ConnectionOptions = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    if (process.env.DB_SSL && process.env.DB_SSL !== "false") {
      config.ssl = {};
    }

    connection = await mysql.createConnection(config);
  }
  return connection;
}

export async function getTotalBrands(): Promise<number> {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(`SELECT COUNT(*) as total FROM brands`);
    const results = rows as any[];
    if (results.length === 0) return 0;
    return Number(results[0].total);
  } catch (error) {
    console.error("Error fetching total brands:", error);
    return 0;
  }
}

export async function getBrand(id: number): Promise<Brand | null> {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `
      SELECT 
        b.id, 
        b.name, 
        b.description, 
        b.imageUrl, 
        b.score, 
        b.ranking, 
        b.uniqueVotersCount,
        b.categoryId,
        c.name as categoryName,
        (SELECT COUNT(*) FROM brands b2 WHERE b2.categoryId = b.categoryId) as categoryTotalBrands,
        (SELECT COUNT(*) + 1 FROM brands b3 
         WHERE b3.categoryId = b.categoryId 
         AND b3.score > b.score) as categoryRanking
      FROM brands b 
      LEFT JOIN categories c ON b.categoryId = c.id 
      WHERE b.id = ?
    `,
      [id]
    );

    const results = rows as any[];
    if (results.length === 0) return null;

    const brand = results[0];
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      imageUrl: brand.imageUrl,
      score: brand.score,
      ranking: brand.ranking,
      uniqueVotersCount: brand.uniqueVotersCount,
      category: brand.categoryName
        ? {
            name: brand.categoryName,
            totalBrands: Number(brand.categoryTotalBrands) || 0,
            ranking: Number(brand.categoryRanking) || 1,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching brand:", error);
    return null;
  }
}

export async function getPodium(
  transactionHash: string
): Promise<UserBrandVotes | null> {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `
      SELECT 
        v.transactionHash,
        v.date,
        v.podiumImageUrl,
        v.brndPaidWhenCreatingPodium,
        u.id as userId,
        u.username,
        u.points,
        u.brndPowerLevel,
        u.photoUrl,
        b1.id as brand1Id,
        b1.name as brand1Name,
        b1.imageUrl as brand1ImageUrl,
        b1.score as brand1Score,
        b2.id as brand2Id,
        b2.name as brand2Name,
        b2.imageUrl as brand2ImageUrl,
        b2.score as brand2Score,
        b3.id as brand3Id,
        b3.name as brand3Name,
        b3.imageUrl as brand3ImageUrl,
        b3.score as brand3Score
      FROM user_brand_votes v
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN brands b1 ON v.brand1Id = b1.id
      LEFT JOIN brands b2 ON v.brand2Id = b2.id
      LEFT JOIN brands b3 ON v.brand3Id = b3.id
      WHERE v.transactionHash = ?
    `,
      [transactionHash]
    );

    const results = rows as any[];
    if (results.length === 0) return null;

    const vote = results[0];
    return {
      transactionHash: vote.transactionHash,
      date: vote.date,
      podiumImageUrl: vote.podiumImageUrl,
      brndPaidWhenCreatingPodium: vote.brndPaidWhenCreatingPodium || 0,
      user: {
        id: vote.userId,
        username: vote.username,
        points: vote.points,
        brndPowerLevel: vote.brndPowerLevel,
        photoUrl: vote.photoUrl,
      },
      brand1: {
        id: vote.brand1Id,
        name: vote.brand1Name,
        imageUrl: vote.brand1ImageUrl,
        score: vote.brand1Score || 0,
        ranking: "",
        description: "",
        uniqueVotersCount: 0,
      },
      brand2: {
        id: vote.brand2Id,
        name: vote.brand2Name,
        imageUrl: vote.brand2ImageUrl,
        score: vote.brand2Score || 0,
        ranking: "",
        description: "",
        uniqueVotersCount: 0,
      },
      brand3: {
        id: vote.brand3Id,
        name: vote.brand3Name,
        imageUrl: vote.brand3ImageUrl,
        score: vote.brand3Score || 0,
        ranking: "",
        description: "",
        uniqueVotersCount: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching podium:", error);
    return null;
  }
}
