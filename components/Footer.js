import styles from '@/styles/Footer.module.css'
import Link from 'next/link';

export default function Footer() {
    return (
        <div className={styles.container}>
            <div className={styles.footer}>
                <div className={styles.credits}>
                    <h3>Credits</h3>
                    <ul>
                        <li>Database: <Link href='https://pocketbase.io'>Pocketbase</Link></li>
                        <li>Github page: <Link href='https://github.com/jfmow'>jfmow</Link></li>
                    </ul>
                </div>
                <div>
                    <Link href='/disclamer'>Disclamer</Link>
                </div>
                <div className={styles.credits}>
                    <h3>Legal</h3>
                    <ul>
                        <Link href='/privacypolicy'><li>Privacy policy</li></Link>
                        <Link href='/termsandconditions'><li>Terms and Conditions</li></Link>
                    </ul>
                </div>
                <div className={styles.credits}>
                    <h3>Packages used</h3>
                    <ul>
                        <li><Link href='/tools'>View here</Link></li>
                        <li></li>
                    </ul>
                </div>
                <div className={styles.credits}>
                    <h3>Other sites</h3>
                    <ul>
                        <li><Link href='https://jamesmowat.com'>Jamesmowat</Link></li>
                        <li><Link href='https://gallery.jamesmowat.com'>Gallery</Link></li>
                    </ul>
                </div>
                <div className={styles.credits}>
                    <h3>My other domains</h3>
                    <ul>
                        <li>suddsy.dev</li>
                        <li>sudsy.dev</li>
                        <li>jamesmowat.com</li>
                        <li>pi5.dev</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

