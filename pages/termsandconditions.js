import Loader from '@/components/Loader'
import dynamic from 'next/dynamic'
const Tc = dynamic(() => import('@/components/Termsandconditions'), {
    ssr: false, loading: () => <Loader/>,
})
export default function TandCPage(){
    function closE(){
        return window.location.replace('/')
    }
    return(
        <Tc isOpen={true} onClose={closE}/>
    )
}