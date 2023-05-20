import PocketBase from 'pocketbase'
import { useEffect, useState } from 'react';
import styles from '@/styles/notification.module.css'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);
import { toast } from "react-toastify";

export default function Notifcation() {
    const [notifcations, setNotifications] = useState([])
    const [listOpen, setListOpen] = useState(false)
    useEffect(() => {
        async function getNotif() {
            const records = await pb.collection('notifications').getFullList({
                sort: '-created', filter: `seen ?!~ '${pb.authStore.model.id}'`
            });
            setNotifications(records)
        }
        getNotif()
    }, [])

    async function dismissNotif(noti) {
        const notifToUpdate = notifcations.find((n) => n.id === noti);
        const currentSeen = notifToUpdate.seen || []; // Use default value if 'seen' is undefined
        const ddd = [...currentSeen, pb.authStore.model.id]
        const data = {
            seen: ddd,
        };
        const record = await pb.collection('notifications').update(noti, data); // Update with 'id' property
        setNotifications((prevNotif) => {
            return prevNotif.filter((n) => n.id !== noti);
        });
    }
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

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
            const data = {
                "notis": true
            };

            const record = await pb.collection('users').update(pb.authStore.model.id, data);
            toast.info('Subscribed to notis')

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
        const data = {
            "notis": false
        };
        
        const record = await pb.collection('users').update(pb.authStore.model.id, data);
        toast.info('Unsubbed from notis')
    }

    async function postToServer(url, data) {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data, user: { token: pb.authStore.token, id: pb.authStore.model.id } })
        });
    }




    return (
        <>
            <div className={styles.openbtn}>
                {notifcations.length !== 0 && (
                    <>
                        <button onClick={() => (setListOpen(true))} className={styles.open}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M80 496q0-88 35.5-166.5T217 194l57 56q-54 47-84 110.5T160 496H80Zm720 0q0-72-30-135.5T686 250l57-56q66 57 101.5 135.5T880 496h-80ZM160 856v-80h80V496q0-83 50-147.5T420 264v-28q0-25 17.5-42.5T480 176q25 0 42.5 17.5T540 236v28q80 20 130 84.5T720 496v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400 896h160q0 33-23.5 56.5T480 976ZM320 776h320V496q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" /></svg></button>

                    </>
                )}
                <div className={`${listOpen ? (styles.container) : (styles.container_closed)}`} onClick={() => setListOpen(false)}>
                    <div className={styles.main} onClick={(event) => event.stopPropagation()}>
                        {pb.authStore.model.notis ? (
                            <button onClick={unsubscribeFromPush}>Disable push notis?</button>

                        ) : (
                            <button onClick={subscribeToPush}>Push notis?</button>
                        )}
                        <button onClick={() => setListOpen(false)} className={styles.exit}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" /></svg></button>
                        {notifcations.length === 0 ? (
                            <h5>All caught up</h5>
                        ) : (
                            <>
                                {notifcations.map((noti) => {
                                    return (<>
                                        <div className={styles.notifcation}>

                                            <div className={styles.text}>
                                                {noti.title && (
                                                    <h4>{noti.title}</h4>
                                                )}
                                                <h6>{(new Date(noti.created).toLocaleString())}</h6>
                                                <p>{noti.message}</p>
                                            </div>
                                            <button onClick={() => dismissNotif(noti.id)} className={styles.dismiss}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="m336 776 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56Zm144 200q-83 0-156-31.5T197 859q-54-54-85.5-127T80 576q0-83 31.5-156T197 293q54-54 127-85.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 83-31.5 156T763 859q-54 54-127 85.5T480 976Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg></button>
                                        </div>
                                    </>)
                                })}
                            </>
                        )}

                    </div>
                </div>
            </div>

        </>
    )
}

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