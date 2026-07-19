---
title: "Spring AI Guide (3) - Prompt Management and Structured Output"
date: "2026-03-17"
updated: "2026-03-17"
description: "How to use Spring AI's message model, variable templating, database-backed prompt management, and JSON Schema-based structured output."
tags: ["spring-ai", "spring-boot", "ai", "prompt-engineering", "structured-output"]
series: "Spring AI Guide"
seriesOrder: 3
draft: false
---

## Why Prompts Matter

In AI features, prompts are part of the product logic. A small wording change can change output quality, token usage, and failure rate.

Hard-coding prompts in Java code is fine for experiments, but production systems need better control:

- prompts should be versioned.
- non-code changes should be possible.
- variables should be explicit.
- output format should be validated.

## Spring AI Message Model

Spring AI supports the common chat message roles:

- system.
- user.
- assistant.

### Using Messages with ChatClient

```java
String content = chatClient.prompt()
    .system("You are a technical writing assistant.")
    .user("Summarize the following text.")
    .call()
    .content();
```

System messages define behavior. User messages provide task input. Keeping those roles separate makes prompts easier to reason about.

## Variable Templating

### Prompt Template Example

```text
You are analyzing a spoken English lesson.

Student level: {{level}}
Lesson topic: {{topic}}

Transcript:
{{transcript}}
```

Variables make prompts reusable.

### Variable Replacement Implementation

```java
public String render(String template, Map<String, Object> variables) {
    String result = template;
    for (var entry : variables.entrySet()) {
        result = result.replace("{{" + entry.getKey() + "}}", String.valueOf(entry.getValue()));
    }
    return result;
}
```

For production, validation is important. Missing variables should fail loudly instead of silently producing a broken prompt.

### Supporting Multiple Variable Formats

Some prompt authors prefer `{{name}}`, while others use `{name}` or `${name}`. Supporting every format can make the system confusing.

The better rule is to pick one format and validate it.

### Collection Values

Collections need special formatting.

```java
private String formatValue(Object value) {
    if (value instanceof Collection<?> collection) {
        return collection.stream()
            .map(String::valueOf)
            .collect(Collectors.joining("\n"));
    }
    return String.valueOf(value);
}
```

This is useful for transcript chunks, rubric lists, or previous feedback items.

## Database-Backed Prompt Management

### Prompt Entity

```java
@Entity
public class PromptTemplate {
    @Id
    private Long id;
    private String code;
    private String provider;
    private String model;
    @Column(columnDefinition = "TEXT")
    private String systemPrompt;
    @Column(columnDefinition = "TEXT")
    private String userPrompt;
    private boolean active;
}
```

Prompts can now be changed without redeploying the application.

### Fetching and Using a Prompt

```java
PromptTemplate prompt = promptRepository.findActiveByCode("LESSON_FEEDBACK")
    .orElseThrow();

String userPrompt = renderer.render(prompt.getUserPrompt(), variables);

return chatClient.prompt()
    .system(prompt.getSystemPrompt())
    .user(userPrompt)
    .call()
    .content();
```

Prompt changes should still be treated carefully. Add audit logs and keep previous versions.

## Structured Output

Natural language output is hard to parse. For application workflows, JSON is often better.

### JSON Schema Method

Some providers support JSON Schema or structured output options.

```java
String result = chatClient.prompt()
    .user(userPrompt)
    .options(OpenAiChatOptions.builder()
        .responseFormat(new ResponseFormat(ResponseFormat.Type.JSON_SCHEMA, schema))
        .build())
    .call()
    .content();
```

### JSON Schema Example

```json
{
  "type": "object",
  "properties": {
    "score": { "type": "number" },
    "summary": { "type": "string" },
    "feedback": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["score", "summary", "feedback"]
}
```

### Provider Support

Provider support differs.

| Provider | Structured output support |
|----------|---------------------------|
| OpenAI | strong JSON Schema support |
| Gemini | supports structured output, details differ |
| Bedrock | depends on the model |

For providers where JSON Schema is not reliable, defensive logic such as JSON repair and retry is still needed. I covered that in the [real-world Spring AI pipeline](/posts/spring-ai-pipeline-real-world).

## Message-Based Requests

### ChatRequest Design

```java
public record ChatRequest(
    String promptCode,
    List<ChatMessage> messages,
    Map<String, Object> variables,
    AiProvider provider,
    String model
) {}
```

This design lets callers choose between prompt-code-based requests and direct message requests.

### Building Messages

```java
List<Message> messages = new ArrayList<>();
messages.add(new SystemMessage(systemPrompt));
messages.add(new UserMessage(userPrompt));
```

### Prompt Priority

A practical priority order is:

1. explicit messages from request.
2. prompt template from DB.
3. default prompt in code.

The rule must be clear. Otherwise it becomes hard to know which prompt was actually used.

## Summary

Prompt management is application logic.

For production use:

- separate system and user messages.
- manage prompts outside code when iteration is frequent.
- validate variables.
- prefer structured output for machine-consumed responses.
- log prompt code, provider, model, and version.
- add JSON repair and retry when provider output is not stable.

Structured output does not remove all uncertainty, but it moves AI integration closer to normal application engineering.
