---
title: "JDK Migration (1) - From JDK 11 to 21 and the Spring Boot 3.x Transition"
date: "2026-03-18"
updated: "2026-10-13"
description: "A practical record of upgrading a production Spring Boot service from JDK 11 to 21, including the javax to jakarta transition, AWS SDK for Java 1.x to 2.x migration, Spring Cloud AWS 3.x, and QueryDSL compatibility work."
tags: ["java", "jdk", "spring-boot", "migration", "devops"]
series: "JDK Migration"
seriesOrder: 1
draft: false
---

## Background

The backend service had been running on JDK 11 for a long time. It was stable, but the ecosystem around it was moving on: Spring Boot 3.x, Jakarta EE, new AWS libraries, and modern JVM features.

The migration target was JDK 21. It was not only a JDK upgrade. In practice, it was a Spring Boot 3.x migration, a Jakarta namespace migration, and a dependency modernization project at the same time.

### Why Upgrade

There were three main reasons.

1. **Spring Boot 2.x maintenance pressure**: staying on old Spring Boot versions increases security and compatibility risk.
2. **Jakarta ecosystem shift**: libraries were moving from `javax.*` to `jakarta.*`.
3. **Future runtime features**: Virtual Threads and newer Java language features require a newer JDK baseline.

### Change Summary

The migration touched many files because the change crossed framework boundaries.

| Area | Change |
|------|--------|
| JDK | 11 -> 21 |
| Spring Boot | 2.x -> 3.x |
| Java EE namespace | `javax.*` -> `jakarta.*` |
| QueryDSL | Jakarta-compatible classifier |
| AWS SDK for Java | 1.x -> 2.x |
| Spring Cloud AWS | 2.4.4 -> 3.3.0 |
| MySQL connector | old driver naming and dependency update |
| Spring Security | API and configuration updates |

## Core Version Changes

The build configuration was the starting point.

```gradle
java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}
```

The Spring Boot version was upgraded together because JDK 21 is best treated as a modern Spring Boot baseline rather than a runtime-only change.

## javax to jakarta Namespace Migration

The largest mechanical change was the namespace migration.

```java
// Before
import javax.persistence.Entity;
import javax.validation.constraints.NotNull;
import javax.servlet.http.HttpServletRequest;

// After
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;
import jakarta.servlet.http.HttpServletRequest;
```

This looks simple, but it affects entity annotations, validation annotations, servlet APIs, filters, interceptors, and generated code.

The rule was straightforward:

- application imports move to `jakarta.*`.
- dependencies must also be Jakarta-compatible.
- generated sources must be regenerated with Jakarta-aware plugins.

## QueryDSL Jakarta Compatibility

QueryDSL required special care because annotation processing generates Q classes from JPA entities.

The key was using the Jakarta classifier.

```gradle
implementation "com.querydsl:querydsl-jpa:5.0.0:jakarta"
annotationProcessor "com.querydsl:querydsl-apt:5.0.0:jakarta"
annotationProcessor "jakarta.persistence:jakarta.persistence-api"
annotationProcessor "jakarta.annotation:jakarta.annotation-api"
```

Without the `jakarta` classifier, generated Q classes may still depend on `javax.persistence`, which creates confusing compile errors.

## AWS SDK for Java 1.x to 2.x with Spring Cloud AWS 3.x

