// Code examples for different languages
export const codeExamples = {
    typescript: `import { OpenAI } from 'openai';
import { z } from 'zod';
import type { EventConfig, StepHandler } from 'motia';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config: EventConfig = {
  type: 'event',
  name: 'Auto-Reply to Support Emails',
  subscribes: ['email.received'],
  emits: ['email.send'],
  flows: ['email-support'],
  input: z.object({ subject: z.string(), body: z.string(), from: z.string() }),
};

export const handler: StepHandler<typeof config> = async (inputData, context) => {
    const { subject, body, from } = inputData;
    const { emit, logger } = context;

    const sentimentResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: \`Analyze the sentiment of the following text: \${body}\` }],
    });

    const sentiment = sentimentResponse.choices[0].message.content;

    logger.info('[EmailAutoReply] Sentiment analysis', { sentiment });

    emit({
        type: 'email.send',
        data: { from, subject, body, sentiment },
    });
};`,
    javascript: `import { OpenAI } from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
    type: 'event',
    name: 'Auto-Reply to Support Emails',
    subscribes: ['email.received'],
    emits: ['email.send'],
    flows: ['email-support'],
    input: z.object({
        subject: z.string(),
        body: z.string(),
        from: z.string()
    }),
};

export const handler = async (inputData, context) => {
    const { subject, body, from } = inputData;
    const { emit, logger } = context;

    const sentimentResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: \`Analyze the sentiment of the following text: \${body}\` }],
    });

    const sentiment = sentimentResponse.choices[0].message.content;

    logger.info('[EmailAutoReply] Sentiment analysis', { sentiment });

    emit({
        type: 'email.send',
        data: { from, subject, body, sentiment },
    });
};`,
    python: `import os
from openai import OpenAI

openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

CONFIG = {
    'type': 'event',
    'name': 'Auto-Reply to Support Emails',
    'subscribes': ['email.received'],
    'emits': ['email.send'],
    'flows': ['email-support']
}

async def handler(input_data, context):
    subject = input_data['subject']
    body = input_data['body']
    from_ = input_data['from']
    emit = context['emit']
    logger = context['logger']

    sentiment_response = await openai.chat.completions.create(
        model="gpt-4o",
        messages=[{'role': 'user', 'content': f'Analyze the sentiment of the following text: {body}'}]
    )

    sentiment = sentiment_response['choices'][0]['message']['content']

    logger.info('[EmailAutoReply] Sentiment analysis', {'sentiment': sentiment})

    emit({
        'type': 'email.send',
        'data': {'from': from_, 'subject': subject, 'body': body, 'sentiment': sentiment}
    })`,
    ruby: `require 'openai'

openai = OpenAI::Client.new(api_key: ENV['OPENAI_API_KEY'])

CONFIG = {
  type: 'event',
  name: 'Auto-Reply to Support Emails',
  subscribes: ['email.received'],
  emits: ['email.send'],
  flows: ['email-support']
}

def handler(input_data, context)
  subject = input_data[:subject]
  body = input_data[:body]
  from = input_data[:from]
  emit = context[:emit]
  logger = context[:logger]

  sentiment_response = openai.chat.completions.create(
    model: "gpt-4o",
    messages: [{ role: "user", content: "Analyze the sentiment of the following text: #{body}" }]
  )

  sentiment = sentiment_response.choices[0].message.content

  logger.info('[EmailAutoReply] Sentiment analysis', { sentiment: sentiment })

  emit.call({
    type: 'email.send',
    data: { from: from, subject: subject, body: body, sentiment: sentiment }
  })
end`,
    java: `import com.theokanning.openai.OpenAiService;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class EmailAutoReply {
    private static final String API_KEY = System.getenv("OPENAI_API_KEY");
    
    public static final Map<String, Object> CONFIG = Map.of(
        "type", "event",
        "name", "Auto-Reply to Support Emails",
        "subscribes", Arrays.asList("email.received"),
        "emits", Arrays.asList("email.send"),
        "flows", Arrays.asList("email-support")
    );
    
    public static void handler(Map<String, String> inputData, Map<String, Object> context) {
        String subject = inputData.get("subject");
        String body = inputData.get("body");
        String from = inputData.get("from");
        
        EmitFunction emit = (EmitFunction) context.get("emit");
        Logger logger = (Logger) context.get("logger");
        
        OpenAiService service = new OpenAiService(API_KEY);
        
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4o")
            .messages(Arrays.asList(
                new ChatMessage(ChatMessageRole.USER.value(), "Analyze the sentiment of the following text: " + body)
            ))
            .build();
            
        String sentiment = service.createChatCompletion(request)
            .getChoices().get(0).getMessage().getContent();
            
        logger.info("[EmailAutoReply] Sentiment analysis", Map.of("sentiment", sentiment));
        
        Map<String, Object> data = new HashMap<>();
        data.put("from", from);
        data.put("subject", subject);
        data.put("body", body);
        data.put("sentiment", sentiment);
        
        emit.call(Map.of(
            "type", "email.send",
            "data", data
        ));
    }
    
    interface EmitFunction {
        void call(Map<String, Object> event);
    }
    
    interface Logger {
        void info(String message, Map<String, Object> data);
    }
}`
};

export type CodeLanguage = keyof typeof codeExamples; 