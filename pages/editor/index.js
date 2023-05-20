import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);
import { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';
import styles from '@/styles/Editormng.module.css'
import Link from 'next/link';
import Head from 'next/head';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'

export default function editorHome() {
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [createdArticles, setCreatedArticles] = useState([]);
    const [isCreatingNewArticle, setIsCreatingNewArticle] = useState(false);
    const [delArticleField, setDelArticle] = useState(null)
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        async function fetchArticles() {
            try {
                //const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                //await delay(5000);
                const response = await pb.collection('articles').getFullList(200 /* batch size */, {sort: `-created`, filter: `author = '${pb.authStore.model.id}' && title ~ '${searchTerm}'`})
                
                setCreatedArticles(response);
                setIsLoading(false);
            } catch (error) {
                console.log(error)
                setIsLoading(false);
                setIsError(true);
            }
        }
        async function authUpdate() {
            try {
                const authData = await pb.collection('users').authRefresh();
                if (!pb.authStore.isValid) {
                    pb.authStore.clear();
                    setIsLoading(true)
                    return window.location.replace("/auth/login");
                }
                if (!authData.record?.admin && !authData.record?.authored) {
                    setIsLoading(true)
                    return window.location.replace('/')
                }
                fetchArticles()
            } catch (error) {
                pb.authStore.clear();
                return window.location.replace('/auth/login');
            }

        }
        authUpdate()
        // Subscribe to all events on the 'gallery' collection
    }, [searchTerm]);

    async function createNewArticle() {
        setIsCreatingNewArticle(true)
        const saveingProgressToast = toast.loading("Creating article template...", { position: toast.POSITION.BOTTOM_RIGHT })

        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' });
        const data = {
            "body": null,
            "author": pb.authStore.model.id,
            "title": `${randomName}`,
            "published": false,
        };

        const record = await pb.collection('articles').create(data);
        toast.update(saveingProgressToast, { render: "Created. Redirecting...", type: "success", isLoading: false });
        return window.location.replace(`/editor/${record.id}`)
    }

    async function deleteArticle(id) {
        await pb.collection('articles').delete(id);
        return window.location.replace('/editor')
    }
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    }

    
    if (isError) {
        return (<div>
            <Head>
                <title>Whoops!</title>
                <link rel="favicon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Titillium+Web&display=swap" rel="stylesheet"></link>
            </Head>
            <div className={styles.containererror}>
                <h1>Problem loading page!</h1>
                <Link href="/">
                    <button className={styles.backbutton}>
                        <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024"><path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path></svg>
                        <span>Home</span>
                    </button></Link>
            </div>
        </div>)
    }
    if (!isLoading) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Editor management</h1>
            </div>
            <div className={styles.forms}>
                <div className={styles.edit_form}>
                    <div className={styles.edit_form_title}>
                        <h1>Edit</h1>
                        <input className={styles.searchArticles} type="text" placeholder="Search articles" value={searchTerm} onChange={handleSearch} />
                        <div className={styles.articles_new}>
                            {isCreatingNewArticle ? (<button disabled className={`${styles.edit_form_new_btn} ${styles.edit_form_new_btn__RED}`} aria-label='create new article'><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M453 776h60V610h167v-60H513V376h-60v174H280v60h173v166Zm27.266 200q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80 658.319 80 575.5q0-82.819 31.5-155.659Q143 347 197.5 293t127.341-85.5Q397.681 176 480.5 176q82.819 0 155.659 31.5Q709 239 763 293t85.5 127Q880 493 880 575.734q0 82.734-31.5 155.5T763 858.316q-54 54.316-127 86Q563 976 480.266 976Z" /></svg></button>) : (<button onClick={createNewArticle} className={styles.edit_form_new_btn} ><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M453 776h60V610h167v-60H513V376h-60v174H280v60h173v166Zm27.266 200q-82.734 0-155.5-31.5t-127.266-86q-54.5-54.5-86-127.341Q80 658.319 80 575.5q0-82.819 31.5-155.659Q143 347 197.5 293t127.341-85.5Q397.681 176 480.5 176q82.819 0 155.659 31.5Q709 239 763 293t85.5 127Q880 493 880 575.734q0 82.734-31.5 155.5T763 858.316q-54 54.316-127 86Q563 976 480.266 976Z" /></svg></button>)}

                        </div>
                    </div>
                    <div className={styles.articles}>
                        {createdArticles.length === 0 ? (<div className={styles.nothing_found}>No results</div>):(<>
                        {createdArticles.map((article) => (
                            <>
                                <div className={styles.article}>
                                    <div className={styles.article_info}>
                                        {article?.header_img && article.header_img.length > 5 ? (
                                            <img className={styles.edit_img} src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/articles/${article.id}/${article?.header_img}`} alt={article.title} />

                                        ) : (
                                            <span className={styles.edit_img} />

                                        )}
                                        <span>{article.title} <span className={styles.createdDate}>{new Date(article.created).toLocaleDateString()}</span></span>
                                    </div>
                                    <div className={styles.edit_article_btns}>
                                        <button onClick={() => setDelArticle(article.id)} type='button' className={styles.delete_article_button}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m361 757 119-121 120 121 47-48-119-121 119-121-47-48-120 121-119-121-48 48 120 121-120 121 48 48ZM261 936q-24 0-42-18t-18-42V306h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Z" /></svg></button>
                                        <Link aria-aria-label='edit button' className={styles.article_edit_btn} href={`/editor/${article.id}`}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M480 936v-71l216-216 71 71-216 216h-71ZM120 726v-60h300v60H120Zm690-49-71-71 29-29q8-8 21-8t21 8l29 29q8 8 8 21t-8 21l-29 29ZM120 561v-60h470v60H120Zm0-165v-60h470v60H120Z" /></svg></Link>
                                    </div>
                                </div>
                                {delArticleField === article.id && (
                                    <>
                                        <div className={styles.usrname_container} onClick={() => { setDelAccField(false) }}>
                                            <div className={styles.usrname_bg}>
                                                <div className={styles.usrname_block} onClick={(event) => event.stopPropagation()}>
                                                    <button type='button' onClick={() => (setDelArticle(null))} className={styles.usrclose_btn}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M480 618 270 828q-9 9-21 9t-21-9q-9-9-9-21t9-21l210-210-210-210q-9-9-9-21t9-21q9-9 21-9t21 9l210 210 210-210q9-9 21-9t21 9q9 9 9 21t-9 21L522 576l210 210q9 9 9 21t-9 21q-9 9-21 9t-21-9L480 618Z" /></svg></button>
                                                    <form >
                                                        <h2>Are you sure you want to delete this article? </h2>
                                                        <div className={styles.usrname_edit_form}>
                                                            <p>This action cannot be undone, and the article will be permanently removed from our system. <br />Please note that once you delete this article, you will not be able to retrieve it. If you are sure you want to proceed, click the "Delete" button below. Otherwise, click anywhere outside this modal to cancel.<br />Deleting this article may also impact other parts of our system that depend on it, such as related articles or links. Please make sure you have considered all the consequences before proceeding with the deletion.<br />Thank you for your understanding.</p>
                                                        </div>
                                                        <button style={{ justifySelf: 'end' }} className={`${styles.buttondefault} ${styles.buttonred}`} type='button' onClick={() => (deleteArticle(article.id))}>Delete</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </>)}
                            </>
                        ))}</>)}
                    </div>
                </div>
            </div>
        </div>
    )}
    return(
        <Loader/>
    )
}