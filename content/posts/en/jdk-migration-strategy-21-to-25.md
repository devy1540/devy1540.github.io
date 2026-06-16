---
title: "JDK Migration (2) - From JDK 21 to 25, Virtual Threads, and Modern Java"
date: "2026-03-18"
description: "A practical record of upgrading from JDK 21 to 25, enabling Virtual Threads, handling pinning issues, applying pattern matching switch, and moving to Gradle Kotlin DSL."
tags: ["java", "jdk", "spring-boot", "virtual-threads", "devops"]
series: "JDK Migration"
seriesOrder: 2
draft: false
---

## Background

In the [previous post](/posts/jdk-migration-strategy-11-to-25), I covered the larger migration from JDK 11 to 21. This time, the upgrade was **JDK 21 to 25**.

Because the service was already on Spring Boot 3.x, the change was much smaller. The number of changed files was also much lower. But this migration had a different goal: prepare the runtime for Virtual Threads and modern Java usage.

### Why Not Stop at 21

JDK 21 is an LTS release and already includes Virtual Threads. Stopping there would have been reasonable.

But our service has many I/O-bound workloads: SQS listeners, external API calls, DB queries, and AI pipeline calls. Especially after building the [Spring AI diagnostic pipeline](/posts/spring-ai-pipeline-real-world), multiple external LLM calls could run in parallel for chunked input.

With platform thread pools, concurrency had to be managed by tuning `corePoolSize`, `maxPoolSize`, and queue capacity. Virtual Threads reduce that operational burden.

### Change Summary

| Area | Change |
|------|--------|
| Runtime | JDK 21 -> 25 |
| Docker image | newer JDK base image |
| Spring Security | matcher and provider API updates |
| Concurrency | enable Virtual Threads |
| Language | pattern matching switch, small modern syntax cleanup |
| Build | Gradle Groovy DSL -> Kotlin DSL |

## Docker Base Image

The Docker image was updated first.

```dockerfile
FROM eclipse-temurin:25-jre

WORKDIR /app
COPY build/libs/app.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

For production, the actual image should be pinned carefully and scanned. The main point is to make the runtime version explicit and reproducible.

## Spring Security API Changes

### AntPathRequestMatcher to PathPatternRequestMatcher

Security matchers changed across Spring Security versions. I checked route matching behavior rather than only replacing class names.

```java
authorize.requestMatchers("/actuator/health").permitAll();
authorize.anyRequest().authenticated();
```

The important part is verifying whether path patterns behave the same as before. Security migration should always include request-level tests or manual curl checks.

### DaoAuthenticationProvider Constructor Change

Some constructors and setters changed. The updated style makes dependencies more explicit.

```java
@Bean
DaoAuthenticationProvider authenticationProvider(UserDetailsService service,
                                                 PasswordEncoder encoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(service);
    provider.setPasswordEncoder(encoder);
    return provider;
}
```

## Enabling Virtual Threads

Spring Boot can enable Virtual Threads with configuration.

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

This does not mean every workload automatically becomes faster. It means blocking I/O can be handled with many lightweight threads without managing a large platform thread pool.

Good candidates:

- external HTTP calls.
- DB calls.
- SQS message handling.
- file or network I/O.

Bad candidates:

- CPU-heavy computation.
- synchronized blocks that pin carrier threads.
- code that depends on thread-local behavior without care.

The most important check is pinning. If a Virtual Thread is blocked inside a synchronized region or native call, it can pin the carrier thread and reduce the benefit.

## JDK 25 Language Features

### Pattern Matching for switch

Pattern matching makes branching on result types cleaner.

```java
return switch (payment) {
    case PaidPayment paid -> handlePaid(paid);
    case FailedPayment failed -> handleFailed(failed);
    default -> throw new IllegalStateException("Unsupported payment type");
};
```

This is especially useful when SDKs expose sealed interfaces or type hierarchies.

### void main()

For application code, `void main()` is not a major production feature. But for small scripts, examples, or local experiments, it reduces boilerplate.

```java
void main() {
    System.out.println("hello");
}
```

I did not apply this broadly to production code. The migration was still conservative.

## build.gradle to build.gradle.kts

The build file was moved from Groovy DSL to Kotlin DSL.

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}
```

Kotlin DSL gives better IDE support and type checking for Gradle configuration. It also makes version and plugin mistakes easier to catch.

The migration cost is mostly syntax:

- quotes and parentheses change.
- task configuration changes shape.
- dependency notation becomes function-like.
- some plugin configuration needs typed accessors.

## Closing

The JDK 21 to 25 migration was much smaller than the JDK 11 to 21 migration. The difficult ecosystem shift had already happened.

This step was about runtime direction: Virtual Threads, modern Java syntax, and a cleaner build setup.

The main lesson was to treat Virtual Threads as a concurrency model change, not a magic performance switch. They are powerful for I/O-heavy services, but they still require attention to blocking behavior, pinning, thread-local usage, and downstream limits.
