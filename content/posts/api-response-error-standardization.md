---
title: "API 응답/에러 처리 구조 공통화 — HTTP 상태코드를 제대로 쓰기까지"
date: "2026-03-10"
description: "모든 API가 200을 반환하던 레거시 구조에서, HTTP 상태코드를 올바르게 활용하는 공통 응답/에러 체계로 전면 개선한 과정. 모니터링 정상화, 디버깅 효율화, 개발자 간 커뮤니케이션 비용 절감까지."
tags: ["java", "spring-boot", "architecture", "error-handling", "refactoring"]
draft: true
---

## 배경

서비스 초기부터 쌓여온 API 응답 코드에는 독특한 관례가 있었다. **모든 응답이 HTTP 200이었다.** 에러가 발생해도 200을 반환하고, 실제 에러 정보는 JSON body 안에 문자열로 담았다.

```java
// 데이터를 못 찾아도 HTTP 200
return ResponseEntity.ok(CommonClass.ResponseResult("404", "데이터를 찾을 수 없습니다."));

// 성공도 HTTP 200
return ResponseEntity.ok(CommonClass.ResponseResult("200", result));
```

빠르게 개발하던 시기에 자연스럽게 자리 잡은 패턴이었다. 그리고 이런 방식은 사실 드문 일이 아니다 — 스타트업 초기나 빠른 프로토타이핑 단계에서 흔히 나타난다.

문제는 서비스가 성장하면서 드러났다. 모니터링 시스템을 붙이고, 프론트엔드 팀과 API 스펙을 맞추고, 장애 대응 프로세스를 정비하는 과정에서 이 구조가 곳곳에서 발목을 잡기 시작했다.

---

## 기존 구조의 문제점

### CommonClass — 레거시 응답 래퍼

먼저 기존 응답 구조를 보면:

```java
public class CommonClass {
    private String resultCd;   // "200", "404" 같은 문자열
    private Object result;
    private String resultMsg;

    public static Map<String, Object> ResponseResult(String resultCd, Object result) {
        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("resultCd", resultCd);
        if (resultCd == "200") {   // == 비교 (버그)
            resultMap.put("result", result);
        } else {
            resultMap.put("resultMsg", result);
        }
        return resultMap;
    }
}
```

`resultCd == "200"` — 문자열을 `==`로 비교하는 버그가 있었다. Java에서 문자열 비교는 `.equals()`를 써야 하는데, 이 코드가 동작한 이유는 컴파일러의 문자열 인터닝(string interning) 덕분이었다. 리터럴 `"200"`끼리는 같은 레퍼런스를 가리키니까 우연히 동작한 것이다. 런타임에 동적으로 생성된 문자열이 들어오면 언제든 깨질 수 있는 코드였다.

**1. 모니터링이 작동하지 않는다**

Grafana, Prometheus 같은 모니터링 도구는 HTTP 상태코드를 기반으로 에러율을 측정한다. 모든 응답이 200이면 에러율은 항상 0%다. 서버에서 에러가 쏟아지고 있어도 대시보드는 초록불이었다. 실제 에러를 추적하려면 응답 body를 파싱해서 `resultCd` 값을 꺼내야 했는데, 표준 모니터링 도구는 이런 방식을 지원하지 않는다.

**2. 응답 포맷이 제각각이다**

같은 "성공 응답"을 만드는 방법이 최소 3가지였다:

```java
// 방식 1: CommonClass 정적 메서드
return ResponseEntity.ok(CommonClass.ResponseResult("200", result));

// 방식 2: Map 직접 생성
Map<String, Object> resultMap = new HashMap<>();
resultMap.put("resultCd", "200");
resultMap.put("result", result);
return ResponseEntity.ok(resultMap);

// 방식 3: CommonClass.ok()
return ResponseEntity.ok(CommonClass.ok(result));
```

새로 합류한 개발자는 어떤 방식을 써야 하는지 매번 물어봐야 했고, 코드 리뷰에서 "이건 왜 `CommonClass.ok` 대신 `Map`을 썼나요?"라는 질문이 반복됐다. 방법이 여러 개면 논쟁이 생기고, 논쟁이 생기면 커뮤니케이션 비용이 늘어난다.

