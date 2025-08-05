import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    process.env.AZURE_OPENAI_ENDPOINT = 'https://example.com';
    process.env.AZURE_OPENAI_API_KEY = 'key';
    process.env.AZURE_OPENAI_API_VERSION = '2024-02-15';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'deployment';

    service = new AiService();
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'test response' } }],
    });

    (service as any).openai = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  });

  it('should call OpenAI with system and user messages', async () => {
    const result = await service.askAi('sys', 'usr');

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'usr' },
      ],
    });
    expect(result).toBe('test response');
  });
});
