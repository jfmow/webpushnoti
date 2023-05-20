import { useState } from "react";
import { toast } from "react-toastify";
import PocketBase from 'pocketbase';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL)
pb.autoCancellation(false);
export default function Home() {
  const [msg, setMessage] = useState('')
  const [msg_body, setMessageBody] = useState('')
  async function notifyAll() {
    const response = await fetch('/api/notify-all', {
      method: 'POST',
      
      body: JSON.stringify({ msg: { title: msg, body: msg_body }, user: {token: pb.authStore.token, id: pb.authStore.model.id} })
    });
    if (response.status === 409) {
      document.getElementById('notification-status-message').textContent =
        'There are no subscribed endpoints to send messages to, yet.';
    }
  }
  async function notifyMe() {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    console.log(JSON.stringify({ msg: { title: msg, body: msg_body }, endpoint: subscription.endpoint }))

    const response = await fetch('/api/sendnotif', {
      method: 'POST',
      body: JSON.stringify({ msg: { title: msg, body: msg_body }, endpoint: subscription.endpoint, user: {token: pb.authStore.token, id: pb.authStore.model.id} })
    });
  }
  return (
    <>
      <h1>
        Home
      </h1>

      <h2>Service worker</h2>
      <textarea
        id="registration-status-message">This browser doesn't support service workers.</textarea>
      <button
        id="register"
        onClick={registerServiceWorker}
      >
        Register service worker
      </button>
      <button
        id="unregister"
        onClick={unregisterServiceWorker}
      >
        Unregister service worker
      </button>
      <h2>Subscripton</h2>
      <textarea
        id="subscription-status-message">No push subscription is active.</textarea>
      <button
        id="subscribe"
        onClick={subscribeToPush}
      >
        Subscribe to push
      </button>
      <button
        id="unsubscribe"
        onClick={unsubscribeFromPush}
      >
        Unsubscribe from push
      </button>
      <h2>Notifications</h2>
      <input type="text" onChange={(e) => (setMessage(e.target.value))}
        id="notification-status-message" value={msg} placeholder="Msg title..."/>
      <h2>Notifications</h2>
      <input type="text" onChange={(e) => (setMessageBody(e.target.value))}
        id="notification-status-message" value={msg_body} placeholder="Msg body..."/>
      <button
        id="notify-me"
        onClick={notifyMe}
      >
        Notify me
      </button>
      <button
        id="notify-all"
        onClick={notifyAll}>
        Notify all
      </button>

    </>
  )
}


const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

/* Push notification logic. */

async function registerServiceWorker() {
  console.log('hg')
  await navigator.serviceWorker.register('service-worker.js');
  updateUI();
}

async function unregisterServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration.unregister();
  updateUI();
}

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  try {
    Notification.requestPermission()
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    console.log(subscription)
    postToServer('/api/add-subscription', subscription);
    updateUI();
  } catch (err) {
    console.log(err)
    return toast.error('Permision denied. Enable notifs')
  }

}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  postToServer('/api/remove-subscription', {
    endpoint: subscription.endpoint
  });
  await subscription.unsubscribe();
  updateUI();
}





/* UI logic. */

async function updateUI() {
  const registrationButton = document.getElementById('register');
  const unregistrationButton = document.getElementById('unregister');
  const registrationStatus = document.getElementById('registration-status-message');
  const subscriptionButton = document.getElementById('subscribe');
  const unsubscriptionButton = document.getElementById('unsubscribe');
  const subscriptionStatus = document.getElementById('subscription-status-message');
  const notifyMeButton = document.getElementById('notify-me');
  const notificationStatus = document.getElementById('notification-status-message');
  // Disable all buttons by default.
  registrationButton.disabled = true;
  unregistrationButton.disabled = true;
  subscriptionButton.disabled = true;
  unsubscriptionButton.disabled = true;
  notifyMeButton.disabled = true;
  // Service worker is not supported so we can't go any further.
  if (!'serviceWorker' in navigator) {
    registrationStatus.textContent = "This browser doesn't support service workers.";
    subscriptionStatus.textContent = "Push subscription on this client isn't possible because of lack of service worker support.";
    notificationStatus.textContent = "Push notification to this client isn't possible because of lack of service worker support.";
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  // Service worker is available and now we need to register one.
  if (!registration) {
    registrationButton.disabled = false;
    registrationStatus.textContent = 'No service worker has been registered yet.';
    subscriptionStatus.textContent = "Push subscription on this client isn't possible until a service worker is registered.";
    notificationStatus.textContent = "Push notification to this client isn't possible until a service worker is registered.";
    return;
  }
  registrationStatus.textContent =
    `Service worker registered. Scope: ${registration.scope}`;
  const subscription = await registration.pushManager.getSubscription();
  // Service worker is registered and now we need to subscribe for push
  // or unregister the existing service worker.
  if (!subscription) {
    unregistrationButton.disabled = false;
    subscriptionButton.disabled = false;
    subscriptionStatus.textContent = 'Ready to subscribe this client to push.';
    notificationStatus.textContent = 'Push notification to this client will be possible once subscribed.';
    return;
  }
  // Service worker is registered and subscribed for push and now we need
  // to unregister service worker, unsubscribe to push, or send notifications.
  subscriptionStatus.textContent =
    `Service worker subscribed to push. Endpoint: ${subscription.endpoint}`;
  notificationStatus.textContent = 'Ready to send a push notification to this client!';
  unregistrationButton.disabled = false;
  notifyMeButton.disabled = false;
  unsubscriptionButton.disabled = false;
}

/* Utility functions. */

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

async function postToServer(url, data) {
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({data, user: {token: pb.authStore.token, id: pb.authStore.model.id}})
  });
}

