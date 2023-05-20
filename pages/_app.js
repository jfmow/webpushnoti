import '@/styles/globals.css'
import { useEffect } from 'react'
import { register } from 'next-offline/runtime';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
