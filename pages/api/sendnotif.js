import {sendNotifications} from "@/lib/sendNotifications";
export default async function sendNotif(req, res){
  try {
    console.log(JSON.parse(req.body))
    const subs = await fetch(`https://news1.suddsy.dev/api/collections/subscriptions/records?filter=(user='${JSON.parse(req.body).notif.user}')`, {
      method: "GET",
      headers: {
        Authorization: JSON.parse(req.body).user.token, // Set the Authorization header
      }
    });
    const data = await subs.json()
    sendNotifications(data.items, JSON.parse(req.body).msg)
    res.status(200).send('Done 2')
  } catch (error) {
    console.log(error)
    res.status(500).send('Failed to send notif')
  }
}