**3. 에러 코드의 의미가 모호하다**

```java
// 304를 "Not Modified"가 아니라 "데이터 없음"으로 사용
return ResponseEntity.ok(CommonClass.ResponseResult("304", "매칭 데이터를 찾을 수 없습니다."));
```

HTTP 304는 캐시 관련 상태코드인데, 여기서는 "데이터를 찾을 수 없다"는 의미로 쓰고 있었다. `resultCd`가 HTTP 상태코드처럼 생겼지만 실제 의미는 달랐다. API를 사용하는 쪽에서는 이 숫자가 HTTP 표준인지, 자체 정의인지 구분할 방법이 없었다.

**4. 컨트롤러가 에러 응답까지 직접 만든다**

```java
@GetMapping("/getList")
public ResponseEntity<?> getBoardList(@RequestParam(required = false) Integer limitCount) {
    final List<BoardInterface> result = boardService.getBoardList(classType, limitCount);

    if (result == null) {
        return ResponseEntity.ok(CommonClass.ResponseResult("404", "데이터를 찾을 수 없습니다."));
    }

    Map<String, Object> resultMap = new HashMap<>();
    resultMap.put("resultCd", "200");
    resultMap.put("result", result);
    return ResponseEntity.ok(resultMap);
}
```

컨트롤러마다 `null` 체크, 에러 응답 생성, 성공 응답 포맷팅을 직접 하고 있었다. 비슷한 코드가 모든 컨트롤러에 복사되어 있었고, 응답 포맷을 바꾸려면 모든 컨트롤러를 찾아서 수정해야 했다.

---

## 설계 원칙

이 문제들을 해결하기 위해 세 가지 원칙을 세웠다.

1. **HTTP 상태코드가 실제 상태를 반영한다** — 200이면 진짜 성공, 404면 진짜 없음
2. **응답 포맷은 하나만 존재한다** — 성공이든 에러든 동일한 구조
3. **비즈니스 코드에서 에러 응답을 직접 만들지 않는다** — `throw`만 하면 인프라가 처리

```mermaid
flowchart TB
    C["Controller"] -->|성공| R["PodoResponse.success(data)"]
    R --> RE["ResponseEntity 200 OK"]

    C -->|실패| T["throw BaseException"]
    T --> H["PodoExceptionHandler"]
    H --> M["HTTP 상태코드 매핑"]
    M --> ER["ResponseEntity 4xx/5xx"]

    subgraph "응답 포맷 (공통)"
        RE --> J["{ resultCd, resultCdName, message, data }"]
        ER --> J
    end
```

개발자가 할 일은 두 가지뿐이다. 성공이면 `PodoResponse.success()`로 감싸고, 실패면 예외를 던진다. 에러 응답 포맷은 전역 예외 핸들러가 알아서 만든다.

---

## 구현

### 공통 응답 래퍼 — PodoResponse

```java
@Getter
@Builder(access = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class PodoResponse<T> {
    private int resultCd;
    private String resultCdName;
    private String message;
    private T data;

    public static <T> PodoResponse<T> success(T data) {
        return PodoResponse.<T>builder()
                .resultCd(200)
                .resultCdName("OK")
                .data(data)
                .build();
    }

    public static <T> PodoResponse<T> fail(int resultCd, String resultCdName, String message) {
        return PodoResponse.<T>builder()
                .resultCd(resultCd)
                .resultCdName(resultCdName)
                .message(message)
                .build();
    }
}
```

성공과 실패 모두 같은 JSON 구조다:

```json
// 성공 (HTTP 200)
{
  "resultCd": 200,
  "resultCdName": "OK",
  "message": null,
  "data": { "userId": 1, "name": "홍길동" }
}

// 에러 (HTTP 404)
{
  "resultCd": 404,
  "resultCdName": "NOT_FOUND",
  "message": "사용자를 찾을 수 없습니다.",
  "data": null
}
```

`resultCd`를 문자열에서 `int`로 바꾼 것도 의도적이다. 레거시의 `resultCd == "200"` 같은 실수가 구조적으로 불가능해진다.

### 에러 코드 중앙 관리 — PodoStatusCode

모든 비즈니스 에러를 하나의 enum에서 관리한다. 각 에러 코드가 어떤 HTTP 상태코드로 매핑되는지 선언적으로 정의되어 있다.

