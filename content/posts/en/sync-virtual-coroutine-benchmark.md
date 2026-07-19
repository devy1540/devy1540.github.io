---
title: "Platform Thread vs Virtual Thread vs Coroutine - 10,000 Task Benchmark"
date: "2026-03-24"
updated: "2026-03-24"
description: "A benchmark comparing JDK 25 Platform Threads, Virtual Threads, and Kotlin Coroutines across I/O-bound, CPU-bound, and high-concurrency scenarios with 10,000 tasks repeated 100 times."
tags: ["java", "kotlin", "virtual-threads", "coroutine", "benchmark", "concurrency"]
draft: false
---

## Why Compare Them

In server applications, the concurrency model is a core design choice that affects throughput and response time.

Traditional platform-thread-based pools were the default for a long time. But JDK 21 introduced Virtual Threads as a stable feature, and Kotlin Coroutines have become a strong option in the JVM ecosystem.

After migrating from [JDK 11 to 21](/posts/jdk-migration-strategy-11-to-25), then moving from [JDK 21 to 25 and adopting Virtual Threads](/posts/jdk-migration-strategy-21-to-25), I wanted real numbers. The synchronous payment API migration and the multi-channel notification server both raised the same question: which model is best for high concurrency?

So I built a benchmark with **10,000 tasks x 100 iterations**. Monitoring used Prometheus and Grafana from the [LGTM stack](/posts/lgtm-stack-observability).

## Three Concurrency Models

### Platform Thread - Traditional Thread Pool

Platform threads are OS-backed threads. They are familiar and stable, but expensive compared to lightweight concurrency models.

```java
ExecutorService executor = Executors.newFixedThreadPool(200);
```

The main tuning points are pool size and queue size. If the pool is too small, throughput is limited. If it is too large, context switching and memory usage increase.

### Virtual Thread - Lightweight Threads in JDK 21+

Virtual Threads are managed by the JVM and mounted on carrier platform threads.

```java
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
```

They are especially effective for blocking I/O. You can write synchronous code while allowing many concurrent tasks.

### Kotlin Coroutine - Language-Level Async

Coroutines are lightweight concurrency units managed by Kotlin.

```kotlin
coroutineScope {
    repeat(10_000) {
        launch(Dispatchers.IO) {
            callExternalApi()
        }
    }
}
```

Coroutines are powerful, but they require coroutine-aware APIs and careful context management.

## Benchmark Design

### Test Environment

The benchmark used:

- JDK 25.
- Kotlin with coroutines.
- 10,000 tasks per run.
- 100 repeated runs.
- Prometheus metrics.
- Grafana dashboards.

### Scenarios and Parameters

| Scenario | Purpose |
|----------|---------|
| I/O Bound | simulate external API calls |
| CPU Bound | simulate pure computation |
| High Concurrency | simulate many lightweight requests |

### Scenario Test Code

#### I/O Bound - External Call Simulation

```java
void ioBoundTask() {
    Thread.sleep(Duration.ofMillis(100));
}
```

This simulates waiting on an external API, DB, or network call.

#### CPU Bound - Pure Computation

```java
long cpuBoundTask() {
    long result = 0;
    for (int i = 0; i < 1_000_000; i++) {
        result += Math.sqrt(i);
    }
    return result;
}
```

This scenario spends time on CPU rather than waiting.

#### High Concurrency - Many Lightweight Requests

```java
void lightweightTask() {
    blackhole.consume(System.nanoTime());
}
```

This checks scheduling overhead when many small tasks are submitted.

#### Measurement Method

Each model runs the same scenario 100 times. For each run, the benchmark records:

- total duration.
- throughput.
- p95 latency.
- memory usage.
- thread count.

### Common Interface

```java
public interface ConcurrencyBenchmark {
    BenchmarkResult run(int taskCount);
}
```

Each implementation uses a different execution model but exposes the same interface.

### Metrics Collection

Prometheus scraped benchmark metrics, and Grafana visualized the results. This was more useful than only printing averages because stability over time matters.

## Result Analysis

### Summary

