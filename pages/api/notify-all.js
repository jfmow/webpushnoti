import prisma from "@/lib/db";
import {sendNotifications} from "@/lib/sendNotifications";
export default async function notifAll(req, res){
  res.status(200);
  const subscriptions = await prisma.subscriptions.findMany()
  if (subscriptions.length > 0) {
    sendNotifications(subscriptions, JSON.parse(req.body).msg)
    res.status(200).send('Success');
  } else {
    res.status(409).send('No subs');
  }
  
}