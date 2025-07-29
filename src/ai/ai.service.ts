
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AzureOpenAI } from "openai";


@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name); // Add a logger for better debugging
  private readonly endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  private readonly apiKey = process.env.AZURE_OPENAI_API_KEY;
  private readonly apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  private readonly deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  private readonly openai = new AzureOpenAI({ endpoint: this.endpoint, apiKey: this.apiKey, apiVersion: this.apiVersion, deployment: this.deployment });
  async askAi(aiPrompt: string, userPrompt: string): Promise<any> { // Change return type to any, as parsing happens in OcrService
    try {
      this.logger.debug('Calling OpenAI API...');
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4', // Using gpt-4 as specified
          messages: [
            {
              role: 'developer',
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


    public async callAiParser(sanitized: string) {
    const systemPrompt = `
You are a medication parser. Given a scanned label text, extract JSON:
{ name: string, dosage: string, quantity?: number,
  instructions?: string, therapy?: string,
Return ONLY valid JSON. No explanation.
`.trim();

    const userPrompt = `Label text:\n"""\n${sanitized}\n"""`;

    this.logger.debug('Sending sanitized text to OpenAI...');
    return this.askAi(systemPrompt, userPrompt);
  }


  public   validateMedicationData(data: any): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Check if data is an object
    if (!data || typeof data !== 'object') {
        errors.push({
            field: 'data_structure',
            message: 'Invalid medication data structure returned by AI'
        });
        return errors;
    }

    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push({
            field: 'name',
            message: 'Medication name is required'
        });
    }

    // Validate schedule if present
    if (data.schedule) {
        if (!data.schedule.repeatPattern || !data.schedule.times || !Array.isArray(data.schedule.times)) {
            errors.push({
                field: 'schedule',
                message: 'Invalid schedule format in medication data'
            });
        }

        if (data.schedule.times && data.schedule.times.length === 0) {
            errors.push({
                field: 'schedule.times',
                message: 'Schedule times cannot be empty'
            });
        }
    }

    // Validate dosage format if present
    if (data.dosage && typeof data.dosage !== 'string') {
        errors.push({
            field: 'dosage',
            message: 'Dosage must be a string'
        });
    }

    // Validate quantity if present
    if (data.quantity && (!Number.isInteger(data.quantity) || data.quantity <= 0)) {
        errors.push({
            field: 'quantity',
            message: 'Quantity must be a positive integer'
        });
    }

    return errors;
}
}
