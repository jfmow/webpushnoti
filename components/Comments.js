import { useState, useEffect } from "react";
import PocketBase from 'pocketbase'
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);
import styles from '@/styles/Commen.module.css'
import { toast } from 'react-toastify';

export default function comments({ articleId }) {
    const [comments, setComments] = useState([])
    const [visibleComments, setVisibleComments] = useState(3);
    const [nextPage, setNextPage] = useState(1);
    const [expandedComments, setExpandedComments] = useState([]);
    const [hasSeenLikeWarning, sethasSeenLikeWarning] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentData, setCurrentData] = useState(null);
    const [repLoading, setRepLoading] = useState(false);


    useEffect(() => {
        async function fetchComments() {
            try {
                const orginalComments = await pb.collection('comments').getFullList({
                    sort: '-created', filter: `article = '${articleId}'`, expand: "commentor, replys.user"
                });

                const res = await fetch('/api/filtercomments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: orginalComments })
                });

                const filteredComment2 = await res.json();
                if (filteredComment2.error) {
                    return console.log(filteredComment2.error)
                }
                setComments(filteredComment2);
            } catch (error) {
                console.log(error)
            }
        }
        fetchComments()
    }, []);

    async function handleDisplayMoreComments() {
        try {
            const resultList = await pb.collection('comments').getList(nextPage, nextPage + 2, {
                sort: '-created', filter: `article = '${articleId}'`, expand: "commentor, replys.user"
            });

            const filteredList = resultList.items.filter(comment => {
                // Check if the comment id already exists in the comments list
                return !comments.some(prevComment => prevComment.id === comment.id);
            });

            setComments(prevComments => [...prevComments, ...filteredList]);
            setNextPage(prevPage => prevPage + 3);
            setVisibleComments(prevVisibleComments => prevVisibleComments + 3);
        } catch (error) {
            console.log(error)
        }
    }



    const [commentBody, setCommentBody] = useState("");


    const handleSubmit = async (event) => {
        event.preventDefault();
        //===Filter badwords===
        const res = await fetch('/api/filterword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commentBody })
        });
        const filteredComment = await res.json();
        if (filteredComment.error) {
            return toast.error(`${filteredComment.error}`)
        }

        // Add comment data to a FormData (not really necessary)
        const newCommentData = {
            "comment": filteredComment,
            "commentor": pb.authStore.model.id,
            "replys": "",
            "article": articleId
        };

        try {
            const response = await toast.promise(pb.collection('comments').create(newCommentData), {
                pending: 'Posting...',
                success: 'Comment saved successfully. 👌',
                error: 'Post failed 🤯'
            });
            //===Update the array of comments on the screen with the new comment===
            //add the user data to the new comment because its not returned with the response but is the curren users data...
            //...it does not have to be valid because it is not sent to the server
            response.expand.commentor = pb.authStore.model;
            //current comments on page
            const commentsCopy = [...comments];
            //add the new comment
            commentsCopy.unshift(response);
            setComments(commentsCopy);
            //set the comment textarea blank
            setCommentBody('');
        } catch (error) {
            console.log(error);
        }

    };

    const handleInputChange = (event) => {
        //===Get the data from the comment textarea and set it so it can be used when posting===
        setCommentBody(event.target.value);
    };

    async function handleLikeClick(commentData) {
        const record = await pb.collection('comments').getOne(commentData.id);
        if (commentData.likes.includes(pb.authStore.model.id)) {
            try {
                const likes = record.likes.filter(userId => userId !== pb.authStore.model.id);
                const data = { likes };
                const updatedLikes = await pb.collection('comments').update(commentData.id, data);
                setComments(prevComments => prevComments.map(comment => {
                  if (comment.id === commentData.id) {
                    return {
                      ...comment,
                      likes: updatedLikes.likes
                    };
                  }
                  return comment;
                }));
                return
              } catch (error) {
                console.log(error);
              }
          }
          
        try {
            const data = {
                "likes": [...record.likes, pb.authStore.model.id]
            };
            await pb.collection('comments').update(commentData.id, data);
            setComments(prevComments => prevComments.map(comment => {
                if (comment.id === commentData.id) {
                    return {
                        ...comment,
                        likes: [...record.likes, pb.authStore.model.id]
                    };
                }
                return comment;
            }));
        } catch (error) {
            console.log(error);
        }
    }


    const handleOpenModal = (data) => {
        //===Open the reply modal===
        setCurrentData(data); // set the current data item when the modal is opened
        setIsModalOpen(true);
        document.body.classList.add("modal-open")
    };
    const handleCloseModal = () => {
        //===Close the reply modal===
        setIsModalOpen(false);
        document.body.classList.remove("modal-open")
    };

    async function handleSubmitModal(inputValue) {
        //===Check if user is logged in and if so check if it is valid/make it valid===
        try {
            //if this authData fails the user isn't logged in
            const authData = await pb.collection('users').authRefresh();
            if (!pb.authStore.isValid) {
                toast.info('Must have a valid session/login to reply', {
                    position: toast.POSITION.TOP_RIGHT
                });
                return
            }
        } catch (error) {
            return toast.info('Must have a valid session/login to reply', {
                position: toast.POSITION.TOP_RIGHT
            });
        }

        //enable loader
        setRepLoading(true)

        //===Filter the replys body for language===
        const commentBody = inputValue
        const res = await fetch('/api/filterword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commentBody })
        });

        const filteredReply = await res.json();
        if (filteredReply.error) {
            return toast.error(`${filteredReply.error}`)
        }
        //===Create the new reply===
        const data = {
            replybody: filteredReply,
            user: pb.authStore.model.id,
            comment: currentData.id,
        };

        const response = await toast.promise(pb.collection('replys').create(data), {
            pending: 'Posting reply...',
            success: 'Reply posted',
            error: 'Failed to post reply'
        });

        //===Update the array of replys on the current comment (currentData.id)===
        const currentReplys = [...currentData.replys, response.id]; // add the new reply ID to the current replies array
        const newListOfReplys = { "replys": currentReplys };
        //Send the new array to the server
        pb.collection('comments').update(currentData.id, newListOfReplys)
        //===Update the current comments state var with the new reply===

        // Add a nested `user` property to the `expand` object with the value of `pb.authStore.model`
        // Set the response.expand.user to pb.authStore
        const replyToAdd = response;
        replyToAdd.expand.user = { ...pb.authStore.model };

        // Find the comment object that matches the ID you are looking for
        const commentToUpdate = comments.find(comment => comment.id === currentData.id);

        // Add the reply object to the `replys` array of the comment object// Add the reply object to the `replys` array of the comment object
        if (!commentToUpdate.expand.replys) {
            commentToUpdate.expand.replys = [];
        }
        commentToUpdate.expand.replys.push({ ...replyToAdd });


        //Update the current aray of comments with the new reply
        setComments(comments);
        setRepLoading(false);
    }

    async function handleDeleteComment(commentId) {
        // Send the delete req to the server with the commentId
        const response = await toast.promise(pb.collection('comments').delete(commentId), {
            pending: 'Processing...',
            success: 'Comment deleted successfully. 👌',
            error: 'Failed to delete comment 🤯'
        });
        //===this stage doesnt make a new request to the server to update the comment and just removes it from the array until reload on leaving oage==
        // Remove the comment with the specified ID from the comments array
        const filteredComments = comments.filter(comment => comment.id !== commentId);

        // Update the state with the filtered comments array
        setComments(filteredComments);
    }


    async function handeDeleteReply(replyId) {
        await toast.promise(pb.collection('replys').delete(replyId), {
            pending: 'Processing...',
            success: 'Reply deleted successfully. 👌',
            error: 'Failed to delete reply 🤯'
        });
        //remove the deleted comment from the array of comments on the page without requesting to the server
        const updatedComments = comments.map(comment => {
            const replys = comment.expand.replys ? comment.expand.replys.filter(reply => reply.id !== replyId) : [];
            return {
                ...comment,
                expand: {
                    ...comment.expand,
                    replys,
                },
            };
        });


        setComments(updatedComments);
    }



    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <span className={styles.title}>Comments</span>
                <div className={styles.commentgrid}>
                    {comments.slice(0, visibleComments).map((comment) => (
                        <div key={comment.id} className={styles.comments}>
                            <div className={styles.commentreact}>
                                <button disabled={pb.authStore.model?.id ? false: true}  onClick={() => handleLikeClick(comment)}>
                                    <svg fill="none" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                        <path fill={comment.likes.includes(pb.authStore.model?.id) ? '#f5356e' : '#707277'} stroke-linecap="round" stroke-width="2" stroke={comment.likes.includes(pb.authStore.model?.id) ? '#f5356e' : '#707277'} d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"></path>
                                    </svg>
                                </button>
                                <hr />
                                <span>{comment.likes.length}</span>
                                {pb.authStore.model?.id === comment.expand.commentor.id && (
                                    <>
                                        <hr />
                                        <button onClick={() => handleDeleteComment(comment.id)} className={styles.commentdelete} type="button" ><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M261 936q-24 0-42-18t-18-42V306h-11q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T190 246h158q0-13 8.625-21.5T378 216h204q12.75 0 21.375 8.625T612 246h158q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T770 306h-11v570q0 24-18 42t-42 18H261Zm106-176q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625 12.825 0 21.325-8.625T427 760V421q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T367 421v339Zm166 0q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625 12.825 0 21.325-8.625T593 760V421q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T533 421v339Z" /></svg></button>
                                    </>
                                )}
                            </div>
                            <div className={styles.commentcontainer}>
                                <div className={styles.user}>
                                    <div className={styles.icon}>
                                        {comment.expand.commentor.avatar ? (
                                            <img src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/users/${comment.expand.commentor?.id}/${comment.expand.commentor?.avatar}?thumb=100x100`} alt={`${comment.expand.commentor?.username || comment.commentor?.name}'s avatar`} />
                                        ) : (
                                            <span><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m792 973-78-77H190q-13 0-21.5-8.5T160 866v-64q0-38 19-65t49-41q60-27 115.5-42T455 637L82 264q-9-9-8.5-21t9.5-21q9-9 21.5-9t21.5 9l709 709q9 9 9 21t-9 21q-9 9-21.5 9t-21.5-9ZM220 836h434L515 697q-8-1-17-1h-18q-57 0-111 11.5T252 750q-14 7-23 21.5t-9 30.5v34Zm511-140q31 14 50 41t19 65v8L657 667q18 6 36.5 13.5T731 696ZM550 560l-48-48q30-7 49-31t19-56q0-38-26-64t-64-26q-32 0-56 19t-31 49l-48-48q19-38 55.5-59t79.5-21q63 0 106.5 43.5T630 425q0 43-21 79.5T550 560Zm104 276H220h434ZM448 457Z" /></svg></span>
                                        )}
                                    </div>
                                    <div className={styles.userinfo}>
                                        <span className={styles.nameverf}>{comment.expand.commentor?.username || comment.commentor?.name}<span className={styles.verfied}>{comment.expand.commentor?.verified ? (<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m332 972-62-106-124-25q-11-2-18.5-12t-5.5-21l14-120-79-92q-8-8-8-20t8-20l79-91-14-120q-2-11 5.5-21t18.5-12l124-25 62-107q6-10 17-14t22 1l109 51 109-51q11-5 22-1.5t17 13.5l63 108 123 25q11 2 18.5 12t5.5 21l-14 120 79 91q8 8 8 20t-8 20l-79 92 14 120q2 11-5.5 21T814 841l-123 25-63 107q-6 10-17 13.5t-22-1.5l-109-51-109 51q-11 5-22 1t-17-14Zm105-349-73-76q-9-10-22-10t-23 9q-10 10-10 23t10 23l97 96q9 9 21 9t21-9l183-182q9-9 9-22t-10-22q-9-8-21.5-7.5T598 463L437 623Z" /></svg>) : ("")}</span></span>
                                        <p>{(new Date(comment.created).toLocaleString())}</p>
                                    </div>
                                </div>
                                <p className={styles.commentcontent}>
                                    {comment.filtered ? (<h5 style={{ margin: '1em 0' }}>Comment filtered:</h5>) : ('')}
                                    {expandedComments.includes(comment.id) ? comment.comment : comment.comment.length <= 50 ? comment.comment : `${comment.comment.slice(0, 50)}...`}

                                </p>
                                {comment.comment.length > 50 && (
                                    <button onClick={() => setExpandedComments(prevExpandedComments => {
                                        if (prevExpandedComments.includes(comment.id)) {
                                            return prevExpandedComments.filter(id => id !== comment.id);
                                        } else {
                                            return [...prevExpandedComments, comment.id];
                                        }
                                    })}>
                                        {expandedComments.includes(comment.id) ? 'Collapse' : 'View full comment'}
                                    </button>

                                )}
                            </div>

                            <div className={styles.replycontainer}>
                                {comment.expand.replys && comment.expand.replys.length > 0 && (
                                    <h3>Replys:</h3>
                                )}
                                <div className={styles.commentreplys}>
                                    {comment.expand.replys?.map((repl) => (
                                        <>
                                            <div className={styles.reply}>

                                                <div className={styles.replyinfo}>

                                                    <div className={styles.replyuserinfo}>

                                                        {repl.expand.user.avatar ? (
                                                            <img className={styles.replyavatar} src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/users/${repl.expand.user?.id}/${repl.expand.user?.avatar}?thumb=100x100`} alt={`${repl.expand.user?.username || repl.expand.user?.name}'s avatar`} />
                                                        ) : (
                                                            <span className={styles.replyavataralt}><svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 96 960 960" width="48"><path d="m792 973-78-77H190q-13 0-21.5-8.5T160 866v-64q0-38 19-65t49-41q60-27 115.5-42T455 637L82 264q-9-9-8.5-21t9.5-21q9-9 21.5-9t21.5 9l709 709q9 9 9 21t-9 21q-9 9-21.5 9t-21.5-9ZM220 836h434L515 697q-8-1-17-1h-18q-57 0-111 11.5T252 750q-14 7-23 21.5t-9 30.5v34Zm511-140q31 14 50 41t19 65v8L657 667q18 6 36.5 13.5T731 696ZM550 560l-48-48q30-7 49-31t19-56q0-38-26-64t-64-26q-32 0-56 19t-31 49l-48-48q19-38 55.5-59t79.5-21q63 0 106.5 43.5T630 425q0 43-21 79.5T550 560Zm104 276H220h434ZM448 457Z" /></svg></span>
                                                        )}
                                                        <h4>{repl.expand.user.username}</h4>
                                                        <div className={styles.replyreact}>
                                                            {pb.authStore.model?.id === repl.expand.user.id && (
                                                                <>
                                                                    <button onClick={() => handeDeleteReply(repl.id)} className={styles.commentdelete} type="button" ><svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M261 936q-24 0-42-18t-18-42V306h-11q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T190 246h158q0-13 8.625-21.5T378 216h204q12.75 0 21.375 8.625T612 246h158q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T770 306h-11v570q0 24-18 42t-42 18H261Zm106-176q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625 12.825 0 21.325-8.625T427 760V421q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T367 421v339Zm166 0q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625 12.825 0 21.325-8.625T593 760V421q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T533 421v339Z" /></svg></button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p>{(new Date(repl.created).toLocaleString())}</p>

                                                </div>
                                                <p>{repl.replybody}</p>
                                            </div>
                                        </>
                                    ))}
                                    {repLoading === comment.id ? ('Posting') : ('')}
                                </div>
                                <div><button className={styles.replytbn} onClick={() => handleOpenModal(comment)}>Reply</button>
                                    <Modal
                                        isOpen={isModalOpen && currentData && currentData.id === comment.id}
                                        onClose={handleCloseModal}
                                        onSubmit={handleSubmitModal}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {visibleComments < comments.length && (
                        <button onClick={handleDisplayMoreComments} className={styles.loadmorebtn}>Load more</button>

                    )}
                </div>
                {pb.authStore.isValid ? (
                    <div className={styles.textbox}>
                        <div className={styles.boxcontainer}>
                            <form onSubmit={handleSubmit} onChange={handleInputChange}>
                                <textarea placeholder="Comment..." value={commentBody}></textarea>
                                <div>
                                    <div className={styles.formatting}>
                                        <button type="submit" className={styles.send} title="Send">
                                            <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                                                <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#ffffff" d="M12 5L12 20"></path>
                                                <path stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" stroke="#ffffff" d="M7 9L11.2929 4.70711C11.6262 4.37377 11.7929 4.20711 12 4.20711C12.2071 4.20711 12.3738 4.37377 12.7071 4.70711L17 9"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : ("")}

            </div>
        </div>
    )
}



const Modal = ({ isOpen, onClose, onSubmit }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
        onClose();
    };

    if (!isOpen) {
        return ("")
    }

    return (
        <div className={`${styles.modal} ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div className={styles.modalcontent}>
                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <div className={styles.repinput}>
                            <textarea
                                className={styles.modalinput}
                                type="text"
                                placeholder="enter reply here"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.isgrouped}>
                        <div className="control">
                            <button className={styles.replytbn} type="submit">
                                reply
                            </button>
                        </div>
                        <div className="control">
                            <button className={styles.replytbn} onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
