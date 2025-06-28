import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class AiService {
  async sanitizeAndParseLabel(cleanedText: string) {
   

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Extract structured data from prescription instructions.',
          },
          {
            role: 'user',
            content: `Prescription: "${cleanedText}".\nReturn as JSON with keys: name, dosage, frequency, durationDays, quantity, refillCount.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const result = JSON.parse(response.data.choices[0].message.content);
    return result;
  }

}


