import Loader from '@/components/Loader'
import dynamic from 'next/dynamic'
const Pp = dynamic(() => import('@/components/PrivacyPolicy'), {
    ssr: false, loading: () => <Loader/>,
})

export default function TandCPage(){
    function closE(){
        return window.location.replace('/')
    }
    return(
        <Pp isOpen={true} onClose={closE}/>
    )
}