import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { ParselabelResponse } from './dto/ai-label-response';

@Resolver()
export class AiResolver {
    private readonly logger = new Logger(AiService.name);
    constructor(private readonly aiService: AiService) {}

    @Mutation(() => ParselabelResponse)
    async parseMedicationLabel(@Args('label') label: string): Promise<ParselabelResponse> {
        try {
            this.logger.debug(`Parsing medication label: ${label.slice(0, 100)}...`);
            
            // Validate input
            if (!label || label.trim().length === 0) {
                return {
                    success: false,
                    errors: [
                        {
                            field: 'label',
                            message: 'Label text is required and cannot be empty'
                        }
                    ],
                    data: {
                        name: '',
                        dosage: '',
                        quantity: '',
                        instructions: '',
                        therapy: ''
                    }
                };
            }

            // Call AI service
            const result = await this.aiService.callAiParser(label);
            this.logger.debug(`AI parser result: ${result}`);

            // Validate that we got a response
            if (!result) {
                return {
                    success: false,
                    errors: [
                        {
                            field: 'ai_service',
                            message: 'AI service returned no response'
                        }
                    ],
                    data: {
                        name: '',
                        dosage: '',
                        quantity: '',
                        instructions: '',
                        therapy: ''
                    }
                };
            }

            // Try to parse JSON to validate it's proper JSON
            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
            } catch (parseError) {
                this.logger.error(`Failed to parse AI response as JSON: ${parseError.message}`);
                return {
                    success: false,
                    errors: [
                        {
                            field: 'ai_response',
                            message: 'AI service returned invalid JSON format'
                        }
                    ],
                    data: {
                        name: '',
                        dosage: '',
                        quantity: '',
                        instructions: '',
                        therapy: ''
                    }
                };
            }

            // Validate required fields in the parsed result
            const validationErrors = this.aiService.validateMedicationData(parsedResult);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    errors: validationErrors,
                    data: {
                        name: '',
                        dosage: '',
                        quantity: '',
                        instructions: '',
                        therapy: ''
                    }
                };
            }
            console.log( {
                success: true,
                errors: [],
                data: {
                    name: parsedResult.name ,
                    dosage: parsedResult.dosage ,
                    quantity: parsedResult.quantity ,
                    instructions: parsedResult.instructions ,
                    therapy: parsedResult.therapy 
                } // Return the JSON string as expected
            }, 'result from ai resolver');
            // Return successful response with JSON string data
            return {
                success: true,
                errors: [],
                data: {
                    name: parsedResult.name || '',
                    dosage: parsedResult.dosage || '',
                    quantity: parsedResult.quantity || '',
                    instructions: parsedResult.instructions || '',
                    therapy: parsedResult.therapy || ''
                } // Return the JSON string as expected
            };

        } catch (error) {
            this.logger.error(`Error in parseMedicationLabel: ${error.message}`, error.stack);
            
            // Handle specific error types
            if (error.message.includes('OpenAI API error')) {
                return {
                    success: false,
                    errors: [
                        {
                            field: 'openai_api',
                            message: 'External AI service is currently unavailable. Please try again later.'
                        }
                    ],
                    data: {
                        name: '',
                        dosage: '',
                        quantity: '',
                        instructions: '',
                        therapy: ''
                    }
                };
            }

            if (error.message.includes('API key')) {
                return {
                    success: false,
                    errors: [
                        {
                            field: 'configuration',
                            message: 'AI service configuration error. Please contact support.'
                        }
                    ],
                    data: {
                        name: '',
                        dosage: '',
                        quantity: '',
                        instructions: '',
                        therapy: ''
                    }
                };
            }

            // Generic error fallback
            return {
                success: false,
                errors: [
                    {
                        field: 'general',
                        message: 'An unexpected error occurred while parsing the medication label'
                    }
                ],
                data: {
                    name: '',
                    dosage: '',
                    quantity: '',
                    instructions: '',
                    therapy: ''
                }
            };
        }
    }
}
