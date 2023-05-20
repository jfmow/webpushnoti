
import Head from 'next/head';
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react';
import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);
import Link from 'next/link';
import Loader from '@/components/Loader';
import Image from 'next/image';

export default function Home({ data }) {

  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [author, setAuthor] = useState([]);
  useEffect(() => {
    async function authUpdate() {
      try {
        const authData = await pb.collection('users').authRefresh();
      } catch (error) {
        pb.authStore.clear()
      }
      if (!pb.authStore.isValid) {
        pb.authStore.clear()
      }
    }
    authUpdate()
    async function fetchArticles() {
      try {
        //const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        //await delay(5000);
        console.log(data.split('@'))
        const data3 = await pb.collection('users').getFirstListItem(`username="${data.split('@')[1]}"`);
        setAuthor(data3)
        const data2 = await pb.collection('articles').getFullList(200 /* batch size */, {
          sort: '-created', filter: `author = '${data3.id}'`
        });
        setArticles(data2);
        console.log(data2);
        setIsLoading(false);
      } catch (error) {
        console.log(error)
        setIsLoading(false);
      }
    }
    fetchArticles()
    // Subscribe to all events on the 'gallery' collection
  }, []);
  if (isLoading) {
    return (<Loader />)
  }
  return (
    <div>
      <Head>
        <title>Articles by {author?.username}</title>
        <link rel="favicon" href="/favicon.ico" />
        <meta name="robots" content="noindex"></meta>
      </Head>
      <div className={styles.header_indi}>
      <span className={styles.authicon}><h1>{author?.username || "unknown"}</h1><img src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/users/${author.id}/${author.avatar}?thumb=100x100`} /></span>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>

          <div className={styles.articlegrid}>
            {articles.map((article) => (
              <>
                <Link className={styles.atitle} href={`/articles/${article.id}`}>
                  <div className={styles.postcard}>
                    {article.expand.author?.avatar ? (
                      <img className={styles.avatar} src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/users/${article.expand.author?.id}/${article.expand.author?.avatar}?thumb=100x100`} />
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
  )
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      data: params.userat,
    },
  };
}
