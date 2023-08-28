import {
  Configuration,
  CreateImageRequestResponseFormatEnum,
  CreateImageRequestSizeEnum,
  OpenAIApi
} from "openai";
import fs from "fs";
import DBUtils from "./data.js";
import {config} from './config';
import axios from 'axios';

const configuration = new Configuration({
  apiKey: config.openai_api_key,
  basePath: config.api,
});
const openai = new OpenAIApi(configuration);

/**
 * Get completion from OpenAI
 * @param username
 * @param message
 */
async function chatgpt(username: string, message: string): Promise<string> {
    DBUtils.addUserMessage(username, message);
    const messages = DBUtils.getChatMessage(username);

    try {
        const response = await axios.post(config.fastgpt_api_endpoint, {
            chatId: username,
            messages: messages,
            detail: true
        }, {
            headers: {
                "Authorization": config.fastgpt_authorization,
                "apikey": config.fastgpt_api_key
            }
        });

        if (response.status === 200) {
            return response.data.choices[0].message?.content.replace(/^\\n+|\\n+$/g, "") as string;
        } else {
            console.error(`Error with FastGPT API. Status Code: ${response.status}, Status Text: ${response.statusText}`);
            return "Sorry, there was an error processing your request.";
        }
    } catch (error) {
        console.error("Error during FastGPT API call:", error);
        if (error.response) {
            // The request was made and the server responded with a status code outside of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request data:', error.request);
        } else {
            // Something happened in setting up the request and triggered an error
            console.error('Error message:', error.message);
        }
        return "Sorry, there was an error processing your request.";
    }
}

/**
 * Get image from Dall·E
 * @param username
 * @param prompt
 */
async function dalle(username:string,prompt: string) {
  const response = await openai.createImage({
    prompt: prompt,
    n:1,
    size: CreateImageRequestSizeEnum._256x256,
    response_format: CreateImageRequestResponseFormatEnum.Url,
    user: username
  }).then((res) => res.data).catch((err) => console.log(err));
  if (response) {
    return response.data[0].url;
  }else{
    return "Generate image failed"
  }
}

/**
 * Speech to text
 * @param username
 * @param videoPath
 */
async function whisper(username:string,videoPath: string): Promise<string> {
  const file:any= fs.createReadStream(videoPath);
  const response = await openai.createTranscription(file,"whisper-1")
    .then((res) => res.data).catch((err) => console.log(err));
  if (response) {
    return response.text;
  }else{
    return "Speech to text failed"
  }
}

export {chatgpt,dalle,whisper};