```java
@Getter
@RequiredArgsConstructor
public enum PodoStatusCode {
    // 결제
    DUPLICATE_PAYMENT(HttpStatus.BAD_REQUEST, "중복된 결제입니다."),
    INVALID_PAYMENT_AMOUNT(HttpStatus.BAD_REQUEST, "결제 금액이 올바르지 않습니다."),
    PAYMENT_ALREADY_CANCELLED(HttpStatus.BAD_REQUEST, "이미 취소된 결제입니다."),

    // 사용자
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    USER_NOT_AUTHORIZED(HttpStatus.UNAUTHORIZED, "사용자가 인증되지 않았습니다."),

    // 쿠폰
    COUPON_NOT_FOUND(HttpStatus.NOT_FOUND, "쿠폰을 찾을 수 없습니다."),
    COUPON_RACE_FAILED(HttpStatus.CONFLICT, "발급 수량이 모두 소진되었어요."),

    // 카드
    DUPLICATE_CARD(HttpStatus.CONFLICT, "중복된 카드입니다."),
    INVALID_CARD(HttpStatus.BAD_REQUEST, "카드 정보가 올바르지 않습니다."),

    // ... 현재 160개 이상의 에러 코드
    ;

    private final HttpStatus httpStatus;
    private final String message;
}
```

새로운 에러가 필요하면 여기에 한 줄만 추가하면 된다. 도메인별로 정리되어 있어서, "결제에서 어떤 에러가 발생할 수 있는지"를 enum 하나만 보면 파악할 수 있다.

### 커스텀 예외 — BaseException

비즈니스 로직에서는 에러 상황에서 `throw`만 하면 된다.

```java
@Getter
public class BaseException extends RuntimeException {
    private final PodoStatusCode podoStatusCode;
    private final String message;
    private String slackMessage;

    public BaseException(PodoStatusCode code) {
        super(code.getMessage());
        this.podoStatusCode = code;
        this.message = code.getMessage();
    }

    public BaseException(PodoStatusCode code, String message) {
        super(message);
        this.podoStatusCode = code;
        this.message = message;
    }

    public BaseException(PodoStatusCode code, String message, Supplier<String> slackMsg) {
        super(message);
        this.podoStatusCode = code;
        this.message = message;
        this.slackMessage = slackMsg.get();
    }
}
```

세 번째 생성자가 흥미로운데, Slack 메시지를 `Supplier<String>`으로 받는다. 에러가 실제로 발생했을 때만 메시지를 생성하므로, 정상 흐름에서는 Slack 메시지 조합 비용이 들지 않는다.

실제 사용은 이런 식이다:

```java
// 기본 — enum에 정의된 메시지 사용
throw new BaseException(PodoStatusCode.USER_NOT_FOUND);

// 커스텀 메시지 — 상황에 맞는 구체적인 메시지
throw new BaseException(PodoStatusCode.DUPLICATE_CARD, "이미 등록된 카드입니다.");

// Slack 알림 — 운영팀이 즉시 알아야 하는 에러
throw new BaseException(PodoStatusCode.ENCRYPT_ERROR,
    "카드 토큰 암호화에 실패했습니다.",
    () -> "카드 암호화 실패: userId=" + userId);
```

### 전역 예외 핸들러 — PodoExceptionHandler

모든 예외를 한 곳에서 잡아서 통일된 응답으로 변환하는 핵심 인프라다.

```java
@Slf4j
@RestControllerAdvice(annotations = RestController.class)
public class PodoExceptionHandler {

    @ExceptionHandler({BaseException.class})
    protected ResponseEntity<PodoResponse<?>> handleBaseException(
            BaseException e, HttpServletRequest request) {
        HttpStatus status = e.getPodoStatusCode().getHttpStatus();
        this.log(status, request, e);

        Span.current().setAttribute("error.message", e.getMessage());
        return ResponseEntity.status(status)
            .body(PodoResponse.fail(
                status.value(), e.getPodoStatusCode().name(), e.getMessage()));
    }

    @ExceptionHandler({RuntimeException.class})
    protected ResponseEntity<PodoResponse<?>> handleRuntimeException(
            RuntimeException e, HttpServletRequest request) {
        HttpStatus status = getHttpStatus(e);
        this.log(status, request, e);

        return ResponseEntity.status(status)
            .body(PodoResponse.fail(
                status.value(), status.name(), createSafeMessage(status)));
    }
}
```

