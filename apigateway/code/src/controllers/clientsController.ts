import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
// import { PrismaClient } from '../../node_modules/.prisma/client.ts';
// import { PrismaClient } from '../../node_modules/.prisma/client/default.js';
import { Client} from '../../prisma/types.ts';
const prisma: PrismaClient = new PrismaClient();

/**
 * Interface for the response object
 */
interface ClientResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: Client[]
}

/**
 * Function to get all people
 * @param req {Request} - The Request object
 * @param res {Response} - The Response object
 * @returns {Promise<void>}
 */
export async function getClients(req: Request, res: Response): Promise<void> {
  const clients: Client[] = await prisma.client.findMany();
  const clientReponse: ClientResponse = {
    meta: {
      count: clients.length,
      title: 'All clients',
      url: req.url
    },
    data: clients
  };
  res.status(200).send(clientReponse);
}

/**
 * Function to get a person by id
 * @param req {Request} - The Request object
 * @param res {Response} - The Response object
 * @returns {Promise<void>}
 */
export async function getClient(req: Request, res: Response): Promise<void> {
  const id: number = parseInt(req.params.id);
  const client: Client = await prisma.client.findUnique({
    where: {
      id: id
    }
  });
  res.status(200).send(client);
}
