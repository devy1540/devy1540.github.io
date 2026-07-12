---
title: "Spring AI Guide (2) - Multi-Provider Strategy"
date: "2026-03-17"
description: "How to abstract OpenAI, AWS Bedrock, and Google Gemini behind one ChatClient interface and switch providers dynamically at runtime."
tags: ["spring-ai", "spring-boot", "ai", "openai", "bedrock", "gemini"]
series: "Spring AI Guide"
seriesOrder: 2
draft: false
---

## Why Multi-Provider

Using one AI provider is simple. But production systems often need more flexibility.

Reasons to support multiple providers:

- cost comparison.
- model quality comparison.
- fallback when one provider fails.
- region or compliance requirements.
- feature differences such as JSON schema support.

Spring AI helps because providers can be hidden behind similar abstractions.

## Provider Configuration

### application.yml

```yaml
ai:
  default-provider: openai

spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o-mini
    bedrock:
      aws:
        region: us-east-1
    vertex:
      ai:
        gemini:
          project-id: ${GCP_PROJECT_ID}
          location: us-central1
```

Keep provider-specific settings separate. Do not force every provider into the same property shape.

### ChatClient Bean Registration

```java
@Configuration
public class AiClientConfig {

    @Bean
    ChatClient openAiChatClient(OpenAiChatModel model) {
        return ChatClient.builder(model).build();
    }

    @Bean
    ChatClient bedrockChatClient(BedrockChatModel model) {
        return ChatClient.builder(model).build();
    }

    @Bean
    ChatClient geminiChatClient(VertexAiGeminiChatModel model) {
        return ChatClient.builder(model).build();
    }
}
```

Bean names matter. They become the routing keys.

### Separate Bedrock Settings

AWS Bedrock often needs more infrastructure-specific configuration than OpenAI.

```java
@Bean
BedrockRuntimeClient bedrockRuntimeClient() {
    return BedrockRuntimeClient.builder()
        .region(Region.US_EAST_1)
        .credentialsProvider(DefaultCredentialsProvider.create())
        .build();
}
```

`DefaultCredentialsProvider` follows the AWS default credential chain. Locally, it can use `~/.aws/credentials`. In deployment, it can use IAM roles.

## Provider-Specific Options

Each provider has its own options. Keep common request fields separate from provider-specific options.

```java
public record AiRequest(
    AiProvider provider,
    String model,
    String prompt,
    Double temperature
) {}
```

Then map options at the provider boundary.

```java
OpenAiChatOptions options = OpenAiChatOptions.builder()
    .model(request.model())
    .temperature(request.temperature())
    .build();
```

Avoid leaking provider option classes throughout the application.

## Bedrock Cross-Region Inference

Bedrock model availability depends on region. Cross-region inference can help route requests to supported regions.

The important operational points are:

- know which models are available in which region.
- use IAM permissions that allow the target model.
- include region in logs.
- make failures visible by provider and region.

Provider routing should not hide too much. When an AI call fails, logs must show which provider, model, and region were used.

## Automatic Model Detection

Instead of hard-coding all models, the application can fetch model lists from providers.

```java
public interface ModelCatalog {
    AiProvider provider();
    List<AiModelInfo> listModels();
}
```

### Model List Caching

Model lists do not need to be fetched on every request.

```java
@Cacheable(cacheNames = "aiModels", key = "#provider")
public List<AiModelInfo> getModels(AiProvider provider) {
    return catalogMap.get(provider).listModels();
}
```

Caching reduces provider API calls and keeps admin screens fast.

## Gemini Authentication

Gemini can be configured through Google Cloud credentials.

Typical options:

- local service account JSON for development.
- workload identity or service account in production.
- environment variable such as `GOOGLE_APPLICATION_CREDENTIALS`.

The key is to keep credential loading outside business logic. The AI service should not know how Google credentials are loaded.

## Dynamic Provider Routing

The routing layer chooses the right `ChatClient`.

```java
@Service
public class AiRouter {
    private final Map<AiProvider, ChatClient> clients;

    public String call(AiRequest request) {
        ChatClient client = clients.get(request.provider());
        return client.prompt()
            .user(request.prompt())
            .call()
            .content();
    }
}
```

In a real system, routing can also consider:

- user plan.
- cost policy.
- fallback priority.
- feature support.
- admin-selected model.

## API Endpoint

```java
@PostMapping("/api/v1/ai/chat")
public AiResponse chat(@RequestBody AiRequest request) {
    return aiRouter.call(request);
}
```

The endpoint should return enough metadata for debugging:

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "content": "..."
}
```

## Summary

A multi-provider strategy is not only about registering multiple clients. It is about setting a boundary.

Application code should depend on your own request model and routing service. Provider-specific classes should stay near the provider integration layer.

The next post covers prompt management and structured output.
