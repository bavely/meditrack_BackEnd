// import { Injectable , Logger} from '@nestjs/common';
// import axios from 'axios';
// @Injectable()
// export class AiService {
//   async askAi(aiPrompt: string, userPrompt: string) {
   

//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-4',
//         messages: [
//           {
//             role: 'system',
//             content: aiPrompt,
//           },
//           {
//             role: 'user',
//             content: userPrompt,
//           },
//         ],
//         response_format: { type: "json_object" }, 
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         },
//       }
//     );

//     const result = JSON.parse(response.data.choices[0].message.content);
//     return result;
//   }

// }


import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import OpenAI from 'openai';


@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name); // Add a logger for better debugging
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  async askAi(aiPrompt: string, userPrompt: string): Promise<any> { // Change return type to any, as parsing happens in OcrService
    try {
      this.logger.debug('Calling OpenAI API...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4', // Using gpt-4 as specified
          messages: [
            {
              role: 'system',
              content: aiPrompt, // System prompt for AI's role and expected output format
            },
            {
              role: 'user',
              content: userPrompt, // User's specific input for parsing
            },
          ],
      });

      console.log(response, 'response from openai');

      // Check if the response structure is as expected
      if (response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        this.logger.debug(`Raw content from OpenAI: ${content}`);
        // With response_format: "json_object", the content should be parseable JSON
        // The JSON.parse will now be handled more safely in OcrService with try/catch
        return content; // Return raw content string to OcrService for parsing
      } else {
        this.logger.error('OpenAI API returned an unexpected response structure:', response);
        throw new Error('OpenAI API returned an unexpected response structure.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Error calling OpenAI API: ${error.message}`);
        if (error.response) {
          this.logger.error(`OpenAI API response status: ${error.response.status}`);
          this.logger.error(`OpenAI API response data: ${JSON.stringify(error.response.data)}`);
          throw new Error(`OpenAI API error: ${error.response.data.error?.message || 'Unknown error'}`);
        }
      } else {
        this.logger.error(`An unexpected error occurred: ${error.message || error}`);
      }
      throw new Error('Failed to get a valid response from the AI service.');
    }
  }
}
