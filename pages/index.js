import Head from "next/head";
import styles from "../styles/Home.module.css"
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';


import Link from "next/link";
import Loader from "@/components/Loader";
import Image from "next/image";
import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);
export default function home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    async function fetchArticles() {
      try {
        //const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        //await delay(5000);
        const response = await pb.collection('articles').getFullList(200 /* batch size */, {
          sort: '-created', expand: 'author'
        })
        if (response.length === 0) {
          setIsError(true)
          setIsLoading(false)
        } else {
          setArticles(response);
          setIsLoading(false);
        }
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
          pb.authStore.clear()
        }
      } catch (error) {
        pb.authStore.clear()
      }
      fetchArticles();
    }
    authUpdate()
    // Subscribe to all events on the 'gallery' collection
  }, []);
  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return (
      <div className={styles.errorcontainer}>
        <div className={styles.error}>
          <h3>Unable to load articles!</h3>
          <p>Please try again or comeback later as the issue maybe resloved</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Articles</title>
        <link rel="favicon" href="/favicon.ico" />
        <meta name="robots" content="noindex, max-snippet:0, noarchive, notranslate, noimageindex, unavailable_after: 2024-01-01"></meta>
      </Head>
      <div className={styles.header}>
        <h1>News</h1>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>

          <div className={styles.articlegrid}>
            {articles.map((article) => (
              <>
                <Link className={styles.atitle} href={`/articles/${article.id}`}>
                  <div className={styles.postcard}>
                    {article.expand.author?.avatar ? (
                      <img className={styles.avatar} src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/users/${article.expand.author?.id}/${article.expand.author?.avatar}?thumb=100x100`} aria-label={article.expand.author?.username} />
                    ) : (
                      <div className={styles.avatar} />
                    )}
                    <Link className={styles.atitle} href={`/articles/${article.id}`}>{article.title}</Link>
                    <span className={styles.datetime}>                      {article.published ? (new Date(article.created).toLocaleString()) : <h3 style={{ color: "#f63b3b" }}>Draft</h3>}
                    </span>
                    <div className={styles.imagepreview}>{article?.header_img && article.header_img.length > 5 ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/articles/${article.id}/${article?.header_img}`}
                        alt=""
                        width='400'
                        height='400'
                      />
                    ) : (
                      <div
                        className={styles.articleimg}
                        style={{
                          backgroundColor: "#ebebeb",
                        }}
                      ></div>
                    )}</div>


                  </div>
                </Link>
              </>
            ))}

          </div>
        </>
      )}
    </div>
  );
}