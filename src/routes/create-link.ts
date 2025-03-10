import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../erros/client-error";

export async function createLink(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/links', {
        schema: { 
            params: z.object({
              tripId: z.string().uuid()
            }),
            body: z.object({
                title: z.string().min(4),
                url: z.string().url()
            })
        },

    }, async (req) => {
        const { tripId } = req.params
        const { title, url } = req.body

        const trip = await prisma.trip.findUnique({
            where: { id: tripId }
        })

        if (!trip) {
            throw new ClientError("Trip not found")
        }

        const link = await prisma.link.create({
          data: {
            title,
            url,
            trip_id: trip.id
          }

        })
        
        return { linkId: link.id } 
    })

}