import { DataSource } from 'typeorm';

export interface Brand {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  score: number;
  ranking: string;
  category?: {
    name: string;
  };
  currentRanking: number;
}

export interface User {
  id: number;
  username: string;
  points?: number;
}

export interface UserBrandVotes {
  transactionHash: string;
  date: Date;
  user: User;
  brand1: Brand;
  brand2: Brand;
  brand3: Brand;
  podiumImageUrl?: string;
}

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource || !dataSource.isInitialized) {
    dataSource = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || process.env.DB_DATABASE,
      entities: [],
      synchronize: false,
      logging: false,
      ssl: process.env.DB_SSL === 'false' ? false : undefined,
    });

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
  }
  
  return dataSource;
}

export async function getBrand(id: number): Promise<Brand | null> {
  try {
    const ds = await getDataSource();
    const result = await ds.query(`
      SELECT 
        b.id, 
        b.name, 
        b.description, 
        b.imageUrl, 
        b.score, 
        b.ranking, 
        b.currentRanking,
        c.name as categoryName
      FROM brands b 
      LEFT JOIN categories c ON b.categoryId = c.id 
      WHERE b.id = ?
    `, [id]);
    
    if (result.length === 0) return null;
    
    const brand = result[0];
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      imageUrl: brand.imageUrl,
      score: brand.score,
      ranking: brand.ranking,
      currentRanking: brand.currentRanking,
      category: brand.categoryName ? { name: brand.categoryName } : undefined,
    };
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

export async function getPodium(transactionHash: string): Promise<UserBrandVotes | null> {
  try {
    const ds = await getDataSource();
    const result = await ds.query(`
      SELECT 
        v.transactionHash,
        v.date,
        v.podiumImageUrl,
        u.id as userId,
        u.username,
        u.points,
        b1.id as brand1Id,
        b1.name as brand1Name,
        b1.imageUrl as brand1ImageUrl,
        b2.id as brand2Id,
        b2.name as brand2Name,
        b2.imageUrl as brand2ImageUrl,
        b3.id as brand3Id,
        b3.name as brand3Name,
        b3.imageUrl as brand3ImageUrl
      FROM user_brand_votes v
      LEFT JOIN users u ON v.userId = u.id
      LEFT JOIN brands b1 ON v.brand1Id = b1.id
      LEFT JOIN brands b2 ON v.brand2Id = b2.id
      LEFT JOIN brands b3 ON v.brand3Id = b3.id
      WHERE v.transactionHash = ?
    `, [transactionHash]);
    
    if (result.length === 0) return null;
    
    const vote = result[0];
    return {
      transactionHash: vote.transactionHash,
      date: vote.date,
      podiumImageUrl: vote.podiumImageUrl,
      user: {
        id: vote.userId,
        username: vote.username,
        points: vote.points,
      },
      brand1: {
        id: vote.brand1Id,
        name: vote.brand1Name,
        imageUrl: vote.brand1ImageUrl,
        score: 0,
        ranking: '',
        description: '',
        currentRanking: 1,
      },
      brand2: {
        id: vote.brand2Id,
        name: vote.brand2Name,
        imageUrl: vote.brand2ImageUrl,
        score: 0,
        ranking: '',
        description: '',
        currentRanking: 2,
      },
      brand3: {
        id: vote.brand3Id,
        name: vote.brand3Name,
        imageUrl: vote.brand3ImageUrl,
        score: 0,
        ranking: '',
        description: '',
        currentRanking: 3,
      },
    };
  } catch (error) {
    console.error('Error fetching podium:', error);
    return null;
  }
}