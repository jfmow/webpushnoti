import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Image from '@editorjs/image';
import AttachesTool from '@editorjs/attaches';
import PocketBase from "pocketbase";
import { toast } from "react-toastify";
import Compressor from 'compressorjs';
import styles from '@/styles/Create.module.css'
import Head from 'next/head';
import Link from 'next/link';
import Image2 from 'next/image';


const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);

import { useRef, useEffect, useState } from 'react';
import Loader from './Loader';

function Editor(articleId) {
    const editorRef = useRef(null);
    const [editor, setEditor] = useState(null);
    const [editorData, setEditorData] = useState({});
    const [isError, setError] = useState(false)
    const [articleTitle, setArticleTitle] = useState('')
    const [isPublished, setIsPublished] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [articleHeader, setArticleHeader] = useState(null)
    const [isLoading, setIsLoading] = useState(true);
    const [currentAuthor, setAuthor] = useState('');

    useEffect(() => {
        if (articleId.articleId) {
            async function fetchArticles() {
                try {
                    const record = await pb.collection('articles').getOne(articleId.articleId, {
                        expand: 'author',
                    });
                    if (!pb.authStore.model.admin) {
                        if (pb.authStore.model.id != record.author) {
                            toast.warning("You can't edit this article!")
                            setError(true)
                            return
                        }
                    }
                    setAuthor(record.author)
                    setEditorData(record.body);
                    setArticleTitle(record.title);
                    setIsPublished(record.published)
                    setArticleHeader(record.header_img)

                } catch (error) {
                    toast.error('Could not get article data! Please do not attempt to save it', {
                        position: toast.POSITION.TOP_LEFT,
                    });
                    setError(true)
                }

            }
            fetchArticles();
        } else {
            setError(true)
            setIsLoading(false)
        }
    }, [articleId.articleId]);

    useEffect(() => {
        if (editorRef.current && (editorData == null || Object.keys(editorData).length > 0)) {
            const editor = new EditorJS({
                holder: editorRef.current,
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                    },
                    attaches: {
                        class: AttachesTool,
                        config: {
                            /**
                             * Custom uploader
                             */
                            uploader: {
                                /**
                                 * Upload file to the server and return an uploaded image data
                                 * @param {File} file - file selected from the device or pasted by drag-n-drop
                                 * @return {Promise.<{success, file: {url}}>}
                                 */
                                uploadByFile(file) {
                                    console.log(file)
                                    // your own uploading logic here
                                    async function upl(file) {
                                        const formData = new FormData();
                                        formData.append('file_data', file);
                                        formData.append('uploader', pb.authStore.model.id);
                                        const response = await toast.promise(
                                            pb.collection("videos").create(formData),
                                            {
                                                pending: "Saving img...",
                                                success: "Saved successfuly. 📁",
                                                error: "failed 🤯",
                                            }
                                        );
                                        function getFileExtension(file) {
                                            const filename = file.name;
                                            const extension = filename.split('.').pop();
                                            return extension;
                                        }
                                        const extension = getFileExtension(file);
                                        return {
                                            success: 1,
                                            file: {
                                                extension: extension,
                                                url: `${process.env.NEXT_PUBLIC_POCKETURL}/api/files/videos/${response.id}/${response.file_data}`,
                                            }
                                        };
                                    };
                                    return upl(file);
                                },
                            }
                        }
                    },
                    table: {
                        class: Table,
                        inlineToolbar: true,
                    },
                    image: {
                        class: Image,
                        inlineToolbar: true,
                        config: {
                            /**
                             * Custom uploader
                             */
                            uploader: {
                                /**
                                 * Upload file to the server and return an uploaded image data
                                 * @param {File} file - file selected from the device or pasted by drag-n-drop
                                 * @return {Promise.<{success, file: {url}}>}
                                 */
                                uploadByFile(file) {
                                    // your own uploading logic here
                                    async function upl(file) {
                                        const formData = new FormData();
                                        const compressedFile = await toast.promise(
                                            new Promise((resolve, reject) => {
                                                new Compressor(file, {
                                                    quality: 1,
                                                    // Set the quality of the output image to a high value
                                                    maxWidth: 2000, // Limit the maximum width of the output image to 1920 pixels
                                                    maxHeight: 2000, // Limit the maximum height of the output image to 1920 pixels
                                                    mimeType: "image/webp",
                                                    maxSize: 3 * 1024 * 1024,

                                                    // The compression process is asynchronous,
                                                    // which means you have to access the `result` in the `success` hook function.
                                                    success(result) {
                                                        resolve(result);
                                                    },
                                                    error(err) {
                                                        reject(err);
                                                    },
                                                });
                                            }),
                                            {
                                                pending: "Compressing img's... 📸",
                                                error: "failed 🤯",
                                            }
                                        );
                                        formData.append('file_data', compressedFile);
                                        formData.append('uploader', pb.authStore.model.id);
                                        const response = await toast.promise(
                                            pb.collection("imgs").create(formData),
                                            {
                                                pending: "Saving img...",
                                                success: "Saved successfuly. 📁",
                                                error: "failed 🤯",
                                            }
                                        );
                                        return {
                                            success: 1,
                                            file: {
                                                url: `${process.env.NEXT_PUBLIC_POCKETURL}/api/files/imgs/${response.id}/${response.file_data}`,
                                            }
                                        };
                                    };
                                    return upl(file);
                                },
                            },
                        },
                    },
                },
                placeholder: 'Write something...',

                data: editorData,
            });
            setEditor(editor);
        }
        setIsLoading(false)


    }, [editorData]);

    const handleSave = async () => {
        if (!articleHeader || !selectedFile) {
            toast.warning('A header image will be required to publish the article.')
        }
        if (!editor) { return; }
        if (!articleTitle) { return }
        const saveingProgressToast = toast.loading("Saving...", { position: toast.POSITION.BOTTOM_RIGHT })
        const savedData = await editor.save();

        let formData = new FormData();
        if (selectedFile) {
            try {
                const compressedFile = await toast.promise(
                    new Promise((resolve, reject) => {
                        new Compressor(selectedFile, {
                            quality: 0.9,
                            mimeType: "image/webp",
                            maxSize: 4 * 1024 * 1024,
                            success(result) {
                                resolve(result);
                            },
                            error(err) {
                                reject(err);
                            },
                        });
                    }),
                    {
                        pending: "Compressing img's... 📸",
                        error: "failed 🤯",
                    }
                );
                formData.append("header_img", compressedFile);
                if (compressedFile.size > 4508876.8) {
                    return toast.error('Compresed file too big!')
                }
            } catch (error) {
                toast.error('Error uploading header img', {
                    position: toast.POSITION.TOP_LEFT,
                });

            }
        }

        formData.append("title", articleTitle);
        formData.append("body", JSON.stringify(savedData));
        formData.append("author", currentAuthor);
        formData.append("published", isPublished);

        const record = await pb.collection("articles").update(articleId.articleId, formData);
        window.location.replace(`/articles/${record.id}`)
        toast.update(saveingProgressToast, { render: "Saved!", type: "success", isLoading: false });
    };

    async function handleDeleteArticle() {
        await pb.collection('articles').delete(articleId.articleId);
        return window.location.replace('/editor')
    }


    if (isError) {
        return (<div>
            <Head>
                <title>Whoops!</title>
                <link rel="favicon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Titillium+Web&display=swap" rel="stylesheet"></link>
            </Head>
            <div className={styles.containererror}>
                <h1>Article not found!</h1>
                <Link href="/">
                    <button className={styles.backbutton}>
                        <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024"><path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path></svg>
                        <span>Back</span>
                    </button></Link>
            </div>
        </div>)
    }

    const handleInputChange = (event) => {
        if (event.target.name === "articleTitle") {
            setArticleTitle(event.target.value);
        } else {
            const file = event.target.files[0];

            if (file.size > 20000000) {
                toast.error("File is to large! Must be less than 20mb", {
                    position: toast.POSITION.TOP_CENTER,
                });
            } else {
                setSelectedFile(file);
                document.getElementById("fileInputName").textContent = file.name;
            }
        }
    };

    const buttonClass = isPublished ? styles.pubbutton : styles.draftbutton;
    function adminPublishArticle() {
        try {
            if (isPublished == true) {
                setIsPublished(false);
            } else {
                if (selectedFile || articleHeader) {
                    setIsPublished(true);

                } else {
                    return toast.error('Header image required!')
                }

            }
        } catch (error) {
            toast.error('Could not update published state.', {
                position: toast.POSITION.TOP_LEFT,
            });
        }
    }

    if (isLoading) {
        return <Loader />
    }

    return <div className={styles.container}>
        <div className={styles.title}>
            {articleHeader &&
                <Image2 width='1400' height='300' src={`${process.env.NEXT_PUBLIC_POCKETURL}/api/files/articles/${articleId.articleId}/${articleHeader}`} alt="Article header image" />
            }<div className={styles.headerstuff}>
                <h1>{articleTitle || "unknown"}</h1>
                <h4>Author: not displayed on edit screen</h4>
                <p>On the: not displayed on edit screen</p>
            </div>
        </div>
        <div className={styles.creategrid}>
            <div className={styles.specialinputs}>
                <input
                    className={styles.titleinput}
                    type="text"
                    name="articleTitle"
                    value={articleTitle}
                    onChange={handleInputChange}
                    placeholder="Article title (used only for metadata)"
                />
            </div>
            <div ref={editorRef} />
            <div className={styles.formbuttons}>
                <button
                    onClick={adminPublishArticle}
                    type="button"
                    className={`${styles.submitbutton} ${buttonClass}`}>{isPublished ? (<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="m828.334 1019.33-116-115.997Q663 938 604.5 957T480 976q-84.333 0-157.333-30.833-73-30.834-127-84.834t-84.834-127Q80 660.333 80 576q0-66 19-124.5t53.667-107.834L26.333 217.333 74 169.666l802 802.001-47.666 47.663ZM480 909.334q51.667 0 97.834-14.334 46.167-14.333 86.167-40L494.334 685.333 422 758.667 255.333 591.333 304 542.667l118 118 23.667-24L201 391.999q-25.667 40-40 86.167-14.334 46.167-14.334 97.834 0 141 96.167 237.167T480 909.334ZM807.666 808l-48.333-48.333q25.667-39.666 39.834-85.833 14.167-46.167 14.167-97.834 0-141-96.167-237.167T480 242.666q-51.667 0-97.834 14.167t-85.833 39.834L248 248.334Q297.333 214 355.833 195T480 176q83.667 0 156.667 31.167 73 31.166 127 85.166t85.166 127Q880 492.333 880 576q0 65.667-19 124.167T807.666 808Zm-217-218-49.333-48.666 114-114.001L704.667 476 590.666 590ZM528 528Zm-95.333 95.333Z"/></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M446.667 896V539.999L332 654.666l-47.333-48L480 411.333l195.333 195.333-47.333 48-114.667-114.667V896h-66.666ZM160 458V322.666q0-27 19.833-46.833T226.666 256h506.668q27 0 46.833 19.833T800 322.666V458h-66.666V322.666H226.666V458H160Z"/></svg>)}</button>
                <button className={styles.submitbutton} type="button" onClick={handleSave}>
                <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M840 374v495.334q0 27-19.833 46.833T773.334 936H186.666q-27 0-46.833-19.833T120 869.334V282.666q0-27 19.833-46.833T186.666 216H682l158 158Zm-66.666 29.333L652.667 282.666H186.666v586.668h586.668V403.333ZM479.843 812.667q45.49 0 77.49-31.844 32-31.843 32-77.333 0-45.49-31.843-77.49-31.843-31.999-77.333-31.999-45.49 0-77.49 31.843-32 31.843-32 77.333 0 45.49 31.843 77.49 31.843 32 77.333 32ZM235.333 480H594V331.333H235.333V480Zm-48.667-76.667v466.001-586.668 120.667Z"/></svg>
                </button>
                <div
                    className={`${styles.submitbutton}`}
                >
                    <label class={styles.customfileupload}>
                        <input
                            type="file"
                            name="file"
                            id="fileInput"
                            accept="image/*"
                            className={styles.finput}
                            onChange={handleInputChange}
                        />
                        <p id="fileInputName"><svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="M146.666 896q-27 0-46.833-19.833T80 829.334V322.666q0-27 19.833-46.833T146.666 256h666.668q27 0 46.833 19.833T880 322.666v506.668q0 27-19.833 46.833T813.334 896H146.666Zm0-66.666h666.668V405.333H146.666v424.001Z"/></svg></p>
                    </label>
                </div>
                <button className={styles.submitbutton} type="button" onClick={handleDeleteArticle}>
                <svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 96 960 960" width="40"><path d="m366 756.667 114-115.334 114.667 115.334 50-50.667-114-115.333 114-115.334-50-50.667L480 540 366 424.666l-50.667 50.667L430 590.667 315.333 706 366 756.667ZM267.333 936q-27 0-46.833-19.833t-19.833-46.833V315.999H160v-66.666h192V216h256v33.333h192v66.666h-40.667v553.335q0 27-19.833 46.833T692.667 936H267.333Zm425.334-620.001H267.333v553.335h425.334V315.999Zm-425.334 0v553.335-553.335Z"/></svg>
                </button>
            </div>
        </div>
    </div>;
}

export default Editor;




