---
title: "JDK 마이그레이션 (2) - JDK 21에서 25로, Virtual Threads와 모던 Java"
date: "2026-03-18"
description: "JDK 21 → 25 업그레이드 실전기. Virtual Threads 활성화, pinning 이슈 해소, pattern matching switch 적용, Gradle Kotlin DSL 전환까지."
tags: ["java", "jdk", "spring-boot", "virtual-threads", "devops"]
series: "JDK Migration"
seriesOrder: 2
draft: false
---

## 배경

[이전 편](/posts/jdk-migration-strategy-11-to-25)에서 JDK 11 → 21로의 대규모 마이그레이션을 다뤘다. 이번에는 **JDK 21 → 25** 업그레이드다. Spring Boot 3.x 내에서의 마이너 업그레이드이므로 변경 파일 수는 **16개**로 훨씬 가벼웠다.

### 왜 21에서 멈추지 않았나

Phase 1에서 JDK 21까지 올린 뒤 한동안은 안정적으로 운영했다. 굳이 더 올릴 이유가 없었다. 그런데 몇 가지 상황이 겹치면서 25까지 가게 됐다.

**Virtual Threads**가 가장 큰 동기였다. 우리 서비스는 SQS 리스너, 외부 API 호출, DB 쿼리 등 I/O 바운드 작업이 많다. 특히 [Spring AI 기반 진단 파이프라인](/posts/spring-ai-pipeline-real-world)에서 청크별로 LLM을 병렬 호출하는 구조를 도입하면서, `CompletableFuture.allOf()`로 동시에 수십 개의 외부 API 호출이 발생하는 상황이 생겼다. 기존에는 `ThreadPoolTaskExecutor`의 corePoolSize, maxPoolSize, queueCapacity를 직접 튜닝하면서 동시 처리량을 관리했는데, 트래픽 패턴이 바뀔 때마다 설정을 재조정하는 게 번거로웠다. Virtual Threads를 적용하면 스레드 풀 관리 자체가 불필요해진다.

Virtual Threads 자체는 JDK 21에서 정식 도입되었지만, 실제로 프로덕션에 적용하기엔 **pinning 문제**가 걸렸다. `synchronized` 블록 안에서 I/O가 발생하면 Virtual Thread가 carrier thread에 고정(pin)되어 플랫폼 스레드를 점유하게 되는데, 이렇게 되면 Virtual Threads의 이점이 사라진다. Hibernate, JDBC 드라이버 등 내부적으로 `synchronized`를 쓰는 라이브러리가 많아서 JPA 기반 서비스에서는 이 문제를 피하기 어려웠다. JDK 24(JEP 491)에서 `synchronized` 블록에서도 Virtual Thread가 unmount될 수 있도록 개선되면서 pinning 문제가 근본적으로 해소됐고, JDK 25에서는 이 개선이 안정화된 상태다. Spring Boot 3.5+에서 설정 한 줄로 전체 적용이 가능해지면서 타이밍이 맞았다.

**보안 강화 작업과 맞물린 것**도 있었다. AWS 인프라 보안 설정을 전면 재검토하면서 런타임 환경도 함께 최신화하자는 방향이 잡혔다.

### 변경 요약

| 항목 | Before | After |
|------|--------|-------|
| JDK | 21 | 25 |
| Spring Boot | 3.4.3 | 3.5.6 → 3.5.10 |
| Gradle | 8.5 | 9.1 → 9.3 |
| Docker Base | amazoncorretto:21 | amazoncorretto:25 |
| Build Script | build.gradle (Groovy) | build.gradle.kts (Kotlin) |

## Docker 베이스 이미지 변경

가장 먼저 할 일은 컨테이너 런타임 변경이다.

```dockerfile
# before
FROM amazoncorretto:21-alpine

# after
FROM amazoncorretto:25-alpine
```

JDK 25에서 FFM(Foreign Function & Memory) API 전환이 완료되기 전까지 네이티브 접근 경고를 억제해야 한다:

```dockerfile
ENV JAVA_TOOL_OPTIONS="--enable-native-access=ALL-UNNAMED"
```

## Spring Security API 변경

### AntPathRequestMatcher → PathPatternRequestMatcher

Spring Security 6.4+에서 `AntPathRequestMatcher`가 deprecated되었다.

```java
// before
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

new OrRequestMatcher(
    PERMIT_LIST.stream()
        .map(AntPathRequestMatcher::new)
        .toArray(RequestMatcher[]::new)
);

// after
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

new OrRequestMatcher(
    PERMIT_LIST.stream()
        .map(path -> PathPatternRequestMatcher.withDefaults().matcher(path))
        .toArray(RequestMatcher[]::new)
);
```

### DaoAuthenticationProvider 생성자 변경

```java
// before
DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
provider.setPasswordEncoder(passwordEncoder);
provider.setUserDetailsService(jwtUserDetailService);

// after
DaoAuthenticationProvider provider = new DaoAuthenticationProvider(jwtUserDetailService);
provider.setPasswordEncoder(passwordEncoder);
```

이런 소소한 API 변경들이 컴파일 에러로 잡히니까 찾기는 쉬웠다. Phase 1의 런타임 에러에 비하면 양반이다.

## Virtual Threads 활성화

JDK 21에서 도입된 Virtual Threads가 JDK 25에서는 완전히 안정화되었다. Spring Boot 3.5+에서는 **설정 한 줄**로 전체 애플리케이션에 적용할 수 있다.

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

