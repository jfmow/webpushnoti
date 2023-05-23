import styles from '@/styles/Nav.module.css'
import Link from 'next/link'
import PocketBase from 'pocketbase';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Notifcation from './Noif';
import Reports from './Reports'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL)

export default function Nav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isAuthor, setIsAuthor] = useState(false)
    useEffect(() => {
        const status = pb.authStore.isValid;
        if (status === true) {
            setIsLoggedIn(true);
        };
        const admin = pb.authStore.model?.admin;
        if (admin === true) {
            setIsLoggedIn(false);
            setIsAdmin(true);
        };
        const author = pb.authStore.model?.authored;
        if (author === true) {
            setIsAuthor(true);
            setIsLoggedIn(false)
        }
        if (pb.authStore.model?.avatar == "") {
            toast.error('Please set an avatar in your account settings!', {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    }, []);

    const router = useRouter();

    function handleLoginClick() {
        sessionStorage.setItem('prevUrl', router.asPath);
        // Navigate to login page
        router.push('/auth/login');
    }
    if (isLoggedIn) {
        return (
            <div className={styles.container}>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Nabla&display=swap" rel="stylesheet"></link>
                </Head>
                <div className={styles.navdiv}>
                    <ul className={styles.navitems}>
                        <li><Link href="/" passHref legacyBehavior><a>Articles</a></Link></li>
                    </ul>

                    <div className={styles.usrmngment}>
                        <Notifcation />
                        <Link className={styles.bookmared_articles_btn} href='/u/me/saved-articles'><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-40v-640q0-33 23.5-56.5T200-760h400q33 0 56.5 23.5T680-680v640L400-160 120-40Zm640-120v-680H240v-80h520q33 0 56.5 23.5T840-840v680h-80Z"/></svg></Link>
                        <span className={styles.alone}><Link aria-label='Settings' href="/u/me" passHref><Image width='100' height='100' className={styles.usericon} src={pb.baseUrl + "/api/files/_pb_users_auth_/" + pb.authStore.model?.id + "/" + pb.authStore.model?.avatar + "?thumb=400x400"}></Image></Link></span>
                    </div>
                </div>
            </div>
        )
    }
    if (isAdmin || (isAdmin && isAuthor)) {
        return (
            <div className={styles.container}>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Nabla&display=swap" rel="stylesheet"></link>
                </Head>
                <div className={styles.navdiv}>
                    <ul className={styles.navitems}>
                        <li><Link href="/" passHref legacyBehavior><a>Articles</a></Link></li>
                        <li><Link href="/editor" passHref legacyBehavior><a>Editor</a></Link></li>
                    </ul>
                    <div className={styles.usrmngment}>
                        <Reports/>
                        <Notifcation />
                        <Link className={styles.bookmared_articles_btn} href='/u/me/saved-articles'><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-40v-640q0-33 23.5-56.5T200-760h400q33 0 56.5 23.5T680-680v640L400-160 120-40Zm640-120v-680H240v-80h520q33 0 56.5 23.5T840-840v680h-80Z"/></svg></Link>
                        <span className={styles.alone}><Link aria-label='Settings' href="/u/me" passHref><Image width='100' height='100' className={styles.usericon} src={pb.baseUrl + "/api/files/_pb_users_auth_/" + pb.authStore.model?.id + "/" + pb.authStore.model?.avatar + "?thumb=400x400"}></Image></Link></span>
                    </div>
                </div>
            </div>
        )
    }
    if (isAuthor) {
        return (
            <div className={styles.container}>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Nabla&display=swap" rel="stylesheet"></link>
                </Head>
                <div className={styles.navdiv}>
                    <h3><Link passHref href="/" legacyBehavior><a>News</a></Link></h3>
                    <ul className={styles.navitems}>
                        <li><Link href="/" passHref legacyBehavior><a>Articles</a></Link></li>
                        <li><Link href="/editor" passHref legacyBehavior><a>Editor</a></Link></li>
                    </ul>

                    <div className={styles.usrmngment}>
                        <Notifcation />
                        <Link className={styles.bookmared_articles_btn} href='/u/me/saved-articles'><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M120-40v-640q0-33 23.5-56.5T200-760h400q33 0 56.5 23.5T680-680v640L400-160 120-40Zm640-120v-680H240v-80h520q33 0 56.5 23.5T840-840v680h-80Z"/></svg></Link>
                        <span className={styles.alone}><Link aria-label='Settings' href="/u/me" passHref><Image width='100' height='100' className={styles.usericon} src={pb.baseUrl + "/api/files/_pb_users_auth_/" + pb.authStore.model?.id + "/" + pb.authStore.model?.avatar + "?thumb=400x400"}></Image></Link></span>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className={styles.container}>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Nabla&display=swap" rel="stylesheet"></link>
            </Head>
            <div className={styles.navdiv}>
                <h3><Link legacyBehavior passHref href="/"><a>News</a></Link></h3>
                <ul className={styles.navitems}>
                    <li><Link href="/" passHref legacyBehavior><a>Articles</a></Link></li>
                    <li id="conflash"><button aria-label='Login' onClick={handleLoginClick}>Login</button></li>
                </ul>
            </div>
        </div>
    )

}