These are two separate version changes: AWS SDK for Java moved from 1.x to 2.x, while Spring Cloud AWS moved from 2.4.4 to 3.3.0. The [Spring Cloud AWS compatibility table](https://awspring.io/what-is-spring-cloud-aws#compatibility-with-spring-project-versions) identifies AWS SDK for Java 2.x as the SDK used by Spring Cloud AWS 3.3.x.

### Dependency Changes

The old AWS SDK for Java dependencies used the `com.amazonaws` group. SDK 2.x uses `software.amazon.awssdk`, as described in the [official migration guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-whats-different.html). The integration library's `3.3.0` version and the Lambda client's `2.30.27` version below belong to different version lines.

```gradle
implementation platform("io.awspring.cloud:spring-cloud-aws-dependencies:3.3.0")
implementation "io.awspring.cloud:spring-cloud-aws-starter:3.3.0"
implementation "io.awspring.cloud:spring-cloud-aws-sqs:3.3.0"
implementation "io.awspring.cloud:spring-cloud-aws-s3:3.3.0"
implementation "software.amazon.awssdk:lambda:2.30.27"
```

The goal was to make AWS clients explicit and compatible with Spring Boot 3.x.

### Configuration Structure

The configuration prefix changed from `cloud.aws.*` to `spring.cloud.aws.*`.

```yaml
spring:
  cloud:
    aws:
      region:
        static: ap-northeast-2
      credentials:
        profile:
          name: default
```

For an EKS deployment using IRSA, credentials can be resolved through the workload's IAM role. The profile setting above is a configuration example rather than an account of production credential storage.

### Service Code Migration

SDK 2.x provides both synchronous `S3Client` and asynchronous `S3AsyncClient` APIs; asynchronous operation is a client choice, not the default behavior of every SDK call. The [AWS S3 client guide](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-s3.html) explains the available clients. The upload example from this migration changed from `AmazonS3` to `S3AsyncClient`:

```java
// Before: AWS SDK for Java 1.x, synchronous upload
AmazonS3 legacyClient;
legacyClient.putObject(bucket, key, file);

// After: AWS SDK for Java 2.x, asynchronous upload
S3AsyncClient s3Client;
CompletableFuture<PutObjectResponse> upload = s3Client.putObject(
    PutObjectRequest.builder().bucket(bucket).key(key).build(),
    AsyncRequestBody.fromFile(file));
```

An asynchronous upload returns a `CompletableFuture`, so the caller must handle completion and failure. Client construction, region, and credential resolution also need to be checked independently of the API rename.

## MySQL Connector Changes

The MySQL driver also needed cleanup.

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
```

Old driver names and old connector versions can still appear in legacy projects. During the migration, I checked the runtime driver class and connection properties together.

## Spring Security Migration

Spring Security changed a lot between older Spring Boot versions and Spring Boot 3.x.

The migration focused on:

- replacing deprecated configuration style.
- making `SecurityFilterChain` explicit.
- checking matcher behavior.
- verifying authentication and authorization flows with actual requests.

Example structure:

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .anyRequest().authenticated()
        )
        .build();
}
```

Security migration is not complete until runtime behavior is verified. Compile success is not enough.

## Things That Went Wrong

### Missing QueryDSL jakarta Classifier

The most confusing issue was QueryDSL generating or expecting `javax` types while the application had already moved to `jakarta`.

The fix was to use Jakarta-compatible QueryDSL dependencies consistently for both runtime and annotation processing.

### AWS SDK Async Migration

An async client changes completion and error handling at the call site. A synchronous path can use `S3Client`; a path using `S3AsyncClient` needs to account for its returned future. Calling `.join()` waits on the calling thread, so replacing a synchronous call with an async client and immediately joining it does not make that caller non-blocking.

### Changing 219 Files at Once

The namespace migration touched many files at once. That made review difficult.

The safer approach is to split the migration into groups:

1. build and dependency changes.
2. namespace changes.
3. generated source changes.
4. security changes.
5. runtime verification.

In reality, some of these overlapped. The lesson was that a platform migration should be divided by failure mode, not only by package.

## Closing

JDK 11 to 21 is not just a version bump. In a Spring Boot service, it pulls the whole framework ecosystem forward.

The risky parts were not the Java language changes. The risky parts were framework compatibility, generated code, security behavior, and cloud integration.

After the migration, the codebase had a modern baseline. That made the next step, moving from JDK 21 to 25 and adopting Virtual Threads, much easier.
