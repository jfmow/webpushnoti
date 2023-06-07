import PocketBase from "pocketbase";
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETURL);
pb.autoCancellation(false);

export default async function handler(request, response) {
    //if (request.method != 'POST') {
    //    return response.status(405).send('Method not allowed');
    //}
    const inputText = request.body.commentBody.replace('\\r\\n', '');
    if (!inputText) {
        return response.status(400).json({ error: "No input text provided" });
    }

    // Split the input text into words
    const words = inputText.split(" ");
    const toxicity = require("@tensorflow-models/toxicity");
    await toxicity.load().then(async (model) => {
        const sentences = words;
        const predictions = await model.classify(sentences);
        console.log(predictions);

        // Check if any prediction has a match
        const hasMatch = predictions.some(prediction => prediction.results.some(result => result.match));

        if (hasMatch) {
            console.log(sentences);
            return response.status(406).json({ error: 'Your comment was flagged as harmful! Please refrain from using that type of language!' });
        } else {
            return response.status(200).json(inputText);
        }
    });


    // Loop through each word and check if it's in the profanity word list
    
    
    


}
