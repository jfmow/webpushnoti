import { sendNotifications } from "@/lib/sendNotifications";

export default async function sendNotif(req, res) {
  try {
    const userIds = JSON.parse(req.body).user.id; // Get the user IDs array from req.body
    
    const subs = await fetch(`https://news1.suddsy.dev/api/collections/subscriptions/records`, {
      method: "GET",
      headers: {
        Authorization: JSON.parse(req.body).user.token, // Set the Authorization header
      },
    });

    //console.log(userIds)
    
    const data = await subs.json();
    //console.log(data.items)
    
    const filteredItems = data.items.filter(item => userIds.includes(item.user));
    //console.log(filteredItems)
    sendNotifications(filteredItems, JSON.parse(req.body).msg);
    
    res.status(200).send(filteredItems);
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to send notif');
  }
}
