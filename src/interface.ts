import {ChatCompletionRequestMessage} from "openai";

export interface IConfig {
  api?: string;
  openai_api_key: string;
  model: string;
  chatTriggerRule: string;
  disableGroupMessage: boolean;
  temperature: number;
  blockWords: string[];
  chatgptBlockWords: string[];
  chatPrivateTriggerKeyword: string;
  fastgpt_api_endpoint: string;
  fastgpt_api_key: string;
  fastgpt_authorization: string;

}
export interface User {
  username: string,
  chatMessage: Array<ChatCompletionRequestMessage>,
}
