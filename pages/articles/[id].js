import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import { toast } from "react-toastify";
import Link from "next/link";
import styles from '@/styles/Article.module.css'
import Comments from "@/components/Comments";
import Loader from "@/components/Loader";
import Image from "next/image";
import Head from "next/head";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);

export default function Viewer({ arti }) {
    const [articleData2, setArticleData] = useState([]);
    const [isError, setError] = useState(false)
    const [artiArticle, setArticle] = useState([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPublished, setIsPublished] = useState(true);
    const [isAuthor, setIsAuthor] = useState(false);
    useEffect(() => {
        async function fetchArticles() {
            try {
                const record = await pb.collection('articles').getOne(arti.article, {
                    expand: 'author',
                });
                setArticleData(record.body)
                setArticle(record)
                setIsPublished(record.published)
            } catch (error) {
                console.log(error);
                setError(true)
            }
        }
        async function authUpdate() {
            try {
                const authData = await pb.collection('users').authRefresh();
                if (!pb.authStore.isValid) {
                    pb.authStore.clear()
                }
            } catch (error) {
                pb.authStore.clear()
            }
            fetchArticles();
        }
        authUpdate()
        if (pb.authStore.model?.authored === true) {
            setIsAuthor(true)
        }
        if (pb.authStore.model?.admin === true) {
            setIsAdmin(true)
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }, []);
    async function adminPublishArticle() {
        try {
            if (isPublished == true) {
                const data = {
                    "published": false
                };
                const record = await pb.collection('articles').update(arti.article, data);
            } else {
                if (!artiArticle.header_img) {
                    return toast.error('Header image required!')
                }
                const data = {
                    "published": true
                };
                const record = await pb.collection('articles').update(arti.article, data);
            }
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }
    if (isAdmin || (isAdmin && isAuthor)) {
        return <><SavedData userSaved={pb.authStore.model.saved_articles.includes(artiArticle.id)} savedData={articleData2} articleArti={artiArticle} /><Comments articleId={arti.article} /><div className={styles.admineditbtns}>
            <Link href={`/editor/${arti.article}`}><button className={styles.submitbutton} type="button">Edit article</button></Link>
            <button onClick={adminPublishArticle} className={styles.publishbutton}>{isPublished ? "Unpublish" : "Publish article"}</button>
        </div><ReportBtn articleName={artiArticle} /></>
    }
    if (isAuthor) {
        console.log(artiArticle)
        return <>

            <SavedData savedData={articleData2} userSaved={pb.authStore.model.saved_articles.includes(artiArticle.id)} articleArti={artiArticle} /><Comments articleId={arti.article} /><div className={styles.admineditbtns}>
                {artiArticle?.author === pb.authStore.model.id && (
                    <Link href={`/editor/${arti.article}`}><button className={styles.submitbutton} type="button">Edit article</button></Link>
                )}
            </div>
            <ReportBtn articleName={artiArticle} />
        </>
    }
    if (isLoading) {
        return (<Loader />)
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
                <h1>Article not found!</h1>
                <Link href="/">
                    <button className={styles.backbutton}>
                        <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024"><path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path></svg>
                        <span>Back</span>
                    </button></Link>
            </div>
        </div>)
    }

    return <><SavedData savedData={articleData2} userSaved={pb.authStore.model.saved_articles.includes(artiArticle.id)} articleArti={artiArticle} /><Comments articleId={arti.article} /><ReportBtn articleName={artiArticle} /></>
}

const SavedData = ({ savedData, articleArti, userSaved }) => {
    const [userSavedAlt, setUserSaved] = useState(userSaved)
    const [shareModal, setShareModal]= useState(false);
    
    async function saveArticle() {
        if (!pb.authStore.isValid) {
            return window.location.replace(`/auth/login/articles/${articleArti.id}`)
        }
        setUserSaved(true)
        const data = {
            "saved_articles": [
                ...pb.authStore.model.saved_articles, articleArti.id
            ]
        };
        await pb.collection('users').update(pb.authStore.model.id, data);
    }
    async function unsaveArticle() {
        if (!pb.authStore.isValid) {
            return window.location.replace(`/auth/login/articles/${articleArti.id}`)
        }
        setUserSaved(false)
        const filtered = pb.authStore.model.saved_articles.filter(article => article.id !== articleArti.id)
        const data = {
            "saved_articles": [
                filtered
            ]
        };
        await pb.collection('users').update(pb.authStore.model.id, data);
    }

    if (!savedData) {
        return (
            <div className={styles.container}>
                <Head>
                    <meta name="robots" content="noindex" />
                    <meta name="robots" content="noindex, max-snippet:0, noarchive, notranslate, noimageindex, unavailable_after: 2024-01-01"></meta>

                </Head>
                <div className={styles.title}>
                    {articleArti.header_img &&
                        <Image width='1500' height='700' src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/articles/${articleArti.id}/${articleArti.header_img}`} alt="Article header image" />}
                    <div className={styles.headerstuff}>
                        <h1>{articleArti?.title || "unknown"}</h1>
                        <h4>Written by: <Link className={styles.authorlink} href={`/u/${articleArti.expand?.author?.username}`}>{articleArti.expand?.author?.username || "unknown"}</Link></h4>
                    </div></div>

                <h3>No data saved!</h3>

            </div>
        )
    }
    function copyToClip() {
        // Create a dummy input element
        var dummyInput = document.createElement('input');
        dummyInput.setAttribute('value', window.location.href);

        // Append it to the body
        document.body.appendChild(dummyInput);

        // Select and copy the value of the dummy input
        dummyInput.select();
        document.execCommand('copy');

        // Remove the dummy input from the DOM
        document.body.removeChild(dummyInput);

        // Optionally, provide visual feedback to the user
        setShareModal(false)
      }
    const { time, blocks, version } = savedData;
    return (
        <div className={styles.container}>
            <Head>
                <meta name="robots" content="noindex" />
                <meta name="robots" content="noindex, max-snippet:0, noarchive, notranslate, noimageindex, unavailable_after: 2024-01-01"></meta>

            </Head>
            <div className={styles.title}>
                {articleArti.header_img &&
                    <Image width='1500' height='700' src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/articles/${articleArti.id}/${articleArti.header_img}`} alt="Article header image" />}
                <div className={styles.headerstuff}>
                    <h1>{articleArti?.title || "unknown"}</h1>
                    <h4>Written by: <Link className={styles.authorlink} href={`/u/@${articleArti.expand?.author?.username}`}>{articleArti.expand?.author?.username || "unknown"}</Link></h4>
                    <p>On the {new Date(time).toLocaleDateString()}</p>
                    <div className={styles.sharebtns_container}>
                        <button className={styles.sharebtn_button} onClick={()=>setShareModal(true)} type="button"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M720 976q-50 0-85-35t-35-85q0-7 1-14.5t3-13.5L322 664q-17 15-38 23.5t-44 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q23 0 44 8.5t38 23.5l282-164q-2-6-3-13.5t-1-14.5q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-23 0-44-8.5T638 384L356 548q2 6 3 13.5t1 14.5q0 7-1 14.5t-3 13.5l282 164q17-15 38-23.5t44-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-640q17 0 28.5-11.5T760 296q0-17-11.5-28.5T720 256q-17 0-28.5 11.5T680 296q0 17 11.5 28.5T720 336ZM240 616q17 0 28.5-11.5T280 576q0-17-11.5-28.5T240 536q-17 0-28.5 11.5T200 576q0 17 11.5 28.5T240 616Zm480 280q17 0 28.5-11.5T760 856q0-17-11.5-28.5T720 816q-17 0-28.5 11.5T680 856q0 17 11.5 28.5T720 896Zm0-600ZM240 576Zm480 280Z" /></svg></button>
                        {userSavedAlt ? (
                            <button onClick={unsaveArticle} className={styles.sharebtn_button} type="button"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M713-600 600-713l56-57 57 57 141-142 57 57-198 198ZM200-120v-640q0-33 23.5-56.5T280-840h280q-20 30-30 57.5T520-720q0 72 45.5 127T680-524q23 3 40 3t40-3v404L480-240 200-120Z" /></svg></button>
                        ) : (
                            <button onClick={saveArticle} className={styles.sharebtn_button} type="button"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z" /></svg></button>
                        )}
                    </div>
                    {shareModal && (
                        <>
                            <div className={styles.sharemodal_container} onClick={()=>setShareModal(false)}>
                                <div className={styles.shareModal} onClick={(event) => event.stopPropagation()}>
                                    <h2>Share {articleArti.title}</h2>
                                    <div className={styles.shareModal_link}>
                                        <div className={styles.shareModal_link_text}>
                                            https://news.suddsy.dev/articles/{articleArti.id}
                                        </div>
                                        <button onClick={copyToClip} className={styles.shareModal_link_btn}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Z"/></svg></button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div></div>

            <ul className={styles.article}>
                {blocks?.map((block) => {
                    switch (block.type) {
                        case "paragraph":
                            return <li key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text.replace(/<br>/g, '<br/>') }}></li>;
                        case "header":
                            const Header = `h${block.data.level}`;
                            return (
                                <li key={block.id}>
                                    <Header>{block.data.text}</Header>
                                </li>
                            );
                        case "list":
                            return (
                                <li key={block.id}>
                                    {block.data.style === "ordered" ? (
                                        <ol>
                                            {block.data.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <ul>
                                            {block.data.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );

                        case "attaches":
                            console.log(block.data.file)
                            if (block.data.file.extension == "MP4" || block.data.file.extension == "mp4" || block.data.file.extension == "mov" || block.data.file.extension == "MOV") {
                                return (
                                    <li key={block.id} style={{ width: "100%", display: 'flex', justifyContent: 'center' }}>
                                        <video controls style={{ width: '50%' }} src={block.data.file.url} alt={block.data.caption} />
                                    </li>
                                );
                            }
                            return (
                                <li key={block.id}>
                                    <Link style={{ width: '20em' }} href={block.data.file.url} />
                                </li>
                            );
                        case "quote":
                            return (
                                <li key={block.id}>
                                    <blockquote>{block.data.text}</blockquote>
                                </li>
                            );
                        case "table":
                            return (
                                <li key={block.id}>
                                    <table>
                                        <thead>
                                            <tr>
                                                {block.data.content[0].map((header) => (
                                                    <th key={header}>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {block.data.content.slice(1).map((row) => (
                                                <tr key={row.join()}>
                                                    {row.map((cell) => (
                                                        <td key={cell}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </li>
                            );
                        case "image":
                            return (
                                <li key={block.id}>
                                    <img loading="lazy" className={styles.article_body_img} src={block.data.file.url} alt={block.data.caption} />
                                </li>
                            );
                        default:
                            throw new Error('Unable to render component!')
                        //return null;
                    }
                })}
            </ul>

        </div>
    );
};

function ReportBtn({ articleName }) {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [reporterEmail, setReportEmail] = useState('');
    const [reportReason, setReportReason] = useState('');
    const [reporting, setReporting] = useState(false);
    async function handelReport(e) {
        e.preventDefault()
        if (!reportReason || !reporterEmail) {
            return toast.warning('Please fill out all fields!')
        }
        setReporting(true)
        const response = await fetch('/api/getip');
        const data = await response.json();
        const userIp = data.ip;
        try {
            const data = {
                "reason": reportReason,
                "reporter_email": reporterEmail,
                "article": articleName.id,
                "reporter_ip": userIp
            };

            const record = await pb.collection('reports').create(data);
            setShowDetailsModal(false);
            setReporting(false)
            return toast.success('Report Sent!')
        } catch (error) {
            return toast.error('Failed to create report!')
        }
    }
    return (
        <>
            <button type="button" onClick={() => setShowDetailsModal(true)} className={styles.reportbtn}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M312.87 823.13h64.76v-200H474l39.92 80h213.21V448.87H608.924l-40.12-80H312.87v454.26ZM557 638.37l-40-80H377.63V433.63h148.413l40 80h96.327v124.74H557Zm-77.425 354.826q-85.454 0-161.65-32.921-76.196-32.92-132.738-89.462T95.725 737.977q-32.92-76.294-32.92-161.944 0-86.544 32.979-162.657 32.979-76.114 89.809-132.934 56.83-56.821 132.741-89.349 75.911-32.528 161.17-32.528 86.622 0 163.08 32.506 76.458 32.505 133.036 89.3 56.577 56.795 89.196 133.094 32.619 76.298 32.619 163.077 0 85.763-32.528 161.415-32.528 75.652-89.349 132.466-56.82 56.814-133.047 89.793-76.227 32.98-162.936 32.98Zm.37-77.305q141.133 0 240.539-99.702 99.407-99.701 99.407-240.134 0-141.133-99.352-240.539-99.352-99.407-240.604-99.407-140.252 0-240.039 99.352-99.787 99.352-99.787 240.604 0 140.252 99.702 240.039 99.701 99.787 240.134 99.787ZM480 576Z" /></svg></button>
            {showDetailsModal ?
                (
                    <>
                        <div className={styles.usrname_container} onClick={() => { setShowDetailsModal(false) }}>
                            <div className={styles.usrname_bg}>
                                <div className={styles.usrname_block} onClick={(event) => event.stopPropagation()}>
                                    <button type='button' onClick={() => { setShowDetailsModal(false) }} className={styles.usrclose_btn}><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M480 618 270 828q-9 9-21 9t-21-9q-9-9-9-21t9-21l210-210-210-210q-9-9-9-21t9-21q9-9 21-9t21 9l210 210 210-210q9-9 21-9t21 9q9 9 9 21t-9 21L522 576l210 210q9 9 9 21t-9 21q-9 9-21 9t-21-9L480 618Z" /></svg></button>
                                    <form>
                                        <h2>Report {articleName.title}</h2>
                                        <div className={styles.usrname_edit_form}>
                                            <input autoCorrect='false' autoCapitalize='false' id='usrnameinput' onChange={event => setReportEmail(event.target.value)} type='email' required placeholder='Your email' />
                                            <input autoCapitalize='false' id='usrnameinput' onChange={event => setReportReason(event.target.value)} type='text' required placeholder='Reason' />
                                        </div>
                                        <p>Spam and abuse of this system will not be tolerated and will result in a blacklist.</p>
                                        {reporting ? (
                                            <button style={{ justifySelf: 'end' }} className={`${styles.buttondefault} ${styles.buttonred}`} type='button' disabled>Report</button>

                                        ) : (
                                            <button style={{ justifySelf: 'end' }} className={`${styles.buttondefault}`} type='submit' onClick={(event) => handelReport(event)}>Report</button>

                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </>
                ) :
                ('')}
        </>
    )
}

export async function getServerSideProps({ params }) {
    return {
        props: {
            arti: { article: params.id },
        },
    };
}