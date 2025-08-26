# Error Handling Strategy

## Error Flow
중앙화된 에러 처리 시스템으로 모든 에러를 관리

## Error Response Format
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

## Frontend Error Handling
```typescript
export class ErrorHandler {
  static handle(error: unknown, context?: string): void {
    // Error handling implementation
  }
}
```

## Backend Error Handling
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
  }
}
```
