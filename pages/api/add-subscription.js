import prisma from "@/lib/db";
export default async function addSub(req, res){
    try {
      await prisma.subscriptions.create({
        data: {
          endpoint: req.body.endpoint,
          keys: req.body.keys
        },
      })
      res.status(200).send('Done')
    } catch (error) {
      res.status(500).send('Failed to sub')
    }
}