두 핸들러의 차이가 중요하다.

`BaseException`은 개발자가 의도적으로 던진 비즈니스 에러이므로, `PodoStatusCode`에 정의된 메시지가 **그대로 클라이언트에 전달**된다. "이미 등록된 카드입니다", "쿠폰을 찾을 수 없습니다" 같은 사용자 친화적 메시지다.

반면 `RuntimeException`은 예상하지 못한 에러 — `NullPointerException`, `ArrayIndexOutOfBoundsException` 같은 것이다. 이런 에러의 내부 메시지를 클라이언트에 노출하면 보안 문제가 될 수 있다. 그래서 `createSafeMessage()`로 안전한 메시지로 치환한다:

```java
private String createSafeMessage(HttpStatus status) {
    if (status.is5xxServerError()) {
        return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
    if (status.is4xxClientError()) {
        return "요청을 처리할 수 없습니다. 요청을 확인해주세요.";
    }
    return "요청 처리 중 문제가 발생했습니다.";
}
```

### 예외 타입별 자동 매핑

`BaseException`으로 감싸지 않은 일반 예외도 합리적인 HTTP 상태코드가 나가도록 매핑 테이블을 둔다.

```java
private HttpStatus getHttpStatus(Exception e) {
    return switch (e) {
        case IllegalArgumentException _,
             HttpMessageNotReadableException _,
             TypeMismatchException _,
             DateTimeParseException _        -> HttpStatus.BAD_REQUEST;
        case NoHandlerFoundException _,
             NoSuchElementException _        -> HttpStatus.NOT_FOUND;
        case AccessDeniedException _         -> HttpStatus.FORBIDDEN;
        case IllegalStateException _,
             DuplicateKeyException _         -> HttpStatus.CONFLICT;
        case AsyncRequestTimeoutException _  -> HttpStatus.REQUEST_TIMEOUT;
        default                              -> HttpStatus.INTERNAL_SERVER_ERROR;
    };
}
```

Service 레이어에서 `throw new IllegalArgumentException("잘못된 입력")`만 던져도 자동으로 400 응답이 나간다. 모든 에러를 `BaseException`으로 감쌀 필요가 없다는 뜻이다.

### 상태코드별 차등 로깅

```java
private void log(HttpStatus status, HttpServletRequest request, Exception e) {
    if (status.is4xxClientError()) {
        log.warn("[{}] {} {} - {}",
            status.name(), request.getMethod(), request.getRequestURI(), e.getMessage());
    } else {
        log.error("throw Exception. \n\tException: {} \n\tRequest: [{}]{} \n\tMessage: {} \n\tSource: {}",
            e.getClass().getSimpleName(), request.getMethod(), request.getRequestURI(),
            e.getMessage(), findApplicationErrorSource(e));
    }
}
```

4xx는 클라이언트의 잘못이므로 WARN, 5xx는 서버의 잘못이므로 ERROR로 기록한다. Grafana Loki에서 `level=error`로 필터링하면 **서버 문제만 바로 볼 수 있다.** 4xx는 무시해도 되는 로그가 아니지만, 5xx와 섞여 있으면 진짜 중요한 에러를 놓치기 쉽다.

5xx의 경우 `findApplicationErrorSource()`로 우리 패키지(`com.speaking.podo.*`) 내 에러 발생 위치를 최대 5단계까지 추적하여 로그에 남긴다. Spring 프레임워크의 수십 줄짜리 스택 트레이스를 뒤질 필요 없이, 애플리케이션 코드의 에러 지점만 바로 확인할 수 있다.

OpenTelemetry Span에도 `error.message`를 기록하기 때문에, Tempo 같은 분산 추적 도구에서도 어느 요청에서 에러가 발생했는지 즉시 파악할 수 있다.

---

## 컨트롤러가 달라졌다

### Before

