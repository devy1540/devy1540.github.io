---
title: "Spring AI Guide (1) - From Project Setup to the First AI Call"
date: "2026-03-17"
description: "A guide to Spring AI core concepts, project setup, and the first AI call with ChatClient."
tags: ["spring-ai", "spring-boot", "ai", "llm", "java"]
series: "Spring AI Guide"
seriesOrder: 1
draft: false
---

## Introduction

In a previous post about a [real-world Spring AI pipeline](/posts/spring-ai-pipeline-real-world), I covered a seven-step AI diagnostic pipeline. That post focused on what was built.

This series focuses on **how to apply Spring AI to a project** step by step.

The first part covers:

- what Spring AI is.
- dependency setup.
- `application.yml` configuration.
- the difference between `ChatClient` and `ChatModel`.
- the first AI call.

## What Is Spring AI

Spring AI is a Spring project that abstracts AI model providers behind familiar Spring patterns.

Instead of calling each provider's HTTP API directly, you can use a common interface for:

- OpenAI.
- Azure OpenAI.
- AWS Bedrock.
- Google Gemini.
- Anthropic.
- local models.

The value is not only API wrapping. Spring AI gives a Spring-native way to configure model clients, prompts, advisors, structured output, and provider-specific options.

## Dependency Setup

### Gradle, Kotlin DSL

```kotlin
dependencies {
    implementation("org.springframework.ai:spring-ai-openai-spring-boot-starter")
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.ai:spring-ai-bom:1.0.0")
    }
}
```

Using the BOM is important because Spring AI has multiple modules and provider starters.

### Maven

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-bom</artifactId>
      <version>1.0.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

<dependencies>
  <dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
  </dependency>
</dependencies>
```

## application.yml Configuration

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o-mini
          temperature: 0.2
```

Do not commit API keys. Use environment variables, secret managers, or Kubernetes secrets.

### Timeout Settings

AI calls are external network calls. Timeout settings should be explicit.

```yaml
spring:
  ai:
    openai:
      chat:
        options:
          model: gpt-4o-mini
```

Provider-specific timeout configuration may differ, but the principle is the same: do not let AI calls wait forever.

## ChatClient vs ChatModel

### ChatModel

`ChatModel` is the lower-level abstraction. It represents a model that can receive a prompt and return a response.

```java
ChatResponse response = chatModel.call(
    new Prompt("Explain Spring AI in one sentence.")
);
```

This is useful when you want direct control over request objects.

### ChatClient

`ChatClient` is the higher-level fluent API.

```java
String content = chatClient.prompt()
    .user("Explain Spring AI in one sentence.")
    .call()
    .content();
```

For application code, `ChatClient` is usually easier to read and compose.

## First AI Call

### 1. Register ChatClient Bean

```java
@Configuration
public class AiConfig {

    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}
```

### 2. Call from a Service

```java
@Service
@RequiredArgsConstructor
public class AiService {
    private final ChatClient chatClient;

    public String summarize(String text) {
        return chatClient.prompt()
            .user("Summarize this text: " + text)
            .call()
            .content();
    }
}
```

### 3. Add a System Prompt

System prompts define the assistant's role or constraints.

```java
return chatClient.prompt()
    .system("You are a concise technical assistant.")
    .user("Explain dependency injection.")
    .call()
    .content();
```

### 4. Access Metadata with ChatResponse

If you need metadata, receive `ChatResponse`.

```java
ChatResponse response = chatClient.prompt()
    .user("Generate a short title.")
    .call()
    .chatResponse();

String content = response.getResult().getOutput().getText();
```

Metadata is useful for logging, token usage tracking, or provider-specific debugging.

## Project Structure

One practical structure is:

```text
ai/
  AiConfig.java
  AiService.java
  prompt/
    PromptTemplateService.java
  provider/
    AiProvider.java
    OpenAiConfig.java
```

Start simple. Do not introduce provider routing, prompt DB management, or structured output until there is a real need.

## Summary

Spring AI lets a Spring Boot application call AI models through familiar Spring configuration and beans.

For the first step:

1. add the provider starter.
2. configure the API key and model.
3. register `ChatClient`.
4. call it from a service.
5. keep timeout, logging, and secrets in mind.

The next post covers a multi-provider strategy for supporting OpenAI, AWS Bedrock, and Google Gemini through one interface.
