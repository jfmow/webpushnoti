import prisma from "@/lib/db";
export default async function unSub(req, res){
    console.log('/remove-subscription');
  console.log(req.body);
  console.log(`Unsubscribing ${req.body.endpoint}`);
  const deleteUsers = await prisma.subscriptions.deleteMany({
    where: {
      endpoint: req.body.endpoint
    },
  })
  
  res.status(200).send('Done')
}