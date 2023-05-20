import prisma from "@/lib/db";
export default async function unSub(req, res){
  
  try {
    const deleteUsers = await prisma.subscriptions.deleteMany({
      where: {
        endpoint: req.body.endpoint
      },
    })
    
    res.status(200).send('Done')
  } catch (error) {
    res.status(500).send('Failed to delete sub')
  }
}