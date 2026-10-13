---
title: "JDK 마이그레이션 (1) - JDK 11에서 21로, Spring Boot 3.x 전환기"
date: "2026-03-18"
updated: "2026-10-13"
description: "프로덕션 Spring Boot 서비스를 JDK 11 → 21로 업그레이드하며 겪은 javax→jakarta 전환, AWS SDK for Java 1.x→2.x와 Spring Cloud AWS 3.x 마이그레이션, QueryDSL 호환성 해결 등 실전 경험을 정리합니다."
tags: ["java", "jdk", "spring-boot", "migration", "devops"]
series: "JDK Migration"
seriesOrder: 1
draft: false
---

## 배경

프로덕션에서 운영 중인 Spring Boot 기반 백엔드를 **JDK 11 → 21**로 업그레이드한 기록이다. JDK만 올린 것이 아니라 Spring Boot 2.7 → 3.4, Gradle 7.5 → 8.5까지 동시에 진행했기 때문에 **219개 파일**이 변경되는 대규모 마이그레이션이었다.

### 왜 올려야 했나

미루고 미뤘지만 더 이상 버틸 수 없는 시점이 왔다.

가장 직접적인 문제는 **새 기능 개발이 막히기 시작한 것**이다. 신규 라이브러리들이 JDK 17+, Jakarta EE를 최소 요구사항으로 내걸면서 도입하고 싶은 라이브러리가 있어도 호환성 때문에 포기하는 일이 반복됐다. 기존 라이브러리의 최신 버전도 마찬가지였다. 버그 픽스나 성능 개선이 담긴 업데이트를 적용하지 못하고 구버전에 머물러 있는 상황이 점점 잦아졌다.

개발 생산성 측면에서도 JDK 11은 답답한 부분이 많았다. JDK 14+의 **Text Block**을 쓸 수 없어서 복잡한 SQL이나 JSON 문자열을 `+`로 이어붙이고 있었고 **Record** 클래스가 없으니 단순 데이터 전달용 DTO마다 getter/setter/equals/hashCode를 Lombok으로 달아야 했다. **Pattern Matching instanceof**도 없어서 타입 캐스팅할 때마다 `if (obj instanceof String) { String s = (String) obj; ... }` 같은 반복 코드가 쌓였다. 특히 네이티브 쿼리를 아직 많이 사용하고 있는 프로젝트 특성상, Text Block 없이 여러 줄 SQL을 관리하는 건 가독성 면에서 고통이었다. ~~네이티브 쿼리에 `+`와 `\n`이 난무하는 코드를 볼 때마다 JDK 올리고 싶었다.~~

**Spring Boot 2.7.x OSS 지원 종료**도 트리거였다. 보안 패치가 끊기면 프로덕션에서 운영할 명분이 없다. Spring Boot 3.x로 올리려면 JDK 17 이상이 필수이고 어차피 올릴 거면 LTS인 21까지 한 번에 가기로 했다.

**AWS SDK for Java 1.x의 유지보수 모드 전환** 역시 무시할 수 없었다. SQS, S3, Lambda를 적극적으로 사용하는 서비스 특성상 새로운 AWS 기능이 SDK 1.x에 추가되지 않는 건 실질적인 제약이었다. AWS SDK for Java 2.x와 이를 사용하는 Spring Cloud AWS 3.x로 클라이언트와 통합 라이브러리를 함께 옮겼다.

### 변경 요약

| 항목 | Before | After |
|------|--------|-------|
| JDK | 11 | 21 |
| Spring Boot | 2.7.2 | 3.4.3 |
| Gradle | 7.5 | 8.5 |
| Java EE | javax.* | jakarta.* |
| AWS SDK for Java | 1.x | 2.x |
| Spring Cloud AWS | 2.4.4 | 3.3.0 |
| MySQL Connector | mysql:mysql-connector-java | com.mysql:mysql-connector-j |
| QueryDSL | querydsl-jpa | querydsl-jpa:5.0.0:jakarta |

## 핵심 버전 변경

```groovy
// before
plugins {
    id 'org.springframework.boot' version '2.7.2'
    id 'io.spring.dependency-management' version '1.0.12.RELEASE'
}
sourceCompatibility = '11'

// after
plugins {
    id 'org.springframework.boot' version '3.4.3'
    id 'io.spring.dependency-management' version '1.1.7'
}
sourceCompatibility = '21'
```

Gradle 래퍼도 **7.5 → 8.5**로 업그레이드했다.

