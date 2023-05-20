import Nav from '@/components/Nav'
import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Footer from '@/components/Footer';
import { register } from 'next-offline/runtime';
import { useEffect } from 'react';
export default function App({ Component, pageProps }) {
  useEffect(()=>{
    register('service-worker.js')
  })
  return (
    <>
      <ToastContainer position="top-left" />
      <Nav />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}
