import PocketBase from 'pocketbase'
import { useEffect, useState } from 'react';
import styles from '@/styles/notification.module.css'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);

export default function report() {
    const [reports, setReports] = useState([])
    const [listOpen, setListOpen] = useState(false)
    useEffect(() => {
        async function getNotif() {
            const records = await pb.collection('reports').getFullList({
                sort: '-created', expand: 'article', filter: "seen = false"
            });
            setReports(records)
        }
        async function authUpdate() {
            try {
                const authData = await pb.collection('users').authRefresh();
                if (!pb.authStore.isValid) {
                    pb.authStore.clear();
                    return
                }
                if (!authData.record?.admin) {
                    return
                } else {
                    getNotif()
                }
            } catch (error) {
                pb.authStore.clear();
                return
            }
        }

        authUpdate()
    }, [])

    async function dismissNotif(noti) {
        const data = {
            seen: true,
        };
        const record = await pb.collection('reports').update(noti, data); // Update with 'id' property
        setReports((prevNotif) => {
            return prevNotif.filter((n) => n.id !== noti);
        });
    }



    return (
        <>
            <div className={styles.openbtn}>
                {reports.length !== 0 && (
                    <>
                        <button onClick={() => (setListOpen(true))} className={styles.open}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M166.174 966.304V225.696h417.439l17.831 81.76h232.382v465.653H496.174l-16-81.761H279.348v274.956H166.174ZM500 499.522Zm90.444 160.413h130.208V420.571H507.513l-16.24-81.701H279.348v239.364h294.829l16.267 81.701Z"/></svg></button>

                    </>
                )}
                <div className={`${listOpen ? (styles.container) : (styles.container_closed)}`} onClick={() => setListOpen(false)}>
                    <div className={styles.main} onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => setListOpen(false)} className={styles.exit}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" /></svg></button>
                        {reports.length === 0 ? (
                            <h5>All caught up</h5>
                        ) : (
                            <>
                                {reports.map((noti) => {
                                    return (<>
                                        <div className={styles.report}>

                                            <div className={styles.text}>
                                                <h4>Article: {noti.expand.article.title}</h4>
                                                <h6>Date: {(new Date(noti.created).toLocaleString())}</h6>
                                                <p>Reason: {noti.reason}</p>
                                                <h6>Ip: {noti.reporter_ip}</h6>
                                                <h6>Reporter: {noti.reporter_email}</h6>
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