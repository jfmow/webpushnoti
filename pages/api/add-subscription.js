import prisma from "@/lib/db";
export default function addSub(req, res){
    console.log('/add-subscription');
    console.log('all data:', req.body);
    console.log(`Subscribing ${req.body.endpoint}`);
    async function createData(){
        await prisma.subscriptions.create({
            data: {
              endpoint: req.body.endpoint,
              keys: req.body.keys
            },
          })
    }
    createData()
    res.status(200).send('Done')
}