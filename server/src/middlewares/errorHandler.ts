import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({ message: error.message });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(422).send({
      message: 'Dados inválidos.',
      issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
    return;
  }

  console.error(error);
  reply.status(500).send({ message: 'Erro interno do servidor.' });
}
