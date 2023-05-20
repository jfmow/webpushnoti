import styles from '@/styles/Legal.module.css'
import Link from 'next/link'
export default function disclamer() {
    return (
        <>

            <div className={styles.container}>
                <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1em'}}>
                <Link href='/' style={{color: 'blue', textDecoration: 'underline'}}>Home</Link>
                <Link href='/privacypolicy' style={{color: 'blue', textDecoration: 'underline'}}>Privacy policy</Link>
                <Link href='/termsandconditions' style={{color: 'blue', textDecoration: 'underline'}}>Terms and Conditions</Link>
                </div>
                <h2>

                    Disclaimer:

                    The information provided on this public news site ("Site") is for general informational purposes only. The articles and content on this Site are not actively moderated and may contain false or inaccurate information. Visitors to this Site are advised to exercise their own judgment and discretion while relying on any information presented herein.

                    It is important to note that the articles and content on this Site may not be up to date or comprehensive. Laws, regulations, and circumstances can change, and the information provided may become outdated or inaccurate. Therefore, users should not solely rely on the information found on this Site and should seek professional legal advice or other appropriate sources to verify and validate the accuracy and applicability of any information before making any decisions or taking any actions.

                    This Site may contain links to external websites or resources that are beyond our control. We do not endorse, guarantee, or take responsibility for the accuracy, completeness, or reliability of the information provided on any external websites linked from this Site.

                    To the fullest extent permitted by the laws of New Zealand, we, as the site host, disclaim any liability or responsibility for any loss, damage, or injury incurred by users of this Site or any third party resulting from the use, reliance, or interpretation of the information provided herein. This includes, but is not limited to, any direct, indirect, consequential, or incidental damages, whether arising from negligence, breach of contract, defamation, or any other cause of action.

                    Please be aware that the laws and regulations referenced in the articles on this Site are subject to change. It is always advisable to consult the latest legislation or seek legal counsel to ensure compliance with the most current laws.

                    By using this Site, you acknowledge that you have read, understood, and agree to be bound by this disclaimer. If you do not agree with any part of this disclaimer, please refrain from using this Site.

                    This disclaimer shall be governed by and construed in accordance with the laws of New Zealand, and any disputes arising from the use of this Site shall be subject to the exclusive jurisdiction of the courts of New Zealand.

                </h2>
                <br/>
                <h1>Takedowns</h1>
                <h3>
                    To request a takedown of any content or report copyright infringement, we provide the following options:

                    Article Report Button: If you believe that an article contains false or inaccurate information, or infringes upon your rights, please utilize the Article Report button, typically located near the article or at the bottom of the page. Clicking on this button will enable you to submit a report detailing the specific issue with the article.

                    Contact Email: Alternatively, you may contact us directly via email at help@jamesmowat.com. Please provide the following information in your email:

                    Your full name and contact information.
                    The specific article or content in question, including relevant URLs or other identifying details.
                    A detailed explanation of the issue, including why you believe it violates your rights or contains false/inaccurate information.
                    Any supporting documentation or evidence that substantiates your claim.
                    We will make reasonable efforts to promptly review and respond to all takedown requests and copyright infringement claims submitted through the provided channels. However, please note that we reserve the right to assess the validity and applicability of each request in accordance with applicable laws and regulations.

                    By utilizing the Article Report button or contacting us via email, you acknowledge that you understand and agree to provide accurate and complete information to facilitate the resolution of your request.

                    Please be aware that we may require additional information or documentation to process your request and that our response does not constitute legal advice or a guarantee of compliance with your request.

                    Thank you for your cooperation and understanding.
                </h3>
            </div>

        </>
    )
}