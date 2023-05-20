
import prisma from "@/lib/db";
import {sendNotifications} from "@/lib/sendNotifications";
export default function sendNotif(req, res){
    async function getSub(){
          const sub = await prisma.subscriptions.findMany({
            where: {
                endpoint: req.body.endpoint,
            },
          })
          console.log(sub)
          sendNotifications(sub)
    }
    getSub()
    res.status(200).send('Done 2')
}