```properties
# gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
```

## javax → jakarta 네임스페이스 전환

Spring Boot 3.x의 **가장 큰 Breaking Change**다. Java EE에서 Jakarta EE로의 전환으로 인해 모든 `javax.*` 패키지가 `jakarta.*`로 변경되었다.

```java
// before
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.annotation.PostConstruct;

// after
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.annotation.PostConstruct;
```

영향 범위가 엄청나다. Entity, Repository, Converter, DTO 등 JPA/Validation 관련 거의 모든 파일이 대상이었다.

> **주의**: `javax.crypto`, `javax.net.ssl` 같은 **Java SE 표준 패키지**는 변경하면 안 된다. 대상은 `javax.persistence`, `javax.annotation`, `javax.validation` 등 Jakarta EE 패키지만이다.

실제로 변경된 파일 수만 해도 엔티티와 컨버터 관련 파일이 100개 이상이었다. IDE의 전체 치환 기능을 사용하되, 반드시 변경 대상을 필터링해서 적용한다.

## QueryDSL Jakarta 호환

QueryDSL은 Jakarta 네임스페이스용 별도 classifier를 제공한다. 이걸 빠뜨리면 컴파일은 되지만 **런타임에 `ClassNotFoundException`**이 터진다.

```groovy
// before
implementation 'com.querydsl:querydsl-jpa'
annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"

// after
implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
annotationProcessor "jakarta.annotation:jakarta.annotation-api"
annotationProcessor "jakarta.persistence:jakarta.persistence-api"
```

핵심은 `:jakarta` classifier다. 이것만 빠뜨려도 Q클래스 생성은 정상이지만 런타임에 javax 의존성을 찾다가 실패한다. 컴파일이 되니까 안심하고 배포했다가 프로덕션에서 터지는 최악의 시나리오가 가능하다.

## AWS SDK for Java 1.x → 2.x, Spring Cloud AWS 3.x 전환