```java
@GetMapping("/getList")
public ResponseEntity<?> getBoardList(@RequestParam(required = false) Integer limitCount) {
    final List<BoardInterface> result = boardService.getBoardList(classType, limitCount);

    if (result == null) {
        return ResponseEntity.ok(CommonClass.ResponseResult("404", "데이터를 찾을 수 없습니다."));
    }

    Map<String, Object> resultMap = new HashMap<>();
    resultMap.put("resultCd", "200");
    resultMap.put("result", result);
    return ResponseEntity.ok(resultMap);
}
```

에러 분기, 응답 포맷 생성, HTTP 상태코드까지 전부 컨트롤러가 직접 처리하고 있다.

### After

```java
@GetMapping("/{boardId}")
public ResponseEntity<PodoResponse<?>> getBoardDetail(
        @AuthenticationPrincipal AuthenticatedUserDto user,
        @PathVariable String boardId) {
    return ResponseEntity.ok(PodoResponse.success(boardGateway.getBoardDetail(boardId)));
}
```

컨트롤러는 성공 케이스만 다룬다. `boardGateway.getBoardDetail()`에서 데이터를 못 찾으면 `BaseException(NOT_FOUND)`이 던져지고, `PodoExceptionHandler`가 HTTP 404 응답을 만든다.

에러 처리 코드가 컨트롤러에서 완전히 사라졌다. 컨트롤러 메서드가 짧아지니 코드 리뷰도 빨라졌고, "에러 응답 포맷을 맞춰주세요"라는 리뷰 코멘트도 사라졌다.

---

## 개선 효과

| | Before | After |
|---|---|---|
| **에러율 측정** | 불가능 (항상 0%) | HTTP 4xx/5xx 비율로 실시간 확인 |
| **응답 포맷** | `CommonClass`, `Map`, 직접 생성 등 3가지 | `PodoResponse` 하나 |
| **에러 판단 기준** | body.resultCd 문자열 비교 | HTTP 상태코드 |
| **새 에러 추가** | 컨트롤러마다 응답 생성 코드 작성 | `PodoStatusCode`에 한 줄 추가 |
| **장애 감지** | body를 파싱해야 감지 가능 | 5xx 급증 시 자동 알림 |
| **코드 리뷰** | "왜 Map을 썼나요?" 반복 | 방법이 하나라 논쟁 없음 |

가장 체감이 컸던 건 모니터링이다. 이전에는 장애가 나면 Grafana에서 아무 이상이 없어서, Slack 알림이나 CS 접수로 먼저 장애를 인지하는 경우가 있었다. 지금은 5xx가 급증하면 Grafana 알림이 먼저 온다. 대응 속도가 근본적으로 달라졌다.

---

## 마무리

돌이켜보면, "모든 응답을 200으로 보내는" 방식이 틀렸다기보다는 서비스 규모에 맞지 않게 된 것이었다. 팀이 2~3명일 때는 body 안의 `resultCd`만으로 충분히 소통이 됐다. 모니터링 도구 없이도 Slack 알림과 로그 검색으로 장애를 대응할 수 있었다.

하지만 팀이 커지고, 모니터링 체계를 갖추고, 프론트엔드와 백엔드가 API 스펙을 명확히 맞춰야 하는 단계에 오면 이야기가 달라진다. HTTP 표준을 따르는 것만으로도 모니터링 도구가 그대로 동작하고, 프론트엔드 라이브러리의 에러 핸들링이 자연스럽게 작동하고, 새로 합류한 개발자가 별도 설명 없이 API를 이해할 수 있다.

구조를 바꾸는 작업 자체보다 어려웠던 건, 이미 운영 중인 API와의 하위 호환이었다. 레거시 컨트롤러가 수십 개 있었고, 프론트엔드도 `resultCd` 문자열에 의존하고 있었다. 한 번에 전부 바꿀 수는 없었고, 새로 만드는 API부터 `PodoResponse`를 적용하면서 기존 API도 리팩토링 시 점진적으로 전환했다. 현재도 일부 레거시 컨트롤러에 `CommonClass`가 남아 있지만, 새로운 코드는 전부 `PodoResponse` 기반으로 작성되고 있다.

방법이 하나면 선택의 여지가 없고, 선택의 여지가 없으면 커뮤니케이션 비용이 사라진다. 이번 작업에서 가장 크게 느낀 점이다.
