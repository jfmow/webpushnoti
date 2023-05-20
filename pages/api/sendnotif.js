
import prisma from "@/lib/db";
import {sendNotifications} from "@/lib/sendNotifications";
export default async function sendNotif(req, res){
  try {
    const sub = await prisma.subscriptions.findMany({
      where: {
          endpoint: JSON.parse(req.body).endpoint,
      },
    })
    sendNotifications(sub, JSON.parse(req.body).msg)
    res.status(200).send('Done 2')
  } catch (error) {
    res.status(500).send('Failed to send notif')
  }
}