SDK와 Spring 통합 라이브러리의 버전을 구분해야 한다. AWS SDK for Java는 1.x에서 2.x로, Spring Cloud AWS는 2.4.4에서 3.3.0으로 올렸다. [Spring Cloud AWS 공식 호환성 표](https://awspring.io/what-is-spring-cloud-aws#compatibility-with-spring-project-versions)에서도 Spring Cloud AWS 3.3.x가 AWS SDK for Java 2.x를 사용한다고 명시한다.

가장 손이 많이 가는 변경이었다. 의존성, 설정 파일, 서비스 코드 세 곳 모두 변경이 필요하다.

### 의존성 변경

```groovy
// before (AWS SDK v1 기반)
dependencyManagement {
    imports {
        mavenBom("io.awspring.cloud:spring-cloud-aws-dependencies:2.4.4")
        mavenBom("com.amazonaws:aws-java-sdk-bom:1.12.395")
    }
}
implementation "io.awspring.cloud:spring-cloud-starter-aws-messaging"
implementation "io.awspring.cloud:spring-cloud-starter-aws"
implementation "com.amazonaws:aws-java-sdk-lambda"

// after (AWS SDK for Java 2.x 기반의 Spring Cloud AWS 3.x)
implementation platform("io.awspring.cloud:spring-cloud-aws-dependencies:3.3.0")
implementation 'io.awspring.cloud:spring-cloud-aws-starter:3.3.0'
implementation 'io.awspring.cloud:spring-cloud-aws-sqs:3.3.0'
implementation 'io.awspring.cloud:spring-cloud-aws-s3:3.3.0'
implementation 'software.amazon.awssdk:lambda:2.30.27'
```

[AWS 공식 마이그레이션 가이드](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/migration-whats-different.html)에서 설명하는 패키지 변경도 같은 구분이다. SDK 1.x의 `com.amazonaws`가 SDK 2.x의 `software.amazon.awssdk`로 바뀌었다. 위 코드의 `3.3.0`은 Spring Cloud AWS 버전이고, Lambda 클라이언트의 `2.30.27`은 AWS SDK for Java 버전이다.

### 설정 파일 구조 변경

프로퍼티 네임스페이스가 `cloud.aws.*`에서 `spring.cloud.aws.*`로 이동한다.

```yaml
# before (cloud.aws.*)
cloud:
  aws:
    credentials:
      access-key: ...
      secret-key: ...
    region:
      static: ap-northeast-2
    stack:
      auto: false

# after (spring.cloud.aws.*)
spring:
  cloud:
    aws:
      s3:
        region: ap-northeast-2
      sqs:
        region: ap-northeast-2
      credentials:
        access-key: ...
        secret-key: ...
```

### 서비스 코드 마이그레이션

AWS SDK for Java 2.x는 동기 `S3Client`와 비동기 `S3AsyncClient`를 모두 제공한다. 모든 호출이 기본적으로 비동기가 되는 것은 아니다. [AWS S3 클라이언트 안내](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-s3.html)를 기준으로 호출부에 맞는 클라이언트를 선택해야 한다. 아래는 기존 `AmazonS3` 업로드를 `S3AsyncClient`로 옮기는 예다.

```java
// S3 - before (sync, blocking)
AmazonS3 s3Client;
s3Client.putObject(bucket, key, file);

// S3 - after (AWS SDK for Java 2.x, async)
S3AsyncClient s3Client;
CompletableFuture<PutObjectResponse> upload = s3Client.putObject(
    PutObjectRequest.builder().bucket(bucket).key(key).build(),
    AsyncRequestBody.fromFile(file));
```

비동기 업로드는 `CompletableFuture`를 반환하므로 호출부에서 완료와 실패를 함께 처리해야 한다. 클라이언트 생성, 리전, 인증 정보도 API 호출 변경과 별도로 확인한다.

```java
// SQS Listener
// before
@SqsListener(value = "queue-name")
public void listen(String message) { ... }

// after
@SqsListener(value = "queue-name")
public void listen(@Payload String message, @Header("...") String header) { ... }
```

## MySQL Connector 변경

GAV 좌표가 변경되었다. 놓치기 쉽지만 빌드 시 바로 실패하므로 발견은 빠르다.

```groovy
// before
runtimeOnly 'mysql:mysql-connector-java'

// after
runtimeOnly 'com.mysql:mysql-connector-j'
```

## Spring Security 마이그레이션

Spring Boot 3.x에서 `WebSecurityConfigurerAdapter`가 완전히 제거되었다. `SecurityFilterChain` 빈 기반으로 전환한다. 프로젝트마다 설정이 다르므로 상세 코드는 생략하지만 핵심은 **상속 기반 → 빈 등록 기반** 패턴 전환이다.

## 삽질한 것들

### QueryDSL jakarta classifier 누락

가장 찾기 어려웠던 버그다. Q클래스 생성도 정상, 컴파일도 정상인데 런타임에 `ClassNotFoundException`이 터진다. `:jakarta`를 빠뜨리면 QueryDSL이 내부적으로 `javax.persistence`를 참조하기 때문이다. 컴파일 타임에 잡히지 않으니 CI에서도 통과하고 로컬 테스트에서도 통과하고 실제 기동할 때 터진다.

### AWS SDK for Java 2.x 비동기 클라이언트 전환

동기 호출이 필요한 경로에는 `S3Client`를 쓸 수 있고, `S3AsyncClient`를 쓰는 경로는 반환된 future의 완료와 실패를 처리해야 한다. `.join()`은 호출 스레드를 기다리게 하므로, 비동기 클라이언트로 바꾸고 바로 `.join()`한다고 호출부까지 논블로킹이 되는 것은 아니다.

### 219개 파일을 한 번에 바꾼 것

가능하다면 `javax → jakarta` 전환, AWS SDK 전환, Spring Security 전환을 **별도 브랜치**로 나눠서 진행하는 것을 권장한다. 우리는 한 번에 진행했는데, 문제가 발생했을 때 원인 추적이 어려웠다.

## 마무리

JDK 11 → 21은 단순한 버전업이 아니라 **Java 생태계 전체의 패러다임 전환**이었다. javax → jakarta, AWS SDK for Java 1.x → 2.x, Spring Cloud AWS 2.x → 3.x, Spring Security 설정 방식 변경까지 동시에 일어나기 때문에, 실질적으로는 프로젝트를 새로 세팅하는 것에 가깝다.

219개 파일을 한 번에 바꿨지만 프로덕션에 무사히 올라갔을 때의 안도감은 아직도 생생하다.

다음 편에서는 JDK 21에서 25로의 업그레이드를 다룬다. Phase 1에 비하면 훨씬 가벼운 작업이었지만 `sun.misc.Unsafe` 제거라는 런타임 수준의 변경 때문에 예상치 못한 곳에서 문제가 터졌다.
