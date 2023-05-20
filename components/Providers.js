"use client";
import PocketBase from 'pocketbase'
import React, { useState, useEffect } from 'react';
import styles from '@/styles/Auth.module.css'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false)
async function loadLinks() {
  pb.autoCancellation(false)
    const authMethods = await pb.collection('users').listAuthMethods({ '$autoCancel': false });
    const providers = authMethods.authProviders
    console.log(providers)
    providers.forEach(provider => {
        localStorage.setItem('provider', JSON.stringify(provider));
      });
    return {providers}
}

function Provide() {
  const [data, setData] = useState(null);
  const redirectUrl = process.env.NEXT_PUBLIC_POCKET_URL_REDIRECT;

  useEffect(() => {
    async function fetchData() {
      const result = await loadLinks();
      setData(result);
    }
    fetchData();
  }, []);
  if(data == null){
    return <p>OAuth loading</p>
  }
  return (
    <>
        {data.providers.map((item, index) => {
          return (
            <a
              href={item.authUrl + redirectUrl}
              key={item.name}
              label={item.name}
              border={'1px solid'}
              padding={'2%'}
              textSize={'1.2 rem'}
              onClick={() => startLogin(item)}
              className={styles.obtn}
            >{item.name}</a>
          );
        })}
        </>
  );
}

export default Provide;