이 설정을 켜면 기존에 수동으로 구성했던 스레드 풀이 **전부 불필요**해진다:

```java
// before - 수동 스레드 풀 + Virtual Thread executor
@Primary
@Bean(name = "taskExecutor")
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(10);
    executor.setMaxPoolSize(20);
    executor.setQueueCapacity(50);
    executor.initialize();
    return executor;
}

@Bean(name = "virtualThreadExecutor")
public Executor virtualThreadExecutor() {
    return Executors.newThreadPerTaskExecutor(
        Thread.ofVirtual().name("v-thread-", 0).factory()
    );
}

// after - 전부 삭제. Spring Boot가 자동으로 Virtual Thread executor를 구성한다
```

`@Async`에서도 특정 executor 지정이 불필요해졌다:

```java
// before
@Async("virtualThreadExecutor")
public void sendMessage(...) { }

// after
@Async
public void sendMessage(...) { }
```

실제로 적용됐는지 확인하는 방법:

```java
log.info("is virtual: {}", Thread.currentThread().isVirtual());
// → is virtual: true
```

~~스레드 풀 튜닝에 쏟은 시간을 돌려받은 기분이었다.~~

## JDK 25 언어 기능 적용

버전업의 부가적인 즐거움이다. 꼭 바꿔야 하는 건 아니지만, 새 문법을 적용하면 코드가 깔끔해진다.

### Pattern Matching for switch

if-else 체인을 타입 기반 switch 표현식으로 변환할 수 있다.

```java
// before - if-else 체인
private HttpStatus getHttpStatus(Exception e) {
    if (e instanceof IllegalArgumentException) {
        return HttpStatus.BAD_REQUEST;
    } else if (e instanceof HttpRequestMethodNotSupportedException) {
        return HttpStatus.METHOD_NOT_ALLOWED;
    } else if (e instanceof NoHandlerFoundException
            || e instanceof NoSuchElementException) {
        return HttpStatus.NOT_FOUND;
    } else {
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}

// after - switch pattern matching
private HttpStatus getHttpStatus(Exception e) {
    return switch (e) {
        case IllegalArgumentException _,
             HttpMessageNotReadableException _,
             TypeMismatchException _,
             ServletRequestBindingException _ -> HttpStatus.BAD_REQUEST;
        case HttpRequestMethodNotSupportedException _ -> HttpStatus.METHOD_NOT_ALLOWED;
        case HttpMediaTypeNotSupportedException _ -> HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        case NoHandlerFoundException _,
             NoSuchElementException _ -> HttpStatus.NOT_FOUND;
        case AccessDeniedException _ -> HttpStatus.FORBIDDEN;
        case IllegalStateException _,
             DuplicateKeyException _ -> HttpStatus.CONFLICT;
        case AsyncRequestTimeoutException _ -> HttpStatus.REQUEST_TIMEOUT;
        default -> HttpStatus.INTERNAL_SERVER_ERROR;
    };
}
```

`_`는 unnamed variable로, 매칭은 하되 변수에 바인딩하지 않겠다는 의미다. 기존 코드에 주석으로 "나중에 JDK 버전업 되면 switch 문으로 대체 가능"이라고 적어뒀었는데, 드디어 그 날이 왔다.

### void main()

JDK 25에서는 `main` 메서드의 `public static` 수식어가 선택사항이 된다.

```java
// before
public static void main(String[] args) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    SpringApplication.run(PodoApplication.class, args);
}

// after
void main(String[] args) {
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    SpringApplication.run(PodoApplication.class, args);
}
```

## build.gradle → build.gradle.kts 전환

Gradle 9.x에서 Kotlin DSL이 기본이 되면서 함께 전환했다.

```kotlin
// build.gradle.kts
plugins {
    id("org.springframework.boot") version "3.5.10"
    id("io.spring.dependency-management") version "1.1.7"
    java
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(25))
    }
}

tasks.withType<JavaCompile>().configureEach {
    options.release.set(25)
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(
        listOf(
            "-parameters",
            "-Xlint:unchecked",
            "-Xlint:deprecation",
            "-Xlint:removal",
        )
    )
}
```

주요 문법 변경:
- `sourceCompatibility = '21'` → `java.toolchain.languageVersion.set(JavaLanguageVersion.of(25))`
- 문자열: `'...'` → `"..."`
- 함수 호출: `implementation '...'` → `implementation("...")`
- 확장 속성: `ext {}` → `extra["key"] = value`

Kotlin DSL로 바꾸면 IDE 자동완성이 된다는 게 가장 크다. Groovy DSL은 문자열이라서 오타가 나도 컴파일 타임에 안 잡혔는데, Kotlin DSL은 타입 안전하다.

## 마무리

JDK 11에서 25까지 올리는 데 약 8개월이 걸렸다. Phase 1(11→21)에서 219개 파일을 건드렸지만, Phase 2(21→25)는 16개 파일로 끝났다. 메이저 업그레이드를 한 번 넘기면 이후는 훨씬 수월해진다.

한 번에 올리면 디버깅이 불가능하다. 어떤 문제가 JDK 때문인지, Spring Boot 때문인지, 라이브러리 호환성 때문인지 구분할 수 없기 때문이다. **단계적 접근**이 핵심이다.