| Scenario | Best fit | Reason |
|----------|----------|--------|
| I/O Bound | Virtual Thread or Coroutine | both handle many waiting tasks well |
| CPU Bound | Platform Thread or bounded dispatcher | CPU cores are the limit |
| High Concurrency | Virtual Thread or Coroutine | lower scheduling overhead |

### I/O Bound - Services with Many External API Calls

Virtual Threads and Coroutines were both strong. Platform Threads required careful pool tuning. If the pool was too small, many tasks waited in the queue. If it was too large, memory and context switching increased.

Virtual Threads were especially attractive because the code stayed synchronous:

```java
String result = client.call();
repository.save(result);
```

No callback chain and no reactive API were required.

### CPU Bound - Computation-Heavy Batch

For CPU-heavy work, Virtual Threads did not create more CPU. The bottleneck is the number of cores.

In this case, a bounded pool is often better. It prevents the application from scheduling far more work than the CPU can execute.

### High Concurrency - Large Number of Small Requests

Virtual Threads and Coroutines handled large numbers of small tasks well. Platform Threads consumed more memory and required more tuning.

The key difference was operational complexity. Virtual Threads required less application-level structure change in a Spring MVC service.

### Time-Series Trend - Stability

Average numbers are not enough. I also checked time-series graphs.

#### I/O Bound Throughput

Virtual Threads stayed stable without aggressive tuning. Platform Threads changed significantly depending on pool size.

#### CPU Bound Throughput

All models eventually converged around CPU capacity. More concurrency did not help after the CPU became saturated.

#### High Concurrency Throughput

Coroutines and Virtual Threads showed lower overhead. Platform Threads were more sensitive to pool configuration.

#### Memory Usage

Platform Threads used more memory as concurrency increased. Virtual Threads and Coroutines were lighter.

## Overall Comparison

| Item | Platform Thread | Virtual Thread | Coroutine |
|------|-----------------|----------------|-----------|
| Programming model | synchronous | synchronous | suspend/async |
| Best at | bounded CPU work | blocking I/O | async pipelines |
| Tuning | pool size required | less pool tuning | dispatcher/context design |
| Spring MVC compatibility | excellent | excellent | requires Kotlin/coroutine stack |
| Risk | pool starvation | pinning, ThreadLocal issues | context leaks, blocking calls |

## Which Model to Choose

### Choose Virtual Threads When

- The service is Spring MVC-based.
- Most work is I/O-bound.
- You want to keep synchronous code.
- You want to reduce thread pool tuning.
- Your libraries are mostly blocking APIs.

### Choose Coroutines When

- The service is already Kotlin-based.
- You use coroutine-friendly libraries.
- You need structured concurrency.
- You are comfortable with suspend function boundaries.

### Platform Threads Are Enough When

- Concurrency is moderate.
- Work is CPU-bound.
- The current thread pool is stable and well understood.
- Simplicity matters more than maximizing concurrency.

## What About WebFlux

WebFlux is still useful when the whole stack is reactive. But adopting WebFlux only to handle many blocking calls is not ideal.

Virtual Threads changed the tradeoff. For many Spring MVC services, Virtual Threads provide much of the concurrency benefit without moving to a reactive programming model.

That does not make WebFlux obsolete. It just means the reason to choose it should be clearer.

## Cautions

### Virtual Thread

- Watch for pinning.
- Be careful with synchronized blocks.
- Check ThreadLocal usage.
- Downstream systems still need limits.
- DB connection pool size still matters.

Virtual Threads let many tasks wait cheaply. They do not make the database accept unlimited connections.

### Coroutine

- Avoid blocking calls on default dispatchers.
- Keep dispatcher boundaries explicit.
- Make cancellation behavior clear.
- Watch context propagation.

Coroutines are powerful, but mixing blocking libraries without care can remove the benefit.

## Closing

There is no single best concurrency model.

For our Spring MVC services with many I/O-bound operations, Virtual Threads were the most practical default. They improved concurrency while preserving the synchronous programming model.

For Kotlin-first services or complex async pipelines, Coroutines are still excellent. For CPU-heavy workloads, a bounded platform thread pool remains a reasonable choice.

The benchmark did not answer "which is always fastest." It answered a more useful question: which model fits which workload.
