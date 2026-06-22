// Single shared Prisma client instance.
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function connectDb() {
  try {
    await prisma.$connect();
    logger.info('database connected');
  } catch (err) {
    logger.error('database connection failed', err.message);
    throw err;
  }
}

module.exports = { prisma, connectDb };
