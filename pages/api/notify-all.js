import { sendNotifications } from "@/lib/sendNotifications";
export default async function notifAll(req, res) {
  res.status(200);
  const subs = await fetch(`https://news1.suddsy.dev/api/collections/subscriptions/records`, {
    method: "GET",
    headers: {
      Authorization: JSON.parse(req.body).user.token, // Set the Authorization header
    }
  });
  const data = await subs.json()
  if (data.items.length > 0) {
    sendNotifications(data.items, JSON.parse(req.body).msg)
    res.status(200).send('Success');
  } else {
    res.status(409).send('No subs');
  }

}