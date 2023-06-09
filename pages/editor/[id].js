import Loader from '@/components/Loader';
import dynamic from 'next/dynamic';
import PocketBase from 'pocketbase'
import { useEffect, useState } from 'react';
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);

const Editor = dynamic(() => import('../../components/Editor'), {
  ssr: false,
});
function NotionEditor({arti}) {
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      async function authUpdate() {
        try {
          const authData = await pb.collection('users').authRefresh();
          if (!pb.authStore.isValid) {
            pb.authStore.clear();
            return window.location.replace("/auth/login");
          }
          if(!authData.record?.admin && !authData.record?.authored){
            return window.location.replace('/')
          } else{
            setIsLoading(false)
          }
        } catch (error) {
          pb.authStore.clear();
          return window.location.replace('/auth/login');
        }
        
      }
      authUpdate()
    },[])
    if(isLoading){
        return(<Loader/>)
    }
  return (
    <div>
      <Editor articleId={arti.article} />
    </div>
  );
}

export default NotionEditor;

export async function getServerSideProps({ params }) {
  return {
      props: {
          arti: { article: params.id },
      },
  };
}
